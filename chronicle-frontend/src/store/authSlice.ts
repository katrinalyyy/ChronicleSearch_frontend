import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api, updateApiToken } from '../api';
import type { IntermalAppHandlerLoginReq } from '../api/Api';

interface AuthState {
  username: string;
  isAuthenticated: boolean;
  token: string | null;
  error: string | null;
  loading: boolean;
  role: number | null; // 0 = Researcher, 1 = Moderator
}

const initialState: AuthState = {
  username: '',
  isAuthenticated: false,
  token: null,
  error: null,
  loading: false,
  role: null,
};

// Сохранение токена в localStorage (только для очистки при logout)
const saveTokenToStorage = (token: string | null) => {
  try {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  } catch {
    // Игнорируем ошибки localStorage
  }
};

// Сохранение username в localStorage
const saveUsernameToStorage = (username: string | null) => {
  try {
    if (username) {
      localStorage.setItem('auth_username', username);
    } else {
      localStorage.removeItem('auth_username');
    }
  } catch {
    // Игнорируем ошибки localStorage
  }
};

/**
 * REDUX ASYNC THUNK - Асинхронное действие для авторизации
 * 
 * createAsyncThunk - это функция из Redux Toolkit, которая упрощает работу с асинхронными операциями.
 * Она автоматически создает три action'а:
 * 1. pending - запрос начался (loading: true)
 * 2. fulfilled - запрос успешен (данные загружены)
 * 3. rejected - запрос провалился (ошибка)
 * 
 * В этом примере:
 * - Отправляем POST запрос на /login через Axios (api.login.loginCreate)
 * - Получаем JWT токен из ответа
 * - Сохраняем токен в localStorage и Redux state
 * - Обновляем токен в Axios клиенте для последующих запросов
 * - Загружаем роль пользователя через дополнительный API запрос
 * 
 * @param credentials - объект с login и password
 * @param rejectWithValue - функция для возврата ошибки в формате, понятном Redux
 */
export const loginUserAsync = createAsyncThunk(
  'auth/loginUserAsync', 
  async (credentials: IntermalAppHandlerLoginReq, { rejectWithValue }) => {
    try {
      const response = await api.login.loginCreate(credentials);
      const accessToken = response.data?.access_token;
      if (accessToken) {
        const username = credentials.login || '';
        // НЕ сохраняем в localStorage - авторизация должна слетать при F5
        updateApiToken(accessToken);
        let userRole: number | null = null;
        try {
          const profileResponse = await api.api.userProfileList();
          console.log('userProfileList full response:', profileResponse);
          console.log('userProfileList response.data:', profileResponse.data);
          const role = profileResponse.data?.role ?? profileResponse.data?.data?.role;
          if (role !== undefined && role !== null) {
            userRole = typeof role === 'number' ? role : parseInt(String(role), 10);
            console.log('User role loaded:', userRole);
          } else {
            console.warn('Role not found in profile response. Full data:', profileResponse.data);
          }
        } catch (error) {
          console.warn('Failed to load user role:', error);
        }
        
        return {
          username,
          token: accessToken,
          role: userRole,
        };
      }
      
      return rejectWithValue('Неверный логин или пароль');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || error.message || 'Ошибка авторизации');
    }
  }
);

export const logoutUserAsync = createAsyncThunk(
  'auth/logoutUserAsync',
  async (_, { rejectWithValue }) => {
    try {
      await api.logout.logoutCreate();
      saveTokenToStorage(null);
      saveUsernameToStorage(null);
      updateApiToken(null);
      return null;
    } catch (error: any) {
      saveTokenToStorage(null);
      saveUsernameToStorage(null);
      updateApiToken(null);
      return rejectWithValue(error.response?.data?.description || 'Ошибка при выходе из системы');
    }
  }
);

// НЕ загружаем токен из localStorage - авторизация должна слетать при F5
// Очищаем localStorage при загрузке, если там что-то осталось
saveTokenToStorage(null);
saveUsernameToStorage(null);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.username = action.payload.username;
        state.token = action.payload.token;
        state.role = action.payload.role ?? null;
        state.isAuthenticated = true;
        state.error = null;
        console.log('loginUserAsync.fulfilled - role set to:', state.role);
      })
      .addCase(loginUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.token = null;
        state.username = '';
        // Очищаем localStorage на случай, если там что-то осталось
        saveTokenToStorage(null);
        saveUsernameToStorage(null);
      })
      .addCase(logoutUserAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUserAsync.fulfilled, (state) => {
        state.loading = false;
        state.username = '';
        state.token = null;
        state.role = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Все равно очищаем состояние даже при ошибке
        state.username = '';
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setRole } = authSlice.actions;
export default authSlice.reducer;

