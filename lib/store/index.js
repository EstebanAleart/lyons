import { configureStore } from '@reduxjs/toolkit'
import leadsReducer from './leadsSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      leads: leadsReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  })
}

// Tipos para TypeScript (opcional)
export const store = makeStore()
