'use client'

import { useState } from 'react'
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
import { Phone, Mail, MessageCircle, Loader2, User, Clock } from 'lucide-react'

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
  // Si no tiene código de país, agregar 54 (Argentina)
  if (!cleaned.startsWith('54')) {
    cleaned = '54' + cleaned
  }
  return cleaned
}

function formatPhoneForCall(phone) {
  if (!phone) return ''
  let cleaned = phone.replace(/\D/g, '')
  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('54')) {
      cleaned = '+' + cleaned
    } else if (cleaned.startsWith('0')) {
      cleaned = '+54' + cleaned.substring(1)
    } else {
      cleaned = '+54' + cleaned
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
  const [method, setMethod] = useState('whatsapp')
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleContact = async () => {
    if (!lead) return
    
    setIsSubmitting(true)
    
    try {
      // Guardar la interacción en la DB
      const response = await fetch('/api/interacciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          metodo: method,
          nota: comment,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Error al guardar la interacción')
      }
      
      // Redirigir según el método
      let url = ''
      switch (method) {
        case 'whatsapp':
          const waPhone = formatPhoneForWhatsApp(lead.telefono)
          url = `https://wa.me/${waPhone}`
          break
        case 'email':
          const subject = encodeURIComponent('Seguimiento - ' + (lead.nombre || 'Lead'))
          url = `mailto:${lead.email}?subject=${subject}`
          break
        case 'llamada':
          const callPhone = formatPhoneForCall(lead.telefono)
          url = `tel:${callPhone}`
          break
      }
      
      // Abrir en nueva pestaña/app
      if (url) {
        window.open(url, '_blank')
      }
      
      // Callback para refrescar datos si es necesario
      if (onContactComplete) {
        onContactComplete(lead.id, method, comment)
      }
      
      // Cerrar modal y limpiar
      setComment('')
      setMethod('whatsapp')
      onOpenChange(false)
      
    } catch (error) {
      console.error('Error:', error)
      alert('Error al registrar el contacto')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setComment('')
    setMethod('whatsapp')
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
          {/* Info del lead */}
          <div className="rounded-lg bg-muted/50 p-3 space-y-1">
            {lead.telefono && (
              <p className="text-sm flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {lead.telefono}
              </p>
            )}
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
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleContact} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                {CONTACT_METHODS.find(m => m.id === method)?.icon && (
                  <span className="mr-2">
                    {(() => {
                      const Icon = CONTACT_METHODS.find(m => m.id === method)?.icon
                      return Icon ? <Icon className="h-4 w-4" /> : null
                    })()}
                  </span>
                )}
                Contactar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
