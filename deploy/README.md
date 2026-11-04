# Деплой Medialive и приём заявок

Статика лежит в `/var/www/medialive`. Обработчик заявок — `api/lead.php` (PHP-FPM).

## PHP-FPM (если ещё не установлен)

На Debian/Ubuntu (FirstVDS):

```bash
sudo apt-get update
sudo apt-get install -y php-fpm php-curl
sudo systemctl enable --now php8.2-fpm
```

Имя сокета смотрите в `/run/php/` (часто `php8.2-fpm.sock` или `php-fpm.sock`) и подставьте в nginx ниже.

## Конфиг доставки заявок (вне webroot)

Заявки уходят в Telegram-чат **«Заявки LED»** через **Radist API**. В `api/lead.php` функция `send_radist()` — точка интеграции (есть TODO по формату запроса; при деплое допишите под вашу документацию Radist). **Telegram Bot API** — запасной канал, если в конфиге заданы `telegram_bot_token` и `telegram_chat_id`.

```bash
sudo mkdir -p /etc/medialive /var/log/medialive /var/lib/medialive/rate-limit
sudo install -o root -g www-data -m 640 deploy/lead.conf.example /etc/medialive/lead.conf
sudo nano /etc/medialive/lead.conf
```

Поля Radist (обязательны для основного канала):

- `radist_api_url` — адрес API Radist
- `radist_api_key` — ключ API
- `radist_chat_id` — ID подключения / чата (чат «Заявки LED»)

Запасной Telegram Bot API (необязательно):

- `telegram_bot_token`
- `telegram_chat_id`

Переменные окружения PHP-FPM (альтернатива ini): `MEDIALIVE_RADIST_API_URL`, `MEDIALIVE_RADIST_API_KEY`, `MEDIALIVE_RADIST_CHAT_ID`, а также `MEDIALIVE_TELEGRAM_BOT_TOKEN`, `MEDIALIVE_TELEGRAM_CHAT_ID`.

Если не настроен ни Radist, ни Telegram, обработчик отвечает **503** с понятным текстом; заявка всё равно пишется в `/var/log/medialive/leads.log`.

Права на лог и rate-limit:

```bash
sudo chown www-data:www-data /var/log/medialive /var/lib/medialive/rate-limit
```

## Nginx: блок для `/api/`

Добавьте в server-блок сайта (пример для HTTPS-конфига из `deploy/nginx.conf`):

```nginx
    location ^~ /api/ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
```

Каталог `api/` должен быть внутри `root` (`/var/www/medialive/api/lead.php`).

После правок:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## Выкладка файлов

```bash
sudo rsync -a --delete \
  --exclude ".git/" \
  --exclude "deploy/" \
  --exclude "README.md" \
  ./ /var/www/medialive/
```

Или скрипт `deploy/setup-vps.sh` для первичной настройки (без PHP — установите FPM отдельно, см. выше).

## Антиспам и валидация

- Скрытое поле honeypot (`company_website`) — ботам отдаётся фиктивный успех.
- Не чаще одной заявки в минуту с IP (файлы в `/var/lib/medialive/rate-limit`).
- Телефон проверяется на сервере (11 цифр, код страны 7).

## Яндекс Метрика

При успешной отправке квиза вызывается цель `quiz_submit` (событие `medialive-quiz-submit` в `js/analytics.js`). Счётчик `114059004` задаётся в `js/site-config.js`.

## Кабинеты Яндекса

Цели `quiz_submit`, `phone_click`, `telegram_click`, `max_click` настраиваются в кабинете Метрики; кампанию Директа ведите по цели `quiz_submit`.
