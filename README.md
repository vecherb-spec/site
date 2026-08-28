# MediaLife — сайт компании

Лендинг технической поддержки мероприятий: звук, свет, видео, LED-экраны и сцены.

Сайт статический: HTML, CSS и JavaScript. Раздаётся Nginx с вашего VPS, домен смотрит на IP сервера.

## Размещение на VPS

Нужны Ubuntu/Debian, домен и SSH. В DNS домена заранее поставьте **A-запись** на IP VPS (и для `www`, если он нужен).

```bash
sudo apt-get update
sudo apt-get install -y git
git clone https://github.com/vecherb-spec/site.git
cd site
sudo bash deploy/setup-vps.sh ваш-домен.ru
```

Скрипт поставит Nginx, скопирует файлы в `/var/www/medialife` и включит сайт на 80 порту.

Когда домен уже открывается по http, включите HTTPS:

```bash
sudo certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru
```

Certbot сам поставит сертификат Let's Encrypt и редирект с http на https.

Обновить сайт после правок:

```bash
cd site
git pull
sudo bash deploy/setup-vps.sh ваш-домен.ru
```

Готовый конфиг Nginx: `deploy/nginx.conf`. Файл `.htaccess` на VPS не нужен — это только для Apache-хостинга.

## Как открыть локально

```bash
python3 -m http.server 8080
```

Адрес: http://localhost:8080

## Что заменить перед запуском

В `index.html` и `js/main.js` сейчас заглушки:

- телефон `+7 (800) 123-45-67`
- почта `info@medialife.ru`

Пришлите домен — пропишу его в мета-тегах.
