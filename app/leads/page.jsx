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
import { Search, Filter, Download, Phone, Mail, MessageSquare, X } from "lucide-react";

const etapaColors = {
  nuevo: "bg-blue-500/20 text-blue-600 border-blue-500/30",
  contactado: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
  interesado: "bg-purple-500/20 text-purple-600 border-purple-500/30",
  negociando: "bg-orange-500/20 text-orange-600 border-orange-500/30",
  convertido: "bg-green-500/20 text-green-600 border-green-500/30",
  perdido: "bg-red-500/20 text-red-600 border-red-500/30",
};

export default function LeadsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [etapaFilter, setEtapaFilter] = useState("Todos");
  const [cursoFilter, setCursoFilter] = useState("Todos");
  const [canalFilter, setCanalFilter] = useState("Todos");
  const [asesorFilter, setAsesorFilter] = useState("Todos");

  useEffect(() => {
    fetch('/api/leads')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setContacts(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Generar opciones de filtro dinámicamente
  const etapas = useMemo(() => {
    const unique = [...new Set(contacts.map(c => c.etapa).filter(Boolean))];
    return ["Todos", ...unique];
  }, [contacts]);

  const cursos = useMemo(() => {
    const unique = [...new Set(contacts.map(c => c.curso).filter(c => c && c !== '-'))];
    return ["Todos", ...unique];
  }, [contacts]);

  const canales = useMemo(() => {
    const unique = [...new Set(contacts.map(c => c.canal).filter(c => c && c !== '-'))];
    return ["Todos", ...unique];
  }, [contacts]);

  const asesores = useMemo(() => {
    const unique = [...new Set(contacts.map(c => c.asesor).filter(c => c && c !== '-'))];
    return ["Todos", ...unique];
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesSearch =
        contact.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (contact.telefono || '').includes(searchTerm);

      const matchesEtapa = etapaFilter === "Todos" || contact.etapa === etapaFilter;
      const matchesCurso = cursoFilter === "Todos" || contact.curso === cursoFilter;
      const matchesCanal = canalFilter === "Todos" || contact.canal === canalFilter;
      const matchesAsesor = asesorFilter === "Todos" || contact.asesor === asesorFilter;

      return matchesSearch && matchesEtapa && matchesCurso && matchesCanal && matchesAsesor;
    });
  }, [contacts, searchTerm, etapaFilter, cursoFilter, canalFilter, asesorFilter]);

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
              {loading ? "Cargando..." : `${filteredContacts.length} de ${contacts.length} contactos`}
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
