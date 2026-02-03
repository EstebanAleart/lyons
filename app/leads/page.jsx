"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navbar } from "@/components/dashboard/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Filter, Download, Phone, Mail, MessageCircle, X, ChevronLeft, ChevronRight, Plus, Pencil, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ContactModal } from "@/components/contact-modal";
import { LeadFormModal } from "@/components/lead-form-modal";
import { LeadDetailDrawer } from "@/components/lead-detail-drawer";
import {
  fetchAllLeadsIncrementally,
  setFilter,
  clearFilters,
  setPage,
  setPerPage,
  resetLeads,
  markLeadAsClient,
  updateLeadEtapa,
  selectPaginatedLeads,
  selectUniqueFilterOptions,
  selectLoadingState,
} from "@/lib/store/leadsSlice";

const etapaColors = {
  nuevo: "bg-blue-500/20 text-blue-600 border-blue-500/30",
  contactado: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
  interesado: "bg-purple-500/20 text-purple-600 border-purple-500/30",
  negociando: "bg-orange-500/20 text-orange-600 border-orange-500/30",
  convertido: "bg-green-500/20 text-green-600 border-green-500/30",
  perdido: "bg-red-500/20 text-red-600 border-red-500/30",
};

export default function LeadsPage() {
  const dispatch = useDispatch();
  const hasFetched = useRef(false);
  
  // Estado para el modal de contacto
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  
  // Estado para el modal de formulario (crear/editar)
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  
  // Estado para el drawer de detalle
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  
  // Estado para eliminar
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const filters = useSelector((state) => state.leads.filters);
  const { leads, totalFiltered, totalPages, currentPage, perPage } = useSelector(selectPaginatedLeads);
  const filterOptions = useSelector(selectUniqueFilterOptions);
  const { isLoading, isLoadingMore, isFullyLoaded, loadedCount, total, progress } = useSelector(selectLoadingState);

  useEffect(() => {
    // Evitar doble fetch en React Strict Mode o re-renders
    if (hasFetched.current) return;
    hasFetched.current = true;
    dispatch(fetchAllLeadsIncrementally());
  }, [dispatch]);

  const handleFilterChange = (key, value) => {
    dispatch(setFilter({ key, value }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
  };

  const handlePerPageChange = (value) => {
    dispatch(setPerPage(parseInt(value)));
  };

  const handleContactClick = (lead) => {
    setSelectedLead(lead);
    setContactModalOpen(true);
  };

  const handleContactComplete = (leadId, method, comment) => {
    console.log('Contacto registrado:', { leadId, method, comment });
  };

  const handleNewLead = () => {
    setEditingLead(null);
    setFormModalOpen(true);
  };

  const handleEditLead = (lead) => {
    setEditingLead(lead);
    setFormModalOpen(true);
  };

  const handleFormSuccess = (result) => {
    if (result && result.id) {
      if (!editingLead) {
        dispatch({ type: 'leads/addLead', payload: result });
      } else {
        dispatch({ type: 'leads/updateLead', payload: result });
      }
    }
  };

  const handleViewDetail = (leadId) => {
    setSelectedLeadId(leadId);
    setDetailDrawerOpen(true);
  };

  const handleDeleteClick = (lead) => {
    setLeadToDelete(lead);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!leadToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/leads/${leadToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar');
      }
      
      toast.success('Lead eliminado', {
        description: `${leadToDelete.nombre} ${leadToDelete.apellido}`.trim()
      });
      
      // Refrescar los leads
      dispatch(resetLeads());
      hasFetched.current = false;
      dispatch(fetchAllLeadsIncrementally());
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error', { description: error.message });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setLeadToDelete(null);
    }
  };

  const handleEtapaChangeInline = async (leadId, nuevaEtapa, leadNombre) => {
    // Obtener etapa anterior para poder revertir si falla
    const lead = leads.find(l => l.id === leadId);
    const etapaAnterior = lead?.etapaActual || lead?.etapa || 'nuevo';
    
    // OPTIMISTIC UPDATE: Actualizar Redux inmediatamente
    dispatch(updateLeadEtapa({ leadId, etapa: nuevaEtapa }));
    
    toast.success('Etapa actualizada', {
      description: `${leadNombre} → ${nuevaEtapa}`
    });
    
    // Luego hacer el POST en background
    try {
      const response = await fetch(`/api/leads/${leadId}/etapa`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          etapa: nuevaEtapa,
          cambiadoPor: 'Usuario'
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al guardar');
      }
      
    } catch (error) {
      // REVERTIR si falla el servidor
      console.error('Error:', error);
      dispatch(updateLeadEtapa({ leadId, etapa: etapaAnterior }));
      toast.error('Error al guardar', { description: 'Se revirtió el cambio' });
    }
  };

  const handleExportCSV = () => {
    const headers = ["Nombre", "Email", "Teléfono", "Curso", "Canal", "Etapa", "Asesor", "Fecha Creación", "Último Contacto"];
    const rows = leads.map((c) => [
      c.nombre,
      c.email,
      c.telefono,
      c.curso,
      c.canal,
      c.etapa,
      c.asesor,
      c.fechaCreacion,
      c.ultimoContacto,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map(cell => `"${cell || ''}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `contactos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const activeFiltersCount = Object.values(filters).filter((f) => f !== "Todos" && f !== "").length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Contactos</h1>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">
                {totalFiltered.toLocaleString()} de {loadedCount.toLocaleString()} contactos cargados
              </p>
              {!isFullyLoaded && (
                <span className="text-xs text-muted-foreground">
                  (cargando más en segundo plano...)
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleNewLead} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Lead
            </Button>
            <Button onClick={handleExportCSV} variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Loading Progress */}
        {!isFullyLoaded && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-3">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Cargando contactos...</span>
                    <span className="text-sm text-muted-foreground">
                      {loadedCount.toLocaleString()} / {total.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                <div className="text-2xl font-bold text-primary">{progress}%</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount} activo{activeFiltersCount > 1 ? "s" : ""}
                  </Badge>
                )}
              </CardTitle>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleClearFilters} className="gap-1 text-muted-foreground">
                  <X className="h-4 w-4" />
                  Limpiar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative lg:col-span-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar nombre, email, teléfono..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Etapa Filter */}
              <Select value={filters.etapa} onValueChange={(v) => handleFilterChange("etapa", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por etapa">
                    {filters.etapa === 'Todos' ? (
                      <span className="text-muted-foreground">Todas las etapas</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          filters.etapa === 'nuevo' ? 'bg-blue-500' :
                          filters.etapa === 'contactado' ? 'bg-yellow-500' :
                          filters.etapa === 'interesado' ? 'bg-purple-500' :
                          filters.etapa === 'negociando' ? 'bg-orange-500' :
                          filters.etapa === 'convertido' ? 'bg-green-500' :
                          filters.etapa === 'perdido' ? 'bg-red-500' : 'bg-gray-400'
                        }`} />
                        {filters.etapa.charAt(0).toUpperCase() + filters.etapa.slice(1)}
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">
                    <span>Todas las etapas</span>
                  </SelectItem>
                  <SelectItem value="nuevo">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      Nuevo
                    </div>
                  </SelectItem>
                  <SelectItem value="contactado">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      Contactado
                    </div>
                  </SelectItem>
                  <SelectItem value="interesado">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      Interesado
                    </div>
                  </SelectItem>
                  <SelectItem value="negociando">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      Negociando
                    </div>
                  </SelectItem>
                  <SelectItem value="convertido">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Convertido
                    </div>
                  </SelectItem>
                  <SelectItem value="perdido">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      Perdido
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Curso Filter */}
              <Select value={filters.curso} onValueChange={(v) => handleFilterChange("curso", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Curso" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.cursos.map((curso) => (
                    <SelectItem key={curso} value={curso}>
                      {curso}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Canal Filter */}
              <Select value={filters.canal} onValueChange={(v) => handleFilterChange("canal", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Canal" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.canales.map((canal) => (
                    <SelectItem key={canal} value={canal}>
                      {canal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Asesor Filter */}
              <Select value={filters.asesor} onValueChange={(v) => handleFilterChange("asesor", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Asesor" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.asesores.map((asesor) => (
                    <SelectItem key={asesor} value={asesor}>
                      {asesor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Filtros de contacto */}
            <div className="flex items-center gap-6 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="tieneEmail"
                  checked={filters.tieneEmail}
                  onCheckedChange={(checked) => handleFilterChange("tieneEmail", checked)}
                />
                <label htmlFor="tieneEmail" className="text-sm font-medium cursor-pointer flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  Con email
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="tieneTelefono"
                  checked={filters.tieneTelefono}
                  onCheckedChange={(checked) => handleFilterChange("tieneTelefono", checked)}
                />
                <label htmlFor="tieneTelefono" className="text-sm font-medium cursor-pointer flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  Con teléfono
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table - Desktop / Cards - Mobile */}
        <Card>
          <CardContent className="p-0">
            {isLoading && loadedCount === 0 ? (
              <div className="h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                  <span className="text-muted-foreground">Cargando contactos...</span>
                </div>
              </div>
            ) : leads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron contactos con los filtros aplicados
              </div>
            ) : (
              <>
                {/* Mobile: Cards */}
                <div className="md:hidden divide-y">
                  {leads.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-4 hover:bg-muted/50 cursor-pointer active:bg-muted transition-colors"
                      onClick={() => handleViewDetail(contact.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {`${contact.nombre} ${contact.apellido}`.trim()}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {contact.email || contact.telefono || 'Sin contacto'}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className={`text-xs ${etapaColors[contact.etapaActual || contact.etapa] || ''}`}>
                              {contact.etapaActual || contact.etapa}
                            </Badge>
                            {contact.curso && (
                              <span className="text-xs text-muted-foreground truncate">
                                {contact.curso}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            className="h-8 gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContactClick(contact);
                            }}
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            Contactar
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            {contact.ultimoContacto || 'Sin contacto'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Contacto</TableHead>
                        <TableHead>Curso</TableHead>
                        <TableHead>Canal</TableHead>
                        <TableHead>Etapa</TableHead>
                        <TableHead>Asesor</TableHead>
                        <TableHead>Último Contacto</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell className="font-medium">{`${contact.nombre} ${contact.apellido}`.trim()}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="text-sm">{contact.email || '-'}</span>
                              <span className="text-xs text-muted-foreground">{contact.telefono || '-'}</span>
                            </div>
                          </TableCell>
                          <TableCell>{contact.curso}</TableCell>
                          <TableCell>{contact.canal}</TableCell>
                          <TableCell>
                            <Select 
                              value={contact.etapaActual || contact.etapa || 'nuevo'} 
                              onValueChange={(value) => handleEtapaChangeInline(contact.id, value, `${contact.nombre} ${contact.apellido}`.trim())}
                            >
                              <SelectTrigger className="w-[120px] h-8 text-xs">
                                <div className={`flex items-center gap-1.5 ${etapaColors[contact.etapaActual || contact.etapa] ? 'px-1.5 py-0.5 rounded' : ''}`}>
                                  <div className={`w-2 h-2 rounded-full ${
                                    (contact.etapaActual || contact.etapa) === 'nuevo' ? 'bg-blue-500' :
                                    (contact.etapaActual || contact.etapa) === 'contactado' ? 'bg-yellow-500' :
                                    (contact.etapaActual || contact.etapa) === 'interesado' ? 'bg-purple-500' :
                                    (contact.etapaActual || contact.etapa) === 'negociando' ? 'bg-orange-500' :
                                    (contact.etapaActual || contact.etapa) === 'convertido' ? 'bg-green-500' :
                                    (contact.etapaActual || contact.etapa) === 'perdido' ? 'bg-red-500' : 'bg-gray-400'
                                  }`} />
                                  <SelectValue />
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="nuevo">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    Nuevo
                                  </div>
                                </SelectItem>
                                <SelectItem value="contactado">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                    Contactado
                                  </div>
                                </SelectItem>
                                <SelectItem value="interesado">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                                    Interesado
                                  </div>
                                </SelectItem>
                                <SelectItem value="negociando">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                                    Negociando
                                  </div>
                                </SelectItem>
                                <SelectItem value="convertido">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    Convertido
                                  </div>
                                </SelectItem>
                                <SelectItem value="perdido">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    Perdido
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{contact.asesor}</TableCell>
                          <TableCell>{contact.ultimoContacto}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => handleEditLead(contact)}
                                title="Editar"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => handleViewDetail(contact.id)}
                                title="Ver detalle"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                onClick={() => handleContactClick(contact)}
                                title="Contactar"
                              >
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteClick(contact)}
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages} ({totalFiltered.toLocaleString()} resultados)
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Por página:</span>
                <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="w-8"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Modal de contacto */}
        <ContactModal
          open={contactModalOpen}
          onOpenChange={setContactModalOpen}
          lead={selectedLead}
          onContactComplete={handleContactComplete}
        />

        {/* Modal de formulario (crear/editar) */}
        <LeadFormModal
          open={formModalOpen}
          onOpenChange={setFormModalOpen}
          lead={editingLead}
          onSuccess={handleFormSuccess}
        />

        {/* Drawer de detalle */}
        <LeadDetailDrawer
          open={detailDrawerOpen}
          onOpenChange={setDetailDrawerOpen}
          leadId={selectedLeadId}
          onContact={(lead) => {
            setDetailDrawerOpen(false);
            handleContactClick(lead);
          }}
          onConvertSuccess={(leadId) => {
            dispatch(markLeadAsClient(leadId));
          }}
          onEtapaChange={(leadId, etapa) => {
            dispatch(updateLeadEtapa({ leadId, etapa }));
          }}
        />

        {/* Alert de confirmación para eliminar */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente el lead 
                <span className="font-semibold"> {leadToDelete ? `${leadToDelete.nombre} ${leadToDelete.apellido}`.trim() : ''}</span> y 
                todos sus datos asociados (interacciones, historial de estados, cursos de interés).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
