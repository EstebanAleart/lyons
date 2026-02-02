// Estados de lead - usando paleta corporativa
export const estadosLead = [
  { id: '1', nombre: 'Nuevo', color: '#0f2d4c' },
  { id: '2', nombre: 'Contactado', color: '#1a4a7a' },
  { id: '3', nombre: 'Interesado', color: '#f7a90c' },
  { id: '4', nombre: 'Negociando', color: '#d4920a' },
  { id: '5', nombre: 'Convertido', color: '#24c65d' },
  { id: '6', nombre: 'Descartado', color: '#6b7280' },
]

// Canales de comunicación
export const canales = [
  { id: '1', nombre: 'WhatsApp' },
  { id: '2', nombre: 'Llamada' },
  { id: '3', nombre: 'Email' },
  { id: '4', nombre: 'Presencial' },
]

// Cursos disponibles
export const cursos = [
  { id: '1', nombre: 'Marketing Digital', activo: true },
  { id: '2', nombre: 'Desarrollo Web', activo: true },
  { id: '3', nombre: 'Diseño UX/UI', activo: true },
  { id: '4', nombre: 'Data Science', activo: true },
  { id: '5', nombre: 'Project Management', activo: true },
]

// KPIs principales
export const kpiMetrics = [
  {
    label: 'Total Leads',
    value: 1247,
    change: 12.5,
    changeLabel: 'vs mes anterior',
  },
  {
    label: 'Tasa de Contacto',
    value: '68%',
    change: 5.2,
    changeLabel: 'vs mes anterior',
  },
  {
    label: 'Tasa de Conversión',
    value: '23%',
    change: -2.1,
    changeLabel: 'vs mes anterior',
  },
  {
    label: 'Leads Vencidos',
    value: 89,
    change: -15,
    changeLabel: 'vs mes anterior',
  },
]

// Datos del funnel - usando paleta corporativa
export const funnelData = [
  { estado: 'Nuevo', cantidad: 456, porcentaje: 100, color: '#0f2d4c' },
  { estado: 'Contactado', cantidad: 312, porcentaje: 68, color: '#1a4a7a' },
  { estado: 'Interesado', cantidad: 189, porcentaje: 41, color: '#f7a90c' },
  { estado: 'Negociando', cantidad: 98, porcentaje: 21, color: '#d4920a' },
  { estado: 'Convertido', cantidad: 67, porcentaje: 15, color: '#24c65d' },
]

// Métricas por canal
export const canalMetrics = [
  { canal: 'WhatsApp', total: 520, contactados: 412, convertidos: 89, tasaConversion: 17.1 },
  { canal: 'Llamada', total: 380, contactados: 298, convertidos: 78, tasaConversion: 20.5 },
  { canal: 'Email', total: 245, contactados: 156, convertidos: 34, tasaConversion: 13.9 },
  { canal: 'Presencial', total: 102, contactados: 98, convertidos: 45, tasaConversion: 44.1 },
]

// Datos de leads por día (últimos 14 días)
export const leadsPorDia = [
  { fecha: '19 Ene', nuevos: 23, reactivados: 12, convertidos: 5 },
  { fecha: '20 Ene', nuevos: 31, reactivados: 8, convertidos: 7 },
  { fecha: '21 Ene', nuevos: 18, reactivados: 15, convertidos: 4 },
  { fecha: '22 Ene', nuevos: 42, reactivados: 10, convertidos: 9 },
  { fecha: '23 Ene', nuevos: 35, reactivados: 14, convertidos: 6 },
  { fecha: '24 Ene', nuevos: 28, reactivados: 11, convertidos: 8 },
  { fecha: '25 Ene', nuevos: 19, reactivados: 9, convertidos: 3 },
  { fecha: '26 Ene', nuevos: 45, reactivados: 16, convertidos: 11 },
  { fecha: '27 Ene', nuevos: 38, reactivados: 13, convertidos: 7 },
  { fecha: '28 Ene', nuevos: 29, reactivados: 18, convertidos: 5 },
  { fecha: '29 Ene', nuevos: 52, reactivados: 20, convertidos: 12 },
  { fecha: '30 Ene', nuevos: 41, reactivados: 15, convertidos: 9 },
  { fecha: '31 Ene', nuevos: 33, reactivados: 11, convertidos: 6 },
  { fecha: '01 Feb', nuevos: 47, reactivados: 17, convertidos: 10 },
]

// Distribución por curso
export const leadsPorCurso = [
  { curso: 'Marketing Digital', cantidad: 342, porcentaje: 27.4 },
  { curso: 'Desarrollo Web', cantidad: 298, porcentaje: 23.9 },
  { curso: 'Diseño UX/UI', cantidad: 256, porcentaje: 20.5 },
  { curso: 'Data Science', cantidad: 215, porcentaje: 17.2 },
  { curso: 'Project Management', cantidad: 136, porcentaje: 10.9 },
]

// Distribución por género
export const leadsPorGenero = [
  { genero: 'Masculino', cantidad: 687, porcentaje: 55.1 },
  { genero: 'Femenino', cantidad: 498, porcentaje: 39.9 },
  { genero: 'No especificado', cantidad: 62, porcentaje: 5.0 },
]

// Leads vencidos (más de 30 días sin contacto)
export const leadsVencidos = [
  {
    id: '1',
    nombre: 'María',
    apellido: 'González',
    email: 'maria.gonzalez@email.com',
    telefono: '+54 11 2345-6789',
    diasSinContacto: 45,
    ultimoContacto: '2025-12-18',
    estado: 'Interesado',
  },
  {
    id: '2',
    nombre: 'Carlos',
    apellido: 'Rodríguez',
    email: 'carlos.rodriguez@email.com',
    telefono: '+54 11 3456-7890',
    diasSinContacto: 38,
    ultimoContacto: '2025-12-25',
    estado: 'Contactado',
  },
  {
    id: '3',
    nombre: 'Ana',
    apellido: 'Martínez',
    email: 'ana.martinez@email.com',
    telefono: '+54 11 4567-8901',
    diasSinContacto: 42,
    ultimoContacto: '2025-12-21',
    estado: 'Nuevo',
  },
  {
    id: '4',
    nombre: 'Luis',
    apellido: 'Fernández',
    email: 'luis.fernandez@email.com',
    telefono: '+54 11 5678-9012',
    diasSinContacto: 35,
    ultimoContacto: '2025-12-28',
    estado: 'Interesado',
  },
  {
    id: '5',
    nombre: 'Patricia',
    apellido: 'López',
    email: 'patricia.lopez@email.com',
    telefono: '+54 11 6789-0123',
    diasSinContacto: 51,
    ultimoContacto: '2025-12-12',
    estado: 'Contactado',
  },
  {
    id: '6',
    nombre: 'Roberto',
    apellido: 'Sánchez',
    email: 'roberto.sanchez@email.com',
    telefono: '+54 11 7890-1234',
    diasSinContacto: 33,
    ultimoContacto: '2025-12-30',
    estado: 'Nuevo',
  },
]

// Performance por asesor
export const performanceAsesores = [
  { asesor: 'Juan Pérez', contactos: 156, conversiones: 34, tasa: 21.8 },
  { asesor: 'Laura García', contactos: 142, conversiones: 38, tasa: 26.8 },
  { asesor: 'Miguel Torres', contactos: 128, conversiones: 29, tasa: 22.7 },
  { asesor: 'Carolina Ruiz', contactos: 134, conversiones: 31, tasa: 23.1 },
]
