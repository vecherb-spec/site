#!/usr/bin/env bash
# Install Telegram MTProto proxy (mtg) next to existing sites.
# Does not change nginx, docker, or ports 80/443/22/1935/8443.
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Запустите от root."
  exit 1
fi

MTG_VERSION="${MTG_VERSION:-2.2.8}"
MTG_PORT="${MTG_PORT:-4433}"
MTG_FRONTING="${MTG_FRONTING:-www.cloudflare.com}"
PUBLIC_IP="${PUBLIC_IP:-77.110.100.102}"
BIN="/usr/local/bin/mtg"
CONF="/etc/mtg.toml"
UNIT="/etc/systemd/system/mtg.service"
ACCESS="/root/mtg-access.txt"
ASSET="mtg-${MTG_VERSION}-linux-amd64.tar.gz"
URL="https://github.com/9seconds/mtg/releases/download/v${MTG_VERSION}/${ASSET}"

for taken in 80 443 22 1935 8443; do
  if [[ "${MTG_PORT}" == "${taken}" ]]; then
    echo "Порт ${MTG_PORT} занят существующим сервисом. Выберите другой."
    exit 1
  fi
done

if ss -lnt | awk '{print $4}' | grep -qE ":${MTG_PORT}$"; then
  if ! systemctl is-active --quiet mtg; then
    echo "Порт ${MTG_PORT} уже слушается другим процессом."
    ss -lntp | grep ":${MTG_PORT}" || true
    exit 1
  fi
fi

tmp="$(mktemp -d)"
trap 'rm -rf "${tmp}"' EXIT
curl -fsSL "${URL}" -o "${tmp}/${ASSET}"
tar -xzf "${tmp}/${ASSET}" -C "${tmp}"
mtg_bin="$(find "${tmp}" -type f -name mtg | head -n 1)"
if [[ -z "${mtg_bin}" ]]; then
  echo "В архиве нет бинарника mtg"
  exit 1
fi
install -m 0755 "${mtg_bin}" "${BIN}"

if [[ ! -f "${CONF}" ]]; then
  secret="$("${BIN}" generate-secret --hex "${MTG_FRONTING}")"
  cat > "${CONF}" <<EOF
secret = "${secret}"
bind-to = "0.0.0.0:${MTG_PORT}"
public-ipv4 = "${PUBLIC_IP}"
prefer-ip = "prefer-ipv4"
concurrency = 1024
auto-update = false
EOF
  chmod 0644 "${CONF}"
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
install -m 0644 "${SCRIPT_DIR}/mtg.service" "${UNIT}"

systemctl daemon-reload
systemctl enable --now mtg
systemctl restart mtg

if command -v ufw >/dev/null 2>&1 && ufw status | grep -q "Status: active"; then
  ufw allow "${MTG_PORT}/tcp" comment "Telegram MTProto mtg" || ufw allow "${MTG_PORT}/tcp"
fi

sleep 1
systemctl --no-pager --full status mtg | sed -n '1,20p'
"${BIN}" access "${CONF}" | tee "${ACCESS}"
chmod 0600 "${ACCESS}"

echo
echo "Nginx и docker не перезапускались."
echo "Ссылка также в ${ACCESS}"
