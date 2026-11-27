# AI-асистент для валідації ідей тех-стартапів

Кросплатформний застосунок, який аналізує ідею стартапу за методикою **NABC**
(Need, Approach, Benefit, Competition) за допомогою Google Gemini та RAG.
Клієнт написаний на C# (.NET 10, Blazor), сервер з API на Node.js.

## Як це працює

1. Користувач реєструється або входить в акаунт.
2. Вводить опис ідеї стартапу.
3. Сервер шукає схожі фрагменти в базі знань (RAG, локальна багатомовна модель embeddings).
4. Gemini аналізує ідею за NABC з урахуванням знайденого контексту.
5. Результат зберігається в MySQL і доступний в історії.

## Архітектура

```
Blazor-клієнт (src/Web)  ──  HTTP + JSON  ──►  Backend API (backend/)  ──►  MySQL
                                                       │
                                                       ├──►  RAG: база знань + embeddings
                                                       └──►  Google Gemini
```

Клієнт не має доступу до бази даних і не містить бізнес-логіки: він знає лише адресу API,
маршрути і формат JSON. Усі перевірки виконуються на сервері.

## Стек

- **Клієнт:** .NET 10, C#, Blazor Web App (Interactive Server), xUnit
- **Сервер:** Node.js, Express, MySQL, JWT, bcrypt
- **AI:** Google Gemini 2.5 Flash (LangChain), `@xenova/transformers` (модель `paraphrase-multilingual-MiniLM-L12-v2`), MemoryVectorStore

## Структура

```
src/
├── Core/              # контракти API і HTTP-клієнт StartupApiClient (без інтерфейсу)
└── Web/               # Blazor-клієнт: сторінки, бічна панель, стилі
tests/
└── Core.Tests/        # модульні тести клієнта API (xUnit)
backend/
├── ai/                # embeddings, RAG, промпт, аналіз через Gemini
├── config/            # змінні середовища, підключення до MySQL
├── controllers/       # обробка HTTP-запитів
├── database/          # SQL-схема бази даних
├── knowledge_base/    # тексти для RAG (.txt)
├── middleware/        # перевірка JWT
├── routes/            # маршрути API
├── services/          # робота з БД (користувачі, ідеї)
├── utils/             # допоміжні функції
└── server.js          # запуск сервера
client/                # попередня вебверсія на React (у цій роботі не використовується)
frontend/              # стара HTML-версія (не використовується)
StartupValidator.slnx  # .NET solution
```

## Запуск

Потрібно: .NET SDK 10, Node.js 20+, MySQL 8, ключ Gemini API.

### 1. База даних

Створіть базу в MySQL і виконайте `backend/database/schema.sql`:

```sql
CREATE DATABASE startup_validator;
USE startup_validator;
-- далі виконати вміст schema.sql
```

### 2. Сервер (порт 3000)

```bash
cd backend
cp .env.example .env    # заповніть значення в .env
npm install
npm run dev
```

Сервер готовий, коли в терміналі з'явиться `Server running on http://localhost:3000`.

### 3. Клієнт (порт 5090)

З кореня репозиторію, коли сервер уже запущений:

```bash
dotnet run --project src/Web --urls http://localhost:5090
```

Відкрити `http://localhost:5090`.

### 4. Тести

```bash
dotnet test
```

Тести перевіряють `StartupApiClient` через підробний HTTP-обробник, тому запущений сервер для них не потрібен.

## Конфігурація клієнта

Адреса сервера задається в `src/Web/appsettings.json`, у коді сторінок її немає:

```json
"Api": {
  "BaseUrl": "http://localhost:3000/"
}
```

## Де виконується код Blazor

Клієнт працює в режимі **Interactive Server**. C#-код сторінок виконується на сервері Blazor,
а браузер отримує лише оновлення інтерфейсу через з'єднання SignalR. Запити до API надсилає
сервер Blazor, а не браузер, тому CORS для них не потрібен. Вхід користувача зберігається в браузері
в зашифрованому вигляді (`ProtectedLocalStorage`), тож після оновлення сторінки сесія не губиться.

## Кросплатформність

- Клієнт і сервер запускаються на Windows, Linux і macOS.
- Інтерфейс відкривається в будь-якому сучасному браузері, зокрема на телефоні: на вузькому екрані бічна панель перетворюється на верхній рядок.
- Світла або темна тема вибирається автоматично за налаштуваннями системи.

## API

| Метод | Адреса | Опис | Токен |
|---|---|---|---|
| POST | `/api/register` | Реєстрація | — |
| POST | `/api/login` | Вхід, повертає JWT | — |
| GET | `/api/ideas` | Історія ідей | ✓ |
| GET | `/api/idea/:id` | Одна ідея з аналізом | ✓ |
| POST | `/api/analyze` | Аналіз нової ідеї | ✓ |

Помилки валідації повертаються з кодом 400 і текстом у полі `error` або `message`,
відсутній або прострочений токен дає 401/403, неіснуюча ідея дає 404.