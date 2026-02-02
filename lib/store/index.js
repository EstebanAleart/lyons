import { configureStore } from '@reduxjs/toolkit'
import leadsReducer from './leadsSlice'
import clientesReducer from './clientesSlice'
import leadsVencidosReducer from './leadsVencidosSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      leads: leadsReducer,
      clientes: clientesReducer,
      leadsVencidos: leadsVencidosReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  })
}

// Tipos para TypeScript (opcional)
export const store = makeStore()
