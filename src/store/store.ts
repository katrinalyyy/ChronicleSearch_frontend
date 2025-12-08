/**
 * REDUX STORE - Централизованное хранилище состояния приложения
 * 
 * Redux Toolkit используется для управления глобальным состоянием приложения.
 * Вместо передачи пропсов через множество компонентов, мы храним состояние в одном месте (store).
 * 
 * Основные концепции Redux:
 * 1. Store - централизованное хранилище состояния
 * 2. Reducers - функции, которые определяют, как состояние изменяется
 * 3. Actions - объекты, которые описывают, что произошло
 * 4. Dispatch - функция для отправки actions в store
 * 
 * Redux Toolkit упрощает работу с Redux:
 * - configureStore() автоматически настраивает Redux DevTools и middleware
 * - createSlice() автоматически создает actions и reducers
 * - createAsyncThunk() упрощает работу с асинхронными операциями (API запросы)
 */
import { configureStore } from '@reduxjs/toolkit'
import filtersReducer from './filtersSlice'
import chroniclesReducer from './chroniclesSlice'
import authReducer from './authSlice'
import draftRequestReducer from './draftRequestSlice'

/**
 * Создание Redux store с помощью configureStore из Redux Toolkit
 * 
 * reducer - объект, где каждый ключ - это имя части состояния (slice),
 * а значение - это reducer функция, которая управляет этой частью состояния
 */
export const store = configureStore({
  reducer: {
    filters: filtersReducer,        // Состояние фильтров (поиск, локация)
    chronicles: chroniclesReducer, // Состояние списка летописей
    auth: authReducer,             // Состояние авторизации (токен, username, роль)
    draftRequest: draftRequestReducer, // Состояние черновика заявки (корзина)
  },
})

/**
 * Типы TypeScript для типизации состояния и dispatch
 * 
 * RootState - тип всего состояния store
 * Используется в useAppSelector для типизации: (state: RootState) => ...
 * 
 * AppDispatch - тип функции dispatch
 * Используется в useAppDispatch для типизации dispatch
 */
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

