/**
 * AXIOS API CLIENT - Настройка HTTP клиента для работы с бэкендом
 * 
 * Axios - это библиотека для выполнения HTTP запросов (GET, POST, PUT, DELETE и т.д.)
 * В этом проекте используется автоматически сгенерированный API клиент из Swagger спецификации.
 * 
 * Основные возможности:
 * 1. Автоматическая подстановка токена авторизации в заголовки
 * 2. Единая точка конфигурации для всех API запросов
 * 3. Обработка ошибок на уровне клиента
 * 4. Типизация запросов и ответов через TypeScript
 */
import { Api } from './Api';
import type { AxiosRequestConfig } from 'axios';

/**
 * Получение JWT токена из localStorage
 * 
 * Токен сохраняется при авторизации и используется для всех защищенных запросов.
 * Формат: Bearer <token>
 */
const getToken = (): string | null => {
  try {
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
};

/**
 * Security Worker - автоматическая подстановка токена в заголовки запросов
 * 
 * Эта функция вызывается Axios перед каждым запросом.
 * Она автоматически добавляет заголовок Authorization: Bearer <token>
 * ко всем запросам, которые требуют авторизации.
 * 
 * @param securityData - токен, переданный через setSecurityData (опционально)
 * @returns конфигурация Axios с заголовком Authorization
 */
const securityWorker = async (
  securityData: string | null
): Promise<AxiosRequestConfig | void> => {
  // Используем переданный токен или берем из localStorage
  const token = securityData || getToken();
  if (token) {
    return {
      headers: {
        Authorization: `Bearer ${token}`, // Стандартный формат JWT токена
      },
    };
  }
  return {};
};

/**
 * Создание экземпляра API клиента
 * 
 * Api - это автоматически сгенерированный класс из Swagger спецификации.
 * Он содержит методы для всех эндпоинтов бэкенда.
 * 
 * baseURL: '' - пустой, так как используется Vite proxy для проксирования запросов
 * securityWorker - функция для автоматической подстановки токена
 */
export const api = new Api({
  baseURL: '', // Используем Vite proxy, поэтому baseURL пустой
  securityWorker,
});

/**
 * Инициализация токена при загрузке модуля
 * 
 * Если пользователь уже авторизован (токен есть в localStorage),
 * устанавливаем его в API клиент, чтобы он использовался для всех запросов.
 */
const initialToken = getToken();
if (initialToken) {
  api.setSecurityData(initialToken);
}

/**
 * Функция для обновления токена в API клиенте
 * 
 * Вызывается из Redux authSlice при авторизации/выходе.
 * Обновляет токен в Axios, чтобы все последующие запросы использовали новый токен.
 * 
 * @param token - новый JWT токен или null для удаления токена
 */
export const updateApiToken = (token: string | null) => {
  api.setSecurityData(token);
};

