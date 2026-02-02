
'use client'

import { useEffect, useState } from 'react';

// Client-only date formatting to avoid hydration mismatch
function ClientDate({ dateString }) {
  const [formatted, setFormatted] = useState(dateString);
  useEffect(() => {
    const date = new Date(dateString);
    setFormatted(date.toLocaleDateString('es-AR'));
  }, [dateString]);
  return <>{formatted}</>;
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { leadsVencidos } from '@/lib/mock-data'
import { Phone, Mail, AlertCircle, Download } from 'lucide-react'

// Colores corporativos para estados
const estadoColors = {
  Nuevo: 'bg-[#0f2d4c]/20 text-[#0f2d4c] border-[#0f2d4c]/30',
  Contactado: 'bg-[#1a4a7a]/20 text-[#1a4a7a] border-[#1a4a7a]/30',
  Interesado: 'bg-[#f7a90c]/20 text-[#f7a90c] border-[#f7a90c]/30',
}

export function ExpiredLeadsTable() {
  const handleExportCSV = () => {
    const headers = ['Nombre', 'Email', 'Teléfono', 'Días sin contacto', 'Último contacto', 'Estado']
    const rows = leadsVencidos.map(lead => [
      `${lead.nombre} ${lead.apellido}`,
      lead.email,
      lead.telefono,
      lead.diasSinContacto.toString(),
      lead.ultimoContacto,
      lead.estado
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `leads_vencidos_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-[#f7a90c]" />
          <CardTitle className="text-base font-medium text-foreground">
            Leads Vencidos ({'>'}30 días)
          </CardTitle>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          className="gap-2 bg-transparent"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="pb-3 text-left text-xs font-medium text-muted-foreground">
                  Lead
                </th>
                <th className="pb-3 text-left text-xs font-medium text-muted-foreground">
                  Contacto
                </th>
                <th className="pb-3 text-center text-xs font-medium text-muted-foreground">
                  Días
                </th>
                <th className="pb-3 text-left text-xs font-medium text-muted-foreground">
                  Estado
                </th>
                <th className="pb-3 text-right text-xs font-medium text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {leadsVencidos.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-border/30 last:border-0"
                >
                  <td className="py-3">
                    <div>
                      <p className="font-medium text-foreground">
                        {lead.nombre} {lead.apellido}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {/* Avoid hydration mismatch: render raw date, format on client */}
                        <ClientDate dateString={lead.ultimoContacto} />
                      </p>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="space-y-1">
                      <p className="text-sm text-foreground">{lead.email}</p>
                      <p className="text-xs text-muted-foreground">{lead.telefono}</p>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <span
                      className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium ${
                        lead.diasSinContacto > 40
                          ? 'bg-[#dc5a5a]/20 text-[#dc5a5a]'
                          : 'bg-[#f7a90c]/20 text-[#f7a90c]'
                      }`}
                    >
                      {lead.diasSinContacto}d
                    </span>
                  </td>
                  <td className="py-3">
                    <Badge
                      variant="outline"
                      className={estadoColors[lead.estado] || 'bg-secondary text-foreground'}
                    >
                      {lead.estado}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
