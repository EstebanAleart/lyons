"use client";

import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/dashboard/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Search, Download, Phone, Mail, UserCheck, X } from "lucide-react";

const estadoColors = {
  activo: "bg-green-500/20 text-green-600 border-green-500/30",
  inactivo: "bg-gray-500/20 text-gray-600 border-gray-500/30",
  suspendido: "bg-red-500/20 text-red-600 border-red-500/30",
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("Todos");

  useEffect(() => {
    fetch('/api/clientes')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setClientes(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const estados = useMemo(() => {
    const uniqueEstados = [...new Set(clientes.map(c => c.estadoCliente).filter(Boolean))];
    return ["Todos", ...uniqueEstados];
  }, [clientes]);

  const filteredClientes = useMemo(() => {
    return clientes.filter((cliente) => {
      const fullName = `${cliente.nombre} ${cliente.apellido}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        (cliente.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (cliente.telefono || '').includes(searchTerm);

      const matchesEstado = estadoFilter === "Todos" || cliente.estadoCliente === estadoFilter;

      return matchesSearch && matchesEstado;
    });
  }, [clientes, searchTerm, estadoFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setEstadoFilter("Todos");
  };

  const handleExportCSV = () => {
    const headers = ['Nombre', 'Apellido', 'Email', 'Teléfono', 'Localidad', 'Estado', 'Fecha Alta'];
    const rows = filteredClientes.map(c => [
      c.nombre,
      c.apellido,
      c.email,
      c.telefono,
      c.localidad,
      c.estadoCliente,
      c.fechaAlta ? new Date(c.fechaAlta).toLocaleDateString('es-AR') : ''
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

  const activeFiltersCount = [estadoFilter].filter(f => f !== "Todos").length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
            <p className="text-muted-foreground">
              Gestiona tus clientes convertidos
            </p>
          </div>
          <Button onClick={handleExportCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>

        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                <Select value={estadoFilter} onValueChange={setEstadoFilter}>
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

                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                    <X className="h-4 w-4" />
                    Limpiar
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando clientes...
              </div>
            ) : (
              <>
                <div className="text-sm text-muted-foreground mb-4">
                  Mostrando {filteredClientes.length} de {clientes.length} clientes
                </div>

                <div className="rounded-md border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Cliente</TableHead>
                        <TableHead>Contacto</TableHead>
                        <TableHead>Localidad</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha Alta</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClientes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No se encontraron clientes
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredClientes.map((cliente) => (
                          <TableRow key={cliente.id} className="hover:bg-muted/30">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500/10">
                                  <UserCheck className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">
                                    {cliente.nombre} {cliente.apellido}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {cliente.genero}
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
                                {cliente.fechaAlta 
                                  ? new Date(cliente.fechaAlta).toLocaleDateString('es-AR')
                                  : '-'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Phone className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Mail className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
