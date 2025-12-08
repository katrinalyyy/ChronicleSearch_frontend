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

// Загрузка токена из localStorage при инициализации
const loadTokenFromStorage = (): string | null => {
  try {
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
};

// Загрузка username из localStorage
const loadUsernameFromStorage = (): string => {
  try {
    return localStorage.getItem('auth_username') || '';
  } catch {
    return '';
  }
};

// Сохранение токена в localStorage
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
  'auth/loginUserAsync', // Префикс для action типов: auth/loginUserAsync/pending, fulfilled, rejected
  async (credentials: IntermalAppHandlerLoginReq, { rejectWithValue }) => {
    try {
      // AXIOS ЗАПРОС: Отправка POST запроса на /login
      // api.login.loginCreate - это метод из сгенерированного API клиента
      // Axios автоматически добавляет заголовок Authorization, если токен установлен
      const response = await api.login.loginCreate(credentials);
      
      // AXIOS ОТВЕТ: Axios оборачивает ответ сервера в объект response
      // response.data содержит данные, возвращенные сервером
      // response.status содержит HTTP статус код (200, 404, 500 и т.д.)
      // response.headers содержит заголовки ответа
      const accessToken = response.data?.access_token;
      
      if (accessToken) {
        const username = credentials.login || '';
        // Сохраняем токен и username в localStorage для персистентности
        saveTokenToStorage(accessToken);
        saveUsernameToStorage(username);
        
        // Устанавливаем токен в Axios клиент для автоматической подстановки в заголовки
        updateApiToken(accessToken);
        
        // ДОПОЛНИТЕЛЬНЫЙ AXIOS ЗАПРОС: Загружаем роль пользователя
        // Это пример цепочки запросов - сначала авторизация, потом получение профиля
        let userRole: number | null = null;
        try {
          // api.api.userProfileList() - GET запрос на /api/user/profile
          // Axios автоматически добавит Authorization: Bearer <token>
          const profileResponse = await api.api.userProfileList();
          console.log('userProfileList full response:', profileResponse);
          console.log('userProfileList response.data:', profileResponse.data);
          // Проверяем разные возможные структуры ответа
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

// Асинхронное действие для деавторизации
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
      // Даже если запрос не удался, очищаем локальное состояние
      saveTokenToStorage(null);
      saveUsernameToStorage(null);
      updateApiToken(null);
      return rejectWithValue(error.response?.data?.description || 'Ошибка при выходе из системы');
    }
  }
);

// Инициализация токена и username из localStorage
const initialToken = loadTokenFromStorage();
const initialUsername = loadUsernameFromStorage();

// Инициализируем токен в API при загрузке
if (initialToken) {
  updateApiToken(initialToken);
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    ...initialState,
    token: initialToken,
    username: initialUsername,
    isAuthenticated: !!initialToken,
  },
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

