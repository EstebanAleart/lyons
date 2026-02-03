'use client'

import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  MessageCircle,
  History,
  GraduationCap,
  UserCheck,
  Clock,
  ArrowRight,
  Loader2,
  UserPlus
} from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function LeadDetailDrawer({ 
  open, 
  onOpenChange, 
  leadId,
  onContact,
  onConvertSuccess
}) {
  const [lead, setLead] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [convertDialogOpen, setConvertDialogOpen] = useState(false)
  const [isConverting, setIsConverting] = useState(false)

  useEffect(() => {
    if (open && leadId) {
      setLoading(true)
      setError(null)
      
      fetch(`/api/leads/${leadId}`)
        .then(res => {
          if (!res.ok) throw new Error('Error al cargar lead')
          return res.json()
        })
        .then(data => {
          setLead(data)
          setLoading(false)
        })
        .catch(err => {
          setError(err.message)
          setLoading(false)
        })
    }
  }, [open, leadId])

  const handleContactClick = () => {
    if (lead && onContact) {
      onContact({
        id: lead.id,
        nombre: lead.nombre,
        apellido: lead.apellido,
        email: lead.email,
        telefono: lead.telefono,
      })
    }
  }

  const handleConvertToClient = async () => {
    if (!lead) return
    
    setIsConverting(true)
    try {
      const response = await fetch(`/api/leads/${lead.id}/convertir`, {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al convertir')
      }
      
      toast.success('¡Lead convertido a cliente!', {
        description: `${lead.nombre} ${lead.apellido} ahora es cliente`
      })
      
      // Actualizar el lead local para mostrar que es cliente
      setLead(prev => ({
        ...prev,
        esCliente: true,
        etapaActual: 'convertido',
        stats: { ...prev.stats, esCliente: true }
      }))
      
      // Actualizar Redux con el leadId
      if (onConvertSuccess) {
        onConvertSuccess(lead.id)
      }
      
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error', { description: error.message })
    } finally {
      setIsConverting(false)
      setConvertDialogOpen(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            {loading ? (
              <Skeleton className="h-6 w-40" />
            ) : lead ? (
              <span>{lead.nombre} {lead.apellido}</span>
            ) : (
              <span>Detalle del Lead</span>
            )}
          </SheetTitle>
          <SheetDescription>
            {lead?.stats?.esCliente ? (
              <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                <UserCheck className="h-3 w-3 mr-1" />
                Cliente
              </Badge>
            ) : lead?.stats?.estadoActual && (
              <Badge variant="outline">{lead.stats.estadoActual}</Badge>
            )}
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="space-y-4 mt-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-40 text-red-500">
            {error}
          </div>
        ) : lead ? (
          <div className="mt-6 space-y-6">
            {/* Info básica */}
            <div className="rounded-lg bg-muted/50 p-4 space-y-3">
              {lead.telefono && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{lead.telefono}</span>
                </div>
              )}
              {lead.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{lead.email}</span>
                </div>
              )}
              {lead.localidad && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {lead.localidad.nombre}
                    {lead.localidad.region && `, ${lead.localidad.region}`}
                    {lead.localidad.pais && ` - ${lead.localidad.pais}`}
                  </span>
                </div>
              )}
              {lead.createdAt && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Registrado: {new Date(lead.createdAt).toLocaleDateString('es-AR')}
                  </span>
                </div>
              )}
              
              <div className="pt-2 flex gap-2">
                <Button size="sm" className="flex-1" onClick={handleContactClick}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contactar
                </Button>
                {!lead.stats?.esCliente && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                    onClick={() => setConvertDialogOpen(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Convertir a Cliente
                  </Button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="interacciones" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="interacciones" className="text-xs">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Interacciones ({lead.stats.totalInteracciones})
                </TabsTrigger>
                <TabsTrigger value="estados" className="text-xs">
                  <History className="h-3 w-3 mr-1" />
                  Estados ({lead.historialEstados.length})
                </TabsTrigger>
                <TabsTrigger value="cursos" className="text-xs">
                  <GraduationCap className="h-3 w-3 mr-1" />
                  Cursos ({lead.cursosInteres.length})
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[300px] mt-4">
                {/* Interacciones */}
                <TabsContent value="interacciones" className="mt-0">
                  {lead.interacciones.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Sin interacciones registradas
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {lead.interacciones.map((inter) => (
                        <div 
                          key={inter.id} 
                          className="p-3 rounded-lg border border-border/50 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{inter.canal}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(inter.fecha).toLocaleDateString('es-AR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          {inter.nota && (
                            <p className="text-sm">{inter.nota}</p>
                          )}
                          {inter.usuario && (
                            <p className="text-xs text-muted-foreground">
                              Por: {inter.usuario.nombre}
                            </p>
                          )}
                          {inter.resultado && (
                            <Badge variant="secondary" className="text-xs">
                              {inter.resultado}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Historial de Estados */}
                <TabsContent value="estados" className="mt-0">
                  {lead.historialEstados.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Sin cambios de estado registrados
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                      <div className="space-y-4">
                        {lead.historialEstados.map((estado, index) => (
                          <div key={estado.id} className="relative pl-10">
                            <div className="absolute left-2.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                            <div className="p-3 rounded-lg border border-border/50">
                              <div className="flex items-center justify-between">
                                <Badge>{estado.estado}</Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(estado.fecha).toLocaleDateString('es-AR')}
                                </span>
                              </div>
                              {estado.cambiadoPor && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Por: {estado.cambiadoPor}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Cursos de Interés */}
                <TabsContent value="cursos" className="mt-0">
                  {lead.cursosInteres.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Sin cursos de interés registrados
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {lead.cursosInteres.map((curso, index) => (
                        <div 
                          key={curso.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                              {curso.prioridad || index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{curso.curso}</p>
                              {curso.activo === false && (
                                <p className="text-xs text-muted-foreground">Curso inactivo</p>
                              )}
                            </div>
                          </div>
                          <GraduationCap className={`h-4 w-4 ${curso.activo ? 'text-green-500' : 'text-muted-foreground'}`} />
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>

            {/* Cliente info si aplica */}
            {lead.cliente && (
              <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-600">Convertido a Cliente</span>
                </div>
                <div className="text-sm space-y-1">
                  <p>Fecha alta: {new Date(lead.cliente.fechaAlta).toLocaleDateString('es-AR')}</p>
                  <p>Estado: <Badge variant="outline">{lead.cliente.estado}</Badge></p>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </SheetContent>

      {/* Alert de confirmación para convertir a cliente */}
      <AlertDialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Convertir a Cliente</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                ¿Estás seguro de que deseas convertir a 
                <span className="font-semibold"> {lead?.nombre} {lead?.apellido}</span> en cliente?
                <p className="mt-2">Esta acción:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Creará un nuevo registro de cliente</li>
                  <li>Cambiará el estado del lead a "convertido"</li>
                  <li>Mantendrá todo el historial del lead</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isConverting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConvertToClient}
              disabled={isConverting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isConverting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Convirtiendo...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Convertir a Cliente
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  )
}
