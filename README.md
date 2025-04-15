WebChat - Веб-приложение для текстового и голосового общения
---

🚀 Реализованный функционал:

🔐 Аутентификация (JWT + Refresh Token)

💬 Текстовый чат (React + SignalR)

🎙️ Голосовой чат (WebRTC, в разработке)

📱 Адаптивный интерфейс (SCSS)

⚡ Оптимизация (ленивая загрузка, code splitting)

🛠 Технологии
----
_**Frontend**_

React + Vite (быстрая сборка)

React Router v6 (навигация)

SignalR (веб-сокеты для чата)

WebRTC (голосовая связь)

SCSS (стилизация)

Axios (HTTP-запросы)

_**Backend**_

ASP.NET Core (Web API)

SignalR (реальное время)

PostgreSQL (хранение данных)

Redis (кэширование)

JWT (аутентификация)

Swagger (документация API)

🚀 Запуск проекта
----

**1. Frontend** --
```
cd Frontend
npm install
npm run dev
```
→ Откроется на http://localhost:5173

** 2. Backend**
```
cd Backend
dotnet restore
Docker-compose up --build
```
 
→ API доступен на http://localhost:8080

→ Swagger: http://localhost:8080/swagger

**Требуется:**

-.NET 7+

-PostgreSQL 

-Redis (для кэширования)



📌 Возможности
------
1.  ✅ Регистрация и вход
2.  ✅ Создание и присоединение к чатам
3.  ✅ Обмен сообщениями в реальном времени
4.  ✅ История сообщений
5.  🛠 Голосовая связь (в разработке)
  
📂 Структура проекта
-----
```ChatApp/
├── Frontend/                  # React-приложение
│   ├── src/
│   │   ├── components/        # UI-компоненты (кнопки, модальные окна)
│   │   ├── context/           # Контексты (Auth, Chat, Voice)
│   │   ├── pages/             # Страницы (логин, чат, регистрация)
│   │   ├── routes/            # Настройки роутинга
│   │   └── styles/            # SCSS/CSS-стили
│   └── vite.config.js         # Конфигурация Vite
│
└── Backend/                   # ASP.NET Core API
    ├── Controllers/           # API-контроллеры (Auth, Chat)
    ├── Hubs/                  # SignalR-хабы (ChatHub)
    ├── Models/                # Сущности БД (User, Message)
    ├── Services/              # Бизнес-логика (JWT, ChatService)
    ├── Data/                  # DbContext, миграции
    └── appsettings.json       # Настройки сервера
```

🔧 Планы по развитию
----
Доработка голосового чата (WebRTC)
