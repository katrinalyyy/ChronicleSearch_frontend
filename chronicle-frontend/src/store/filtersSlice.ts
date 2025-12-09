import { createSlice } from '@reduxjs/toolkit'

interface FiltersState {
  searchQuery: string
  selectedLocation: string
}

const initialState: FiltersState = {
  searchQuery: '',
  selectedLocation: '',
}

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
    },
    setSelectedLocation: (state, action) => {
      state.selectedLocation = action.payload
    },
    resetFilters: (state) => {
      state.searchQuery = ''
      state.selectedLocation = ''
    },
  },
})

export const { setSearchQuery, setSelectedLocation, resetFilters } = filtersSlice.actions
export default filtersSlice.reducer

