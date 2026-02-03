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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Loader2,
  UserMinus,
  Trash2,
  Award
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

const estadoColors = {
  activo: "bg-green-500/20 text-green-600 border-green-500/30",
  inactivo: "bg-gray-500/20 text-gray-600 border-gray-500/30",
  egresado: "bg-blue-500/20 text-blue-600 border-blue-500/30",
  suspendido: "bg-red-500/20 text-red-600 border-red-500/30",
}

const estadoLabels = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  egresado: 'Egresado',
  suspendido: 'Suspendido',
}

export function ClienteDetailDrawer({ 
  open, 
  onOpenChange, 
  clienteId,
  onContact,
  onStatusChange,
  onDelete
}) {
  const [cliente, setCliente] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  useEffect(() => {
    if (open && clienteId) {
      setLoading(true)
      setError(null)
      
      fetch(`/api/clientes/${clienteId}`)
        .then(res => {
          if (!res.ok) throw new Error('Error al cargar cliente')
          return res.json()
        })
        .then(data => {
          setCliente(data)
          setLoading(false)
        })
        .catch(err => {
          setError(err.message)
          setLoading(false)
        })
    } else if (!open) {
      setCliente(null)
      setError(null)
    }
  }, [open, clienteId])

  const handleStatusChange = async (newStatus) => {
    if (!cliente || newStatus === cliente.estadoCliente) return
    
    setIsUpdatingStatus(true)
    try {
      const response = await fetch(`/api/clientes/${cliente.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estadoCliente: newStatus })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al actualizar')
      }
      
      toast.success('Estado actualizado', {
        description: `${cliente.nombre} ${cliente.apellido} ahora está ${estadoLabels[newStatus]?.toLowerCase()}`
      })
      
      // Actualizar local
      setCliente(prev => ({ ...prev, estadoCliente: newStatus }))
      
      // Notificar al padre para actualizar Redux
      if (onStatusChange) {
        onStatusChange(cliente.id, newStatus)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error', { description: error.message })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleDelete = async () => {
    if (!cliente) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/clientes/${cliente.id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar')
      }
      
      toast.success('Cliente eliminado', {
        description: `${cliente.nombre} ${cliente.apellido} ya no es cliente. El lead se mantiene en el sistema.`
      })
      
      // Notificar al padre para actualizar Redux
      if (onDelete) {
        onDelete(cliente.id)
      }
      
      // Cerrar el drawer
      onOpenChange(false)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error', { description: error.message })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-500" />
            Detalle de Cliente
          </SheetTitle>
          <SheetDescription>
            Información completa del cliente
          </SheetDescription>
        </SheetHeader>

        {loading && (
          <div className="space-y-4 mt-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {cliente && !loading && (
          <ScrollArea className="h-[calc(100vh-120px)] pr-4">
            <div className="space-y-6 mt-6">
              {/* Header del cliente */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <User className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{cliente.nombre} {cliente.apellido}</h3>
                    <p className="text-muted-foreground text-sm">
                      Cliente desde {cliente.fechaAlta ? new Date(cliente.fechaAlta).toLocaleDateString('es-AR') : '-'}
                    </p>
                    <Badge className={`mt-1 ${estadoColors[cliente.estadoCliente] || estadoColors.activo}`}>
                      {estadoLabels[cliente.estadoCliente] || cliente.estadoCliente}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Cambiar estado */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <label className="text-sm font-medium">Cambiar estado del cliente</label>
                <Select 
                  value={cliente.estadoCliente} 
                  onValueChange={handleStatusChange}
                  disabled={isUpdatingStatus}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-green-500" />
                        Activo
                      </div>
                    </SelectItem>
                    <SelectItem value="egresado">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-blue-500" />
                        Egresado (completó el curso)
                      </div>
                    </SelectItem>
                    <SelectItem value="inactivo">
                      <div className="flex items-center gap-2">
                        <UserMinus className="h-4 w-4 text-gray-500" />
                        Inactivo (dejó el curso)
                      </div>
                    </SelectItem>
                    <SelectItem value="suspendido">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-red-500" />
                        Suspendido
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {isUpdatingStatus && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Actualizando...
                  </p>
                )}
              </div>

              {/* Información de contacto */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Información de Contacto
                </h4>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  {cliente.email && (
                    <a href={`mailto:${cliente.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                      <Mail className="h-4 w-4" />
                      {cliente.email}
                    </a>
                  )}
                  {cliente.telefono && (
                    <a href={`tel:${cliente.telefono}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                      <Phone className="h-4 w-4" />
                      {cliente.telefono}
                    </a>
                  )}
                  {cliente.localidad && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {cliente.localidad}
                    </div>
                  )}
                </div>
              </div>

              {/* Tabs con más info */}
              <Tabs defaultValue="cursos" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="cursos" className="text-xs">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    Cursos
                  </TabsTrigger>
                  <TabsTrigger value="historial" className="text-xs">
                    <History className="h-3 w-3 mr-1" />
                    Historial
                  </TabsTrigger>
                  <TabsTrigger value="interacciones" className="text-xs">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Contacto
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="cursos" className="mt-4">
                  {cliente.cursos?.length > 0 ? (
                    <div className="space-y-2">
                      {cliente.cursos.map((curso, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                          <GraduationCap className="h-4 w-4 text-primary" />
                          <span className="text-sm">{curso.nombre}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sin cursos registrados</p>
                  )}
                </TabsContent>

                <TabsContent value="historial" className="mt-4">
                  {cliente.historialEstados?.length > 0 ? (
                    <div className="space-y-2">
                      {cliente.historialEstados.map((h, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <div className="flex items-center gap-2">
                            <History className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm capitalize">{h.estado}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {h.fecha ? new Date(h.fecha).toLocaleDateString('es-AR') : '-'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sin historial</p>
                  )}
                </TabsContent>

                <TabsContent value="interacciones" className="mt-4">
                  {cliente.interacciones?.length > 0 ? (
                    <div className="space-y-2">
                      {cliente.interacciones.map((i, idx) => (
                        <div key={idx} className="p-2 bg-muted/50 rounded space-y-1">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">{i.resultado}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {i.fecha ? new Date(i.fecha).toLocaleDateString('es-AR') : '-'}
                            </span>
                          </div>
                          {i.nota && (
                            <p className="text-sm text-muted-foreground">{i.nota}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sin interacciones</p>
                  )}
                </TabsContent>
              </Tabs>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{cliente.stats?.diasComoCliente || 0}</p>
                  <p className="text-xs text-muted-foreground">Días como cliente</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{cliente.stats?.totalInteracciones || 0}</p>
                  <p className="text-xs text-muted-foreground">Interacciones</p>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex flex-col gap-2 pt-4 border-t">
                {onContact && (
                  <Button 
                    onClick={() => onContact(cliente)} 
                    className="w-full"
                    variant="outline"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Registrar Contacto
                  </Button>
                )}
                
                <Button 
                  onClick={() => setDeleteDialogOpen(true)}
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Cliente
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  El lead se mantendrá en el sistema para estadísticas
                </p>
              </div>
            </div>
          </ScrollArea>
        )}
      </SheetContent>

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                ¿Estás seguro de que deseas eliminar a 
                <span className="font-semibold"> {cliente?.nombre} {cliente?.apellido}</span> como cliente?
                <p className="mt-2">Esta acción:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Eliminará el registro de cliente</li>
                  <li>El lead se mantendrá en el sistema</li>
                  <li>El lead volverá a estado "contactado"</li>
                  <li>Se conservarán las estadísticas de conversión</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  )
}
