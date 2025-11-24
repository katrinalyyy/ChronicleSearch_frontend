// Константы для маршрутов приложения
export const ROUTES = {
  HOME: '/',
  CHRONICLES: '/chronicles',
  CHRONICLE_DETAIL: '/chronicle',
}

// Тип для ключей маршрутов
export type RouteKeyType = keyof typeof ROUTES

// Метки для маршрутов (для Breadcrumbs)
export const ROUTE_LABELS: Record<RouteKeyType, string> = {
  HOME: 'Главная',
  CHRONICLES: 'Летописи',
  CHRONICLE_DETAIL: 'Летопись',
}

