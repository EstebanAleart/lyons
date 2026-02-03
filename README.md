# 📚 LeadFlow - Sistema de Gestión de Leads Educativos

Sistema completo de CRM para gestión de leads y clientes en instituciones educativas. Permite el seguimiento, análisis y conversión de prospectos en estudiantes.

![LeadFlow](public/images/logo-icon.png)

---

## 📋 Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Instalación](#instalación)
3. [Configuración](#configuración)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Flujo de la Plataforma](#flujo-de-la-plataforma)
6. [Módulos Principales](#módulos-principales)
7. [API Endpoints](#api-endpoints)
8. [Guía de Usuario](#guía-de-usuario)

---

## 🔧 Requisitos Previos

- **Node.js** v18 o superior
- **pnpm** (gestor de paquetes)
- **PostgreSQL** v14 o superior
- **Git**

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd lyons
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
# Base de datos PostgreSQL
DB_HOST=localhost
DB_NAME=leadflow
DB_USER=tu_usuario
DB_PASS=tu_contraseña
DB_DIALECT=postgres

# Configuración opcional
NODE_ENV=development
```

### 4. Crear la base de datos

```bash
# Crear las tablas
node scripts/create-db.js
```

### 5. Importar datos (opcional)

Si tienes un archivo Excel con leads:

```bash
node scripts/importExcelLeads.js ruta/al/archivo.xlsx
```

### 6. Iniciar el servidor de desarrollo

```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

---

## 🏗 Estructura del Proyecto

```
lyons/
├── app/                    # Rutas y páginas (App Router de Next.js)
│   ├── api/               # API Routes (Backend)
│   │   ├── leads/         # CRUD de leads
│   │   ├── clientes/      # CRUD de clientes
│   │   ├── interacciones/ # Gestión de contactos
│   │   ├── kpis/          # Indicadores clave
│   │   └── ...
│   ├── dashboard/         # Panel principal
│   ├── leads/             # Gestión de leads
│   └── clientes/          # Gestión de clientes
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── dashboard/        # Componentes del dashboard
│   └── ...
├── lib/                   # Utilidades y configuración
│   ├── store/            # Redux slices
│   ├── models/           # Modelos Sequelize
│   └── db.js             # Conexión a base de datos
├── scripts/              # Scripts de utilidad
└── public/               # Archivos estáticos
```

---

## 🔄 Flujo de la Plataforma

### Ciclo de Vida de un Lead

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   NUEVO     │────▶│ CONTACTADO  │────▶│ INTERESADO  │────▶│ NEGOCIANDO  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                    │
                    ┌─────────────┐     ┌─────────────┐             │
                    │   PERDIDO   │◀────│             │◀────────────┘
                    └─────────────┘     │ CONVERTIDO  │
                                        │  (Cliente)  │
                                        └─────────────┘
```

### Estados de un Lead

| Estado | Descripción |
|--------|-------------|
| **Nuevo** | Lead recién ingresado, sin contactar |
| **Contactado** | Se realizó el primer contacto |
| **Interesado** | Mostró interés en el curso |
| **Negociando** | En proceso de inscripción |
| **Convertido** | Se convirtió en cliente/estudiante |
| **Perdido** | No se logró la conversión |

### Estados de un Cliente

| Estado | Descripción |
|--------|-------------|
| **Activo** | Estudiante actualmente inscrito |
| **Inactivo** | Cliente temporalmente sin actividad |
| **Egresado** | Completó su formación |
| **Suspendido** | Inscripción pausada |

---

## 📦 Módulos Principales

### 1. Dashboard (`/dashboard`)

Panel principal con visión general del sistema:

- **KPIs**: Total leads, conversiones, tasa de éxito
- **Gráfico de Embudo**: Visualización del funnel de ventas
- **Actividad**: Gráfico de interacciones por período
- **Canales**: Distribución por canal de captación
- **Cursos**: Interés por curso
- **Rendimiento de Asesores**: Métricas por asesor
- **Leads Vencidos**: Leads sin contactar hace +7 días
- **Últimos Contactos**: Interacciones recientes

### 2. Gestión de Leads (`/leads`)

Módulo completo para administrar prospectos:

#### Funcionalidades:
- ✅ **Listado paginado** con carga incremental
- ✅ **Búsqueda** por nombre, email, teléfono
- ✅ **Filtros** por etapa, canal, curso, localidad
- ✅ **Crear nuevo lead** con formulario
- ✅ **Editar lead** existente
- ✅ **Ver detalle** en drawer lateral
- ✅ **Contactar** (WhatsApp, Email, Llamada)
- ✅ **Convertir a cliente**
- ✅ **Eliminar lead**
- ✅ **Exportar a CSV**

#### Acciones rápidas por lead:
| Botón | Acción |
|-------|--------|
| 👁️ Ver | Abre drawer con detalle completo |
| ✏️ Editar | Abre modal de edición |
| 📱 Contactar | Abre modal de contacto |
| 🗑️ Eliminar | Elimina (con confirmación) |

### 3. Gestión de Clientes (`/clientes`)

Módulo para administrar estudiantes convertidos:

#### Funcionalidades:
- ✅ **Listado paginado** con carga incremental
- ✅ **Búsqueda** por nombre, email, teléfono
- ✅ **Filtros** por estado, curso, localidad
- ✅ **Ver detalle** en drawer lateral
- ✅ **Cambiar estado** (activo/inactivo/egresado/suspendido)
- ✅ **Revertir a lead** (eliminar como cliente)
- ✅ **Contactar** cliente
- ✅ **Exportar a CSV**

---

## 🔌 API Endpoints

### Leads

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/leads` | Listar leads (paginado) |
| GET | `/api/leads/[id]` | Obtener lead por ID |
| POST | `/api/leads` | Crear nuevo lead |
| PUT | `/api/leads/[id]` | Actualizar lead |
| DELETE | `/api/leads/[id]` | Eliminar lead |
| POST | `/api/leads/[id]/convertir` | Convertir a cliente |

### Clientes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/clientes` | Listar clientes |
| GET | `/api/clientes/[id]` | Obtener cliente por ID |
| PUT | `/api/clientes/[id]` | Actualizar estado cliente |
| DELETE | `/api/clientes/[id]` | Eliminar cliente (vuelve a lead) |

### Interacciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/interacciones` | Listar interacciones |
| POST | `/api/interacciones` | Registrar interacción |
| PUT | `/api/interacciones/[id]` | Actualizar nota |
| DELETE | `/api/interacciones/[id]` | Eliminar interacción |

### Dashboard

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/kpis` | Obtener KPIs |
| GET | `/api/funnel` | Datos del embudo |
| GET | `/api/actividad` | Actividad por período |
| GET | `/api/canales` | Distribución por canal |
| GET | `/api/cursos` | Distribución por curso |
| GET | `/api/asesores` | Rendimiento asesores |
| GET | `/api/leads-vencidos` | Leads sin contactar |
| GET | `/api/ultimos-contactos` | Contactos recientes |

---

## 📖 Guía de Usuario

### Acceso al Sistema

1. Ingresa a la URL de la plataforma
2. Haz clic en **"Iniciar Sesión"**
3. Serás redirigido al Dashboard

### Crear un Nuevo Lead

1. Ve a **Leads** en el menú de navegación
2. Haz clic en el botón **"+ Nuevo Lead"**
3. Completa el formulario:
   - Nombre y Apellido (requerido)
   - Email
   - Teléfono
   - Localidad
   - Curso de interés
4. Haz clic en **"Crear Lead"**

### Contactar un Lead

1. En la lista de leads, busca el lead deseado
2. Haz clic en el botón de **Contactar** (ícono de teléfono/mensaje)
3. Selecciona el método de contacto:
   - **WhatsApp**: Abre WhatsApp Web con el número
   - **Email**: Abre tu cliente de correo
   - **Llamada**: Inicia llamada telefónica
4. Selecciona el asesor que realiza el contacto
5. Haz clic en **"Contactar"**
6. **Después del contacto**: Agrega notas sobre la conversación
7. Haz clic en **"Guardar"** para registrar la interacción

### Convertir Lead a Cliente

1. Abre el detalle del lead (clic en 👁️)
2. Haz clic en **"Convertir a Cliente"**
3. Confirma la acción
4. El lead pasará al módulo de **Clientes**

### Gestionar Clientes

1. Ve a **Clientes** en el menú
2. Para cambiar estado:
   - Abre el detalle del cliente
   - Selecciona el nuevo estado
   - Haz clic en **"Guardar Cambios"**
3. Para revertir a lead:
   - Abre el detalle del cliente
   - Haz clic en **"Eliminar Cliente"**
   - El registro vuelve a aparecer como lead

### Ver Leads Vencidos

Los leads vencidos son aquellos sin contactar en los últimos 7 días:

1. En el **Dashboard**, localiza la sección **"Leads Vencidos"**
2. Usa los filtros para buscar leads específicos
3. Contacta directamente desde esta vista

### Exportar Datos

1. En la vista de **Leads** o **Clientes**
2. Aplica los filtros deseados
3. Haz clic en el botón **"Exportar CSV"**
4. Se descargará un archivo con los datos filtrados

---

## 🛠 Tecnologías Utilizadas

- **Frontend**: Next.js 16, React, Redux Toolkit
- **UI**: shadcn/ui, Tailwind CSS, Lucide Icons
- **Backend**: Next.js API Routes
- **Base de Datos**: PostgreSQL con Sequelize ORM
- **Notificaciones**: Sonner (toast notifications)
- **Gráficos**: Recharts

---

## 📝 Scripts Disponibles

```bash
# Desarrollo
pnpm dev          # Inicia servidor de desarrollo

# Producción
pnpm build        # Compila para producción
pnpm start        # Inicia servidor de producción

# Base de datos
node scripts/create-db.js           # Crea tablas
node scripts/importExcelLeads.js    # Importa leads desde Excel
node scripts/migrateToUUID.js       # Migra IDs a UUID

# Linting
pnpm lint         # Ejecuta ESLint
```

---

## 🤝 Soporte

Para reportar bugs o solicitar nuevas funcionalidades, crea un issue en el repositorio.

---

## 📄 Licencia

Este proyecto es privado y de uso exclusivo.

---

<div align="center">
  <p>Desarrollado con ❤️ para la gestión educativa</p>
</div>
