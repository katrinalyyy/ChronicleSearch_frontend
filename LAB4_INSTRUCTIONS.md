# Лабораторная работа №4 - JWT Авторизация и Swagger

## Что реализовано

### 1. JWT Авторизация
- ✅ Структуры для JWT (access token, refresh token, claims)
- ✅ Генерация и валидация JWT токенов
- ✅ Access token (15 минут) и Refresh token (7 дней)

### 2. Redis
- ✅ Настройка Redis в docker-compose.yml
- ✅ Сервис для работы с Redis
- ✅ Хранение refresh токенов в Redis

### 3. Middleware
- ✅ AuthMiddleware - проверка JWT токена
- ✅ ModeratorMiddleware - проверка прав модератора
- ✅ OptionalAuthMiddleware - опциональная авторизация

### 4. Ролевая модель
- **Без авторизации (гость)**: только GET методы чтения хроник
- **С авторизацией (пользователь)**: создание/изменение хроник, управление своими заявками
- **Модератор**: все методы + завершение/отклонение заявок

### 5. Swagger документация
- ✅ Интеграция Swagger UI
- ✅ Аннотации к основным методам API
- ✅ Поддержка JWT авторизации в Swagger

### 6. Endpoints
- POST /api/users/register - регистрация
- POST /api/users/auth - аутентификация (получение токенов)
- POST /api/users/refresh - обновление токенов
- POST /api/users/logout - выход (удаление refresh token)
- GET /api/ChronicleRequestList - список заявок (с фильтрацией по роли)
- PUT /api/ChronicleRequestList/:id/chronicle_complete-or-reject - завершение/отклонение (только модератор)

## Запуск приложения

### 1. Запустить Docker контейнеры
```bash
docker-compose up -d
```

Это запустит:
- PostgreSQL (порт 5432)
- MinIO (порты 9000, 9001)
- Redis (порт 6379)
- Adminer (порт 8081)

### 2. Запустить приложение
```bash
go run cmd/ChronicleSearch/main.go
```

Приложение запустится на http://localhost:8080

### 3. Открыть Swagger UI
Перейдите в браузере:
```
http://localhost:8080/swagger/index.html
```

## Тестирование (согласно заданию)

### Шаг 1: Аутентификация в Swagger (режим инкогнито)

1. Откройте браузер в режиме инкогнито
2. Перейдите на http://localhost:8080/swagger/index.html
3. Найдите метод `POST /api/users/auth`
4. Нажмите "Try it out"
5. Введите данные (предварительно создайте пользователя через register):
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
6. Скопируйте `access_token` из ответа

### Шаг 2: Авторизация в Swagger

1. Нажмите кнопку "Authorize" вверху страницы
2. Введите: `Bearer {ваш_access_token}`
3. Нажмите "Authorize"

### Шаг 3: GET списка заявок

**Для гостя (без токена):**
- Попробуйте GET /api/ChronicleRequestList без авторизации
- Результат: **401 Unauthorized**

**Для создателя (с токеном пользователя):**
- Выполните GET /api/ChronicleRequestList с токеном
- Результат: **только заявки текущего пользователя**

**Для модератора:**
- Аутентифицируйтесь как модератор (пользователь с is_moderator=true)
- Выполните GET /api/ChronicleRequestList
- Результат: **все заявки**

### Шаг 4: PUT завершения заявки

**Для создателя:**
- Попробуйте PUT /api/ChronicleRequestList/{id}/chronicle_complete-or-reject
```json
{
  "action": "complete"
}
```
- Результат: **403 Forbidden** (недостаточно прав)

**Для модератора:**
- Выполните тот же запрос с токеном модератора
- Результат: **200 OK** (заявка завершена)
- Поля `completed_at` и `moderator_id` обновлены

### Шаг 5: Проверка Redis через CMD

```bash
# Подключитесь к контейнеру Redis
docker exec -it chroniclesearch-redis-1 redis-cli

# Просмотр всех ключей
KEYS *

# Просмотр refresh токена конкретного пользователя
GET refresh_token:1

# Проверка TTL (время жизни)
TTL refresh_token:1
```

## Использование через Insomnia/Postman

### 1. Регистрация пользователя
```
POST http://localhost:8080/api/users/register
Content-Type: application/json

{
  "login": "user@example.com",
  "name": "Test User",
  "password": "password123"
}
```

### 2. Аутентификация
```
POST http://localhost:8080/api/users/auth
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Ответ:
```json
{
  "status": "success",
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "data": {
    "id": 1,
    "login": "user@example.com",
    "name": "Test User",
    "is_moderator": false
  }
}
```

### 3. Использование токена

Для всех защищенных эндпоинтов добавляйте заголовок:
```
Authorization: Bearer {access_token}
```

### 4. Обновление токена
```
POST http://localhost:8080/api/users/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGc..."
}
```

## Создание модератора

Для тестирования прав модератора нужно:

1. Зарегистрировать пользователя
2. Вручную изменить в БД поле `is_moderator` на `true`

Через Adminer (http://localhost:8081):
```sql
UPDATE users SET is_moderator = true WHERE email = 'moderator@example.com';
```

Или через psql:
```bash
docker exec -it chroniclesearch-postgres-1 psql -U myuser -d chronicles_db
UPDATE users SET is_moderator = true WHERE email = 'moderator@example.com';
```

## Структура проекта

```
intermal/
├── app/
│   ├── auth/          # JWT токены
│   │   └── jwt.go
│   ├── middleware/    # Middleware для авторизации
│   │   └── auth.go
│   ├── redis/         # Работа с Redis
│   │   └── redis.go
│   ├── handler/       # HTTP handlers
│   ├── repository/    # Работа с БД
│   └── ds/            # Data structures
```

## Важные моменты

1. **Секретные ключи** - в файле `intermal/app/auth/jwt.go` определены секретные ключи для JWT. В продакшене их нужно хранить в переменных окружения!

2. **Время жизни токенов**:
   - Access token: 15 минут
   - Refresh token: 7 дней

3. **Фильтрация заявок**:
   - Обычный пользователь видит только свои заявки (по creator_id)
   - Модератор видит все заявки

4. **Права доступа**:
   - GET хроник - доступно всем
   - POST/PUT/DELETE хроник - требуется авторизация
   - Завершение/отклонение заявок - только модератор

## Контрольные вопросы

1. **Куки** - HTTP заголовки для хранения данных на клиенте
2. **Сессия** - механизм хранения состояния между запросами
3. **Redis** - in-memory база данных для быстрого доступа к данным
4. **JWT** - JSON Web Token, самодостаточный токен для передачи информации
5. **Авторизация и Аутентификация** - проверка прав vs проверка личности
6. **SSO** - Single Sign-On, единая точка входа
7. **Двухфакторная аутентификация** - дополнительный фактор подтверждения личности
8. **RSA** - асимметричный алгоритм шифрования

## Troubleshooting

### Ошибка подключения к Redis
```
failed to connect to Redis: dial tcp [::1]:6379: connect: connection refused
```
Решение: Запустите `docker-compose up -d`

### Ошибка 401 Unauthorized
- Проверьте что токен не истек (15 минут)
- Проверьте формат заголовка: `Bearer {token}`
- Используйте refresh token для получения нового access token

### Ошибка 403 Forbidden
- Проверьте что пользователь имеет права модератора
- Убедитесь что в БД поле `is_moderator = true`

