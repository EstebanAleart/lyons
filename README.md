# LeadFlow CRM — Instituto Lyon

Sistema de gestión de leads y clientes educativos. ~25,344 contactos en producción.

## Stack

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 16 (App Router) |
| UI | shadcn/ui + Tailwind CSS v4 |
| Estado | Redux Toolkit 2.x |
| Auth | Auth0 + NextAuth v5 |
| ORM | Sequelize 6 |
| DB | PostgreSQL 15 — Supabase (AWS eu-west-1) |
| Gráficos | Recharts |
| Analytics | Vercel Analytics + SpeedInsights |

## Setup

```bash
npm install
cp .env.example .env.local   # completar credenciales
node scripts/create-db.js    # crear tablas (⚠️ destructivo)
npm run dev
```

**.env.local:**
```env
DB_HOST=  DB_NAME=  DB_USER=  DB_PASS=  DB_PORT=5432
AUTH0_SECRET=  AUTH0_BASE_URL=  AUTH0_ISSUER_BASE_URL=
AUTH0_CLIENT_ID=  AUTH0_CLIENT_SECRET=
NEXTAUTH_SECRET=  NEXTAUTH_URL=
NODE_ENV=development
```

## Estructura

```
app/
├── api/                    # 25+ endpoints REST
│   ├── leads/[id]/         # CRUD + convertir + etapa + cursos + estados
│   ├── clientes/[id]/      # CRUD
│   ├── interacciones/[id]/ # CRUD
│   ├── kpis|funnel|actividad|canales|cursos|asesores/  # Dashboard
│   ├── leads-vencidos|ultimos-contactos/               # Dashboard
│   ├── localidades|origenes|estados-lead|cursos/       # Catálogos
│   ├── usuarios|sync-user|tracking|system-health/      # Sistema
│   └── auth/[...nextauth]/
├── dashboard|leads|clientes|guia|system|no-autorizado/
├── actions/auth-actions.js
├── layout.tsx              # Root: StoreProvider + Toaster + Analytics
└── page.jsx                # Landing / login

components/
├── dashboard/
│   ├── app-sidebar.jsx     # Navegación lateral
│   ├── app-layout.jsx      # Wrapper: SidebarProvider + AppSidebar + SidebarInset
│   ├── dashboard-header|kpi-cards|funnel-chart|activity-chart.jsx
│   ├── channel-chart|course-chart|advisor-performance.jsx
│   ├── expired-leads-table|recent-contacts-table|loading-skeletons.jsx
│   └── system-health.jsx
├── ui/                     # shadcn/ui components
├── analytics/tracker.jsx
├── providers/store-provider.jsx
├── contact-modal|lead-detail-drawer|lead-form-modal|cliente-detail-drawer.jsx
└── AuthProvider|LoginButton|LogoutButton|theme-provider.jsx

lib/
├── db.js                   # Sequelize connection
├── models/index.js         # Modelos + relaciones
└── store/                  # leadsSlice|clientesSlice|leadsVencidosSlice|contactosSlice

scripts/
├── create-db.js            # Recrear tablas (⚠️ destructivo)
├── importExcelLeads.js     # Importar Excel inicial
├── importacion-incremental.js  # Importar sin duplicar
├── limpiar-duplicados.js   # Deduplicar por teléfono normalizado
├── analisis-datos.js       # Comparar Excel vs BD
├── createTrackingTables.js # Tablas page_views + api_metrics
└── migrateToUUID.js

auth.js                     # NextAuth + Auth0 config
middleware.js               # Protección de rutas
```

## Modelo de Datos

| Tabla | Descripción |
|-------|-------------|
| `leads` | Prospectos (~25k) |
| `clientes` | Leads convertidos |
| `interacciones` | Historial de contactos |
| `usuarios` | Asesores del sistema |
| `canales` | WhatsApp / Email / Llamada / Presencial |
| `cursos` | Catálogo de cursos |
| `lead_cursos` | Relación N:N leads-cursos |
| `localidades` | ~200 ubicaciones |
| `origenes` | Fuentes de captación |
| `estados_lead` | Estados del funnel |
| `historial_estado_lead` | Auditoría de cambios de estado |
| `page_views` | Tracking de navegación |
| `api_metrics` | Métricas de rendimiento |

**Relaciones clave:**
`Lead` → hasOne `Cliente` · hasMany `Interaccion` · hasMany `LeadCurso` · belongsTo `Genero|Localidad|Origen`
`Interaccion` → belongsTo `Lead|Usuario|Canal`

## API Reference

**Leads:** `GET|POST /api/leads` · `GET|PUT|DELETE /api/leads/[id]` · `POST /api/leads/[id]/convertir` · `PUT /api/leads/[id]/etapa`

**Clientes:** `GET|POST /api/clientes` · `GET|PUT|DELETE /api/clientes/[id]`

**Interacciones:** `GET|POST /api/interacciones` · `GET|PUT|DELETE /api/interacciones/[id]`

**Dashboard:**

| Endpoint | Params | Response |
|----------|--------|----------|
| `GET /api/kpis` | — | `{ totalLeads, tasaContacto, tasaConversion, leadsVencidos }` |
| `GET /api/funnel` | — | `{ etapas: [{ nombre, cantidad, porcentaje }] }` |
| `GET /api/actividad` | `dias` | `[{ fecha, nuevos, reactivados, convertidos }]` |
| `GET /api/canales` | — | `[{ canal, cantidad }]` |
| `GET /api/cursos` | — | `[{ curso, cantidad }]` |
| `GET /api/leads-vencidos` | `limit, offset, dias` | `{ data, total }` |
| `GET /api/ultimos-contactos` | `dias` | `Interaccion[]` |

## Redux

4 slices: `leads` · `clientes` · `leadsVencidos` · `contactos`

Carga incremental (chunks de 1000 vía `fetchAllLeadsIncrementally`): carga inicial instantánea, resto en background.

## Ciclo del Lead

```
NUEVO → CONTACTADO → INTERESADO → NEGOCIANDO → CONVERTIDO → Cliente
                                              ↓
                                           PERDIDO
```

Estados cliente: `activo` · `inactivo` · `egresado` · `suspendido`

## Auth

- Solo `rol = 'asesor'` + `activo = true` accede al dashboard
- Usuarios nuevos: `rol = 'usuario'`, `activo = false` (requieren activación manual)
- Sin acceso → redirige a `/no-autorizado`

## Scripts

```bash
node scripts/create-db.js                   # ⚠️ Recrear tablas
node scripts/importExcelLeads.js            # Importar Excel
node scripts/importacion-incremental.js     # Actualización incremental
node scripts/limpiar-duplicados.js          # Deduplicar por teléfono
node scripts/analisis-datos.js              # Comparar Excel vs BD
node scripts/createTrackingTables.js        # Crear tablas de métricas
npm run dev | build | start | lint
```

## Convenciones

- Componentes: `PascalCase` · API folders: `kebab-case` · DB: `snake_case_plural` · Redux: `camelCase`
- Commits: `feat|fix|perf|refactor|style|docs|chore|test|build: descripción` (max 72 chars, presente imperativo)
- Ramas: `main` (producción) · `feature/*` · `fix/*`

## Troubleshooting

| Problema | Solución |
|----------|----------|
| Error conexión DB | Verificar `.env.local` y que PostgreSQL esté corriendo |
| Tablas no existen | `node scripts/create-db.js` |
| Datos no cargan | Consola del navegador + logs del servidor |
| Usuario sin acceso | Verificar `rol=asesor` y `activo=true` en tabla `usuarios` |
| Build falla | Verificar variables de entorno en Vercel |
| Hydration error (sidebar) | Corregido — `Math.random` en `SidebarMenuSkeleton` movido a `useEffect` |
