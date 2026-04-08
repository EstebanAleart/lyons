import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'

const CHUNK_SIZE = 1000 // Clientes por request

// Flag global para evitar cargas duplicadas
let isFetchingInProgress = false

// Thunk para cargar clientes en chunks
export const fetchClientesChunk = createAsyncThunk(
  'clientes/fetchChunk',
  async ({ offset = 0, limit = CHUNK_SIZE }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/clientes?offset=${offset}&limit=${limit}`)
      if (!response.ok) throw new Error('Error fetching clientes')
      const data = await response.json()
      return { clientes: data.clientes, total: data.total, offset, hasMore: data.hasMore }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Thunk para cargar todos los clientes incrementalmente
export const fetchAllClientesIncrementally = createAsyncThunk(
  'clientes/fetchAllIncrementally',
  async (_, { dispatch, getState }) => {
    // Evitar cargas duplicadas con flag global
    if (isFetchingInProgress) {
      return { skipped: true }
    }
    
    const state = getState()
    if (state.clientes.isFullyLoaded || state.clientes.items.length > 0) {
      return { skipped: true }
    }
    
    isFetchingInProgress = true
    
    try {
      let offset = 0
      let hasMore = true
      
      while (hasMore) {
        const result = await dispatch(fetchClientesChunk({ offset, limit: CHUNK_SIZE }))
        if (fetchClientesChunk.fulfilled.match(result)) {
          hasMore = result.payload.hasMore
          offset += CHUNK_SIZE
        } else {
          break
        }
      }
      
      return { completed: true }
    } finally {
      isFetchingInProgress = false
    }
  }
)

const initialState = {
  items: [],
  total: 0,
  loadedCount: 0,
  isLoading: false,
  isLoadingMore: false,
  isFullyLoaded: false,
  error: null,
  // Filtros client-side
  filters: {
    search: '',
    estado: 'Todos',
    curso: 'Todos',
    localidad: 'Todos',
  },
  // Paginación client-side
  pagination: {
    page: 1,
    perPage: 50,
  },
}

const clientesSlice = createSlice({
  name: 'clientes',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      const { key, value } = action.payload
      state.filters[key] = value
      state.pagination.page = 1 // Reset page on filter change
    },
    clearFilters: (state) => {
      state.filters = initialState.filters
      state.pagination.page = 1
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload
    },
    setPerPage: (state, action) => {
      state.pagination.perPage = action.payload
      state.pagination.page = 1
    },
    resetClientes: (state) => {
      isFetchingInProgress = false
      return initialState
    },
    updateClienteStatus: (state, action) => {
      const { clienteId, estadoCliente } = action.payload
      const clienteIndex = state.items.findIndex(c => c.id === clienteId)
      if (clienteIndex !== -1) {
        state.items[clienteIndex].estadoCliente = estadoCliente
      }
    },
    removeCliente: (state, action) => {
      const clienteId = action.payload
      state.items = state.items.filter(c => c.id !== clienteId)
      state.total = state.total > 0 ? state.total - 1 : 0
      state.loadedCount = state.items.length
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchClientesChunk
      .addCase(fetchClientesChunk.pending, (state, action) => {
        if (action.meta.arg.offset === 0) {
          state.isLoading = true
          state.items = []
        } else {
          state.isLoadingMore = true
        }
        state.error = null
      })
      .addCase(fetchClientesChunk.fulfilled, (state, action) => {
        const { clientes, total, hasMore } = action.payload
        // Append new clientes (avoid duplicates by id)
        const existingIds = new Set(state.items.map(c => c.id))
        const newClientes = clientes.filter(c => !existingIds.has(c.id))
        state.items = [...state.items, ...newClientes]
        state.total = total
        state.loadedCount = state.items.length
        state.isLoading = false
        state.isLoadingMore = false
        state.isFullyLoaded = !hasMore
      })
      .addCase(fetchClientesChunk.rejected, (state, action) => {
        state.isLoading = false
        state.isLoadingMore = false
        state.error = action.payload || 'Error cargando clientes'
      })
      // fetchAllClientesIncrementally
      .addCase(fetchAllClientesIncrementally.pending, (state) => {
        // No cambiamos loading aquí, lo maneja fetchClientesChunk
      })
      .addCase(fetchAllClientesIncrementally.fulfilled, (state) => {
        // Carga completa
      })
      .addCase(fetchAllClientesIncrementally.rejected, (state, action) => {
        state.error = action.payload || 'Error en carga incremental'
      })
  },
})

export const { setFilter, clearFilters, setPage, setPerPage, resetClientes, updateClienteStatus, removeCliente } = clientesSlice.actions

// Selectores base
const selectClientesState = (state) => state.clientes
const selectItems = (state) => state.clientes.items
const selectFilters = (state) => state.clientes.filters
const selectPagination = (state) => state.clientes.pagination

// Selector memoizado para clientes filtrados
export const selectFilteredClientes = createSelector(
  [selectItems, selectFilters],
  (items, filters) => {
    return items.filter(cliente => {
      // Filtro de búsqueda
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const nombreCompleto = `${cliente.nombre} ${cliente.apellido}`.toLowerCase()
        const matchesSearch =
          nombreCompleto.includes(searchLower) ||
          cliente.email?.toLowerCase().includes(searchLower) ||
          cliente.telefono?.includes(filters.search)
        if (!matchesSearch) return false
      }
      
      // Filtro por estado
      if (filters.estado !== 'Todos' && cliente.estadoCliente !== filters.estado) {
        return false
      }
      
      // Filtro por curso
      if (filters.curso !== 'Todos' && cliente.curso !== filters.curso) {
        return false
      }
      
      // Filtro por localidad (búsqueda parcial)
      if (filters.localidad !== 'Todos' && filters.localidad !== '' &&
          !(cliente.localidad || '').toLowerCase().includes(filters.localidad.toLowerCase())) {
        return false
      }
      
      return true
    })
  }
)

// Selector memoizado para clientes paginados
export const selectPaginatedClientes = createSelector(
  [selectFilteredClientes, selectPagination],
  (filteredClientes, pagination) => {
    const start = (pagination.page - 1) * pagination.perPage
    const end = start + pagination.perPage
    return filteredClientes.slice(start, end)
  }
)

// Selector para opciones de filtros únicos
export const selectUniqueFilterOptions = createSelector(
  [selectItems],
  (items) => {
    const estados = [...new Set(items.map(c => c.estadoCliente).filter(Boolean))]
    const cursos = [...new Set(items.map(c => c.curso).filter(c => c && c !== '-'))]
    const localidades = [...new Set(items.map(c => c.localidad).filter(Boolean))]
    
    return { estados, cursos, localidades }
  }
)

// Selector para estado de carga
export const selectLoadingState = createSelector(
  [selectClientesState],
  (clientesState) => ({
    isLoading: clientesState.isLoading,
    isLoadingMore: clientesState.isLoadingMore,
    isFullyLoaded: clientesState.isFullyLoaded,
    loadedCount: clientesState.loadedCount,
    total: clientesState.total,
    error: clientesState.error,
  })
)

export default clientesSlice.reducer
