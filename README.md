# Medialive — аренда техники для мероприятий

Сайт компании: звук, свет, видео, LED-экраны, сцена, трансляции и электро. Скопирован с https://rent.medialive.ru/ (Enter Pro) на статику HTML/CSS/JS для своего VPS.

Домен: **https://rent.medialive.ru/**

## Выкладка на VPS

В DNS `rent.medialive.ru` должна быть A-запись на IP сервера.

```bash
sudo bash deploy/setup-vps.sh rent.medialive.ru
sudo certbot --nginx -d rent.medialive.ru
```

Сайт окажется в `/var/www/medialive`. После правок: `git pull` и снова `setup-vps.sh`.

## Локально

```bash
python3 -m http.server 8080
```

Откройте http://localhost:8080

## Контакты на сайте

Сейчас как на Enter Pro:

- телефон `+7 (900) 000-00-00`
- почта `info@medialive.ru`
- WhatsApp `https://wa.me/79000000000`

Замените на рабочие номера в `index.html`.
