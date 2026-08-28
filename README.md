# Medialive — аренда техники для мероприятий

Сайт компании: звук, свет, видео, LED-экраны, сцена, трансляции и электро.

Домен: **https://medialive.tech/**

## Выкладка на VPS

В DNS домена `medialive.tech` (и `www.medialive.tech`) поставьте **A-запись** на IP сервера.

```bash
sudo bash deploy/setup-vps.sh medialive.tech
sudo certbot --nginx -d medialive.tech -d www.medialive.tech
```

Сайт окажется в `/var/www/medialive`. После правок: `git pull` и снова `setup-vps.sh`.

## Локально

```bash
python3 -m http.server 8080
```

Откройте http://localhost:8080

## Контакты на сайте

- телефон `+7 (900) 000-00-00`
- почта `info@medialive.ru`
- WhatsApp `https://wa.me/79000000000`

Замените на рабочие номера в `index.html`.
