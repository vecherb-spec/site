#!/usr/bin/env bash
# Restore nginx listen 443 from the latest SNI-split backup.
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Запустите от root."
  exit 1
fi

BACKUP="${1:-}"
if [[ -z "${BACKUP}" && -f /root/nginx-backup-mtg-443-latest ]]; then
  BACKUP="$(cat /root/nginx-backup-mtg-443-latest)"
fi
if [[ -z "${BACKUP}" || ! -d "${BACKUP}" ]]; then
  echo "Не найден бэкап. Передайте каталог: $0 /root/nginx-backup-mtg-443-..."
  exit 1
fi

cp -a "${BACKUP}/nginx.conf" /etc/nginx/nginx.conf
if [[ -d "${BACKUP}/sites-available" ]]; then
  cp -a "${BACKUP}/sites-available/." /etc/nginx/sites-available/
fi
rm -f /etc/nginx/stream.d/mtg.conf
nginx -t
systemctl reload nginx
echo "Nginx восстановлен из ${BACKUP}"
