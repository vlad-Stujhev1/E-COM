# VS_LAB Store - Telegram WebApp

Цифровое пространство VS_LAB — лаборатории архитектурных решений. Telegram WebApp магазин с полным функционалом e-commerce.

## 🏗️ Архитектура

\`\`\`
vs-lab-store/
├── app/                    # Next.js App Router
│   ├── welcome/           # Страница авторизации
│   ├── home/              # Главная/витрина
│   ├── cart/              # Корзина
│   ├── payment/           # Оплата
│   ├── profile/           # Профиль пользователя
│   ├── admin/             # Админ-панель
│   └── layout.tsx         # Основной layout
├── components/ui/         # UI компоненты (shadcn/ui)
├── scripts/               # Backend сервер
│   └── server.js          # Express API
├── logs/                  # Логи запуска
└── start.bat             # Скрипт запуска
\`\`\`

## 🚀 Быстрый запуск

### Windows
\`\`\`bash
# Запуск одной командой
start.bat
\`\`\`

### Linux/Mac
\`\`\`bash
# Установка зависимостей
npm install

# Запуск фронтенда
npm run dev

# Запуск бэкенда (в отдельном терминале)
npm run server
\`\`\`

## 🎨 Дизайн-система VS_LAB

### Цветовая палитра
- **Основной фон**: `#f9f9f9` (VS_LAB White)
- **Текст**: `#111111` (VS_LAB Black)  
- **Акцент**: `#0d6efd` (Cobalt Blue)
- **Вторичный**: `#666666` (Cyber Gray)

### Принципы
- **Системное мышление** - модульная архитектура
- **Радикальная эстетика** - смелые решения в UI
- **Простота без упрощения** - функциональность через минимализм
- **Гибрид физического и цифрового** - тактильные взаимодействия

## 📱 Telegram WebApp интеграция

### Настройка бота
\`\`\`javascript
// Отправка кнопки WebApp
bot.sendMessage(chatId, "Открыть VS_LAB Store", {
  reply_markup: {
    inline_keyboard: [[
      { text: "🏪 Открыть магазин", web_app: { url: "https://your-domain.com" } }
    ]]
  }
});
\`\`\`

### SDK функции
- `window.Telegram.WebApp.ready()` - инициализация
- `window.Telegram.WebApp.expand()` - полноэкранный режим
- `window.Telegram.WebApp.initDataUnsafe.user` - данные пользователя
- `window.Telegram.WebApp.showAlert()` - уведомления

## 🔐 Авторизация

### Telegram WebApp
\`\`\`javascript
// Валидация HMAC подписи
const validateTelegramData = (initData) => {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  // ... проверка подписи
};
\`\`\`

### JWT токены
- Выдача после успешной валидации Telegram данных
- Хранение в localStorage
- Проверка на каждом API запросе

## 🛒 API Endpoints

### Публичные
- `GET /api/products` - список товаров
- `GET /api/products/:id` - товар по ID
- `POST /api/auth` - авторизация

### Авторизованные
- `GET /api/orders` - заказы пользователя
- `POST /api/cart` - добавить в корзину
- `POST /api/payment` - оплата

### Админские
- `GET /api/admin/products` - все товары
- `POST /api/admin/product` - добавить товар
- `PUT /api/admin/product/:id` - обновить товар
- `DELETE /api/admin/product/:id` - удалить товар

## 🔧 Конфигурация

### Переменные окружения
\`\`\`env
# .env.local
TELEGRAM_BOT_TOKEN=your_bot_token
JWT_SECRET=your_jwt_secret
NODE_ENV=production
\`\`\`

### Админский доступ
- По IP адресу (127.0.0.1 для разработки)
- По JWT токену
- Дополнительная проверка user ID

## 📊 Мониторинг

### Логирование
- Все запросы логируются в `logs/`
- Формат: `start_YYYYMMDD_HHMMSS.log`
- Ротация логов по дням

### Статус API
\`\`\`bash
GET /api/status
\`\`\`

## 🎯 Особенности

### Mobile First
- Оптимизация под Telegram WebApp
- Адаптивный дизайн
- Touch-friendly интерфейс

### Производительность
- Next.js App
