"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navbar } from "@/components/dashboard/navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Search, Download, Phone, Mail, MessageCircle, UserCheck, X, ChevronLeft, ChevronRight } from "lucide-react";
import { ContactModal } from "@/components/contact-modal";
import {
  fetchAllClientesIncrementally,
  setFilter,
  clearFilters,
  setPage,
  setPerPage,
  selectFilteredClientes,
  selectPaginatedClientes,
  selectUniqueFilterOptions,
  selectLoadingState,
} from "@/lib/store/clientesSlice";

const estadoColors = {
  activo: "bg-green-500/20 text-green-600 border-green-500/30",
  inactivo: "bg-gray-500/20 text-gray-600 border-gray-500/30",
  suspendido: "bg-red-500/20 text-red-600 border-red-500/30",
};

export default function ClientesPage() {
  const dispatch = useDispatch();
  const hasFetched = useRef(false);
  
  // Estado para el modal de contacto
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  
  // Selectores de Redux
  const filters = useSelector(state => state.clientes.filters);
  const pagination = useSelector(state => state.clientes.pagination);
  const { isLoading, isLoadingMore, isFullyLoaded, loadedCount, total, error } = useSelector(selectLoadingState);
  const filteredClientes = useSelector(selectFilteredClientes);
  const paginatedClientes = useSelector(selectPaginatedClientes);
  const filterOptions = useSelector(selectUniqueFilterOptions);

  // Cargar clientes al montar
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      dispatch(fetchAllClientesIncrementally());
    }
  }, [dispatch]);

  // Opciones de filtros
  const estados = useMemo(() => ["Todos", ...filterOptions.estados], [filterOptions.estados]);
  const cursos = useMemo(() => ["Todos", ...filterOptions.cursos], [filterOptions.cursos]);
  const localidades = useMemo(() => ["Todos", ...filterOptions.localidades], [filterOptions.localidades]);

  // Handlers
  const handleSearchChange = (e) => {
    dispatch(setFilter({ key: "search", value: e.target.value }));
  };

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

  const handleContactClick = (cliente) => {
    setSelectedCliente(cliente);
    setContactModalOpen(true);
  };

  const handleContactComplete = (clienteId, method, comment) => {
    console.log('Contacto registrado:', { clienteId, method, comment });
  };

  const handleExportCSV = () => {
    const headers = ['Nombre', 'Email', 'Teléfono', 'Localidad', 'Curso', 'Estado', 'Fecha Alta'];
    const rows = filteredClientes.map(c => [
      c.nombre,
      c.email,
      c.telefono,
      c.localidad,
      c.curso,
      c.estadoCliente,
      c.fechaAlta
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Paginación
  const totalPages = Math.ceil(filteredClientes.length / pagination.perPage);
  const activeFiltersCount = Object.entries(filters).filter(([k, v]) => k !== 'search' && v !== 'Todos').length;
  const loadProgress = total > 0 ? (loadedCount / total) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
            <p className="text-muted-foreground">
              {loadedCount.toLocaleString()} de {total.toLocaleString()} clientes cargados
              {isFullyLoaded && " ✓"}
            </p>
          </div>
          <Button onClick={handleExportCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>

        {/* Progress bar mientras carga */}
        {!isFullyLoaded && total > 0 && (
          <Card className="border-border/50">
            <CardContent className="py-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cargando clientes...</span>
                  <span className="font-medium">{loadedCount.toLocaleString()} / {total.toLocaleString()}</span>
                </div>
                <Progress value={loadProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {Math.round(loadProgress)}% - Puedes empezar a buscar mientras se cargan más datos
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email o teléfono..."
                  value={filters.search}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                <Select value={filters.estado} onValueChange={(v) => handleFilterChange("estado", v)}>
                  <SelectTrigger className="w-[140px]">
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

                <Select value={filters.curso} onValueChange={(v) => handleFilterChange("curso", v)}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {cursos.map((curso) => (
                      <SelectItem key={curso} value={curso}>
                        {curso}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.localidad} onValueChange={(v) => handleFilterChange("localidad", v)}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Localidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {localidades.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleClearFilters} className="gap-1">
                    <X className="h-4 w-4" />
                    Limpiar ({activeFiltersCount})
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading && loadedCount === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando clientes...
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                Error: {error}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {paginatedClientes.length} de {filteredClientes.length} clientes
                    {filters.search && ` (filtrados de ${loadedCount})`}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Por página:</span>
                    <Select value={pagination.perPage.toString()} onValueChange={handlePerPageChange}>
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

                <div className="rounded-md border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Cliente</TableHead>
                        <TableHead>Contacto</TableHead>
                        <TableHead>Curso</TableHead>
                        <TableHead>Localidad</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha Alta</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedClientes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No se encontraron clientes
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedClientes.map((cliente) => (
                          <TableRow key={cliente.id} className="hover:bg-muted/30">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500/10">
                                  <UserCheck className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">
                                    {cliente.nombre}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {cliente.genero || '-'}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="text-sm">{cliente.email || '-'}</p>
                                <p className="text-xs text-muted-foreground">
                                  {cliente.telefono || '-'}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{cliente.curso || '-'}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{cliente.localidad || '-'}</span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={estadoColors[cliente.estadoCliente] || estadoColors.activo}
                              >
                                {cliente.estadoCliente || 'activo'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {cliente.fechaAlta || '-'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                onClick={() => handleContactClick(cliente)}
                                title="Contactar"
                              >
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
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
        </Card>

        {/* Modal de contacto */}
        <ContactModal
          open={contactModalOpen}
          onOpenChange={setContactModalOpen}
          lead={selectedCliente}
          onContactComplete={handleContactComplete}
        />
      </main>
    </div>
  );
}
