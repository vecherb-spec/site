#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Запустите от root: sudo ./deploy/setup-vps.sh medialive.tech"
  exit 1
fi

DOMAIN="${1:-medialive.tech}"

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE_ROOT="/var/www/medialive"
NGINX_SITE="/etc/nginx/sites-available/medialive"

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y nginx rsync certbot python3-certbot-nginx

mkdir -p "${SITE_ROOT}"
rsync -a --delete \
  --exclude ".git/" \
  --exclude "deploy/" \
  --exclude "README.md" \
  "${REPO_ROOT}/" "${SITE_ROOT}/"

cat > "${NGINX_SITE}" <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

    root ${SITE_ROOT};
    index index.html;

    error_page 404 /404.html;

    location /.well-known/acme-challenge/ {
        root ${SITE_ROOT};
    }

    location / {
        try_files \$uri \$uri/ =404;
        add_header Cache-Control "no-cache, must-revalidate";
        add_header X-Content-Type-Options nosniff always;
        add_header Referrer-Policy strict-origin-when-cross-origin always;
    }

    location ~* \.(css|js|svg|ico|png|jpg|jpeg|webp|woff2)$ {
        expires 7d;
        add_header Cache-Control "public";
        access_log off;
    }
}
NGINX
ln -sfn "${NGINX_SITE}" /etc/nginx/sites-enabled/medialive
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl enable --now nginx
systemctl reload nginx

if command -v ufw >/dev/null 2>&1 && ufw status | grep -q "Status: active"; then
  ufw allow OpenSSH
  ufw allow "Nginx Full"
fi

echo
echo "Сайт разложен в ${SITE_ROOT} и слушает 80 порт."
echo "В DNS ${DOMAIN} и www.${DOMAIN} поставьте A-запись на IP этого VPS."
echo "Когда DNS дойдёт, выпустите сертификат и примените HTTPS-конфиг:"
echo "  sudo certbot certonly --webroot -w ${SITE_ROOT} -d ${DOMAIN} -d www.${DOMAIN}"
echo "  sudo sed 's/YOUR_DOMAIN/${DOMAIN}/g' ${REPO_ROOT}/deploy/nginx.conf | sudo tee ${NGINX_SITE} >/dev/null"
echo "  sudo nginx -t && sudo systemctl reload nginx"
