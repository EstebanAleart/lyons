"use client";

import { useState, useMemo } from "react";
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
import { Search, Filter, Download, Phone, Mail, MessageSquare, X } from "lucide-react";

// Mock data para contactos
const mockContacts = [
  { id: 1, nombre: "María García", email: "maria.garcia@email.com", telefono: "+52 55 1234 5678", curso: "Marketing Digital", canal: "Facebook", etapa: "Nuevo", asesor: "Carlos Méndez", fechaCreacion: "2026-01-28", ultimoContacto: "2026-01-28" },
  { id: 2, nombre: "Juan Pérez", email: "juan.perez@email.com", telefono: "+52 55 2345 6789", curso: "Diseño UX/UI", canal: "Google Ads", etapa: "Contactado", asesor: "Ana López", fechaCreacion: "2026-01-25", ultimoContacto: "2026-01-30" },
  { id: 3, nombre: "Laura Sánchez", email: "laura.sanchez@email.com", telefono: "+52 55 3456 7890", curso: "Desarrollo Web", canal: "Instagram", etapa: "Interesado", asesor: "Carlos Méndez", fechaCreacion: "2026-01-20", ultimoContacto: "2026-01-29" },
  { id: 4, nombre: "Roberto Hernández", email: "roberto.h@email.com", telefono: "+52 55 4567 8901", curso: "Data Science", canal: "Referido", etapa: "Negociando", asesor: "Luis Torres", fechaCreacion: "2026-01-15", ultimoContacto: "2026-02-01" },
  { id: 5, nombre: "Carmen Díaz", email: "carmen.diaz@email.com", telefono: "+52 55 5678 9012", curso: "Marketing Digital", canal: "WhatsApp", etapa: "Convertido", asesor: "Ana López", fechaCreacion: "2026-01-10", ultimoContacto: "2026-02-01" },
  { id: 6, nombre: "Miguel Rodríguez", email: "miguel.r@email.com", telefono: "+52 55 6789 0123", curso: "Diseño UX/UI", canal: "Orgánico", etapa: "Nuevo", asesor: "Luis Torres", fechaCreacion: "2026-01-30", ultimoContacto: "2026-01-30" },
  { id: 7, nombre: "Patricia López", email: "patricia.l@email.com", telefono: "+52 55 7890 1234", curso: "Desarrollo Web", canal: "Facebook", etapa: "Contactado", asesor: "Carlos Méndez", fechaCreacion: "2026-01-22", ultimoContacto: "2026-01-28" },
  { id: 8, nombre: "Fernando Castro", email: "fernando.c@email.com", telefono: "+52 55 8901 2345", curso: "Data Science", canal: "Google Ads", etapa: "Interesado", asesor: "Ana López", fechaCreacion: "2026-01-18", ultimoContacto: "2026-01-31" },
  { id: 9, nombre: "Sofía Morales", email: "sofia.m@email.com", telefono: "+52 55 9012 3456", curso: "Marketing Digital", canal: "Instagram", etapa: "Perdido", asesor: "Luis Torres", fechaCreacion: "2025-12-15", ultimoContacto: "2025-12-20" },
  { id: 10, nombre: "Andrés Ruiz", email: "andres.r@email.com", telefono: "+52 55 0123 4567", curso: "Diseño UX/UI", canal: "Referido", etapa: "Nuevo", asesor: "Carlos Méndez", fechaCreacion: "2026-02-01", ultimoContacto: "2026-02-01" },
  { id: 11, nombre: "Lucía Vargas", email: "lucia.v@email.com", telefono: "+52 55 1111 2222", curso: "Desarrollo Web", canal: "WhatsApp", etapa: "Negociando", asesor: "Ana López", fechaCreacion: "2026-01-12", ultimoContacto: "2026-02-02" },
  { id: 12, nombre: "Diego Martínez", email: "diego.m@email.com", telefono: "+52 55 3333 4444", curso: "Data Science", canal: "Orgánico", etapa: "Contactado", asesor: "Luis Torres", fechaCreacion: "2026-01-24", ultimoContacto: "2026-01-27" },
];

const etapas = ["Todos", "Nuevo", "Contactado", "Interesado", "Negociando", "Convertido", "Perdido"];
const cursos = ["Todos", "Marketing Digital", "Diseño UX/UI", "Desarrollo Web", "Data Science"];
const canales = ["Todos", "Facebook", "Google Ads", "Instagram", "Referido", "WhatsApp", "Orgánico"];
const asesores = ["Todos", "Carlos Méndez", "Ana López", "Luis Torres"];

const etapaColors = {
  Nuevo: "bg-blue-500/20 text-blue-600 border-blue-500/30",
  Contactado: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
  Interesado: "bg-purple-500/20 text-purple-600 border-purple-500/30",
  Negociando: "bg-orange-500/20 text-orange-600 border-orange-500/30",
  Convertido: "bg-green-500/20 text-green-600 border-green-500/30",
  Perdido: "bg-red-500/20 text-red-600 border-red-500/30",
};

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [etapaFilter, setEtapaFilter] = useState("Todos");
  const [cursoFilter, setCursoFilter] = useState("Todos");
  const [canalFilter, setCanalFilter] = useState("Todos");
  const [asesorFilter, setAsesorFilter] = useState("Todos");

  const filteredContacts = useMemo(() => {
    return mockContacts.filter((contact) => {
      const matchesSearch =
        contact.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.telefono.includes(searchTerm);

      const matchesEtapa = etapaFilter === "Todos" || contact.etapa === etapaFilter;
      const matchesCurso = cursoFilter === "Todos" || contact.curso === cursoFilter;
      const matchesCanal = canalFilter === "Todos" || contact.canal === canalFilter;
      const matchesAsesor = asesorFilter === "Todos" || contact.asesor === asesorFilter;

      return matchesSearch && matchesEtapa && matchesCurso && matchesCanal && matchesAsesor;
    });
  }, [searchTerm, etapaFilter, cursoFilter, canalFilter, asesorFilter]);

  const activeFiltersCount = [etapaFilter, cursoFilter, canalFilter, asesorFilter].filter(
    (f) => f !== "Todos"
  ).length;

  const clearFilters = () => {
    setEtapaFilter("Todos");
    setCursoFilter("Todos");
    setCanalFilter("Todos");
    setAsesorFilter("Todos");
    setSearchTerm("");
  };

  const exportToCSV = () => {
    const headers = ["Nombre", "Email", "Teléfono", "Curso", "Canal", "Etapa", "Asesor", "Fecha Creación", "Último Contacto"];
    const rows = filteredContacts.map((c) => [
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

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "contactos.csv";
    link.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Contactos</h1>
            <p className="text-muted-foreground">
              {filteredContacts.length} de {mockContacts.length} contactos
            </p>
          </div>
          <Button onClick={exportToCSV} variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>

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
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Etapa Filter */}
              <Select value={etapaFilter} onValueChange={setEtapaFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Etapa" />
                </SelectTrigger>
                <SelectContent>
                  {etapas.map((etapa) => (
                    <SelectItem key={etapa} value={etapa}>
                      {etapa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Curso Filter */}
              <Select value={cursoFilter} onValueChange={setCursoFilter}>
                <SelectTrigger>
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

              {/* Canal Filter */}
              <Select value={canalFilter} onValueChange={setCanalFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Canal" />
                </SelectTrigger>
                <SelectContent>
                  {canales.map((canal) => (
                    <SelectItem key={canal} value={canal}>
                      {canal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Asesor Filter */}
              <Select value={asesorFilter} onValueChange={setAsesorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Asesor" />
                </SelectTrigger>
                <SelectContent>
                  {asesores.map((asesor) => (
                    <SelectItem key={asesor} value={asesor}>
                      {asesor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
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
                  {filteredContacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No se encontraron contactos con los filtros aplicados
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">{contact.nombre}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm">{contact.email}</span>
                            <span className="text-xs text-muted-foreground">{contact.telefono}</span>
                          </div>
                        </TableCell>
                        <TableCell>{contact.curso}</TableCell>
                        <TableCell>{contact.canal}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={etapaColors[contact.etapa]}>
                            {contact.etapa}
                          </Badge>
                        </TableCell>
                        <TableCell>{contact.asesor}</TableCell>
                        <TableCell>{contact.ultimoContacto}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
