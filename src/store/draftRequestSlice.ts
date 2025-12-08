import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api';
import type { Lab1IntermalAppDsChronicleResource } from '../api/Api';

// Хроника в заявке с количеством
interface ChronicleInRequest {
  chronicle?: Lab1IntermalAppDsChronicleResource | undefined;
  count?: number | undefined;
  quote?: string | undefined;
  research_id?: number | undefined; // ID связи хроники с заявкой
}

// Поля заявки
interface RequestData {
  research_title?: string | null;
  research_description?: string | null;
  research_purpose?: string | null;
}

interface DraftRequestState {
  request_id: number | null;
  count: number;
  loading: boolean;
  error: string | null;
  // Данные заявки
  chronicles: ChronicleInRequest[];
  requestData: RequestData;
  isDraft: boolean;
  requestStatus: number | string | null; // Статус текущей заявки
  // Список заявок
  requestsList: any[];
  requestsListLoading: boolean;
  requestsListError: string | null;
}

const initialState: DraftRequestState = {
  request_id: null,
  count: 0,
  loading: false,
  error: null,
  chronicles: [],
  requestData: {
    research_title: '',
    research_description: '',
    research_purpose: '',
  },
  isDraft: false,
  requestStatus: null,
  requestsList: [],
  requestsListLoading: false,
  requestsListError: null,
};

export const getDraftRequestInfo = createAsyncThunk(
  'draftRequest/getDraftRequestInfo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.api.chronicleRequestListChronicleDraftList();
      console.log('getDraftRequestInfo full response:', response);
      console.log('getDraftRequestInfo response.data:', response.data);
      console.log('getDraftRequestInfo response.data type:', typeof response.data);
      const data = response.data;
      let requestId = 0;
      let count = 0;
      if (data?.status === 'success') {
        requestId = data.request_id ?? 0;
        count = data.count ?? 0;
        if (requestId === 0 && data.data) {
          requestId = data.data.request_id ?? 0;
          count = data.data.count ?? 0;
        }
      } else {
        requestId = data?.request_id ?? 0;
        count = data?.count ?? 0;
      }
      console.log('Final parsed - request_id:', requestId, 'count:', count);
      return {
        request_id: requestId,
        count: count,
      };
    } catch (error: any) {
      console.error('getDraftRequestInfo error:', error);
      console.error('getDraftRequestInfo error response:', error.response?.data);
      return rejectWithValue(error.message || 'Ошибка при загрузке корзины');
    }
  }
);

export const getRequestDetail = createAsyncThunk(
  'draftRequest/getRequestDetail',
  async (requestId: number, { rejectWithValue }) => {
    try {
      const response = await api.api.chronicleRequestListDetail(requestId);
      console.log('getRequestDetail response:', response);
      console.log('getRequestDetail response.data:', response.data);
      console.log('getRequestDetail response.data structure:', JSON.stringify(response.data, null, 2));
      let resultData = response.data;
      if (resultData?.status === 'success') {
        resultData = resultData.data || resultData;
      }
      if (!resultData || (!resultData.request && !resultData.chronicles && !resultData.chronicle_research)) {
        console.warn('getRequestDetail - invalid data structure:', resultData);
        return rejectWithValue('Неверный формат данных заявки');
      }
      console.log('getRequestDetail - returning data:', resultData);
      return resultData;
    } catch (error: any) {
      console.error('getRequestDetail error:', error);
      if (error.response?.status === 403) {
        return rejectWithValue('Нет доступа к этой заявке. Проверьте авторизацию.');
      }
      return rejectWithValue(error.response?.data?.description || error.message || 'Ошибка при загрузке заявки');
    }
  }
);

/**
 * REDUX ASYNC THUNK + AXIOS: Добавление хроники в заявку
 * 
 * Этот пример демонстрирует:
 * 1. Цепочку Axios запросов (последовательные API вызовы)
 * 2. Использование getState() для чтения текущего Redux state внутри thunk
 * 3. Обработку ошибок с помощью try/catch и rejectWithValue
 * 
 * Процесс:
 * 1. POST запрос на добавление хроники в заявку
 * 2. Получение request_id из ответа
 * 3. GET запрос для получения актуального состояния заявки
 * 4. Возврат данных для обновления Redux state
 */
export const addChronicleToRequest = createAsyncThunk(
  'draftRequest/addChronicleToRequest',
  async (chronicleId: number, { getState, rejectWithValue }) => {
    try {
      const response = await api.api.chronicleResourcesAddToChronicleRequestCreate(chronicleId);
      console.log('addChronicleToRequest response:', response.data);
      const responseData = response.data;
      if (responseData?.request_id) {
        const requestId = responseData.request_id;
        await new Promise(resolve => setTimeout(resolve, 300));
        /**
         * AXIOS ЗАПРОС #2: Получение детальной информации о заявке
         * 
         * Это пример цепочки запросов - второй запрос зависит от результата первого.
         * Используется для получения актуального количества хроник в заявке.
         */
        try {
          const detailResponse = await api.api.chronicleRequestListDetail(requestId);
          console.log('getRequestDetail after add response:', detailResponse.data);
          const detailData = detailResponse.data;
          console.log('detailData structure:', detailData);
          let chronicles = detailData?.chronicles;
          if (!chronicles && detailData?.data?.chronicles) {
            chronicles = detailData.data.chronicles;
          }
          if (!chronicles && detailData?.data?.chronicle_research) {
            chronicles = detailData.data.chronicle_research;
          }
          const count = Array.isArray(chronicles) ? chronicles.length : 0;
          console.log('Calculated count from detail:', count, 'chronicles array length:', chronicles?.length, 'chronicles:', chronicles);
          const result = {
            request_id: requestId,
            count: count,
            responseData: responseData,
          };
          console.log('addChronicleToRequest returning:', result);
          return result;
        } catch (detailError) {
          console.error('Error getting request detail:', detailError);
          /**
           * REDUX: Использование getState() для чтения текущего state
           * 
           * getState() позволяет получить доступ к текущему Redux state внутри thunk.
           * Это полезно, когда нужно использовать существующие данные для вычислений.
           * 
           * В этом случае, если второй запрос провалился, используем текущий count из state
           * и увеличиваем его на 1.
           */
          const state = getState() as any;
          const currentCount = state.draftRequest.count || 0;
          return {
            request_id: requestId,
            count: currentCount + 1,
            responseData: responseData,
          };
        }
      }
      
      /**
       * REDUX: Fallback - использование текущего state, если request_id нет в ответе
       * 
       * Если первый запрос не вернул request_id, используем данные из текущего Redux state.
       * Это гарантирует, что состояние всегда будет обновлено, даже при неполных данных.
       */
      const state = getState() as any;
      const currentCount = state.draftRequest.count || 0;
      const currentRequestId = state.draftRequest.request_id || 0;
      
      console.log('No request_id in response, using current state - request_id:', currentRequestId, 'count:', currentCount + 1);
      
      return {
        request_id: currentRequestId,
        count: currentCount + 1,
        responseData: responseData,
      };
    } catch (error: any) {
      console.error('addChronicleToRequest error:', error);
      return rejectWithValue(error.message || 'Ошибка при добавлении хроники');
    }
  }
);

// Удаление заявки
export const deleteRequest = createAsyncThunk(
  'draftRequest/deleteRequest',
  async (requestId: number, { rejectWithValue }) => {
    try {
      const response = await api.api.chronicleRequestListDelete(requestId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при удалении заявки');
    }
  }
);

// Обновление полей заявки
export const updateRequest = createAsyncThunk(
  'draftRequest/updateRequest',
  async ({ requestId, requestData }: { requestId: number; requestData: RequestData }, { rejectWithValue }) => {
    try {
      const dataToSend = {
        name: requestData.research_title ?? '',
        search_event: requestData.research_description ?? '',
      };
      const response = await api.api.chronicleRequestListUpdate(requestId, dataToSend as any);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при обновлении заявки');
    }
  }
);

// Формирование заявки из черновика (завершение заявки)
export const formRequest = createAsyncThunk(
  'draftRequest/formRequest',
  async (requestId: number, { rejectWithValue }) => {
    try {
      const response = await api.api.chronicleRequestListChronicleRequestFormUpdate(requestId);
      return response.data;
    } catch (error: any) {
      // Получаем детальное сообщение об ошибке от сервера
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Ошибка при формировании заявки';
      console.error('formRequest error:', error);
      console.error('formRequest error response:', error.response?.data);
      return rejectWithValue(errorMessage);
    }
  }
);

// Получение списка заявок
export const getRequestsList = createAsyncThunk(
  'draftRequest/getRequestsList',
  async (filters: { status?: string; start_date?: string; end_date?: string } | undefined, { rejectWithValue }) => {
    try {
      const response = await api.api.chronicleRequestListList(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке списка заявок');
    }
  }
);

// Действия модератора: завершить или отклонить заявку
export const moderateRequest = createAsyncThunk(
  'draftRequest/moderateRequest',
  async ({ requestId, action }: { requestId: number; action: 'complete' | 'reject' }, { rejectWithValue }) => {
    try {
      const response = await api.api.chronicleRequestListChronicleCompleteOrRejectUpdate(requestId, { action });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Ошибка при выполнении действия';
      return rejectWithValue(errorMessage);
    }
  }
);

// Удаление хроники из заявки
export const deleteChronicleFromRequest = createAsyncThunk(
  'draftRequest/deleteChronicleFromRequest',
  async ({ requestId, chronicleId }: { requestId: number; chronicleId: number }, { rejectWithValue }) => {
    try {
      await api.api.chronicleResearchChroniclesDelete(requestId, chronicleId);
      return { requestId, chronicleId };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при удалении хроники из заявки');
    }
  }
);

// Обновление цитаты для хроники в заявке
export const updateChronicleQuote = createAsyncThunk(
  'draftRequest/updateChronicleQuote',
  async ({ requestId, chronicleId, quote }: { requestId: number; chronicleId: number; quote: string }, { rejectWithValue }) => {
    try {
      await api.api.chronicleResearchChroniclesUpdate(requestId, chronicleId, { quote });
      return { requestId, chronicleId, quote };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при обновлении цитаты');
    }
  }
);

const draftRequestSlice = createSlice({
  name: 'draftRequest',
  initialState,
  reducers: {
    setRequestId: (state, action) => {
      state.request_id = action.payload;
    },
    setCount: (state, action) => {
      state.count = action.payload;
    },
    setRequestData: (state, action) => {
      state.requestData = {
        ...state.requestData,
        ...action.payload,
      };
    },
          setChronicles: (state, action) => {
            state.chronicles = action.payload;
          },
          updateChronicleQuoteLocal: (state, action) => {
            const { chronicleId, quote } = action.payload;
            const chronicle = state.chronicles.find((item) => item.chronicle?.id === chronicleId);
            if (chronicle) {
              chronicle.quote = quote;
            }
          },
    setError: (state, action) => {
      state.error = action.payload;
    },
    resetDraft: (state) => {
      state.request_id = null;
      state.count = 0;
      state.chronicles = [];
      state.requestData = {
        research_title: '',
        research_description: '',
        research_purpose: '',
      };
      state.isDraft = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDraftRequestInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDraftRequestInfo.fulfilled, (state, action) => {
        state.loading = false;
        const { request_id, count } = action.payload;
        console.log('getDraftRequestInfo.fulfilled - setting request_id:', request_id, 'count:', count);
        // Обновляем только если получили валидные данные (request_id > 0)
        // Это предотвращает перезапись существующего состояния пустыми значениями
        if (request_id && request_id > 0) {
          state.request_id = request_id;
          state.count = count;
        } else if (!state.request_id || state.request_id === 0) {
          // Обновляем только если текущее состояние тоже пустое
          state.request_id = request_id;
          state.count = count;
        }
      })
      .addCase(getDraftRequestInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.request_id = null;
        state.count = 0;
      })
      .addCase(getRequestDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      /**
       * REDUX REDUCER: Обработка успешного получения деталей заявки
       * 
       * Когда async thunk getRequestDetail завершается успешно (fulfilled),
       * Redux автоматически вызывает этот reducer с action.payload = данные из Axios ответа.
       * 
       * Reducer обновляет state:
       * - state.loading = false (загрузка завершена)
       * - state.request_id = ID заявки
       * - state.chronicles = массив хроник в заявке
       * - state.requestData = данные заявки (название, описание)
       * - state.count = количество хроник (для черновика)
       * 
       * После обновления state, все компоненты, подписанные на эти данные через useAppSelector,
       * автоматически перерендерятся с новыми данными.
       */
      .addCase(getRequestDetail.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload содержит данные, возвращенные из async thunk (результат Axios запроса)
        const data = action.payload;
        
        console.log('getRequestDetail.fulfilled - data:', data);
        
        // Предполагаем структуру ответа: { request: {...}, chronicles: [...] }
        if (data.request) {
          // Проверяем статус (строка "черновик" или число 1 = черновик)
          const status = data.request.status;
          state.requestStatus = status; // Сохраняем статус для использования в компонентах
          console.log('Request status:', status, 'type:', typeof status);
          // Статус может быть числом (1 = черновик) или строкой ("черновик")
          const isDraftStatus = status === 1 || status === 'черновик' || status === 'RequestStatusDraft' || String(status).toLowerCase() === 'черновик';
          state.isDraft = isDraftStatus;
          console.log('isDraft set to:', state.isDraft);
          
          // Всегда обновляем данные заявки для отображения
          state.request_id = data.request.id || data.request.request_id;
          state.requestData = {
            research_title: data.request.name || data.request.research_title || '',
            research_description: data.request.search_event || data.request.research_description || '',
            research_purpose: data.request.research_purpose || '',
          };
          
          if (data.chronicles || data.chronicle_research) {
            // Преобразуем массив хроник в нужный формат
            const chroniclesList = data.chronicles || data.chronicle_research || [];
            state.chronicles = chroniclesList.map((item: any) => ({
              chronicle: item.chronicle_resource || item.chronicle,
              count: item.count || 1,
              quote: item.quote || item.Quote || '',
              research_id: item.id || item.research_id,
            }));
            console.log('getRequestDetail.fulfilled - updated chronicles:', state.chronicles.length);
          } else {
            state.chronicles = [];
          }
          
          // Обновляем корзину только если заявка является черновиком
          if (isDraftStatus) {
            // Для черновика обновляем count корзины
            if (data.chronicles || data.chronicle_research) {
              const chroniclesList = data.chronicles || data.chronicle_research || [];
              state.count = chroniclesList.length;
              console.log('getRequestDetail.fulfilled - updated count (draft):', state.count);
            } else {
              state.count = 0;
            }
          } else {
            // Если заявка не черновик (сформирована), очищаем только счетчик корзины
            // но оставляем данные заявки для отображения
            console.log('getRequestDetail.fulfilled - request is not draft, clearing cart count only');
            state.count = 0;
            // НЕ очищаем request_id, chronicles и requestData - они нужны для отображения
          }
        }
      })
      .addCase(getRequestDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      /**
       * REDUX REDUCER: Обработка успешного добавления хроники в заявку
       * 
       * Когда async thunk addChronicleToRequest завершается успешно,
       * обновляем state с новым request_id и count.
       * 
       * action.payload содержит данные, возвращенные из thunk:
       * { request_id: number, count: number, responseData: {...} }
       */
      .addCase(addChronicleToRequest.fulfilled, (state, action) => {
        console.log('addChronicleToRequest.fulfilled - action.payload:', action.payload);
        
        // Если в ответе есть request_id и count, обновляем состояние
        if (action.payload && typeof action.payload === 'object' && 'request_id' in action.payload) {
          const payload = action.payload as { request_id: number; count: number };
          console.log('addChronicleToRequest.fulfilled - updating with request_id:', payload.request_id, 'count:', payload.count);
          
          // Устанавливаем значения только если они валидны
          if (payload.request_id && payload.request_id > 0) {
            state.request_id = payload.request_id;
          }
          if (payload.count !== undefined && payload.count >= 0) {
            state.count = payload.count;
          }
        } else {
          // Если данных нет, просто увеличиваем счетчик
          console.log('addChronicleToRequest.fulfilled - no valid payload, incrementing count');
          state.count = Math.max(0, state.count + 1);
        }
      })
      .addCase(addChronicleToRequest.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRequest.fulfilled, (state) => {
        state.loading = false;
        state.request_id = null;
        state.count = 0;
        state.chronicles = [];
        state.requestData = {
          research_title: '',
          research_description: '',
          research_purpose: '',
        };
        state.isDraft = false;
      })
      .addCase(deleteRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateRequest.fulfilled, (state, action) => {
        const data = action.payload;
        if (data.data?.request) {
          state.requestData = {
            research_title: data.data.request.name || data.data.request.research_title || '',
            research_description: data.data.request.search_event || data.data.request.research_description || '',
            research_purpose: data.data.request.research_purpose || '',
          };
        }
      })
      .addCase(updateRequest.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteChronicleFromRequest.fulfilled, (state, action) => {
        // Удаляем хронику из массива
        state.chronicles = state.chronicles.filter(
          (item) => item.chronicle?.id !== action.payload.chronicleId
        );
        state.count = Math.max(0, state.count - 1);
      })
      .addCase(deleteChronicleFromRequest.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateChronicleQuote.pending, () => {
        // Можно добавить индикатор загрузки, если нужно
      })
      .addCase(updateChronicleQuote.fulfilled, (state, action) => {
        const { chronicleId, quote } = action.payload;
        const chronicle = state.chronicles.find((item) => item.chronicle?.id === chronicleId);
        if (chronicle) {
          chronicle.quote = quote;
        }
      })
      .addCase(updateChronicleQuote.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(formRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(formRequest.fulfilled, (state) => {
        state.loading = false;
        // После формирования заявки она больше не является черновиком
        state.isDraft = false;
        // Очищаем корзину, так как заявка уже сформирована
        state.request_id = null;
        state.count = 0;
        state.chronicles = [];
        state.requestData = {
          research_title: '',
          research_description: '',
          research_purpose: '',
        };
      })
      .addCase(formRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getRequestsList.pending, (state) => {
        state.requestsListLoading = true;
        state.requestsListError = null;
      })
      .addCase(getRequestsList.fulfilled, (state, action) => {
        state.requestsListLoading = false;
        console.log('getRequestsList.fulfilled - action.payload:', action.payload);
        console.log('getRequestsList.fulfilled - payload type:', typeof action.payload);
        console.log('getRequestsList.fulfilled - isArray:', Array.isArray(action.payload));
        
        // API может возвращать данные в разных форматах:
        // 1. { status: "success", data: [...] }
        // 2. Прямой массив [...]
        // 3. { requests: [...] } или другая структура
        let requestsData: any[] = [];
        
        if (action.payload) {
          if (action.payload.status === 'success' && action.payload.data) {
            requestsData = Array.isArray(action.payload.data) ? action.payload.data : [];
          } else if (Array.isArray(action.payload)) {
            requestsData = action.payload;
          } else if (action.payload.requests && Array.isArray(action.payload.requests)) {
            requestsData = action.payload.requests;
          } else if (action.payload.data && Array.isArray(action.payload.data)) {
            requestsData = action.payload.data;
          } else {
            // Пытаемся найти массив в любом поле объекта
            const payload = action.payload as any;
            for (const key in payload) {
              if (Array.isArray(payload[key])) {
                requestsData = payload[key];
                break;
              }
            }
          }
        }
        
        console.log('getRequestsList.fulfilled - extracted requestsData:', requestsData);
        console.log('getRequestsList.fulfilled - requestsData length:', requestsData.length);
        state.requestsList = requestsData;
      })
      .addCase(getRequestsList.rejected, (state, action) => {
        state.requestsListLoading = false;
        state.requestsListError = action.payload as string;
      })
      .addCase(moderateRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(moderateRequest.fulfilled, (state) => {
        state.loading = false;
        // После модерации перезагружаем данные заявки
      })
      .addCase(moderateRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setRequestId, setCount, setRequestData, setChronicles, setError, resetDraft, updateChronicleQuoteLocal } = draftRequestSlice.actions;
export default draftRequestSlice.reducer;
