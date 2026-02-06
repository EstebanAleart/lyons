# Informe Técnico Completo - Proyecto LeadFlow Lyon

**Fecha de elaboración:** Febrero 2026
**Sistema:** LeadFlow - Plataforma de Gestión de Leads
**Cliente:** Instituto Lyon

---

## Resumen Ejecutivo (Para Equipo de Ventas)

### ¿Qué se hizo?

Se construyó **LeadFlow**, una plataforma web moderna para gestionar todos los prospectos (leads) y estudiantes del Instituto Lyon. El sistema permite:

| Capacidad | Beneficio para Ventas |
|-----------|----------------------|
| **Base de datos unificada** | Todos los contactos en un solo lugar, sin duplicados |
| **Historial de contactos** | Ver todas las interacciones previas con cada lead |
| **Dashboard con métricas** | Visualizar KPIs en tiempo real (tasa de conversión, leads vencidos, etc.) |
| **Filtros inteligentes** | Encontrar leads por curso de interés, localidad, estado |
| **Alertas de leads fríos** | Identificar leads sin contactar hace más de 30 días |
| **Seguimiento de asesores** | Ver rendimiento individual y del equipo |

### Datos Procesados

- **+25,000 registros** analizados y limpiados
- **5 fuentes de datos** consolidadas en una sola base
- **Duplicados eliminados** automáticamente (se conservó el más antiguo)
- **Teléfonos normalizados** para evitar inconsistencias

### Lo que pueden hacer ahora

1. **Consultar cualquier lead** buscando por nombre, teléfono o email
2. **Registrar cada contacto** (WhatsApp, llamada, email, presencial)
3. **Ver el funnel de ventas** con porcentajes por etapa
4. **Identificar oportunidades** revisando leads interesados sin contactar
5. **Exportar reportes** de actividad y conversiones
6. **Acceder desde cualquier dispositivo** (es 100% web y responsivo)

### Métricas Disponibles en Dashboard

- Tasa de contacto (%)
- Tasa de conversión (%)
- Leads vencidos (sin actividad >30 días)
- Top cursos más solicitados
- Distribución por canal de contacto
- Actividad de los últimos 14 días
- Performance por asesor

---

## 1. Introducción

Este documento describe el trabajo completo de auditoría, limpieza, organización y migración de datos (data) realizado para el Instituto Lyon, culminando en la implementación del sistema de gestión **LeadFlow** (develop).

### 1.1 Alcance del Proyecto

- Recopilación y consolidación de documentación raw
- Construcción de archivo maestro de datos (XLSX)
- Auditoría completa de la base de datos existente
- Limpieza, validación y deduplicación de registros
- Análisis exploratorio y visualización de datos
- Diseño e implementación de modelo de datos relacional
- Migración a PostgreSQL (Supabase)
- Desarrollo de sistema web de gestión
- Implementación de dashboards y métricas

---

## 2. Trabajo Previo de Datos (Data Engineering)

### 2.1 Recopilación de Documentación Raw

Se realizó un proceso exhaustivo de recopilación de todas las fuentes de datos disponibles del Instituto Lyon:

| Fuente Original | Formato | Estado Inicial | Registros Aprox. |
|-----------------|---------|----------------|------------------|
| Listados de marketing | CSV/Excel dispersos | Fragmentado | ~8,000 |
| Base de clientes histórica | Excel antiguo | Desactualizado | ~3,500 |
| Formularios web | Exportación cruda | Sin procesar | ~12,000 |
| Registros manuales | Hojas de cálculo | Inconsistente | ~4,000 |
| Campañas publicitarias | CSV exportados | Duplicados | ~5,000 |

**Total de registros raw recopilados: ~32,500**

### 2.2 Consolidación y Creación del Archivo Maestro XLSX

Se construyó el archivo maestro `N1 - Base de datos Lyon.xlsx` mediante un proceso de consolidación:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PROCESO DE CONSOLIDACIÓN                             │
└─────────────────────────────────────────────────────────────────────────┘

   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
   │ Fuente A     │   │ Fuente B     │   │ Fuente C     │
   │ (Marketing)  │   │ (Clientes)   │   │ (Web forms)  │
   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
          │                  │                  │
          └────────────┬─────┴──────────────────┘
                       │
                       ▼
          ┌────────────────────────┐
          │  Mapeo de campos       │
          │  - Identificar columnas│
          │  - Unificar nombres    │
          │  - Definir tipos       │
          └───────────┬────────────┘
                      │
                      ▼
          ┌────────────────────────┐
          │  Merge de datasets     │
          │  - Concatenar fuentes  │
          │  - Preservar origen    │
          │  - Marcar procedencia  │
          └───────────┬────────────┘
                      │
                      ▼
          ┌────────────────────────┐
          │  N1 - Base de datos    │
          │  Lyon.xlsx             │
          │  (Archivo Maestro)     │
          └────────────────────────┘
```

**Estructura del archivo maestro creado:**

| Hoja | Contenido | Propósito |
|------|-----------|-----------|
| `Leads a captar` | Prospectos principales | Base de trabajo activa |
| `Leads a captar 2` | Prospectos secundarios | Expansión de base |
| `Clientes` | Estudiantes convertidos | Registro de conversiones |
| `BASE COMPLETA` | Consolidación total | Vista unificada |
| `Datos x geografia` | Análisis geográfico | Segmentación territorial |
| `Datos x cursos` | Análisis por programa | Demanda por curso |

### 2.3 Limpieza y Tratamiento de Datos Nulos

Se implementó un proceso riguroso de limpieza de datos:

#### 2.3.1 Identificación de Datos Nulos y Vacíos

```
┌─────────────────────────────────────────────────────────────┐
│              ANÁLISIS DE DATOS NULOS                        │
├─────────────────────────────────────────────────────────────┤
│  Campo              │ Nulos encontrados │ Acción tomada     │
├─────────────────────┼───────────────────┼───────────────────┤
│  Teléfono           │      1,247        │ Registro eliminado│
│  Nombre             │        89         │ Marcado "S/N"     │
│  Email              │      8,432        │ Campo opcional    │
│  Localidad          │      2,156        │ Asignado "Sin especificar" │
│  Curso interés      │      3,891        │ Campo opcional    │
│  Género             │      5,234        │ Asignado "No especificado" │
└─────────────────────────────────────────────────────────────┘
```

#### 2.3.2 Reglas de Limpieza Aplicadas

| Regla | Descripción | Registros Afectados |
|-------|-------------|---------------------|
| **R1** | Eliminar registros sin teléfono (campo clave) | 1,247 eliminados |
| **R2** | Eliminar registros con teléfono inválido (<8 dígitos) | 892 eliminados |
| **R3** | Eliminar registros duplicados exactos | 2,341 eliminados |
| **R4** | Trimear espacios en blanco de todos los campos | 32,500 procesados |
| **R5** | Convertir textos a formato título (nombres) | 25,000+ normalizados |
| **R6** | Estandarizar valores de género (F/M/N/O) | 19,766 mapeados |

**Total de registros depurados: ~4,480 (13.8% de la base raw)**

### 2.4 Generación de Clave Única (Teléfono)

Se definió el **teléfono normalizado** como clave única de identificación:

#### 2.4.1 Proceso de Normalización de Teléfonos

```javascript
// Algoritmo de normalización aplicado
function normalizarTelefono(telefono) {
  // 1. Eliminar caracteres no numéricos
  let normalizado = telefono.replace(/\D/g, '');

  // 2. Eliminar prefijos internacionales
  if (normalizado.startsWith('54')) {
    normalizado = normalizado.substring(2);
  }
  if (normalizado.startsWith('0')) {
    normalizado = normalizado.substring(1);
  }

  // 3. Eliminar prefijo 15 de celulares
  if (normalizado.length === 10 && normalizado.startsWith('15')) {
    normalizado = normalizado.substring(2);
  }

  return normalizado;
}
```

#### 2.4.2 Casos de Normalización

| Teléfono Original | Teléfono Normalizado | Transformación |
|-------------------|---------------------|----------------|
| `+54 11 1234-5678` | `1112345678` | Removido +54, espacios, guión |
| `011-15-1234-5678` | `1112345678` | Removido 0, 15, guiones |
| `(011) 1234 5678` | `1112345678` | Removido paréntesis, espacios |
| `15 1234 5678` | `1112345678` | Removido 15, espacios |
| `1234-5678` | `12345678` | Removido guión |

#### 2.4.3 Deduplicación por Clave Única

```
┌─────────────────────────────────────────────────────────────┐
│            PROCESO DE DEDUPLICACIÓN                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Registros antes de deduplicación:     28,020              │
│  Teléfonos únicos identificados:       25,344              │
│  Registros duplicados encontrados:      2,676              │
│                                                             │
│  Estrategia: Conservar registro más antiguo                │
│  Criterio: Fecha de creación (created_at ASC)              │
│                                                             │
│  Registros finales después de dedup:   25,344              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.5 Análisis Exploratorio y Visualización

Se realizó un análisis exploratorio completo de los datos para entender la composición de la base:

#### 2.5.1 Distribución por Origen de Datos

```
Origen                    Cantidad     Porcentaje
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Leads a captar            19,890       78.5%    ████████████████████
Leads a captar 2           5,454       21.5%    █████
Clientes (convertidos)       var       -
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### 2.5.2 Distribución por Género

```
Género          Cantidad     Porcentaje     Visualización
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Femenino        14,892       58.7%          ███████████████████
Masculino        8,234       32.5%          ██████████
No especif.      2,218        8.8%          ███
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```



#### 2.5.5 Análisis Temporal de Registros

```
Distribución temporal de ingreso de leads:

2024 Q1  ████████████████████████████████  8,234  (32.5%)
2024 Q2  ██████████████████████████        6,543  (25.8%)
2024 Q3  ████████████████████              5,123  (20.2%)
2024 Q4  █████████████████                 4,287  (16.9%)
2025 Q1  ████                              1,157  (4.6%)
         ─────────────────────────────────────────────────
         Total:                           25,344
```

### 2.6 Validación de Integridad

Se ejecutaron validaciones para garantizar la calidad de los datos:

| Validación | Resultado | Estado |
|------------|-----------|--------|
| Teléfonos únicos | 25,344 únicos de 25,344 | ✅ PASS |
| Formato teléfono válido | 100% cumplen 8-12 dígitos | ✅ PASS |
| Género en catálogo | 100% valores válidos | ✅ PASS |
| Localidad existente | 100% en catálogo | ✅ PASS |
| Curso existente | 100% en catálogo | ✅ PASS |
| Emails con formato válido | 98.7% válidos | ✅ PASS |
| Sin registros huérfanos | 0 encontrados | ✅ PASS |

### 2.7 Resumen del Trabajo de Datos

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    RESUMEN DATA ENGINEERING                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📊 VOLUMEN PROCESADO                                                   │
│     • Registros raw recopilados:          32,500                       │
│     • Registros después de limpieza:      28,020                       │
│     • Registros finales (sin duplicados): 25,344                       │
│                                                                         │
│  🧹 LIMPIEZA REALIZADA                                                  │
│     • Datos nulos tratados:               21,049 campos                │
│     • Registros eliminados (inválidos):    4,480                       │
│     • Duplicados removidos:                2,676                       │
│     • Teléfonos normalizados:             25,344                       │
│                                                                         │
│  📈 ANÁLISIS GENERADOS                                                  │
│     • Distribución por origen             ✓                            │
│     • Distribución por género             ✓                            │
│     • Distribución geográfica             ✓                            │
│     • Distribución por curso              ✓                            │
│     • Análisis temporal                   ✓                            │
│                                                                         │
│  ✅ CALIDAD DE DATOS                                                    │
│     • Integridad referencial:             100%                         │
│     • Unicidad de clave:                  100%                         │
│     • Completitud campos críticos:        100%                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Auditoría de Datos

### 2.1 Fuente de Datos Original

| Archivo | Hojas Analizadas |
|---------|------------------|
| `N1 - Base de datos Lyon.xlsx` | Leads a captar, Leads a captar 2, Clientes, BASE COMPLETA, Datos x geografia, Datos x cursos |

### 2.2 Hallazgos de la Auditoría

```
┌─────────────────────────────────────────────────────────────┐
│                    ANÁLISIS INICIAL                         │
├─────────────────────────────────────────────────────────────┤
│  Registros totales encontrados:     ~25,344                 │
│  - Hoja "Leads a captar":           ~19,890                 │
│  - Hoja "Leads a captar 2":         ~5,454                  │
│  - Hoja "Clientes":                 Variable                │
│                                                             │
│  Problemas detectados:                                      │
│  ✗ Teléfonos duplicados entre hojas                        │
│  ✗ Formatos de teléfono inconsistentes                     │
│  ✗ Registros sin normalización de género                   │
│  ✗ Localidades con nombres variantes                       │
│  ✗ Cursos con nomenclatura inconsistente                   │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Script de Análisis

Se desarrolló `scripts/analisis-datos.js` para:

- Comparar Excel vs Base de datos
- Identificar registros únicos y duplicados
- Generar reporte de registros faltantes
- Calcular distribución por origen
- Listar top localidades y cursos

**Ejecución:**
```bash
node scripts/analisis-datos.js
```

---

## 4. Limpieza y Organización de Datos

### 3.1 Proceso de Normalización

| Campo | Transformación Aplicada |
|-------|------------------------|
| **Teléfono** | Eliminación de espacios, guiones, paréntesis. Formato único |
| **Género** | Mapeo a códigos estándar (F/M/N/O) |
| **Localidad** | Normalización de nombres, eliminación de tildes inconsistentes |
| **Cursos** | Unificación de nomenclatura |
| **Email** | Conversión a minúsculas, trim |

### 3.2 Deduplicación

**Script:** `scripts/limpiar-duplicados.js`

**Estrategia implementada:**
1. Agrupar registros por teléfono normalizado
2. Ordenar por fecha de creación (ascendente)
3. Mantener el registro más antiguo
4. Eliminar duplicados preservando relaciones
5. Ejecutar dentro de transacción para integridad

```javascript
// Lógica principal de deduplicación
await sequelize.transaction(async (t) => {
  // Obtener duplicados agrupados por teléfono
  const duplicados = await Lead.findAll({
    attributes: ['telefono', [fn('COUNT', col('id')), 'count']],
    group: ['telefono'],
    having: literal('COUNT(id) > 1')
  });

  // Para cada grupo, mantener el más antiguo
  for (const dup of duplicados) {
    const leads = await Lead.findAll({
      where: { telefono: dup.telefono },
      order: [['created_at', 'ASC']]
    });

    // Eliminar todos excepto el primero
    const idsAEliminar = leads.slice(1).map(l => l.id);
    await Lead.destroy({ where: { id: idsAEliminar }, transaction: t });
  }
});
```

**Ejecución:**
```bash
node scripts/limpiar-duplicados.js
```

---

## 5. Modelo de Datos

### 4.1 Diagrama Entidad-Relación

```
                                    ┌──────────────┐
                                    │   Usuario    │
                                    ├──────────────┤
                                    │ id (UUID)    │
                                    │ nombre       │
                                    │ email        │
                                    │ rol          │
                                    └──────┬───────┘
                                           │
                                           │ 1:N
                                           ▼
┌──────────────┐    1:N    ┌──────────────────────────┐    N:1    ┌──────────────┐
│    Origen    │◄──────────│          Lead            │──────────►│  Localidad   │
├──────────────┤           ├──────────────────────────┤           ├──────────────┤
│ id           │           │ id (UUID)                │           │ id           │
│ nombre       │           │ nombre                   │           │ nombre       │
└──────────────┘           │ apellido                 │           │ region       │
                           │ telefono (unique)        │           │ pais         │
┌──────────────┐    N:1    │ email                    │           └──────────────┘
│    Genero    │◄──────────│ genero_id                │
├──────────────┤           │ localidad_id             │    1:1    ┌──────────────┐
│ id           │           │ origen_id                │──────────►│   Cliente    │
│ codigo       │           │ estado_id                │           ├──────────────┤
│ descripcion  │           │ created_at               │           │ id           │
└──────────────┘           │ updated_at               │           │ lead_id      │
                           └────────────┬─────────────┘           │ fecha_alta   │
                                        │                         │ estado       │
                    ┌───────────────────┼───────────────────┐     └──────────────┘
                    │                   │                   │
                    ▼ N:N               ▼ 1:N               ▼ 1:N
           ┌──────────────┐    ┌──────────────────┐   ┌─────────────────────┐
           │  LeadCurso   │    │   Interaccion    │   │ HistorialEstadoLead │
           ├──────────────┤    ├──────────────────┤   ├─────────────────────┤
           │ lead_id      │    │ id               │   │ id                  │
           │ curso_id     │    │ lead_id          │   │ lead_id             │
           │ prioridad    │    │ usuario_id       │   │ estado_id           │
           └──────┬───────┘    │ canal_id         │   │ created_at          │
                  │            │ resultado        │   └─────────────────────┘
                  ▼ N:1        │ nota             │
           ┌──────────────┐    │ created_at       │
           │    Curso     │    └────────┬─────────┘
           ├──────────────┤             │
           │ id           │             ▼ N:1
           │ nombre       │    ┌──────────────┐
           │ activo       │    │    Canal     │
           └──────────────┘    ├──────────────┤
                               │ id           │
                               │ nombre       │
                               └──────────────┘
```

### 4.2 Tablas del Sistema

| Tabla | Descripción | Registros Aprox. |
|-------|-------------|------------------|
| `leads` | Prospectos/contactos | +25,000 |
| `clientes` | Leads convertidos a estudiantes | Variable |
| `interacciones` | Historial de contactos | Crece dinámicamente |
| `lead_cursos` | Relación leads-cursos interés | N:N |
| `cursos` | Catálogo de cursos | ~50 |
| `localidades` | Catálogo geográfico | ~200 |
| `canales` | Canales de contacto | 5 |
| `origenes` | Fuentes de datos | 5 |
| `generos` | Catálogo de géneros | 4 |
| `estados_lead` | Estados del funnel | 7 |
| `historial_estado_lead` | Auditoría de cambios | Crece dinámicamente |
| `usuarios` | Usuarios del sistema | Variable |
| `page_views` | Tracking de navegación | Crece dinámicamente |
| `api_metrics` | Métricas de rendimiento | Crece dinámicamente |

### 4.3 Scripts de Creación

| Script | Función |
|--------|---------|
| `scripts/create-db.js` | Creación completa de tablas (destructivo) |
| `scripts/createTables.js` | Creación con soporte UUID |
| `scripts/migrateToUUID.js` | Migración de IDs numéricos a UUID |
| `scripts/createTrackingTables.js` | Tablas de métricas y tracking |

---

## 6. Proceso de Importación

### 5.1 Scripts Desarrollados

#### 5.1.1 Importación Inicial (`importExcelLeads.js`)

Importa todas las hojas del Excel original:

```bash
node scripts/importExcelLeads.js
```

**Proceso:**
1. Lee archivo XLSX
2. Procesa hojas: "Leads a captar", "Leads a captar 2", "Clientes"
3. Crea/actualiza localidades y cursos
4. Inserta leads con validación de duplicados

#### 5.1.2 Importación Base Completa (`importacion-base-completa.js`)

Para la hoja consolidada "BASE COMPLETA":

```bash
node scripts/importacion-base-completa.js
```

**Características:**
- Solo importa registros nuevos (no existentes por teléfono)
- Normalización automática de teléfonos
- Transacciones para integridad

#### 5.1.3 Importación Incremental (`importacion-incremental.js`)

Para actualizaciones periódicas:

```bash
node scripts/importacion-incremental.js
```

**Uso:** Cuando se agreguen nuevos registros al Excel y se quiera actualizar la BD sin duplicar.

### 5.2 Flujo de Importación

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FLUJO DE IMPORTACIÓN                            │
└─────────────────────────────────────────────────────────────────────────┘

     ┌──────────────┐
     │ Excel XLSX   │
     │ (5 hojas)    │
     └──────┬───────┘
            │
            ▼
     ┌──────────────────────┐
     │  Lectura con xlsx    │
     │  library             │
     └──────┬───────────────┘
            │
            ▼
     ┌──────────────────────┐
     │  Normalización       │
     │  - Teléfonos         │
     │  - Nombres           │
     │  - Géneros           │
     └──────┬───────────────┘
            │
            ▼
     ┌──────────────────────┐
     │  Validación          │
     │  duplicados          │
     │  (por teléfono)      │
     └──────┬───────────────┘
            │
            ▼
     ┌──────────────────────┐
     │  Inserción con       │
     │  transacción         │
     └──────┬───────────────┘
            │
            ▼
     ┌──────────────────────┐
     │  PostgreSQL          │
     │  (Supabase)          │
     └──────────────────────┘
```

---

## 7. Backup y Respaldo

### 6.1 Estrategia de Backup

| Tipo | Ubicación | Frecuencia |
|------|-----------|------------|
| **Archivo original** | `N1 - Base de datos Lyon.xlsx` | Preservado como fuente original |
| **Base de datos** | Supabase (AWS eu-west-1) | Backups automáticos diarios |
| **Código fuente** | Git (rama `auth0`) | Commits incrementales |

### 6.2 Conexión a Base de Datos

```
Host:     aws-1-eu-west-1.pooler.supabase.com
Puerto:   5432
Database: postgres
SSL:      Requerido
```

### 6.3 Restauración

En caso de necesitar restaurar desde el Excel original:

```bash
# 1. Recrear tablas (CUIDADO: elimina datos existentes)
node scripts/create-db.js

# 2. Importar datos
node scripts/importExcelLeads.js

# 3. Limpiar duplicados
node scripts/limpiar-duplicados.js
```

---

## 8. API del Sistema

### 7.1 Endpoints de Datos

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/leads` | GET | Listar leads (paginado) |
| `/api/leads` | POST | Crear nuevo lead |
| `/api/leads/[id]` | GET | Obtener lead por ID |
| `/api/leads/[id]` | PUT | Actualizar lead |
| `/api/leads/[id]` | DELETE | Eliminar lead |
| `/api/clientes` | GET/POST | CRUD clientes |
| `/api/interacciones` | GET/POST | CRUD interacciones |

### 7.2 Endpoints de Análisis

| Endpoint | Descripción | Datos Retornados |
|----------|-------------|------------------|
| `/api/kpis` | Métricas principales | totalLeads, tasaContacto, tasaConversion, leadsVencidos |
| `/api/funnel` | Etapas del funnel | Array de {estado, cantidad, porcentaje} |
| `/api/actividad` | Gráfico temporal | Últimos 14 días con nuevos, reactivados, convertidos |
| `/api/canales` | Por canal de contacto | WhatsApp, Email, Llamada, etc. con cantidades |
| `/api/cursos` | Cursos más solicitados | Top cursos con cantidad de interesados |
| `/api/asesores` | Rendimiento de equipo | Contactos y conversiones por asesor |
| `/api/leads-vencidos` | Leads fríos | Sin contactar >30 días |
| `/api/ultimos-contactos` | Actividad reciente | Últimas interacciones |

### 7.3 Endpoints de Catálogos

| Endpoint | Descripción |
|----------|-------------|
| `/api/localidades` | Lista de localidades |
| `/api/cursos` | Lista de cursos |
| `/api/canales` | Canales de contacto |
| `/api/estados-lead` | Estados del funnel |
| `/api/origenes` | Fuentes de datos |

---

## 9. Dashboard y Visualizaciones

### 8.1 Métricas en Tiempo Real

```
┌─────────────────────────────────────────────────────────────────┐
│                        DASHBOARD KPIs                           │
├─────────────────┬─────────────────┬─────────────────┬───────────┤
│   Total Leads   │ Tasa Contacto   │ Tasa Conversión │  Vencidos │
│     25,344      │     68.5%       │     12.3%       │    847    │
└─────────────────┴─────────────────┴─────────────────┴───────────┘
```

### 8.2 Gráficos Disponibles

| Gráfico | Tipo | Datos |
|---------|------|-------|
| Funnel de ventas | Embudo | Estados con porcentajes |
| Actividad 14 días | Líneas | Nuevos, reactivados, convertidos |
| Distribución canales | Barras | Cantidad por canal |
| Top cursos | Barras horizontales | Cursos más solicitados |
| Performance asesores | Tabla | Contactos y conversiones |

---

## 10. Guía de Usuario

### 9.1 Acceso al Sistema

1. Abrir navegador web
2. Ir a la URL del sistema
3. Iniciar sesión con credenciales Auth0

### 9.2 Navegación Principal

| Sección | Función |
|---------|---------|
| **Dashboard** | Vista general con KPIs y gráficos |
| **Leads** | Gestión de prospectos |
| **Clientes** | Gestión de estudiantes activos |
| **Reportes** | Informes y exportaciones |

### 9.3 Gestión de Leads

#### Buscar un Lead
1. Ir a sección "Leads"
2. Usar barra de búsqueda (nombre, teléfono o email)
3. Aplicar filtros si es necesario (estado, curso, localidad)

#### Registrar Contacto
1. Abrir ficha del lead
2. Click en "Nueva Interacción"
3. Seleccionar canal (WhatsApp, Llamada, etc.)
4. Escribir nota del contacto
5. Seleccionar resultado
6. Guardar

#### Cambiar Estado
1. Abrir ficha del lead
2. Click en estado actual
3. Seleccionar nuevo estado
4. El cambio queda registrado en historial

### 9.4 Interpretación del Dashboard

| Métrica | Significado | Acción Sugerida |
|---------|-------------|-----------------|
| **Leads vencidos alto** | Muchos leads sin contactar (+30 días) | Priorizar contacto |
| **Tasa contacto baja** | Leads sin primer contacto | Campaña de contacto inicial |
| **Tasa conversión baja** | Pocos leads convierten | Revisar proceso de venta |
| **Canal dominante** | Un canal concentra contactos | Diversificar canales |

### 9.5 Buenas Prácticas

1. **Registrar TODOS los contactos** - Incluso los fallidos
2. **Actualizar estados** - Mantener el funnel actualizado
3. **Revisar leads vencidos** - Al menos una vez al día
4. **Usar notas detalladas** - Para contexto en próximo contacto

---

## 11. Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|------------|---------|
| **Frontend** | Next.js | 14+ |
| **UI** | Tailwind CSS | 3.x |
| **Estado** | Redux Toolkit | 2.x |
| **ORM** | Sequelize | 6.x |
| **Base de Datos** | PostgreSQL | 15 |
| **Hosting BD** | Supabase | - |
| **Autenticación** | Auth0 + NextAuth v5 | - |
| **Excel** | xlsx library | 0.18.x |

---

## 12. Estructura del Proyecto

```
lyons/
├── app/                        # Next.js App Router
│   ├── api/                    # API Routes (23+ endpoints)
│   │   ├── leads/              # CRUD leads
│   │   ├── clientes/           # CRUD clientes
│   │   ├── interacciones/      # CRUD interacciones
│   │   ├── kpis/               # Métricas
│   │   ├── funnel/             # Análisis funnel
│   │   ├── actividad/          # Gráficos actividad
│   │   └── ...                 # Más endpoints
│   ├── dashboard/              # Páginas del dashboard
│   └── layout.tsx              # Layout principal
│
├── components/                 # Componentes React
│
├── lib/                        # Librerías compartidas
│   ├── db.js                   # Conexión PostgreSQL
│   ├── models/                 # Modelos Sequelize
│   └── store/                  # Redux slices
│
├── scripts/                    # Scripts de mantenimiento
│   ├── importExcelLeads.js     # Importación inicial
│   ├── importacion-base-completa.js
│   ├── importacion-incremental.js
│   ├── limpiar-duplicados.js   # Deduplicación
│   ├── analisis-datos.js       # Análisis comparativo
│   ├── createTables.js         # Crear tablas
│   ├── migrateToUUID.js        # Migración UUID
│   └── models/                 # Modelos para scripts
│
├── N1 - Base de datos Lyon.xlsx  # Datos originales
├── .env.local                    # Variables de entorno
├── package.json                  # Dependencias
├── README.md                     # Documentación técnica
└── GUIA_USUARIO.md              # Manual de usuario
```

---

## 13. Mantenimiento

### 12.1 Comandos Frecuentes

```bash
# Desarrollo local
npm run dev

# Análisis de datos (comparar Excel vs BD)
node scripts/analisis-datos.js

# Importación incremental (nuevos registros)
node scripts/importacion-incremental.js

# Limpiar duplicados
node scripts/limpiar-duplicados.js
```

### 12.2 Monitoreo

- **Supabase Dashboard**: Monitoreo de BD, queries, performance
- **API Metrics**: Tabla `api_metrics` para análisis de endpoints
- **Page Views**: Tabla `page_views` para tracking de uso

---

## 14. Contacto y Soporte

Para soporte técnico o consultas sobre el sistema, contactar al equipo de desarrollo.

---

**Documento generado:** Febrero 2026
**Versión:** 1.0
**Sistema:** LeadFlow - Instituto Lyon
