'use client'

import { useEffect, useRef, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock, 
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react'
import {
  fetchAllContactosIncrementally,
  setFilter,
  clearFilters,
  setPage,
  resetContactos,
  selectFilteredContactos,
  selectPaginatedContactos,
  selectUniqueFilterOptions,
  selectLoadingState,
} from '@/lib/store/contactosSlice'

const canalIcons = {
  'WhatsApp': <MessageCircle className="h-4 w-4 text-green-500" />,
  'Email': <Mail className="h-4 w-4 text-blue-500" />,
  'Teléfono': <Phone className="h-4 w-4 text-purple-500" />,
}

const etapaColors = {
  nuevo: "bg-blue-500/20 text-blue-600",
  contactado: "bg-yellow-500/20 text-yellow-600",
  interesado: "bg-purple-500/20 text-purple-600",
  negociando: "bg-orange-500/20 text-orange-600",
  convertido: "bg-green-500/20 text-green-600",
  perdido: "bg-red-500/20 text-red-600",
}

export function RecentContactsTable({ onLeadClick }) {
  const dispatch = useDispatch()
  const hasFetched = useRef(false)

  // Selectores de Redux
  const filters = useSelector(state => state.contactos.filters)
  const pagination = useSelector(state => state.contactos.pagination)
  const { isLoading, isFullyLoaded, loadedCount, total } = useSelector(selectLoadingState)
  const filteredContactos = useSelector(selectFilteredContactos)
  const paginatedContactos = useSelector(selectPaginatedContactos)
  const filterOptions = useSelector(selectUniqueFilterOptions)

  // Cargar contactos al montar
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true
      dispatch(fetchAllContactosIncrementally({ dias: 90 }))
    }
  }, [dispatch])

  // Opciones de filtros
  const canales = useMemo(() => ['Todos', ...filterOptions.canales], [filterOptions.canales])
  const etapas = useMemo(() => ['Todos', ...filterOptions.etapas], [filterOptions.etapas])

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

  const handleRefresh = () => {
    dispatch(resetContactos())
    hasFetched.current = false
    dispatch(fetchAllContactosIncrementally({ dias: 90 }))
  }

  const formatFecha = (fecha) => {
    if (!fecha) return '-'
    const d = new Date(fecha)
    const hoy = new Date()
    const diff = Math.floor((hoy - d) / (1000 * 60 * 60 * 24))
    
    if (diff === 0) {
      return `Hoy ${d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`
    } else if (diff === 1) {
      return 'Ayer'
    } else if (diff < 7) {
      return `Hace ${diff} días`
    } else {
      return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
    }
  }

  // Paginación
  const totalPages = Math.ceil(filteredContactos.length / pagination.perPage)
  const activeFiltersCount = Object.entries(filters).filter(([k, v]) => k !== 'search' && v !== 'Todos').length
  const loadProgress = total > 0 ? (loadedCount / total) * 100 : 0

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Últimos Contactos
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRefresh}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {loadedCount.toLocaleString()} contactos cargados
          {isFullyLoaded && ' ✓'}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress bar mientras carga */}
        {!isFullyLoaded && total > 0 && (
          <div className="space-y-1">
            <Progress value={loadProgress} className="h-1" />
            <p className="text-xs text-muted-foreground text-center">
              {Math.round(loadProgress)}% cargado
            </p>
          </div>
        )}

        {/* Búsqueda y filtros */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, teléfono, nota..."
              className="pl-9 h-9 text-sm"
              value={filters.search}
              onChange={handleSearchChange}
            />
          </div>
          
          <Select value={filters.diasRango} onValueChange={(v) => handleFilterChange('diasRango', v)}>
            <SelectTrigger className="w-[100px] h-9 text-xs">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Hoy</SelectItem>
              <SelectItem value="7">7 días</SelectItem>
              <SelectItem value="15">15 días</SelectItem>
              <SelectItem value="30">30 días</SelectItem>
              <SelectItem value="Todos">Todos</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.canal} onValueChange={(v) => handleFilterChange('canal', v)}>
            <SelectTrigger className="w-[100px] h-9 text-xs">
              <SelectValue placeholder="Canal" />
            </SelectTrigger>
            <SelectContent>
              {canales.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.etapa} onValueChange={(v) => handleFilterChange('etapa', v)}>
            <SelectTrigger className="w-[100px] h-9 text-xs">
              <SelectValue placeholder="Etapa" />
            </SelectTrigger>
            <SelectContent>
              {etapas.map(e => (
                <SelectItem key={e} value={e} className="capitalize">{e}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(filters.search || activeFiltersCount > 0) && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-9">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Info de resultados */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{filteredContactos.length.toLocaleString()} resultados</span>
          <span>Pág. {pagination.page} de {totalPages || 1}</span>
        </div>

        {/* Tabla */}
        {isLoading && loadedCount === 0 ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : paginatedContactos.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>No hay contactos que coincidan</p>
          </div>
        ) : (
          <ScrollArea className="h-[320px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Fecha</TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead className="w-[60px]">Canal</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead className="w-[80px]">Etapa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedContactos.map((contacto) => (
                  <TableRow 
                    key={contacto.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onLeadClick?.(contacto.leadId)}
                  >
                    <TableCell className="text-xs text-muted-foreground">
                      {formatFecha(contacto.fecha)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm truncate max-w-[120px]">{contacto.nombre || 'Sin nombre'}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                          {contacto.telefono || contacto.email || '-'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {canalIcons[contacto.canal] || <MessageCircle className="h-4 w-4" />}
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]" title={contacto.nota}>
                        {contacto.nota || '-'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${etapaColors[contacto.etapa] || ''}`}>
                        {contacto.etapa}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm text-muted-foreground">
              {pagination.page} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
