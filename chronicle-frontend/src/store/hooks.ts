/**
 * REDUX HOOKS - Типизированные хуки для работы с Redux в React компонентах
 * 
 * React-Redux предоставляет хуки для подключения компонентов к Redux store:
 * - useDispatch - для отправки actions (изменения состояния)
 * - useSelector - для чтения данных из store
 * 
 * Типизация необходима для:
 * 1. Автодополнения в IDE
 * 2. Проверки типов на этапе компиляции
 * 3. Предотвращения ошибок при обращении к несуществующим полям
 */
import { useDispatch, useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from './store'

/**
 * useAppDispatch - типизированный хук для отправки actions
 * 
 * Использование:
 * const dispatch = useAppDispatch()
 * dispatch(loginUserAsync({ login: 'user', password: 'pass' }))
 * 
 * Типизация гарантирует, что можно отправлять только валидные actions
 */
export const useAppDispatch: () => AppDispatch = useDispatch

/**
 * useAppSelector - типизированный хук для чтения данных из store
 * 
 * Использование:
 * const username = useAppSelector((state) => state.auth.username)
 * const chronicles = useAppSelector((state) => state.chronicles.chronicles)
 * 
 * Селектор функция получает весь state и возвращает нужную часть.
 * Компонент автоматически перерендерится при изменении выбранной части state.
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

