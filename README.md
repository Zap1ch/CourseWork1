# AI-асистент для валідації ідей тех-стартапів

Вебзастосунок, який аналізує ідею стартапу за методологією **NABC**
(Need, Approach, Benefit, Competition) за допомогою Google Gemini та RAG.

## Як це працює

1. Користувач реєструється або входить в акаунт.
2. Вводить опис ідеї стартапу.
3. Сервер шукає схожі фрагменти в базі знань (RAG, локальні embeddings).
4. Gemini аналізує ідею за NABC з урахуванням знайденого контексту.
5. Результат зберігається в MySQL і доступний в історії.

## Стек

- **Backend:** Node.js, Express, MySQL, JWT, bcrypt
- **AI:** Google Gemini (LangChain), `@xenova/transformers` (embeddings), MemoryVectorStore
- **Frontend:** React, TypeScript, Vite, React Router

## Структура

```
backend/
├── ai/              # embeddings, RAG, промпт, аналіз через Gemini
├── config/          # змінні середовища, підключення до MySQL
├── controllers/     # обробка HTTP-запитів
├── database/        # SQL-схема бази даних
├── knowledge_base/  # тексти для RAG (.txt)
├── middleware/      # перевірка JWT
├── routes/          # маршрути API
├── services/        # робота з БД (користувачі, ідеї)
├── utils/           # допоміжні функції
└── server.js        # запуск сервера
client/              # React-фронтенд
```

## Запуск

Потрібно: Node.js 20+, MySQL 8, ключ Gemini API.

### 1. База даних

Створіть базу в MySQL і виконайте `backend/database/schema.sql`:

```sql
CREATE DATABASE startup_validator;
USE startup_validator;
-- далі виконати вміст schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env    # заповніть значення в .env
npm install
npm run dev
```

Сервер запуститься на `http://localhost:3000`.

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

Сайт відкриється на `http://localhost:5173`.

## API

| Метод | Адреса | Опис | Токен |
|---|---|---|---|
| POST | `/api/register` | Реєстрація | — |
| POST | `/api/login` | Вхід, повертає JWT | — |
| GET | `/api/ideas` | Історія ідей | ✓ |
| GET | `/api/idea/:id` | Одна ідея з аналізом | ✓ |
| POST | `/api/analyze` | Аналіз нової ідеї | ✓ |