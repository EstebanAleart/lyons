# Lyons CRM — Documentación Técnica de Arquitectura

> Guía completa para desarrolladores. Explica cada decisión de diseño, cómo funciona el sistema de datos, el estado global, las actualizaciones optimistas y las funciones SQL de alta performance.

---

## Stack Tecnológico

| Capa | Tecnología | Motivo |
|---|---|---|
| Frontend | Next.js 16 (App Router) | SSR/SSG, routing integrado, Turbopack |
| Estado global | Redux Toolkit | Manejo predictivo de estado, DevTools |
| Base de datos | Supabase (PostgreSQL) | Serverless, RPC, auth incluida |
| Cliente DB | `@supabase/supabase-js` v2 | HTTPS (evita problemas DNS locales con TCP) |
| Auth | NextAuth v5 + Auth0 | OAuth delegado, sesiones JWT |
| UI | shadcn/ui + Tailwind CSS | Componentes accesibles, diseño consistente |
| Notificaciones | Sonner | Toasts no bloqueantes |

---

## Problema DNS y Por Qué Usamos supabase-js en Vez de TCP

### El Problema
Cuando Next.js corre **localmente**, Node.js intenta resolver el hostname de Supabase (`db.xxxxx.supabase.co`) por TCP/IP directo. En algunas redes esto falla con:

```
getaddrinfo ENOENT db.voomrikhxehuuuccwnfl.supabase.co
```

Esto es un problema de resolución DNS local. En producción (Vercel) funciona perfecto porque Vercel tiene DNS completo.

### La Solución
En vez de conectar directamente a PostgreSQL por TCP (puerto 5432), usamos el cliente oficial `@supabase/supabase-js` que se conecta por **HTTPS** a `https://voomrikhxehuuuccwnfl.supabase.co`. Este dominio resuelve correctamente en cualquier red porque usa la infraestructura HTTP estándar.

```js
// lib/supabase.js — cliente centralizado
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,      // https://xxxxx.supabase.co
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY  // clave pública anon
)
```

**Todas** las rutas de API importan este cliente. Nunca se usa `pg.Pool` ni `Sequelize` directamente.

---

## Carga de Datos: Paginación con Limit/Offset

### El Concepto
Con miles de clientes/leads, no se puede traer todo de una vez (timeout, memoria, UX lenta). La solución es **paginación por chunks**: traer los datos en bloques de 1000 registros.

```
Primera request:  offset=0,    limit=1000  → registros 1-1000
Segunda request:  offset=1000, limit=1000  → registros 1001-2000
Tercera request:  offset=2000, limit=1000  → registros 2001-3000
...y así hasta que hasMore=false
```

### Implementación en la API (`/api/clientes/route.js`)

```js
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const offset = parseInt(searchParams.get('offset') || '0', 10)
  const limit  = parseInt(searchParams.get('limit')  || '500', 10)

  // Llama a la función SQL con los parámetros de paginación
  const { data, error } = await supabase.rpc('get_clientes_list', {
    p_limit:  limit,
    p_offset: offset
  })

  const total = data[0]?.total_count ? parseInt(data[0].total_count) : 0

  return Response.json({
    clientes: clientesFormateados,
    total,
    offset,
    limit,
    hasMore: offset + data.length < total  // ← clave: ¿quedan más?
  })
}
```

El campo `hasMore` le dice al frontend si debe pedir el siguiente chunk.

### Implementación en Redux (`clientesSlice.js`)

```js
// Thunk que trae UN chunk
export const fetchClientesChunk = createAsyncThunk(
  'clientes/fetchChunk',
  async ({ offset = 0, limit = 1000 }, { rejectWithValue }) => {
    const response = await fetch(`/api/clientes?offset=${offset}&limit=${limit}`)
    const data = await response.json()
    return { clientes: data.clientes, total: data.total, offset, hasMore: data.hasMore }
  }
)

// Thunk orquestador: llama fetchClientesChunk en loop hasta que hasMore=false
export const fetchAllClientesIncrementally = createAsyncThunk(
  'clientes/fetchAllIncrementally',
  async (_, { dispatch, getState }) => {
    // Anti-duplicado: si ya hay una carga en curso, no iniciar otra
    if (isFetchingInProgress) return { skipped: true }

    const state = getState()
    // Si ya tenemos datos, no recargar
    if (state.clientes.isFullyLoaded || state.clientes.items.length > 0) {
      return { skipped: true }
    }

    isFetchingInProgress = true
    try {
      let offset = 0
      let hasMore = true

      while (hasMore) {
        const result = await dispatch(fetchClientesChunk({ offset, limit: 1000 }))
        if (fetchClientesChunk.fulfilled.match(result)) {
          hasMore = result.payload.hasMore
          offset += 1000
        } else {
          break  // error → detener
        }
      }
      return { completed: true }
    } finally {
      isFetchingInProgress = false
    }
  }
)
```

El resultado: la tabla empieza a mostrar datos al instante (con los primeros 1000 registros), y mientras el usuario navega, el resto se va cargando en segundo plano. Una barra de progreso muestra el avance.

---

## Redux Toolkit — Estado Global

### ¿Por Qué Redux?
Con carga incremental de miles de registros, múltiples componentes necesitan acceder al mismo estado (tabla, filtros, paginación, barra de progreso). Redux centraliza todo y evita prop drilling.

### Estructura del Slice (`clientesSlice.js`)

```js
const initialState = {
  items: [],           // Array con TODOS los clientes cargados hasta ahora
  total: 0,            // Total en la base de datos (viene en el primer response)
  loadedCount: 0,      // Cuántos tenemos ya en memoria
  isLoading: false,    // Cargando el primer chunk (muestra spinner)
  isLoadingMore: false,// Cargando chunks adicionales (muestra progress bar)
  isFullyLoaded: false,// true cuando offset+data.length >= total
  error: null,
  filters: {           // Filtros client-side (no hacen requests nuevos)
    search: '',
    estado: 'Todos',
    curso: 'Todos',
    localidad: 'Todos',
  },
  pagination: {
    page: 1,
    perPage: 50,       // Cuántas filas mostrar en pantalla
  },
}
```

### El Flujo Completo

```
Usuario entra a /clientes
        ↓
useEffect → dispatch(fetchAllClientesIncrementally())
        ↓
Redux lanza fetchClientesChunk(offset=0)
        ↓
API: /api/clientes?offset=0&limit=1000
        ↓
SQL: get_clientes_list(p_offset=0, p_limit=1000)
        ↓
Redux recibe 1000 clientes → state.items = [1000 items]
Tabla muestra los primeros 50 (pagination.perPage)
        ↓
hasMore=true → Redux lanza fetchClientesChunk(offset=1000)
        ↓
...y así hasta isFullyLoaded=true
```

### Selectores Memoizados (performance crítica)

Con miles de items en Redux, recalcular los filtros en cada render sería muy lento. `createSelector` (de Reselect) **cachea el resultado** y solo recalcula si cambian los inputs.

```js
// Solo recalcula si cambian items o filters
export const selectFilteredClientes = createSelector(
  [selectItems, selectFilters],
  (items, filters) => {
    return items.filter(cliente => {
      // búsqueda de texto
      if (filters.search) {
        const nombreCompleto = `${cliente.nombre} ${cliente.apellido}`.toLowerCase()
        const matchesSearch =
          nombreCompleto.includes(filters.search.toLowerCase()) ||
          cliente.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
          cliente.telefono?.includes(filters.search)
        if (!matchesSearch) return false
      }
      // filtro por estado
      if (filters.estado !== 'Todos' && cliente.estadoCliente !== filters.estado) return false
      // filtro por curso
      if (filters.curso !== 'Todos' && cliente.curso !== filters.curso) return false
      // filtro por localidad
      if (filters.localidad !== 'Todos' && cliente.localidad !== filters.localidad) return false
      return true
    })
  }
)

// Solo recalcula si cambian los filtrados o la paginación
export const selectPaginatedClientes = createSelector(
  [selectFilteredClientes, selectPagination],
  (filteredClientes, pagination) => {
    const start = (pagination.page - 1) * pagination.perPage
    return filteredClientes.slice(start, start + pagination.perPage)
  }
)
```

**Resultado:** Los filtros son instantáneos, client-side. No hay requests extra al buscar.

---

## Actualizaciones Optimistas (Optimistic Updates)

### ¿Qué Es?
En vez de esperar a que el servidor confirme un cambio para actualizarlo en la UI, **actualizamos Redux inmediatamente** y hacemos el request en segundo plano. Si el servidor falla, revertimos.

### Ejemplo Real: Cambiar la Etapa de un Lead

```js
const handleEtapaChangeInline = async (leadId, nuevaEtapa, leadNombre) => {
  // 1. Guardar el valor anterior para poder revertir
  const lead = leads.find(l => l.id === leadId)
  const etapaAnterior = lead?.etapaActual || lead?.etapa || 'nuevo'

  // 2. OPTIMISTIC UPDATE: actualizar Redux ANTES de hablar con el servidor
  //    El usuario ve el cambio al instante (0ms de latencia percibida)
  dispatch(updateLeadEtapa({ leadId, etapa: nuevaEtapa }))
  toast.success('Etapa actualizada', { description: `${leadNombre} → ${nuevaEtapa}` })

  // 3. Request al servidor EN SEGUNDO PLANO
  try {
    const response = await fetch(`/api/leads/${leadId}/etapa`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ etapa: nuevaEtapa, cambiadoPor: 'Usuario' })
    })
    if (!response.ok) throw new Error('Error al guardar')

    // Servidor confirmó → no hacer nada, el estado ya está correcto

  } catch (error) {
    // 4. ROLLBACK: si falló el servidor, revertir Redux al valor anterior
    dispatch(updateLeadEtapa({ leadId, etapa: etapaAnterior }))
    toast.error('Error al guardar', { description: 'Se revirtió el cambio' })
  }
}
```

**¿Por qué?** La UX es inmediata. El dropdown cambia al instante. Si hay error de red, el usuario lo ve con el toast de error y el valor vuelve al estado anterior. Esto es el patrón que usan apps como Notion, Linear o Gmail.

---

## Funciones SQL en Supabase (RPC — Remote Procedure Calls)

### ¿Por Qué Funciones SQL?
El cliente `supabase-js` puede hacer queries simples (`supabase.from('tabla').select('*')`), pero para queries complejas con **JOINs, subconsultas, DISTINCT ON, total_count**, necesitamos SQL puro.

Supabase permite crear **funciones PostgreSQL** y llamarlas desde el cliente con `supabase.rpc('nombre_funcion', params)`. Esto es tipado, seguro, y mucho más rápido que hacer múltiples queries.

### Cómo Llamar una Función desde el Frontend

```js
// En la API route
const { data, error } = await supabase.rpc('get_clientes_list', {
  p_limit:  1000,
  p_offset: 0
})
```

### Función Principal: `get_clientes_list`

```sql
CREATE OR REPLACE FUNCTION get_clientes_list(
  p_limit  INT DEFAULT 500,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id            UUID,
  lead_id       UUID,
  nombre        TEXT,
  apellido      TEXT,
  email         TEXT,
  telefono      TEXT,
  genero        TEXT,
  localidad     TEXT,
  localidad_id  UUID,
  curso         TEXT,
  curso_id      UUID,
  fecha_alta    TIMESTAMPTZ,
  estado_cliente TEXT,
  created_at    TIMESTAMPTZ,
  total_count   BIGINT        -- ← total de registros en la tabla (sin paginación)
)
LANGUAGE sql STABLE AS $$
  SELECT
    c.id,
    c.lead_id,
    l.nombre,                     -- viene del JOIN con leads
    l.apellido,
    l.email,
    l.telefono,
    l.genero,
    loc.nombre   AS localidad,    -- JOIN con localidades
    c.localidad_id,
    cur.nombre   AS curso,        -- JOIN con cursos
    c.curso_id,
    c.fecha_alta,
    c.estado_cliente,
    c.created_at,
    COUNT(*) OVER() AS total_count  -- window function: total sin LIMIT
  FROM clientes c
  JOIN leads l    ON l.id = c.lead_id
  LEFT JOIN localidades loc ON loc.id = c.localidad_id
  LEFT JOIN cursos      cur ON cur.id = c.curso_id
  ORDER BY c.created_at DESC
  LIMIT  p_limit
  OFFSET p_offset;
$$;

-- Permisos: el cliente anon/autenticado puede ejecutar esta función
GRANT EXECUTE ON FUNCTION get_clientes_list(INT, INT) TO anon, authenticated;
```

**Técnicas usadas:**
- `COUNT(*) OVER()` — Window function que devuelve el total de filas SIN LIMIT en cada fila. Así sabemos el total sin hacer un query extra.
- `LEFT JOIN` — Si un cliente no tiene localidad o curso, igual aparece (no se filtra).
- `LIMIT / OFFSET` — Paginación server-side, solo trae los registros necesarios.
- `ORDER BY created_at DESC` — Los más recientes primero, consistente entre páginas.

### Función con DISTINCT ON: `get_funnel_data`

PostgreSQL no tiene `MAX(uuid)` — los UUIDs no son ordenables numéricamente. Para obtener el **último estado de cada lead**, usamos `DISTINCT ON`:

```sql
-- MAL (no funciona en PostgreSQL):
SELECT MAX(h.id) FROM historial_estados h GROUP BY h.lead_id

-- BIEN (DISTINCT ON):
SELECT DISTINCT ON (lead_id) lead_id, estado, created_at
FROM historial_estados
ORDER BY lead_id, created_at DESC
-- Para cada lead_id, solo devuelve la fila con la created_at más reciente
```

`DISTINCT ON (columna)` ordena por esa columna y descarta duplicados, conservando la **primera fila** del orden definido por `ORDER BY`.

### Función con `make_interval`: `get_ultimos_contactos`

Para filtrar por "últimos N días" desde un parámetro entero:

```sql
-- MAL (error de tipos en PostgreSQL):
WHERE i.fecha >= NOW() - p_dias || ' days'

-- BIEN:
WHERE i.fecha >= NOW() - make_interval(days => p_dias)
-- make_interval convierte el integer a un tipo INTERVAL válido
```

---

## Estructura de Carpetas

```
lyons/
├── app/
│   ├── api/                      # Rutas de API (Next.js App Router)
│   │   ├── clientes/
│   │   │   ├── route.js          # GET: lista paginada de clientes
│   │   │   └── [id]/route.js     # GET/PUT/DELETE cliente individual
│   │   ├── leads/
│   │   │   ├── route.js          # GET: lista paginada, POST: crear lead
│   │   │   └── [id]/
│   │   │       ├── route.js      # GET/PUT/DELETE
│   │   │       ├── etapa/route.js    # PUT: cambiar etapa (optimistic)
│   │   │       └── cursos/route.js   # GET/POST cursos de interés
│   │   ├── interacciones/route.js    # POST: registrar contacto
│   │   └── dashboard/            # Métricas del dashboard
│   ├── clientes/page.jsx         # Vista de clientes con tabla expandible
│   ├── leads/page.jsx            # Vista de leads/contactos con tabla expandible
│   └── dashboard/page.jsx        # Dashboard con gráficos
├── components/
│   ├── dashboard/                # Gráficos (activity, funnel, canal, course)
│   ├── contact-modal.jsx         # Modal para registrar interacciones
│   ├── lead-form-modal.jsx       # Modal crear/editar lead o cliente
│   ├── lead-detail-drawer.jsx    # Drawer lateral con detalle de lead
│   └── cliente-detail-drawer.jsx # Drawer lateral con detalle de cliente
├── lib/
│   ├── supabase.js               # Cliente Supabase centralizado
│   └── store/
│       ├── index.js              # Redux store (configureStore)
│       ├── clientesSlice.js      # Estado + thunks de clientes
│       └── leadsSlice.js         # Estado + thunks de leads
├── supabase-functions.sql        # Todas las funciones PostgreSQL (correr en Supabase)
├── auth.js                       # Configuración NextAuth + Auth0
└── .env.local                    # Variables de entorno locales (no commitear)
```

---

## Variables de Entorno Requeridas

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...

# Auth0 (NextAuth)
AUTH0_DOMAIN=dev-xxxxx.us.auth0.com
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...
AUTH0_ISSUER=https://dev-xxxxx.us.auth0.com
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000   # cambiar a URL real en prod
```

---

## Patrón de Filas Expandibles en las Tablas

Las tablas de Clientes y Contactos tienen filas expandibles. Al hacer clic en una fila, se despliega un panel con todos los campos del registro.

### Cómo Funciona

```jsx
// 1. Estado local: guarda el ID de la fila expandida (null = ninguna)
const [expandedRow, setExpandedRow] = useState(null)
const toggleRow = (id) => setExpandedRow(prev => prev === id ? null : id)

// 2. Icono de chevron en la primera columna
<TableCell>
  {expandedRow === item.id
    ? <ChevronUp className="h-4 w-4" />
    : <ChevronDown className="h-4 w-4" />}
</TableCell>

// 3. La fila principal activa el toggle al hacer clic
<TableRow onClick={() => toggleRow(item.id)}>

// 4. Celdas con botones usan e.stopPropagation() para no activar el toggle
<TableCell onClick={(e) => e.stopPropagation()}>
  <Button onClick={() => handleEdit(item)}>Editar</Button>
</TableCell>

// 5. Fila expandida: colSpan abarca todas las columnas
{expandedRow === item.id && (
  <TableRow>
    <TableCell colSpan={8}>
      <div className="grid grid-cols-4 gap-4">
        {/* todos los campos */}
      </div>
    </TableCell>
  </TableRow>
)}
```

**Nota importante:** Cada par de filas (principal + expandida) se envuelve en un `<>` (Fragment) para que el `.map()` devuelva múltiples elementos sin romper la estructura del `<tbody>`.

---

## Auth: NextAuth v5 + Auth0

```
Usuario → /api/auth/signin → Auth0 Login Page → Callback → Sesión JWT
```

Auth0 maneja toda la autenticación. NextAuth actúa de puente entre Auth0 y Next.js. El token JWT queda en una cookie httpOnly. Para proteger páginas se usa el middleware de NextAuth.

Los callbacks de Auth0 permitidos deben incluir:
- `http://localhost:3000/api/auth/callback/auth0` (local)
- `https://lyons-one.vercel.app/api/auth/callback/auth0` (producción)

---

## Notas de Deploy (Vercel)

1. Las variables de entorno del `.env.local` deben cargarse manualmente en Vercel Dashboard → Settings → Environment Variables.
2. `NEXTAUTH_URL` debe ser la URL de producción (`https://lyons-one.vercel.app`).
3. Las funciones SQL en `supabase-functions.sql` deben ejecutarse una vez en el SQL Editor de Supabase antes del primer deploy.
4. Vercel resuelve DNS de Supabase sin problema — el issue DNS es exclusivamente local.
