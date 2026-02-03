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
import { Search, Filter, Download, Phone, Mail, MessageCircle, X, ChevronLeft, ChevronRight, Plus, Pencil } from "lucide-react";
import { ContactModal } from "@/components/contact-modal";
import { LeadFormModal } from "@/components/lead-form-modal";
import {
  fetchAllLeadsIncrementally,
  setFilter,
  clearFilters,
  setPage,
  setPerPage,
  resetLeads,
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

  const handleFormSuccess = () => {
    // Refrescar los leads
    dispatch(resetLeads());
    hasFetched.current = false;
    dispatch(fetchAllLeadsIncrementally());
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
                  <SelectValue placeholder="Etapa" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.etapas.map((etapa) => (
                    <SelectItem key={etapa} value={etapa}>
                      {etapa}
                    </SelectItem>
                  ))}
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

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading && loadedCount === 0 ? (
              <div className="h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                  <span className="text-muted-foreground">Cargando contactos...</span>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
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
                    {leads.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No se encontraron contactos con los filtros aplicados
                        </TableCell>
                      </TableRow>
                    ) : (
                      leads.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell className="font-medium">{contact.nombre}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="text-sm">{contact.email || '-'}</span>
                              <span className="text-xs text-muted-foreground">{contact.telefono || '-'}</span>
                            </div>
                          </TableCell>
                          <TableCell>{contact.curso}</TableCell>
                          <TableCell>{contact.canal}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={etapaColors[contact.etapa] || ''}>
                              {contact.etapa}
                            </Badge>
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
                                className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                onClick={() => handleContactClick(contact)}
                                title="Contactar"
                              >
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
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
      </main>
    </div>
  );
}
