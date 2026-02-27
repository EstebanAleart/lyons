"use client";

import { AppLayout } from "@/components/dashboard/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  Phone, 
  Clock, 
  Download, 
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  MessageCircle,
  Mail,
  UserPlus
} from "lucide-react";

export default function GuiaPage() {
  return (
    <AppLayout>
      <main className="p-4 md:p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-8 w-8 text-[#f7a90c]" />
            <h1 className="text-3xl font-bold">Guía de Usuario</h1>
          </div>
          <p className="text-muted-foreground">
            Aprende a utilizar todas las funcionalidades de LeadFlow
          </p>
        </div>

        <Tabs defaultValue="inicio" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 h-auto gap-2">
            <TabsTrigger value="inicio" className="text-xs">Inicio</TabsTrigger>
            <TabsTrigger value="dashboard" className="text-xs">Dashboard</TabsTrigger>
            <TabsTrigger value="leads" className="text-xs">Leads</TabsTrigger>
            <TabsTrigger value="clientes" className="text-xs">Clientes</TabsTrigger>
            <TabsTrigger value="contactar" className="text-xs">Contactar</TabsTrigger>
            <TabsTrigger value="exportar" className="text-xs">Exportar</TabsTrigger>
            <TabsTrigger value="faq" className="text-xs">FAQ</TabsTrigger>
          </TabsList>

          {/* Inicio */}
          <TabsContent value="inicio">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#f7a90c]" />
                  Bienvenido a LeadFlow
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  LeadFlow es tu sistema de gestión de leads y clientes. Esta guía te ayudará a 
                  utilizar todas las funcionalidades de la plataforma.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Users className="h-8 w-8 text-blue-500 mt-1" />
                        <div>
                          <h3 className="font-semibold mb-1">Leads</h3>
                          <p className="text-sm text-muted-foreground">
                            Personas interesadas en los cursos que aún no se han inscrito
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <GraduationCap className="h-8 w-8 text-green-500 mt-1" />
                        <div>
                          <h3 className="font-semibold mb-1">Clientes</h3>
                          <p className="text-sm text-muted-foreground">
                            Leads que se convirtieron en estudiantes inscriptos
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Navegación</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    En la barra superior encontrarás los enlaces a:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 text-[#f7a90c]" />
                      <strong>Dashboard</strong> - Panel principal con métricas
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 text-[#f7a90c]" />
                      <strong>Leads</strong> - Gestión de prospectos
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 text-[#f7a90c]" />
                      <strong>Clientes</strong> - Gestión de estudiantes
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dashboard */}
          <TabsContent value="dashboard">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5 text-[#f7a90c]" />
                  Dashboard - Panel Principal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  El Dashboard te muestra un resumen de toda la actividad del sistema.
                </p>

                <div className="space-y-4">
                  <h3 className="font-semibold">¿Qué puedes ver?</h3>
                  
                  <div className="grid gap-3">
                    {[
                      { title: "KPIs", desc: "Números importantes: total de leads, conversiones, tasa de éxito" },
                      { title: "Embudo de Ventas", desc: "Visualización de en qué etapa están los leads" },
                      { title: "Actividad", desc: "Gráfico de contactos realizados por día" },
                      { title: "Canales", desc: "De dónde vienen los leads (WhatsApp, Email, etc.)" },
                      { title: "Cursos", desc: "Qué cursos les interesan a los leads" },
                      { title: "Asesores", desc: "Rendimiento de cada asesor" },
                      { title: "Leads Vencidos", desc: "Leads sin contactar hace más de 7 días" },
                      { title: "Últimos Contactos", desc: "Las interacciones más recientes" },
                    ].map((item) => (
                      <div key={item.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <span className="font-medium">{item.title}</span>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leads */}
          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#f7a90c]" />
                  Gestión de Leads
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  Los <strong>leads</strong> son personas interesadas en los cursos que aún no se han inscrito.
                </p>

                {/* Buscar y Filtrar */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Buscar y Filtrar
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-[#f7a90c] mt-0.5" />
                      <span>Usa la <strong>barra de búsqueda</strong> para buscar por nombre, email o teléfono</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-[#f7a90c] mt-0.5" />
                      <span>Filtra por <strong>Etapa, Canal, Curso o Localidad</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-[#f7a90c] mt-0.5" />
                      <span>Haz clic en <strong>"Limpiar Filtros"</strong> para resetear</span>
                    </li>
                  </ul>
                </div>

                {/* Crear Lead */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Crear un Nuevo Lead
                  </h3>
                  <ol className="space-y-2 text-sm list-decimal list-inside">
                    <li>Haz clic en el botón <strong>"+ Nuevo Lead"</strong></li>
                    <li>Completa el formulario (Nombre y Apellido son obligatorios)</li>
                    <li>Haz clic en <strong>"Crear Lead"</strong></li>
                  </ol>
                </div>

                {/* Acciones */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Acciones por Lead</h3>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-3 p-2 rounded bg-muted/50">
                      <Eye className="h-5 w-5 text-blue-500" />
                      <span className="text-sm"><strong>Ver</strong> - Abre el detalle completo del lead</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded bg-muted/50">
                      <Pencil className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm"><strong>Editar</strong> - Modifica los datos del lead</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded bg-muted/50">
                      <Phone className="h-5 w-5 text-green-500" />
                      <span className="text-sm"><strong>Contactar</strong> - Abre el modal para contactar</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded bg-muted/50">
                      <Trash2 className="h-5 w-5 text-red-500" />
                      <span className="text-sm"><strong>Eliminar</strong> - Elimina el lead (con confirmación)</span>
                    </div>
                  </div>
                </div>

                {/* Convertir */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Convertir Lead a Cliente
                  </h3>
                  <ol className="space-y-2 text-sm list-decimal list-inside">
                    <li>Abre el detalle del lead (botón Ver)</li>
                    <li>Haz clic en <strong>"Convertir a Cliente"</strong></li>
                    <li>Confirma la acción</li>
                    <li>El lead ahora aparecerá en la sección de <strong>Clientes</strong></li>
                  </ol>
                </div>

                {/* Etapas */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Etapas del Lead</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="flex items-center gap-2 p-2 rounded bg-blue-500/10">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-sm"><strong>Nuevo</strong> - Sin contactar</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-yellow-500/10">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span className="text-sm"><strong>Contactado</strong> - Ya se contactó</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-purple-500/10">
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                      <span className="text-sm"><strong>Interesado</strong> - Mostró interés</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-orange-500/10">
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                      <span className="text-sm"><strong>Negociando</strong> - En proceso</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-green-500/10">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-sm"><strong>Convertido</strong> - Es cliente</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-red-500/10">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-sm"><strong>Perdido</strong> - No convirtió</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clientes */}
          <TabsContent value="clientes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-[#f7a90c]" />
                  Gestión de Clientes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  Los <strong>clientes</strong> son leads que se convirtieron en estudiantes.
                </p>

                {/* Estados */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Estados de un Cliente</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="flex items-center gap-2 p-2 rounded bg-green-500/10">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-sm"><strong>Activo</strong> - Inscrito actualmente</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-gray-500/10">
                      <div className="w-3 h-3 rounded-full bg-gray-500" />
                      <span className="text-sm"><strong>Inactivo</strong> - Sin actividad temporal</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-blue-500/10">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-sm"><strong>Egresado</strong> - Completó formación</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-red-500/10">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-sm"><strong>Suspendido</strong> - Inscripción pausada</span>
                    </div>
                  </div>
                </div>

                {/* Cambiar Estado */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Cambiar el Estado de un Cliente</h3>
                  <ol className="space-y-2 text-sm list-decimal list-inside">
                    <li>Haz clic en el botón <strong>Ver</strong> del cliente</li>
                    <li>En el panel lateral, busca el selector de <strong>Estado</strong></li>
                    <li>Selecciona el nuevo estado</li>
                    <li>Haz clic en <strong>"Guardar Cambios"</strong></li>
                  </ol>
                </div>

                {/* Revertir */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Revertir Cliente a Lead</h3>
                  <p className="text-sm text-muted-foreground">
                    Si un cliente necesita volver a ser lead (por ejemplo, si la conversión fue un error):
                  </p>
                  <ol className="space-y-2 text-sm list-decimal list-inside">
                    <li>Abre el detalle del cliente</li>
                    <li>Haz clic en <strong>"Eliminar Cliente"</strong></li>
                    <li>Confirma la acción</li>
                    <li>El registro volverá a aparecer en <strong>Leads</strong></li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contactar */}
          <TabsContent value="contactar">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-[#f7a90c]" />
                  Cómo Contactar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  Aprende a registrar tus contactos con leads y clientes.
                </p>

                {/* Métodos */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Métodos de Contacto</h3>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="flex items-center gap-2 p-3 rounded bg-green-500/10">
                      <MessageCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm"><strong>WhatsApp</strong></span>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded bg-blue-500/10">
                      <Mail className="h-5 w-5 text-blue-500" />
                      <span className="text-sm"><strong>Email</strong></span>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded bg-purple-500/10">
                      <Phone className="h-5 w-5 text-purple-500" />
                      <span className="text-sm"><strong>Llamada</strong></span>
                    </div>
                  </div>
                </div>

                {/* Paso a paso */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Paso a Paso</h3>
                  <ol className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#f7a90c] text-white text-xs font-bold">1</span>
                      <span>Haz clic en el botón de <strong>contacto</strong> del lead o cliente</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#f7a90c] text-white text-xs font-bold">2</span>
                      <span>Selecciona el <strong>método de contacto</strong> (WhatsApp, Email o Llamada)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#f7a90c] text-white text-xs font-bold">3</span>
                      <span>Selecciona <strong>quién realiza el contacto</strong> (tu nombre)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#f7a90c] text-white text-xs font-bold">4</span>
                      <span>Haz clic en <strong>"Contactar"</strong> - Se abrirá WhatsApp/Email/Teléfono</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#f7a90c] text-white text-xs font-bold">5</span>
                      <span><strong>Después de hablar</strong>, escribe una nota sobre la conversación</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#f7a90c] text-white text-xs font-bold">6</span>
                      <span>Haz clic en <strong>"Guardar"</strong> para registrar la interacción</span>
                    </li>
                  </ol>
                </div>

                {/* Tip */}
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-600">Tip</p>
                      <p className="text-sm text-muted-foreground">
                        Siempre agrega notas descriptivas como "Interesado en curso de marzo, 
                        llamar la próxima semana" para que el equipo tenga contexto.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Leads Vencidos */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Leads Vencidos
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Los <strong>leads vencidos</strong> son aquellos sin contactar en los últimos 7 días.
                    Es importante darles seguimiento.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-[#f7a90c] mt-0.5" />
                      <span>En el Dashboard, busca la sección <strong>"Leads Vencidos"</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-[#f7a90c] mt-0.5" />
                      <span>Contacta directamente desde esa vista</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-[#f7a90c] mt-0.5" />
                      <span>Una vez contactado, el lead saldrá de la lista</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exportar */}
          <TabsContent value="exportar">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-[#f7a90c]" />
                  Exportar Datos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  Puedes descargar los datos en formato CSV para abrirlos en Excel.
                </p>

                <div className="space-y-3">
                  <h3 className="font-semibold">Cómo Exportar</h3>
                  <ol className="space-y-2 text-sm list-decimal list-inside">
                    <li>Ve a la sección de <strong>Leads</strong> o <strong>Clientes</strong></li>
                    <li>Aplica los <strong>filtros</strong> que necesites (opcional)</li>
                    <li>Haz clic en el botón <strong>"Exportar CSV"</strong> (ícono de descarga)</li>
                    <li>Se descargará un archivo que puedes abrir en Excel</li>
                  </ol>
                </div>

                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-600">Nota</p>
                      <p className="text-sm text-muted-foreground">
                        El archivo exportado contendrá solo los datos filtrados. 
                        Si quieres exportar todo, asegúrate de limpiar los filtros primero.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQ */}
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-[#f7a90c]" />
                  Preguntas Frecuentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {[
                    {
                      q: "¿Cómo sé en qué etapa está un lead?",
                      a: "Cada lead tiene una etiqueta de color que indica su etapa. Azul = Nuevo, Amarillo = Contactado, Púrpura = Interesado, Naranja = Negociando, Verde = Convertido, Rojo = Perdido."
                    },
                    {
                      q: "¿Qué pasa si un lead ya está en la base de datos?",
                      a: "El sistema te avisará si intentas crear un lead con un email o teléfono que ya existe."
                    },
                    {
                      q: "¿Puedo ver el historial de contactos de un lead?",
                      a: "Sí, abre el detalle del lead y encontrarás la pestaña \"Interacciones\" con todo el historial."
                    },
                    {
                      q: "¿Cómo sé cuántos leads tengo en cada etapa?",
                      a: "En el Dashboard, el gráfico de \"Embudo de Ventas\" muestra cuántos leads hay en cada etapa."
                    },
                    {
                      q: "¿Se guardan automáticamente los cambios?",
                      a: "No, debes hacer clic en \"Guardar\" o \"Guardar Cambios\" para confirmar cualquier modificación."
                    },
                    {
                      q: "¿Puedo recuperar un lead eliminado?",
                      a: "No, la eliminación es permanente. Por eso siempre se pide confirmación antes de eliminar."
                    },
                    {
                      q: "¿Quién puede ver mis contactos?",
                      a: "Todos los usuarios del sistema pueden ver las interacciones. Esto permite que el equipo tenga visibilidad del historial de cada lead."
                    },
                  ].map((faq, idx) => (
                    <div key={idx} className="p-4 rounded-lg border">
                      <p className="font-medium mb-2">{faq.q}</p>
                      <p className="text-sm text-muted-foreground">{faq.a}</p>
                    </div>
                  ))}
                </div>

                {/* Ayuda */}
                <div className="p-4 rounded-lg bg-muted">
                  <h3 className="font-semibold mb-2">¿Necesitas más ayuda?</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Recarga la página (F5) si algo no funciona</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Limpia los filtros si no ves los datos esperados</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Verifica tu conexión a internet</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Contacta al administrador si el problema persiste</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </AppLayout>
  );
}
