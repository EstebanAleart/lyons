import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'

const CHUNK_SIZE = 500 // Leads por request

// Flag global para evitar cargas duplicadas
let isFetchingInProgress = false

// Thunk para cargar leads en chunks
export const fetchLeadsChunk = createAsyncThunk(
  'leads/fetchChunk',
  async ({ offset = 0, limit = CHUNK_SIZE }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/leads?offset=${offset}&limit=${limit}`)
      if (!response.ok) throw new Error('Error fetching leads')
      const data = await response.json()
      return { leads: data.leads, total: data.total, offset, hasMore: data.hasMore }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Thunk para cargar todos los leads incrementalmente
export const fetchAllLeadsIncrementally = createAsyncThunk(
  'leads/fetchAllIncrementally',
  async (_, { dispatch, getState }) => {
    // Evitar cargas duplicadas con flag global
    if (isFetchingInProgress) {
      return { skipped: true }
    }
    
    const state = getState()
    if (state.leads.isFullyLoaded || state.leads.items.length > 0) {
      return { skipped: true }
    }
    
    isFetchingInProgress = true
    
    try {
      let offset = 0
      let hasMore = true
      
      while (hasMore) {
        const result = await dispatch(fetchLeadsChunk({ offset, limit: CHUNK_SIZE }))
        if (fetchLeadsChunk.fulfilled.match(result)) {
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
    etapa: 'Todos',
    curso: 'Todos',
    canal: 'Todos',
    asesor: 'Todos',
    tieneEmail: false,
    tieneTelefono: false,
  },
  // Paginación client-side
  pagination: {
    page: 1,
    perPage: 50,
  },
}

const leadsSlice = createSlice({
  name: 'leads',
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
    resetLeads: (state) => {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchLeadsChunk
      .addCase(fetchLeadsChunk.pending, (state, action) => {
        if (action.meta.arg.offset === 0) {
          state.isLoading = true
          state.items = []
        } else {
          state.isLoadingMore = true
        }
        state.error = null
      })
      .addCase(fetchLeadsChunk.fulfilled, (state, action) => {
        const { leads, total, hasMore } = action.payload
        // Append new leads (avoid duplicates by id)
        const existingIds = new Set(state.items.map(l => l.id))
        const newLeads = leads.filter(l => !existingIds.has(l.id))
        state.items = [...state.items, ...newLeads]
        state.total = total
        state.loadedCount = state.items.length
        state.isLoading = false
        state.isLoadingMore = false
        state.isFullyLoaded = !hasMore
      })
      .addCase(fetchLeadsChunk.rejected, (state, action) => {
        state.isLoading = false
        state.isLoadingMore = false
        state.error = action.payload
      })
      // fetchAllLeadsIncrementally
      .addCase(fetchAllLeadsIncrementally.fulfilled, (state) => {
        state.isFullyLoaded = true
      })
  },
})

// Selectores base
const selectLeadsState = (state) => state.leads
const selectItems = (state) => state.leads.items
const selectFilters = (state) => state.leads.filters
const selectPagination = (state) => state.leads.pagination

export const selectAllLeads = selectItems

export const selectFilteredLeads = createSelector(
  [selectItems, selectFilters],
  (items, filters) => {
    return items.filter((lead) => {
      const matchesSearch = filters.search === '' || 
        lead.nombre.toLowerCase().includes(filters.search.toLowerCase()) ||
        (lead.email?.toLowerCase() || '').includes(filters.search.toLowerCase()) ||
        (lead.telefono || '').includes(filters.search)
      
      const matchesEtapa = filters.etapa === 'Todos' || lead.etapa === filters.etapa
      const matchesCurso = filters.curso === 'Todos' || lead.curso === filters.curso
      const matchesCanal = filters.canal === 'Todos' || lead.canal === filters.canal
      const matchesAsesor = filters.asesor === 'Todos' || lead.asesor === filters.asesor
      const matchesTieneEmail = !filters.tieneEmail || (lead.email && lead.email.trim() !== '' && lead.email !== '-')
      const matchesTieneTelefono = !filters.tieneTelefono || (lead.telefono && lead.telefono.trim() !== '' && lead.telefono !== '-')
      
      return matchesSearch && matchesEtapa && matchesCurso && matchesCanal && matchesAsesor && matchesTieneEmail && matchesTieneTelefono
    })
  }
)

export const selectPaginatedLeads = createSelector(
  [selectFilteredLeads, selectPagination],
  (filtered, pagination) => {
    const { page, perPage } = pagination
    const start = (page - 1) * perPage
    const end = start + perPage
    
    return {
      leads: filtered.slice(start, end),
      totalFiltered: filtered.length,
      totalPages: Math.ceil(filtered.length / perPage),
      currentPage: page,
      perPage,
    }
  }
)

export const selectUniqueFilterOptions = createSelector(
  [selectItems],
  (items) => ({
    etapas: ['Todos', ...new Set(items.map(l => l.etapa).filter(Boolean))],
    cursos: ['Todos', ...new Set(items.map(l => l.curso).filter(c => c && c !== '-'))],
    canales: ['Todos', ...new Set(items.map(l => l.canal).filter(c => c && c !== '-'))],
    asesores: ['Todos', ...new Set(items.map(l => l.asesor).filter(a => a && a !== '-'))],
  })
)

export const selectLoadingState = createSelector(
  [selectLeadsState],
  (leads) => ({
    isLoading: leads.isLoading,
    isLoadingMore: leads.isLoadingMore,
    isFullyLoaded: leads.isFullyLoaded,
    loadedCount: leads.loadedCount,
    total: leads.total,
    progress: leads.total > 0 ? Math.round((leads.loadedCount / leads.total) * 100) : 0,
  })
)

export const { setFilter, clearFilters, setPage, setPerPage, resetLeads } = leadsSlice.actions
export default leadsSlice.reducer
