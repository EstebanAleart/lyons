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
import { PhoneCountrySelect } from '@/components/ui/phone-country-select'
import { detectCountryFromPhone, formatInternationalPhone } from '@/lib/phone-utils'

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
    localidadId: 'null',
    cursoId: 'null',
  })
  // Estado para país de teléfono
  const [country, setCountry] = useState('UY')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Opciones para los selects
  const [localidades, setLocalidades] = useState([])
  const [cursos, setCursos] = useState([])
  
  // Estados para agregar nuevos items
  const [newLocalidad, setNewLocalidad] = useState('')
  const [newCurso, setNewCurso] = useState('')
  const [isAddingLocalidad, setIsAddingLocalidad] = useState(false)
  const [isAddingCurso, setIsAddingCurso] = useState(false)

  // Cargar opciones al abrir el modal
  useEffect(() => {
    if (open) {
      setIsLoading(true)
      Promise.all([
        fetch('/api/localidades').then(r => r.json()).catch(() => []),
        fetch('/api/cursos').then(r => r.json()).catch(() => []),
      ]).then(([locs, curs]) => {
        setLocalidades(locs)
        setCursos(curs)
        setIsLoading(false)
      })
    }
  }, [open])

  // Cargar datos del lead si estamos editando
  useEffect(() => {
    if (open && lead) {
      // Detectar país desde el teléfono si es posible
      let tel = lead.telefono || ''
      let detected = detectCountryFromPhone(tel)
      if (detected) {
        setCountry(detected.code)
        // Quitar prefijo para mostrar solo el número local
        setFormData({
          nombre: lead.nombre || '',
          apellido: lead.apellido || '',
          email: lead.email || '',
          telefono: tel.replace(detected.dial, ''),
          localidadId: lead.localidadId || 'null',
          cursoId: lead.cursoId || 'null',
        })
      } else {
        setCountry('UY')
        setFormData({
          nombre: lead.nombre || '',
          apellido: lead.apellido || '',
          email: lead.email || '',
          telefono: tel,
          localidadId: lead.localidadId || 'null',
          cursoId: lead.cursoId || 'null',
        })
      }
    } else if (open && !lead) {
      // Reset form para crear nuevo
      setCountry('UY')
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        localidadId: 'null',
        cursoId: 'null',
      })
    }
  }, [open, lead])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Función para agregar nueva localidad
  const handleAddLocalidad = async () => {
    if (!newLocalidad.trim()) return
    setIsAddingLocalidad(true)
    try {
      const response = await fetch('/api/localidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: newLocalidad.trim() })
      })
      if (response.ok) {
        const newLoc = await response.json()
        setLocalidades(prev => [...prev, newLoc])
        setFormData(prev => ({ ...prev, localidadId: newLoc.id }))
        setNewLocalidad('')
        toast.success('Localidad agregada', { description: newLoc.nombre })
      } else {
        const error = await response.json()
        if (response.status === 409 && error.error?.includes('existe')) {
          toast.error('Ya existe una localidad con ese nombre')
        } else {
          toast.error('Error al agregar localidad', { description: error.error || 'Error desconocido' })
        }
      }
    } catch (error) {
      toast.error('Error al agregar localidad', { description: error.message })
    } finally {
      setIsAddingLocalidad(false)
    }
  }

  // Función para agregar nuevo curso
  const handleAddCurso = async () => {
    if (!newCurso.trim()) return
    
    setIsAddingCurso(true)
    try {
      const response = await fetch('/api/cursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: newCurso.trim() })
      })
      
      if (response.ok) {
        const newCrs = await response.json()
        setCursos(prev => [...prev, newCrs])
        setFormData(prev => ({ ...prev, cursoId: newCrs.id }))
        setNewCurso('')
        toast.success('Curso agregado', { description: newCrs.nombre })
      } else {
        toast.error('Error al agregar curso')
      }
    } catch (error) {
      toast.error('Error al agregar curso')
    } finally {
      setIsAddingCurso(false)
    }
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
    // Formatear teléfono internacional antes de enviar
    let intlPhone = formData.telefono.trim()
    if (intlPhone) {
      intlPhone = formatInternationalPhone(intlPhone, country)
    }
    
    setIsSubmitting(true)
    
    try {
      const url = isEditing ? `/api/leads/${lead.id}` : '/api/leads'
      const method = isEditing ? 'PUT' : 'POST'
      
      // Preparar datos convirtiendo "null" string a null
      const submitData = {
        ...formData,
        telefono: intlPhone,
        localidadId: formData.localidadId === 'null' ? null : formData.localidadId,
        cursoId: formData.cursoId === 'null' ? null : formData.cursoId,
      }
      
      console.log('Form submitData:', submitData);
      console.log('URL:', url, 'Method:', method);
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        console.error('API Error:', error);
        throw new Error(error.error || error.message || 'Error al guardar')
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
      console.error('Form Error:', error)
      toast.error('Error', { 
        description: error.message || 'No se pudo guardar el lead' 
      })
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

            {/* Teléfono internacional con país */}
            <div className="space-y-2">
              <Label htmlFor="telefono" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Teléfono
              </Label>
              <div className="flex gap-2">
                <div className="w-36">
                  <PhoneCountrySelect value={country} onChange={setCountry} />
                </div>
                <Input
                  id="telefono"
                  placeholder="Teléfono sin prefijo"
                  value={formData.telefono}
                  onChange={e => handleChange('telefono', e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={15}
                  disabled={isSubmitting}
                />
              </div>
              <div className="text-xs text-muted-foreground pl-8">
                Guardado como: <span className="font-mono">{formatInternationalPhone(formData.telefono, country)}</span>
              </div>
            </div>

            {/* Localidad */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Localidad
              </Label>
              <div className="space-y-2">
                <Select 
                  value={formData.localidadId} 
                  onValueChange={(v) => handleChange('localidadId', v)}
                  disabled={isSubmitting || isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoading ? "Cargando..." : "Seleccionar localidad"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Sin especificar</SelectItem>
                    {localidades.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Agregar nueva localidad */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Nueva localidad"
                    value={newLocalidad}
                    onChange={(e) => setNewLocalidad(e.target.value)}
                    disabled={isSubmitting || isAddingLocalidad}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddLocalidad}
                    disabled={!newLocalidad.trim() || isSubmitting || isAddingLocalidad}
                  >
                    {isAddingLocalidad ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      '+ Agregar'
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Curso de interés */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Curso de interés
              </Label>
              <div className="space-y-2">
                <Select 
                  value={formData.cursoId} 
                  onValueChange={(v) => handleChange('cursoId', v)}
                  disabled={isSubmitting || isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoading ? "Cargando..." : "Seleccionar curso"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Sin especificar</SelectItem>
                    {cursos.map((curso) => (
                      <SelectItem key={curso.id} value={curso.id}>
                        {curso.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Agregar nuevo curso */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Nuevo curso"
                    value={newCurso}
                    onChange={(e) => setNewCurso(e.target.value)}
                    disabled={isSubmitting || isAddingCurso}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCurso}
                    disabled={!newCurso.trim() || isSubmitting || isAddingCurso}
                  >
                    {isAddingCurso ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      '+ Agregar'
                    )}
                  </Button>
                </div>
              </div>
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
