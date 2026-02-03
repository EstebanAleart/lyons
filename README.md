# LeadFlow CRM

Sistema de gestión de leads y clientes para instituciones educativas.

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 16 (App Router) |
| Runtime | Node.js 18+ |
| Lenguaje | JavaScript (ES6+) |
| Estado | Redux Toolkit |
| UI | shadcn/ui + Tailwind CSS |
| ORM | Sequelize 6 |
| Base de datos | PostgreSQL 14+ |
| Gráficos | Recharts |
| Notificaciones | Sonner |

---

## Requisitos

- Node.js >= 18.x
- npm >= 9.x
- PostgreSQL >= 14.x

---

## Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd lyons

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con las credenciales de la base de datos

# Crear tablas en la base de datos
node scripts/create-db.js

# Iniciar en desarrollo
npm run dev
```

---

## Variables de Entorno

Crear archivo `.env` en la raíz:

```env
DB_HOST=<host>
DB_NAME=<database_name>
DB_USER=<username>
DB_PASS=<password>
DB_DIALECT=postgres
NODE_ENV=development
```

> ⚠️ No commitear archivos `.env` con credenciales reales.

---

## Git Workflow

### Ramas

| Rama | Propósito |
|------|-----------|
| `main` | Producción estable |
| `backSSR` | Desarrollo con SSR |
| `feature/*` | Nuevas funcionalidades |
| `fix/*` | Corrección de bugs |

### Convención de Commits (Conventional Commits)

Formato: `<tipo>: <descripción breve>`

Para cambios más complejos:
```
<tipo>: <descripción breve>

- Detalle 1
- Detalle 2
- Detalle 3
```

#### Tipos de Commit

| Tipo | Uso | Ejemplo |
|------|-----|---------|
| `feat` | Nueva funcionalidad | `feat: agregar filtro por etapa en leads` |
| `fix` | Corrección de bug | `fix: corregir cálculo de días vencidos` |
| `perf` | Mejora de rendimiento | `perf: optimizar query de leads con SQL directo` |
| `refactor` | Refactorización sin cambio funcional | `refactor: extraer lógica de filtros a hook` |
| `style` | Cambios de estilo/formato | `style: ajustar espaciado en cards móviles` |
| `docs` | Documentación | `docs: agregar guía de usuario` |
| `chore` | Tareas de mantenimiento | `chore: actualizar dependencias` |
| `test` | Tests | `test: agregar tests para API de leads` |
| `build` | Cambios de build/deploy | `build: configurar variables de Vercel` |

#### Ejemplos Reales del Proyecto

```bash
# Feature con detalles
git commit -m "feat: implementar sistema de etapas del lead con optimistic updates

- Agregar API endpoint para cambiar etapa del lead
- Agregar selector de etapa inline en tabla de leads
- Implementar optimistic updates para cambios instantáneos"

# Performance
git commit -m "perf: optimizar carga de leads con SQL directo y carga progresiva

- Reemplazar Sequelize includes por SQL directo
- Carga inicial de 100 leads para respuesta inmediata
- Resto de leads carga en background"

# Fix simple
git commit -m "fix: agregar dependencia uuid"

# Docs
git commit -m "docs: actualizar README con estructura del proyecto"
```

### Flujo de Trabajo

```bash
# 1. Asegurarse de estar en la rama correcta
git checkout backSSR
git pull

# 2. Hacer cambios y commit
git add -A
git commit -m "feat: descripción del cambio"

# 3. Push
git push

# 4. El deploy a Vercel es automático
```

### Buenas Prácticas

1. **Commits atómicos**: Un commit = un cambio lógico
2. **Descripción clara**: Que se entienda sin ver el código
3. **Presente imperativo**: "agregar" no "agregado" o "agrega"
4. **Sin punto final**: `feat: agregar filtro` ✅ no `feat: agregar filtro.` ❌
5. **Máximo 72 caracteres** en la primera línea

---

## Estructura del Proyecto

```
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (REST endpoints)
│   │   ├── leads/               
│   │   │   ├── route.js          # GET (list), POST (create)
│   │   │   └── [id]/
│   │   │       ├── route.js      # GET, PUT, DELETE
│   │   │       └── convertir/    # POST - convert to client
│   │   ├── clientes/
│   │   │   ├── route.js          # GET (list)
│   │   │   └── [id]/route.js     # GET, PUT, DELETE
│   │   ├── interacciones/
│   │   │   ├── route.js          # GET, POST
│   │   │   └── [id]/route.js     # GET, PUT, DELETE
│   │   ├── kpis/                 # Dashboard metrics
│   │   ├── funnel/               # Funnel data
│   │   ├── actividad/            # Activity chart data
│   │   ├── canales/              # Channel distribution
│   │   ├── cursos/               # Course distribution
│   │   ├── asesores/             # Advisor performance
│   │   ├── leads-vencidos/       # Expired leads
│   │   ├── ultimos-contactos/    # Recent contacts
│   │   └── system-health/        # Health check
│   ├── dashboard/                # Dashboard page
│   ├── leads/                    # Leads management page
│   ├── clientes/                 # Clients management page
│   ├── layout.tsx                # Root layout
│   └── page.jsx                  # Landing page
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── dashboard/                # Dashboard-specific components
│   │   ├── navbar.jsx
│   │   ├── kpi-cards.jsx
│   │   ├── funnel-chart.jsx
│   │   ├── activity-chart.jsx
│   │   ├── channel-chart.jsx
│   │   ├── course-chart.jsx
│   │   ├── advisor-performance.jsx
│   │   ├── expired-leads-table.jsx
│   │   └── recent-contacts-table.jsx
│   ├── providers/
│   │   └── store-provider.jsx    # Redux Provider
│   ├── contact-modal.jsx         # Contact interaction modal
│   ├── lead-detail-drawer.jsx    # Lead detail sidebar
│   ├── lead-form-modal.jsx       # Create/Edit lead form
│   └── cliente-detail-drawer.jsx # Client detail sidebar
│
├── lib/
│   ├── db.js                     # Sequelize connection
│   ├── utils.ts                  # Utility functions (cn)
│   ├── models/
│   │   └── index.js              # Sequelize models & relations
│   └── store/
│       ├── index.js              # Redux store configuration
│       ├── leadsSlice.js         # Leads state management
│       ├── clientesSlice.js      # Clients state management
│       ├── leadsVencidosSlice.js # Expired leads state
│       └── contactosSlice.js     # Recent contacts state
│
├── scripts/
│   ├── create-db.js              # Create database tables
│   ├── importExcelLeads.js       # Import leads from Excel
│   ├── migrateToUUID.js          # Migrate IDs to UUID
│   └── models/                   # Standalone script models
│
└── public/
    └── images/                   # Static assets
```

---

## Modelo de Datos

### Entidades Principales

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Lead      │────▶│   Cliente    │     │  Interaccion │
└──────────────┘     └──────────────┘     └──────────────┘
       │                                         │
       │                                         │
       ▼                                         ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Localidad   │     │    Curso     │     │   Usuario    │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Genero    │     │  LeadCurso   │     │    Canal     │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Tablas

| Tabla | Descripción |
|-------|-------------|
| `leads` | Prospectos/leads del sistema |
| `clientes` | Leads convertidos a estudiantes |
| `interacciones` | Historial de contactos |
| `usuarios` | Asesores/usuarios del sistema |
| `canales` | Canales de contacto (WhatsApp, Email, Llamada) |
| `cursos` | Catálogo de cursos disponibles |
| `lead_cursos` | Relación N:N entre leads y cursos |
| `localidades` | Catálogo de ubicaciones |
| `generos` | Catálogo de géneros |
| `origenes` | Fuentes de captación |
| `estados_lead` | Estados del funnel |
| `historial_estado_lead` | Tracking de cambios de estado |
| `page_views` | Métricas de navegación |
| `api_metrics` | Métricas de rendimiento de APIs |

### Relaciones

```javascript
Lead.belongsTo(Genero, { foreignKey: 'genero_id' });
Lead.belongsTo(Localidad, { foreignKey: 'localidad_id' });
Lead.belongsTo(Origen, { foreignKey: 'origen_id' });
Lead.hasOne(Cliente, { foreignKey: 'lead_id' });
Lead.hasMany(Interaccion, { foreignKey: 'lead_id' });
Lead.hasMany(HistorialEstadoLead, { foreignKey: 'lead_id' });
Lead.hasMany(LeadCurso, { foreignKey: 'lead_id' });
Cliente.belongsTo(Lead, { foreignKey: 'lead_id' });
Interaccion.belongsTo(Lead, { foreignKey: 'lead_id' });
Interaccion.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Interaccion.belongsTo(Canal, { foreignKey: 'canal_id' });
```

---

## API Reference

### Leads

| Method | Endpoint | Query Params | Body | Response |
|--------|----------|--------------|------|----------|
| `GET` | `/api/leads` | `limit`, `offset` | - | `{ data: Lead[], total, offset, limit }` |
| `GET` | `/api/leads/[id]` | - | - | `Lead` con relaciones |
| `POST` | `/api/leads` | - | `{ nombre, apellido, email, telefono, ... }` | `Lead` |
| `PUT` | `/api/leads/[id]` | - | `{ ...fields }` | `Lead` |
| `DELETE` | `/api/leads/[id]` | - | `{ success: true }` |
| `POST` | `/api/leads/[id]/convertir` | - | - | `{ success: true, cliente }` |

### Clientes

| Method | Endpoint | Query Params | Body | Response |
|--------|----------|--------------|------|----------|
| `GET` | `/api/clientes` | `limit`, `offset` | - | `{ data: Cliente[], total, offset, limit }` |
| `GET` | `/api/clientes/[id]` | - | - | `Cliente` con Lead |
| `PUT` | `/api/clientes/[id]` | - | `{ estadoCliente }` | `Cliente` |
| `DELETE` | `/api/clientes/[id]` | - | - | `{ success: true }` |

### Interacciones

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| `GET` | `/api/interacciones` | - | `Interaccion[]` |
| `POST` | `/api/interacciones` | `{ leadId, canalId, usuarioId, nota }` | `Interaccion` |
| `PUT` | `/api/interacciones/[id]` | `{ nota, usuarioId }` | `Interaccion` |
| `DELETE` | `/api/interacciones/[id]` | - | `{ success: true }` |

### Dashboard

| Method | Endpoint | Query Params | Response |
|--------|----------|--------------|----------|
| `GET` | `/api/kpis` | - | `{ totalLeads, convertidos, tasaConversion, ... }` |
| `GET` | `/api/funnel` | - | `{ etapas: { nombre, cantidad }[] }` |
| `GET` | `/api/actividad` | `dias` | `{ fecha, interacciones }[]` |
| `GET` | `/api/canales` | - | `{ canal, cantidad }[]` |
| `GET` | `/api/cursos` | - | `{ curso, cantidad }[]` |
| `GET` | `/api/asesores` | - | `{ asesor, contactos, conversiones }[]` |
| `GET` | `/api/leads-vencidos` | `limit`, `offset`, `dias` | `{ data, total }` |
| `GET` | `/api/ultimos-contactos` | `dias` | `Interaccion[]` |

---

## Redux State Management

### Slices

| Slice | Propósito | Archivo |
|-------|-----------|---------|
| `leads` | Gestión de leads con filtros y paginación client-side | `lib/store/leadsSlice.js` |
| `clientes` | Gestión de clientes | `lib/store/clientesSlice.js` |
| `leadsVencidos` | Leads sin contactar (+7 días) | `lib/store/leadsVencidosSlice.js` |
| `contactos` | Últimos contactos realizados | `lib/store/contactosSlice.js` |

### Patrón de Carga Incremental

Todos los slices implementan carga incremental con chunks de 1000 registros:

```javascript
const CHUNK_SIZE = 1000;

export const fetchAllLeadsIncrementally = createAsyncThunk(
  'leads/fetchAllIncrementally',
  async (_, { dispatch }) => {
    let offset = 0;
    let hasMore = true;
    
    while (hasMore) {
      const response = await fetch(`/api/leads?limit=${CHUNK_SIZE}&offset=${offset}`);
      const data = await response.json();
      
      dispatch(appendLeads(data.data));
      
      offset += CHUNK_SIZE;
      hasMore = data.data.length === CHUNK_SIZE;
    }
  }
);
```

---

## Ciclo de Vida del Lead

```
NUEVO → CONTACTADO → INTERESADO → NEGOCIANDO → CONVERTIDO (→ Cliente)
                                      ↓
                                   PERDIDO
```

| Estado | Código |
|--------|--------|
| Nuevo | `nuevo` |
| Contactado | `contactado` |
| Interesado | `interesado` |
| Negociando | `negociando` |
| Convertido | `convertido` |
| Perdido | `perdido` |

### Estados de Cliente

| Estado | Código |
|--------|--------|
| Activo | `activo` |
| Inactivo | `inactivo` |
| Egresado | `egresado` |
| Suspendido | `suspendido` |

---

## Scripts de Mantenimiento

```bash
# Crear/recrear todas las tablas (⚠️ destructivo)
node scripts/create-db.js

# Importar leads desde archivo Excel
node scripts/importExcelLeads.js path/to/file.xlsx

# Migrar IDs numéricos a UUID
node scripts/migrateToUUID.js

# Crear tablas de tracking (pageviews, api_metrics)
node scripts/createTrackingTables.js
```

---

## Desarrollo

```bash
# Servidor de desarrollo con hot reload
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm start

# Linting
npm run lint
```

### Convenciones

- **Componentes**: PascalCase (`LeadDetailDrawer.jsx`)
- **Archivos de API**: kebab-case en carpetas (`leads-vencidos/`)
- **Modelos**: PascalCase singular (`Lead`, `Cliente`)
- **Tablas DB**: snake_case plural (`leads`, `clientes`)
- **Redux actions**: camelCase (`fetchAllLeadsIncrementally`)

---

## Despliegue

### Variables de producción requeridas

```env
DB_HOST=<production_host>
DB_NAME=<production_db>
DB_USER=<production_user>
DB_PASS=<production_password>
DB_DIALECT=postgres
NODE_ENV=production
```

### Build

```bash
npm run build
npm start
```

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| Error de conexión a DB | Verificar variables de entorno y que PostgreSQL esté corriendo |
| Tablas no existen | Ejecutar `node scripts/create-db.js` |
| Datos no cargan | Verificar consola del navegador y logs del servidor |
| CORS errors | Verificar que las rutas de API estén correctas |

---

## Licencia

Proyecto privado. Todos los derechos reservados.
