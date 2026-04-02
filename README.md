# LEDVision - сайт по продаже светодиодных экранов

Готовый B2B-сайт на русском языке с:

- витриной и каталогом товаров;
- карточкой товара с характеристиками;
- формой заявки;
- контактной страницей;
- админ-панелью (вход, CRUD товаров, просмотр заявок).

## Технологии

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS 4
- Prisma 7 + SQLite

## Быстрый старт

1. Установить зависимости:

```bash
npm install
```

2. Применить миграции и сгенерировать Prisma Client:

```bash
npm run db:migrate -- --name init
npm run db:generate
```

3. Заполнить демо-товары:

```bash
npm run db:seed
```

4. Запустить dev-сервер:

```bash
npm run dev
```

Открыть: `http://localhost:3000`

## Админка

- URL: `http://localhost:3000/admin/login`
- Демо-логин: `admin@led-pro.ru`
- Демо-пароль: `admin123`

Значения берутся из `.env`:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_COOKIE_SECRET`

Для production обязательно замените эти значения на безопасные.

## Скрипты

- `npm run dev` - запуск в режиме разработки
- `npm run lint` - проверка ESLint
- `npm run build` - production-сборка
- `npm run db:migrate -- --name <name>` - применение миграций
- `npm run db:generate` - генерация Prisma Client
- `npm run db:seed` - заполнение тестовыми данными
