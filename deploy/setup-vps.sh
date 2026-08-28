#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Запустите от root: sudo ./deploy/setup-vps.sh ваш-домен.ru"
  exit 1
fi

DOMAIN="${1:-}"
if [[ -z "${DOMAIN}" ]]; then
  echo "Укажите домен: sudo ./deploy/setup-vps.sh example.ru"
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE_ROOT="/var/www/medialife"
NGINX_SITE="/etc/nginx/sites-available/medialife"

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y nginx rsync certbot python3-certbot-nginx

mkdir -p "${SITE_ROOT}"
rsync -a --delete \
  --exclude ".git/" \
  --exclude "deploy/" \
  --exclude "README.md" \
  "${REPO_ROOT}/" "${SITE_ROOT}/"

sed "s/YOUR_DOMAIN/${DOMAIN}/g" "${REPO_ROOT}/deploy/nginx.conf" > "${NGINX_SITE}"
ln -sfn "${NGINX_SITE}" /etc/nginx/sites-enabled/medialife
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
echo "В DNS домена ${DOMAIN} должна быть A-запись на IP этого VPS."
echo "Когда DNS дойдёт, выпустите сертификат:"
echo "  sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
