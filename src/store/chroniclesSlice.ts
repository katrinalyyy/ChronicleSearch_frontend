import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api';
import { Lab1IntermalAppDsChronicleResource } from '../api/Api';

interface ChroniclesState {
  searchValue: string;
  selectedLocation: string;
  chronicles: Lab1IntermalAppDsChronicleResource[];
  loading: boolean;
  error: string | null;
}

const initialState: ChroniclesState = {
  searchValue: '',
  selectedLocation: '',
  chronicles: [],
  loading: false,
  error: null,
};

export const getChroniclesList = createAsyncThunk(
  'chronicles/getChroniclesList',
  async (_, { getState, rejectWithValue }) => {
    const { chronicles }: any = getState();
    try {
      const response = await api.api.chronicleResourcesList({
        title: chronicles.searchValue || undefined,
        location: chronicles.selectedLocation || undefined,
      });

      // API возвращает { status: "success", data: [...] }
      if (response.data?.status === 'success' && response.data?.data) {
        return response.data.data;
      }
      return [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке хроник');
    }
  }
);

const chroniclesSlice = createSlice({
  name: 'chronicles',
  initialState,
  reducers: {
    setSearchValue(state, action) {
      state.searchValue = action.payload;
    },
    setSelectedLocation(state, action) {
      state.selectedLocation = action.payload;
    },
    resetFilters(state) {
      state.searchValue = '';
      state.selectedLocation = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getChroniclesList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getChroniclesList.fulfilled, (state, action) => {
        state.loading = false;
        state.chronicles = action.payload;
      })
      .addCase(getChroniclesList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSearchValue, setSelectedLocation, resetFilters } = chroniclesSlice.actions;
export default chroniclesSlice.reducer;

