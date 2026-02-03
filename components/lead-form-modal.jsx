'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, User, Mail, Phone, MapPin, BookOpen } from 'lucide-react'

export function LeadFormModal({ 
  open, 
  onOpenChange, 
  lead = null, // Si es null, es crear. Si tiene datos, es editar
  onSuccess
}) {
  const isEditing = !!lead
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    localidadId: '',
    origenId: '',
    cursoId: '',
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Opciones para los selects
  const [localidades, setLocalidades] = useState([])
  const [origenes, setOrigenes] = useState([])
  const [cursos, setCursos] = useState([])

  // Cargar opciones al abrir el modal
  useEffect(() => {
    if (open) {
      setIsLoading(true)
      Promise.all([
        fetch('/api/localidades').then(r => r.json()).catch(() => []),
        fetch('/api/origenes').then(r => r.json()).catch(() => []),
        fetch('/api/cursos').then(r => r.json()).catch(() => []),
      ]).then(([locs, origs, curs]) => {
        setLocalidades(locs)
        setOrigenes(origs)
        setCursos(curs)
        setIsLoading(false)
      })
    }
  }, [open])

  // Cargar datos del lead si estamos editando
  useEffect(() => {
    if (open && lead) {
      setFormData({
        nombre: lead.nombre || '',
        apellido: lead.apellido || '',
        email: lead.email || '',
        telefono: lead.telefono || '',
        localidadId: lead.localidadId || '',
        origenId: lead.origenId || '',
        cursoId: lead.cursoId || '',
      })
    } else if (open && !lead) {
      // Reset form para crear nuevo
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        localidadId: '',
        origenId: '',
        cursoId: '',
      })
    }
  }, [open, lead])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validación básica
    if (!formData.nombre.trim()) {
      toast.warning('Campo requerido', { description: 'El nombre es obligatorio' })
      return
    }
    
    if (!formData.telefono.trim() && !formData.email.trim()) {
      toast.warning('Datos de contacto', { description: 'Debe ingresar al menos un teléfono o email' })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const url = isEditing ? `/api/leads/${lead.id}` : '/api/leads'
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al guardar')
      }
      
      const result = await response.json()
      
      toast.success(isEditing ? 'Lead actualizado' : 'Lead creado', {
        description: `${formData.nombre} ${formData.apellido}`.trim()
      })
      
      if (onSuccess) {
        onSuccess(result)
      }
      
      onOpenChange(false)
      
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error', { description: error.message || 'No se pudo guardar el lead' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <span>{isEditing ? 'Editar Lead' : 'Nuevo Lead'}</span>
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modifica los datos del lead' 
              : 'Ingresa los datos del nuevo contacto'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  placeholder="Nombre"
                  value={formData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido</Label>
                <Input
                  id="apellido"
                  placeholder="Apellido"
                  value={formData.apellido}
                  onChange={(e) => handleChange('apellido', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@ejemplo.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="telefono" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Teléfono
              </Label>
              <Input
                id="telefono"
                placeholder="099 123 456"
                value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Localidad */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Localidad
              </Label>
              <Select 
                value={formData.localidadId} 
                onValueChange={(v) => handleChange('localidadId', v)}
                disabled={isSubmitting || isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoading ? "Cargando..." : "Seleccionar localidad"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin especificar</SelectItem>
                  {localidades.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Origen */}
            <div className="space-y-2">
              <Label>Origen</Label>
              <Select 
                value={formData.origenId} 
                onValueChange={(v) => handleChange('origenId', v)}
                disabled={isSubmitting || isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoading ? "Cargando..." : "Seleccionar origen"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin especificar</SelectItem>
                  {origenes.map((orig) => (
                    <SelectItem key={orig.id} value={orig.id}>
                      {orig.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Curso de interés */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Curso de interés
              </Label>
              <Select 
                value={formData.cursoId} 
                onValueChange={(v) => handleChange('cursoId', v)}
                disabled={isSubmitting || isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoading ? "Cargando..." : "Seleccionar curso"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin especificar</SelectItem>
                  {cursos.map((curso) => (
                    <SelectItem key={curso.id} value={curso.id}>
                      {curso.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                isEditing ? 'Guardar cambios' : 'Crear lead'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
