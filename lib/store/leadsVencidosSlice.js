import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';

const CHUNK_SIZE = 1000

// Thunk para cargar un chunk de leads vencidos
export const fetchLeadsVencidosChunk = createAsyncThunk(
  'leadsVencidos/fetchChunk',
  async ({ offset = 0, limit = CHUNK_SIZE }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/leads-vencidos?offset=${offset}&limit=${limit}`);
      if (!response.ok) throw new Error('Error al cargar leads vencidos');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk para cargar todos los leads vencidos incrementalmente
export const fetchAllLeadsVencidosIncrementally = createAsyncThunk(
  'leadsVencidos/fetchAllIncrementally',
  async (_, { dispatch, getState }) => {
    let offset = 0;
    let hasMore = true;
    
    while (hasMore) {
      const result = await dispatch(fetchLeadsVencidosChunk({ offset, limit: CHUNK_SIZE })).unwrap();
      hasMore = result.hasMore;
      offset += CHUNK_SIZE;
      
      // Pequeña pausa para no saturar
      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    return { completed: true };
  }
);

const initialState = {
  items: [],
  filters: {
    search: '',
    estado: 'Todos',
    diasMin: 30,
  },
  pagination: {
    page: 1,
    perPage: 5,
  },
  loading: false,
  loadingMore: false,
  error: null,
  total: 0,
  loadedCount: 0,
  isFullyLoaded: false,
};

const leadsVencidosSlice = createSlice({
  name: 'leadsVencidos',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
      state.pagination.page = 1; // Reset página al filtrar
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setPerPage: (state, action) => {
      state.pagination.perPage = action.payload;
      state.pagination.page = 1;
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch chunk
      .addCase(fetchLeadsVencidosChunk.pending, (state) => {
        if (state.items.length === 0) {
          state.loading = true;
        } else {
          state.loadingMore = true;
        }
      })
      .addCase(fetchLeadsVencidosChunk.fulfilled, (state, action) => {
        const { leadsVencidos, total, hasMore } = action.payload;
        
        // Agregar sin duplicados
        const existingIds = new Set(state.items.map(item => item.id));
        const newItems = leadsVencidos.filter(item => !existingIds.has(item.id));
        
        state.items = [...state.items, ...newItems];
        state.total = total;
        state.loadedCount = state.items.length;
        state.isFullyLoaded = !hasMore;
        state.loading = false;
        state.loadingMore = false;
        state.error = null;
      })
      .addCase(fetchLeadsVencidosChunk.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload;
      })
      // Fetch all incrementally
      .addCase(fetchAllLeadsVencidosIncrementally.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllLeadsVencidosIncrementally.fulfilled, (state) => {
        state.loading = false;
        state.isFullyLoaded = true;
      })
      .addCase(fetchAllLeadsVencidosIncrementally.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilter, clearFilters, setPage, setPerPage, resetState, resetState: resetLeadsVencidos } = leadsVencidosSlice.actions;

// Selectores base
const selectLeadsVencidosState = (state) => state.leadsVencidos;
const selectItems = (state) => state.leadsVencidos.items;
const selectFilters = (state) => state.leadsVencidos.filters;
const selectPaginationState = (state) => state.leadsVencidos.pagination;

// Selector memoizado para leads filtrados
export const selectFilteredLeadsVencidos = createSelector(
  [selectItems, selectFilters],
  (items, filters) => {
    return items.filter(lead => {
      // Filtro de búsqueda
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          lead.nombre?.toLowerCase().includes(searchLower) ||
          lead.apellido?.toLowerCase().includes(searchLower) ||
          lead.email?.toLowerCase().includes(searchLower) ||
          lead.telefono?.includes(filters.search);
        if (!matchesSearch) return false;
      }
      
      // Filtro de estado
      if (filters.estado !== 'Todos' && lead.estado !== filters.estado) {
        return false;
      }
      
      // Filtro de días mínimos
      if (filters.diasMin && lead.diasSinContacto < filters.diasMin) {
        return false;
      }
      
      return true;
    });
  }
);

// Selector memoizado para leads paginados
export const selectPaginatedLeadsVencidos = createSelector(
  [selectFilteredLeadsVencidos, selectPaginationState],
  (filteredItems, pagination) => {
    const start = (pagination.page - 1) * pagination.perPage;
    const end = start + pagination.perPage;
    return filteredItems.slice(start, end);
  }
);

// Selector para opciones únicas de filtro
export const selectUniqueFilterOptions = createSelector(
  [selectItems],
  (items) => {
    const estados = [...new Set(items.map(l => l.estado).filter(Boolean))].sort();
    return { estados };
  }
);

// Selector para estado de carga
export const selectLoadingState = createSelector(
  [selectLeadsVencidosState],
  (state) => ({
    isLoading: state.loading,
    isLoadingMore: state.loadingMore,
    isFullyLoaded: state.isFullyLoaded,
    loadedCount: state.loadedCount,
    total: state.total,
    error: state.error,
  })
);

export default leadsVencidosSlice.reducer;
