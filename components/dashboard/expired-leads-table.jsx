'use client'

import { useEffect, useRef, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Phone, Mail, AlertCircle, Search, ChevronLeft, ChevronRight, X, MessageCircle, Eye, Pencil } from 'lucide-react'
import {
  fetchAllLeadsVencidosIncrementally,
  setFilter,
  clearFilters,
  setPage,
  setPerPage,
  resetLeadsVencidos,
  selectFilteredLeadsVencidos,
  selectPaginatedLeadsVencidos,
  selectUniqueFilterOptions,
  selectLoadingState,
} from '@/lib/store/leadsVencidosSlice'
import { ContactModal } from '@/components/contact-modal'
import { LeadFormModal } from '@/components/lead-form-modal'
import { LeadDetailDrawer } from '@/components/lead-detail-drawer'

// Colores corporativos para estados
const estadoColors = {
  nuevo: 'bg-[#0f2d4c]/20 text-[#0f2d4c] border-[#0f2d4c]/30',
  contactado: 'bg-[#1a4a7a]/20 text-[#1a4a7a] border-[#1a4a7a]/30',
  interesado: 'bg-[#f7a90c]/20 text-[#f7a90c] border-[#f7a90c]/30',
  convertido: 'bg-[#24c65d]/20 text-[#24c65d] border-[#24c65d]/30',
}

export function ExpiredLeadsTable() {
  const dispatch = useDispatch()
  const hasFetched = useRef(false)
  
  // Estado para el modal de contacto
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  
  // Estado para el drawer de detalle
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [selectedLeadId, setSelectedLeadId] = useState(null)
  
  // Estado para el modal de formulario (editar)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingLead, setEditingLead] = useState(null)

  // Selectores Redux
  const filters = useSelector(state => state.leadsVencidos.filters)
  const pagination = useSelector(state => state.leadsVencidos.pagination)
  const { isLoading, isLoadingMore, isFullyLoaded, loadedCount, total, error } = useSelector(selectLoadingState)
  const filteredLeads = useSelector(selectFilteredLeadsVencidos)
  const paginatedLeads = useSelector(selectPaginatedLeadsVencidos)
  const filterOptions = useSelector(selectUniqueFilterOptions)

  // Cargar leads vencidos al montar
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true
      dispatch(fetchAllLeadsVencidosIncrementally())
    }
  }, [dispatch])

  // Opciones de filtro
  const estados = useMemo(() => ['Todos', ...filterOptions.estados], [filterOptions.estados])

  // Handlers
  const handleSearchChange = (e) => {
    dispatch(setFilter({ key: 'search', value: e.target.value }))
  }

  const handleFilterChange = (key, value) => {
    dispatch(setFilter({ key, value }))
  }

  const handleClearFilters = () => {
    dispatch(clearFilters())
  }

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage))
  }

  const handlePerPageChange = (value) => {
    dispatch(setPerPage(parseInt(value)))
  }

  const handleContactClick = (lead) => {
    setSelectedLead(lead)
    setContactModalOpen(true)
  }

  const handleContactComplete = (leadId, method, comment) => {
    // Opcionalmente refrescar los datos
    console.log('Contacto registrado:', { leadId, method, comment })
  }

  const handleViewDetail = (leadId) => {
    setSelectedLeadId(leadId)
    setDetailDrawerOpen(true)
  }

  const handleContactFromDrawer = (lead) => {
    setDetailDrawerOpen(false)
    setSelectedLead(lead)
    setContactModalOpen(true)
  }

  const handleEditLead = (lead) => {
    setEditingLead(lead)
    setFormModalOpen(true)
  }

  const handleFormSuccess = () => {
    // Refrescar los leads vencidos
    dispatch(resetLeadsVencidos())
    hasFetched.current = false
    dispatch(fetchAllLeadsVencidosIncrementally())
  }

  // Paginación
  const totalPages = Math.ceil(filteredLeads.length / pagination.perPage)
  const hasActiveFilters = filters.search || filters.estado !== 'Todos'
  const loadProgress = total > 0 ? (loadedCount / total) * 100 : 0

  if (isLoading && loadedCount === 0) {
    return (
      <Card className="border-border/50 bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-[#f7a90c]" />
            <CardTitle className="text-base font-medium text-foreground">
              Leads Vencidos ({'>'}30 días)
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground">Cargando leads vencidos...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[#f7a90c]" />
              <CardTitle className="text-base font-medium text-foreground">
                Leads Vencidos ({'>'}30 días)
              </CardTitle>
              <Badge variant="outline" className="ml-2">
                {loadedCount.toLocaleString()} de {total.toLocaleString()}
                {isFullyLoaded && ' ✓'}
              </Badge>
            </div>
          </div>

          {/* Progress bar mientras carga */}
          {!isFullyLoaded && total > 0 && (
            <div className="space-y-1">
              <Progress value={loadProgress} className="h-1.5" />
              <p className="text-xs text-muted-foreground">
                Cargando... {Math.round(loadProgress)}%
              </p>
            </div>
          )}

          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email..."
                value={filters.search}
                onChange={handleSearchChange}
                className="pl-9 h-9"
              />
            </div>
            
            <Select value={filters.estado} onValueChange={(v) => handleFilterChange('estado', v)}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                {estados.map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-9 gap-1">
                <X className="h-4 w-4" />
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {error ? (
          <div className="text-center py-8 text-red-500">Error: {error}</div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-muted-foreground">
                Mostrando {paginatedLeads.length} de {filteredLeads.length} leads vencidos
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Por página:</span>
                <Select value={pagination.perPage.toString()} onValueChange={handlePerPageChange}>
                  <SelectTrigger className="w-[70px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Mobile: Cards */}
            <div className="md:hidden divide-y">
              {paginatedLeads.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No se encontraron leads vencidos
                </div>
              ) : (
                paginatedLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-3 hover:bg-muted/50 cursor-pointer active:bg-muted transition-colors"
                    onClick={() => handleViewDetail(lead.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">
                            {lead.nombre} {lead.apellido}
                          </p>
                          <span
                            className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              lead.diasSinContacto > 60
                                ? 'bg-[#dc5a5a]/20 text-[#dc5a5a]'
                                : lead.diasSinContacto > 40
                                  ? 'bg-[#f7a90c]/20 text-[#f7a90c]'
                                  : 'bg-yellow-500/20 text-yellow-600'
                            }`}
                          >
                            {lead.diasSinContacto}d
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {lead.email || lead.telefono || 'Sin contacto'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className={`text-xs ${estadoColors[lead.estado] || ''}`}
                          >
                            {lead.estado}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        className="h-8 gap-1 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContactClick(lead);
                        }}
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Contactar
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop: Table */}
            <div className="hidden md:block overflow-x-auto">
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
                    <th className="pb-3 text-left text-xs font-medium text-muted-foreground">
                      Último comentario
                    </th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLeads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No se encontraron leads vencidos
                      </td>
                    </tr>
                  ) : (
                    paginatedLeads.map((lead) => (
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
                              Último: {lead.ultimoContacto 
                                ? new Date(lead.ultimoContacto).toLocaleDateString('es-AR')
                                : 'Nunca'}
                            </p>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="space-y-1">
                            <p className="text-sm text-foreground">{lead.email || '-'}</p>
                            <p className="text-xs text-muted-foreground">{lead.telefono || '-'}</p>
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <span
                            className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium ${
                              lead.diasSinContacto > 60
                                ? 'bg-[#dc5a5a]/20 text-[#dc5a5a]'
                                : lead.diasSinContacto > 40
                                  ? 'bg-[#f7a90c]/20 text-[#f7a90c]'
                                  : 'bg-yellow-500/20 text-yellow-600'
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
                        <td className="py-3 max-w-[200px]">
                          {lead.ultimoComentario ? (
                            <div className="space-y-1">
                              <p className="text-xs text-foreground line-clamp-2">
                                {lead.ultimoComentario}
                              </p>
                              {lead.ultimoCanal && (
                                <Badge variant="secondary" className="text-xs">
                                  vía {lead.ultimoCanal}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Sin comentarios</span>
                          )}
                        </td>
                        <td className="py-3">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              onClick={() => handleEditLead(lead)}
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              onClick={() => handleViewDetail(lead.id)}
                              title="Ver detalle"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                              onClick={() => handleContactClick(lead)}
                              title="Contactar"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
                <div className="text-sm text-muted-foreground">
                  Página {pagination.page} de {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === totalPages}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
      
      {/* Modal de contacto */}
      <ContactModal
        open={contactModalOpen}
        onOpenChange={setContactModalOpen}
        lead={selectedLead}
        onContactComplete={handleContactComplete}
      />
      
      {/* Modal de formulario (editar) */}
      <LeadFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        lead={editingLead}
        onSuccess={handleFormSuccess}
      />
      
      {/* Drawer de detalle del lead */}
      <LeadDetailDrawer
        open={detailDrawerOpen}
        onOpenChange={setDetailDrawerOpen}
        leadId={selectedLeadId}
        onContact={handleContactFromDrawer}
      />
    </Card>
  )
}
