import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'

const CHUNK_SIZE = 1000

let isFetchingInProgress = false

// Thunk para cargar contactos en chunks
export const fetchContactosChunk = createAsyncThunk(
  'contactos/fetchChunk',
  async ({ offset = 0, limit = CHUNK_SIZE, dias = 90 }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/ultimos-contactos?offset=${offset}&limit=${limit}&dias=${dias}`)
      if (!response.ok) throw new Error('Error fetching contactos')
      const data = await response.json()
      return { contactos: data.contactos, total: data.total, offset, hasMore: data.hasMore }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Thunk para cargar todos los contactos incrementalmente
export const fetchAllContactosIncrementally = createAsyncThunk(
  'contactos/fetchAllIncrementally',
  async ({ dias = 90 } = {}, { dispatch, getState }) => {
    if (isFetchingInProgress) {
      return { skipped: true }
    }
    
    const state = getState()
    if (state.contactos.isFullyLoaded || state.contactos.items.length > 0) {
      return { skipped: true }
    }
    
    isFetchingInProgress = true
    
    try {
      let offset = 0
      let hasMore = true
      
      while (hasMore) {
        const result = await dispatch(fetchContactosChunk({ offset, limit: CHUNK_SIZE, dias }))
        if (fetchContactosChunk.fulfilled.match(result)) {
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
    canal: 'Todos',
    etapa: 'Todos',
    diasRango: 'Todos', // Hoy, 7, 15, 30, Todos
  },
  // Paginación client-side
  pagination: {
    page: 1,
    perPage: 25,
  },
}

const contactosSlice = createSlice({
  name: 'contactos',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      const { key, value } = action.payload
      state.filters[key] = value
      state.pagination.page = 1
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
    resetContactos: (state) => {
      isFetchingInProgress = false
      return initialState
    },
    addContacto: (state, action) => {
      // Agregar nuevo contacto al inicio (para tiempo real)
      state.items.unshift(action.payload)
      state.total += 1
      state.loadedCount += 1
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContactosChunk.pending, (state, action) => {
        if (action.meta.arg.offset === 0) {
          state.isLoading = true
          state.items = []
        } else {
          state.isLoadingMore = true
        }
        state.error = null
      })
      .addCase(fetchContactosChunk.fulfilled, (state, action) => {
        const { contactos, total, hasMore } = action.payload
        const existingIds = new Set(state.items.map(c => c.id))
        const newContactos = contactos.filter(c => !existingIds.has(c.id))
        state.items = [...state.items, ...newContactos]
        state.total = total
        state.loadedCount = state.items.length
        state.isLoading = false
        state.isLoadingMore = false
        state.isFullyLoaded = !hasMore
      })
      .addCase(fetchContactosChunk.rejected, (state, action) => {
        state.isLoading = false
        state.isLoadingMore = false
        state.error = action.payload
      })
      .addCase(fetchAllContactosIncrementally.fulfilled, (state) => {
        state.isFullyLoaded = true
      })
  },
})

// Selectores base
const selectContactosState = (state) => state.contactos
const selectItems = (state) => state.contactos.items
const selectFilters = (state) => state.contactos.filters
const selectPagination = (state) => state.contactos.pagination

export const selectAllContactos = selectItems

// Selector para filtrar contactos
export const selectFilteredContactos = createSelector(
  [selectItems, selectFilters],
  (items, filters) => {
    return items.filter((contacto) => {
      // Filtro de búsqueda
      const searchLower = filters.search.toLowerCase()
      const matchesSearch = filters.search === '' ||
        (contacto.nombre?.toLowerCase() || '').includes(searchLower) ||
        (contacto.email?.toLowerCase() || '').includes(searchLower) ||
        (contacto.telefono || '').includes(filters.search) ||
        (contacto.nota?.toLowerCase() || '').includes(searchLower)

      // Filtro de canal
      const matchesCanal = filters.canal === 'Todos' || contacto.canal === filters.canal

      // Filtro de etapa
      const matchesEtapa = filters.etapa === 'Todos' || contacto.etapa === filters.etapa

      // Filtro de rango de días
      let matchesDias = true
      if (filters.diasRango !== 'Todos') {
        const dias = parseInt(filters.diasRango)
        matchesDias = contacto.diasDesdeContacto <= dias
      }

      return matchesSearch && matchesCanal && matchesEtapa && matchesDias
    })
  }
)

// Selector para contactos paginados
export const selectPaginatedContactos = createSelector(
  [selectFilteredContactos, selectPagination],
  (filteredContactos, pagination) => {
    const start = (pagination.page - 1) * pagination.perPage
    const end = start + pagination.perPage
    return filteredContactos.slice(start, end)
  }
)

// Selector para opciones de filtros únicos
export const selectUniqueFilterOptions = createSelector(
  [selectItems],
  (items) => ({
    canales: [...new Set(items.map(c => c.canal).filter(Boolean))],
    etapas: [...new Set(items.map(c => c.etapa).filter(Boolean))],
  })
)

// Selector para estado de carga
export const selectLoadingState = createSelector(
  [selectContactosState],
  (contactos) => ({
    isLoading: contactos.isLoading,
    isLoadingMore: contactos.isLoadingMore,
    isFullyLoaded: contactos.isFullyLoaded,
    loadedCount: contactos.loadedCount,
    total: contactos.total,
    error: contactos.error,
  })
)

export const { setFilter, clearFilters, setPage, setPerPage, resetContactos, addContacto } = contactosSlice.actions
export default contactosSlice.reducer
