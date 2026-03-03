'use client'

import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Phone, Mail, MessageCircle, Loader2, User, Clock, UserCheck } from 'lucide-react'
import { PhoneCountrySelect } from '@/components/ui/phone-country-select'
import { COUNTRIES } from '@/lib/countries'
import { detectCountryFromPhone, formatInternationalPhone } from '@/lib/phone-utils'

const CONTACT_METHODS = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: MessageCircle,
    color: 'bg-green-500/20 text-green-600 border-green-500/50 hover:bg-green-500/30',
    activeColor: 'bg-green-500 text-white border-green-500',
  },
  {
    id: 'email',
    label: 'Email',
    icon: Mail,
    color: 'bg-blue-500/20 text-blue-600 border-blue-500/50 hover:bg-blue-500/30',
    activeColor: 'bg-blue-500 text-white border-blue-500',
  },
  {
    id: 'llamada',
    label: 'Llamada',
    icon: Phone,
    color: 'bg-purple-500/20 text-purple-600 border-purple-500/50 hover:bg-purple-500/30',
    activeColor: 'bg-purple-500 text-white border-purple-500',
  },
]

function formatPhoneForWhatsApp(phone) {
  if (!phone) return ''
  // Eliminar todo lo que no sea número
  let cleaned = phone.replace(/\D/g, '')
  // Si empieza con 0, quitarlo
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1)
  }
  // Si ya tiene código de país válido, usarlo
  if (cleaned.startsWith('598') || cleaned.startsWith('54') || cleaned.startsWith('55')) {
    return cleaned
  }
  // Por defecto agregar 598 (Uruguay)
  cleaned = '598' + cleaned
  return cleaned
}

function formatPhoneForCall(phone) {
  if (!phone) return ''
  let cleaned = phone.replace(/\D/g, '')
  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('598') || cleaned.startsWith('54') || cleaned.startsWith('55')) {
      cleaned = '+' + cleaned
    } else if (cleaned.startsWith('0')) {
      cleaned = '+598' + cleaned.substring(1)
    } else {
      cleaned = '+598' + cleaned
    }
  }
  return cleaned
}

export function ContactModal({ 
  open, 
  onOpenChange, 
  lead,
  onContactComplete 
}) {
  // Estado para país y teléfono
  const [country, setCountry] = useState('UY')
  const [telefono, setTelefono] = useState('')
  const [method, setMethod] = useState('whatsapp')
  const [comment, setComment] = useState('')
  const [usuarioId, setUsuarioId] = useState('')
  const [usuarios, setUsuarios] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingUsuarios, setLoadingUsuarios] = useState(false)
  const [contacted, setContacted] = useState(false) // Ya se abrió el canal de contacto
  const [saved, setSaved] = useState(false) // Ya se guardó la interacción
  const [interaccionId, setInteraccionId] = useState(null) // ID de la interacción guardada
  // Redux dispatch
  const dispatch = useDispatch();

  // Cargar usuarios/asesores y setear país/teléfono al abrir el modal
  useEffect(() => {
    if (open && lead) {
      setLoadingUsuarios(true)
      fetch('/api/usuarios')
        .then(res => res.json())
        .then(data => {
          setUsuarios(data)
          setLoadingUsuarios(false)
        })
        .catch(err => {
          console.error('Error cargando usuarios:', err)
          setLoadingUsuarios(false)
        })
      // Detectar país y teléfono
      let tel = lead.telefono || ''
      let detected = detectCountryFromPhone(tel)
      if (detected) {
        setCountry(detected.code)
        // Quitar prefijo para mostrar solo el número local
        setTelefono(tel.replace(detected.dial, ''))
      } else {
        setCountry('UY')
        setTelefono(tel)
      }
    }
  }, [open, lead])

  const handleContact = async () => {
    if (!lead) return
    // Validar email
    if (method === 'email' && !lead.email) {
      toast.warning('Sin email', { description: 'Este contacto no tiene email registrado' })
      return
    }
    // Validar teléfono
    if ((method === 'whatsapp' || method === 'llamada') && !telefono) {
      toast.warning('Sin teléfono', { description: 'Debes ingresar el teléfono' })
      return
    }
    // Formatear teléfono internacional
    const intlPhone = formatInternationalPhone(telefono, country)
    // Si el teléfono cambió, actualizar en Redux (optimista) y backend
    if (intlPhone !== lead.telefono) {
      // Optimistic update in Redux
      dispatch({ type: 'leads/updateLeadTelefono', payload: { leadId: lead.id, telefono: intlPhone } });
      // Update in backend
      await fetch(`/api/leads/${lead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefono: intlPhone })
      });
    }
    // Abrir canal
    let url = ''
    switch (method) {
      case 'whatsapp':
        url = `https://wa.me/${intlPhone.replace('+','')}`
        break
      case 'email':
        const subject = encodeURIComponent('Seguimiento - ' + (lead.nombre || 'Lead'))
        const body = encodeURIComponent('')
        url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(lead.email)}&su=${subject}&body=${body}`
        break
      case 'llamada':
        url = `tel:${intlPhone}`
        break
    }
    if (url) {
      window.open(url, '_blank')
      setContacted(true)
      toast.success('Canal abierto', { description: 'Agrega una nota sobre el contacto y guarda' })
    }
  }
  
  const handleSave = async (closeAfter = false) => {
    if (!lead) return
    
    setIsSubmitting(true)
    
    try {
      let response
      
      if (saved && interaccionId) {
        // Actualizar interacción existente
        response = await fetch(`/api/interacciones/${interaccionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nota: comment,
            usuarioId: usuarioId || null,
          }),
        })
      } else {
        // Crear nueva interacción
        response = await fetch('/api/interacciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId: lead.id,
            metodo: method,
            nota: comment,
            usuarioId: usuarioId || null,
          }),
        })
      }
      
      if (!response.ok) {
        throw new Error('Error al guardar la interacción')
      }
      
      const data = await response.json()
      
      if (!saved) {
        setInteraccionId(data.interaccion?.id || data.id)
        setSaved(true)
      }
      
      toast.success(saved ? 'Nota actualizada' : 'Contacto registrado', {
        description: comment ? 'Se guardó la nota del contacto' : 'Interacción registrada'
      })
      
      // Callback para refrescar datos si es necesario
      if (onContactComplete) {
        onContactComplete(lead.id, method, comment)
      }
      
      if (closeAfter) {
        // Cerrar modal y limpiar
        setComment('')
        setMethod('whatsapp')
        setUsuarioId('')
        setContacted(false)
        setSaved(false)
        setInteraccionId(null)
        onOpenChange(false)
      }
      
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error', {
        description: 'No se pudo registrar el contacto'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setComment('')
    setMethod('whatsapp')
    setUsuarioId('')
    setContacted(false)
    setSaved(false)
    setInteraccionId(null)
    onOpenChange(false)
  }

  if (!lead) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="block">{lead.nombre} {lead.apellido}</span>
              <span className="text-sm font-normal text-muted-foreground">
                Registrar contacto
              </span>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Selecciona el método de contacto y deja un comentario
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Info del lead y edición de teléfono internacional */}
          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div className="flex gap-2 w-full">
                <div className="w-36">
                  <PhoneCountrySelect value={country} onChange={setCountry} />
                </div>
                <input
                  type="tel"
                  className="input input-sm border rounded px-2 py-1 w-full"
                  placeholder="Teléfono sin prefijo"
                  value={telefono}
                  onChange={e => setTelefono(e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={15}
                />
              </div>
            </div>
            <div className="text-xs text-muted-foreground pl-8">
              Guardado como: <span className="font-mono">{formatInternationalPhone(telefono, country)}</span>
            </div>
            {lead.email && (
              <p className="text-sm flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {lead.email}
              </p>
            )}
            {lead.ultimoContacto && (
              <p className="text-sm flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                Último contacto: {new Date(lead.ultimoContacto).toLocaleDateString('es-AR')}
              </p>
            )}
            {lead.diasSinContacto && (
              <Badge variant="outline" className="mt-2 bg-orange-500/10 text-orange-600 border-orange-500/30">
                {lead.diasSinContacto} días sin contacto
              </Badge>
            )}
          </div>

          {/* Selector de método */}
          <div className="space-y-2">
            <Label>Método de contacto</Label>
            <div className="grid grid-cols-3 gap-2">
              {CONTACT_METHODS.map((m) => {
                const Icon = m.icon
                const isActive = method === m.id
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                      isActive ? m.activeColor : m.color
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{m.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Comentario */}
          <div className="space-y-2">
            <Label htmlFor="comment">Comentario (opcional)</Label>
            <Textarea
              id="comment"
              placeholder="Ej: Interesado en el curso de verano, llamar después de las 18hs..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Este comentario será visible cuando el lead vuelva a aparecer como vencido
            </p>
          </div>

          {/* Selector de Asesor */}
          <div className="space-y-2">
            <Label htmlFor="asesor" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Asesor responsable
            </Label>
            <Select value={usuarioId} onValueChange={setUsuarioId}>
              <SelectTrigger id="asesor" disabled={loadingUsuarios}>
                <SelectValue placeholder={loadingUsuarios ? "Cargando..." : "Seleccionar asesor (opcional)"} />
              </SelectTrigger>
              <SelectContent>
                {usuarios.map((usuario) => (
                  <SelectItem key={usuario.id} value={usuario.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      {usuario.nombre}
                      {usuario.rol && (
                        <span className="text-xs text-muted-foreground">({usuario.rol})</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting} className="sm:mr-auto">
            {saved ? 'Cerrar' : 'Cancelar'}
          </Button>
          
          <div className="flex gap-2">
            {/* Botón Guardar/Actualizar nota - siempre visible */}
            <Button 
              variant="outline"
              onClick={() => handleSave(false)} 
              disabled={isSubmitting || !comment.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : saved ? (
                'Actualizar nota'
              ) : (
                'Guardar nota'
              )}
            </Button>
            
            {/* Botón Contactar */}
            <Button onClick={handleContact}>
              {(() => {
                const Icon = CONTACT_METHODS.find(m => m.id === method)?.icon
                return Icon ? <Icon className="h-4 w-4 mr-2" /> : null
              })()}
              {contacted ? 'Contactar de nuevo' : 'Contactar'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
