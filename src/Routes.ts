// Константы для маршрутов приложения
export const ROUTES = {
  HOME: '/',
  CHRONICLES: '/chronicles',
  CHRONICLE_DETAIL: '/chronicle',
  LOGIN: '/login',
  REQUEST: '/request',
  REQUESTS_LIST: '/requests',
  USER_PROFILE: '/profile',
}

// Тип для ключей маршрутов
export type RouteKeyType = keyof typeof ROUTES

// Метки для маршрутов (для Breadcrumbs)
export const ROUTE_LABELS: Record<RouteKeyType, string> = {
  HOME: 'Главная',
  CHRONICLES: 'Летописи',
  CHRONICLE_DETAIL: 'Летопись',
  LOGIN: 'Авторизация',
  REQUEST: 'Заявка',
  REQUESTS_LIST: 'Список заявок',
  USER_PROFILE: 'Личный кабинет',
}

