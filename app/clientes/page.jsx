"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppLayout } from "@/components/dashboard/app-layout";
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
import { Search, Phone, Mail, MessageCircle, UserCheck, X, ChevronLeft, ChevronRight, Pencil, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { ContactModal } from "@/components/contact-modal";
import { LeadFormModal } from "@/components/lead-form-modal";
import { ClienteDetailDrawer } from "@/components/cliente-detail-drawer";
import {
  fetchAllClientesIncrementally,
  setFilter,
  clearFilters,
  setPage,
  setPerPage,
  resetClientes,
  updateClienteStatus,
  removeCliente,
  selectFilteredClientes,
  selectPaginatedClientes,
  selectUniqueFilterOptions,
  selectLoadingState,
} from "@/lib/store/clientesSlice";

const estadoColors = {
  activo: "bg-green-500/20 text-green-600 border-green-500/30",
  inactivo: "bg-gray-500/20 text-gray-600 border-gray-500/30",
  egresado: "bg-blue-500/20 text-blue-600 border-blue-500/30",
  suspendido: "bg-red-500/20 text-red-600 border-red-500/30",
};

export default function ClientesPage() {
  const dispatch = useDispatch();
  const hasFetched = useRef(false);
  
  // Estado para el modal de contacto
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  
  // Estado para el modal de formulario (editar)
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  
  // Estado para el drawer de detalle
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState(null);

  // Estado para filas expandidas
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleRow = (id) => setExpandedRow(prev => prev === id ? null : id);
  
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

  const handleEditCliente = (cliente) => {
    setEditingCliente(cliente);
    setFormModalOpen(true);
  };

  const handleFormSuccess = () => {
    // Refrescar clientes
    dispatch(resetClientes());
    hasFetched.current = false;
    dispatch(fetchAllClientesIncrementally());
  };

  const handleViewDetail = (clienteId) => {
    setSelectedClienteId(clienteId);
    setDetailDrawerOpen(true);
  };

  // Paginación
  const totalPages = Math.ceil(filteredClientes.length / pagination.perPage);
  const activeFiltersCount = Object.entries(filters).filter(([k, v]) => k !== 'search' && v !== 'Todos').length;
  const loadProgress = total > 0 ? (loadedCount / total) * 100 : 0;

  return (
    <AppLayout>
      <main className="container mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
            <p className="text-muted-foreground">
              {loadedCount.toLocaleString()} de {total.toLocaleString()} clientes cargados
              {isFullyLoaded && " ✓"}
            </p>
          </div>
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
            <div className="flex flex-col gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email o teléfono..."
                  value={filters.search}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-2 md:flex gap-2">
                <Select value={filters.estado} onValueChange={(v) => handleFilterChange("estado", v)}>
                  <SelectTrigger className="w-full md:w-[140px]">
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
                  <SelectTrigger className="w-full md:w-[160px]">
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
                  <SelectTrigger className="w-full md:w-[160px]">
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
                    Limpiar
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div className="text-sm text-muted-foreground">
                    {paginatedClientes.length} de {filteredClientes.length} clientes
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground hidden sm:inline">Por página:</span>
                    <Select value={pagination.perPage.toString()} onValueChange={handlePerPageChange}>
                      <SelectTrigger className="w-[70px] h-8">
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

                {/* Mobile: Cards */}
                <div className="md:hidden divide-y border rounded-lg">
                  {paginatedClientes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No se encontraron clientes
                    </div>
                  ) : (
                    paginatedClientes.map((cliente) => (
                      <div
                        key={cliente.id}
                        className="p-4 hover:bg-muted/50 cursor-pointer active:bg-muted transition-colors"
                        onClick={() => handleViewDetail(cliente.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 flex-shrink-0">
                            <UserCheck className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="font-medium truncate">
                                  {`${cliente.nombre} ${cliente.apellido}`.trim()}
                                </p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {cliente.email || cliente.telefono || 'Sin contacto'}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className={`text-xs flex-shrink-0 ${estadoColors[cliente.estadoCliente] || estadoColors.activo}`}
                              >
                                {cliente.estadoCliente || 'activo'}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground truncate">
                                {cliente.curso || 'Sin curso'}
                              </span>
                              <Button
                                variant="default"
                                size="sm"
                                className="h-7 text-xs gap-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleContactClick(cliente);
                                }}
                              >
                                <MessageCircle className="h-3 w-3" />
                                Contactar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Desktop: Table */}
                <div className="hidden md:block rounded-md border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-8"></TableHead>
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
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No se encontraron clientes
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedClientes.map((cliente) => (
                          <>
                            <TableRow
                              key={cliente.id}
                              className={`hover:bg-muted/30 cursor-pointer ${expandedRow === cliente.id ? 'bg-muted/20' : ''}`}
                              onClick={() => toggleRow(cliente.id)}
                            >
                              <TableCell className="pl-3 pr-0">
                                {expandedRow === cliente.id
                                  ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                  : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500/10">
                                    <UserCheck className="h-4 w-4 text-green-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-foreground">
                                      {`${cliente.nombre} ${cliente.apellido}`.trim()}
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
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center gap-1 justify-end">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    onClick={() => handleEditCliente(cliente)}
                                    title="Editar"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    onClick={() => handleViewDetail(cliente.id)}
                                    title="Ver detalle"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                    onClick={() => handleContactClick(cliente)}
                                    title="Contactar"
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>

                            {/* Fila expandida con todos los datos */}
                            {expandedRow === cliente.id && (
                              <TableRow key={`${cliente.id}-expanded`} className="bg-muted/10 hover:bg-muted/10">
                                <TableCell colSpan={8} className="py-4 px-6">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-3 text-sm">
                                    <div>
                                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">ID Sistema</p>
                                      <p className="font-mono text-xs text-foreground truncate">{cliente.id}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">ID Lead asociado</p>
                                      <p className="font-mono text-xs text-foreground">{cliente.leadId || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Nombre</p>
                                      <p className="text-foreground">{cliente.nombre || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Apellido</p>
                                      <p className="text-foreground">{cliente.apellido || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Email</p>
                                      <p className="text-foreground">{cliente.email || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Teléfono</p>
                                      <p className="text-foreground">{cliente.telefono || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Género</p>
                                      <p className="text-foreground">{cliente.genero || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Localidad</p>
                                      <p className="text-foreground">{cliente.localidad || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Curso</p>
                                      <p className="text-foreground">{cliente.curso || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Estado</p>
                                      <Badge variant="outline" className={estadoColors[cliente.estadoCliente] || estadoColors.activo}>
                                        {cliente.estadoCliente || 'activo'}
                                      </Badge>
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Fecha de Alta</p>
                                      <p className="text-foreground">{cliente.fechaAlta || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Fecha de Registro</p>
                                      <p className="text-foreground">{cliente.createdAt || '-'}</p>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </>
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

        {/* Modal de formulario (editar) */}
        <LeadFormModal
          open={formModalOpen}
          onOpenChange={setFormModalOpen}
          lead={editingCliente}
          onSuccess={handleFormSuccess}
        />

        {/* Drawer de detalle */}
        <ClienteDetailDrawer
          open={detailDrawerOpen}
          onOpenChange={setDetailDrawerOpen}
          clienteId={selectedClienteId}
          onContact={(cliente) => {
            setDetailDrawerOpen(false);
            handleContactClick(cliente);
          }}
          onStatusChange={(clienteId, estadoCliente) => {
            dispatch(updateClienteStatus({ clienteId, estadoCliente }));
          }}
          onDelete={(clienteId) => {
            dispatch(removeCliente(clienteId));
          }}
        />
      </main>
    </AppLayout>
  );
}
