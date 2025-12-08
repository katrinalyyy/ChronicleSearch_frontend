import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api';
import type { Lab1IntermalAppDsChronicleResource } from '../api/Api';
import { setRequestId, setCount } from './draftRequestSlice';

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
  async (_, { getState, dispatch, rejectWithValue }) => {
    const { chronicles, auth }: any = getState();
    try {
      const response = await api.api.chronicleResourcesList({
        title: chronicles.searchValue || undefined,
        location: chronicles.selectedLocation || undefined,
      });

      if (response.data?.status === 'success' && response.data?.data) {
        if (auth.isAuthenticated) {
          try {
            const draftResponse = await api.api.chronicleRequestListChronicleDraftList();
            if (draftResponse.data?.status === 'success') {
              const requestId = draftResponse.data.request_id || 0;
              const count = draftResponse.data.count || 0;
              const currentState: any = getState();
              if (!currentState.draftRequest.request_id || currentState.draftRequest.request_id === 0) {
                dispatch(setRequestId(requestId));
                dispatch(setCount(count));
              }
            }
          } catch (draftError) {
            // Игнорируем ошибки черновика - не обновляем, если уже есть данные
          }
        }
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

