# MediaLife — Техническая поддержка мероприятий

Профессиональный лендинг для компании MediaLife — техническое обеспечение мероприятий: звук, свет, видео, LED-экраны, сценические конструкции и прямые трансляции.

## Структура сайта

- **Главная** — hero-блок с ключевым предложением
- **Услуги** — звук, свет, экраны и видео, сцены
- **Оборудование** — детальный каталог техники по категориям
- **О компании** — информация о MediaLife
- **Контакты** — форма заявки и контактные данные

## Запуск локально

Откройте `index.html` в браузере **не получится** — стили и скрипты не загрузятся. Нужен локальный сервер:

```bash
cd site
python3 -m http.server 8080
```

Откройте http://localhost:8080

## Публикация в интернете (GitHub Pages)

1. Откройте репозиторий: https://github.com/vecherb-spec/site
2. **Settings** → **Pages**
3. **Build and deployment** → Source: **Deploy from a branch**
4. Branch: **main**, папка: **/ (root)**
5. Нажмите **Save**

Через 1–2 минуты сайт будет доступен по адресу:

**https://vecherb-spec.github.io/site/**

## Технологии

- HTML5, CSS3, JavaScript (vanilla)
- Адаптивный дизайн (mobile-first)
- Тёмная тема в стиле event-индустрии

## Настройка

Замените контактные данные в `index.html`:
- Телефон: `+7 (800) 123-45-67`
- Email: `info@medialife.ru`

## Telegram MTProto-прокси на VPS

Сервис `mtg` слушает **4433**. Для Wi‑Fi, где этот порт режут, публичный **443** делится по SNI: сайты идут в Nginx на `127.0.0.1:4443`, FakeTLS Telegram — в mtg.

```bash
sudo ./deploy/setup-mtproto.sh
sudo ./deploy/enable-mtg-443.sh
```

Ссылки: `/root/mtg-access.txt` (4433) и `/root/mtg-access-443.txt` (443). Откат Nginx: `sudo ./deploy/rollback-mtg-443.sh`.
