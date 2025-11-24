import { configureStore } from '@reduxjs/toolkit'
import filtersReducer from './filtersSlice'
import chroniclesReducer from './chroniclesSlice'

export const store = configureStore({
  reducer: {
    filters: filtersReducer,
    chronicles: chroniclesReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

