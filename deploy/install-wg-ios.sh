#!/usr/bin/env bash
# Persist classic WireGuard (official iOS app) after Docker/host reboot.
# Does not print or store client private keys. Those stay in /root/ios-wireguard.conf on the VPS.
set -euo pipefail
if [[ "${EUID}" -ne 0 ]]; then
  echo "Запустите от root."
  exit 1
fi
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
install -d -m 0750 /opt/amnezia/amnezia-wireguard
install -m 0755 "${SCRIPT_DIR}/bringup-wg.sh" /usr/local/sbin/bringup-wg.sh
install -m 0755 "${SCRIPT_DIR}/wg-start.sh" /opt/amnezia/amnezia-wireguard/start.sh
install -m 0644 "${SCRIPT_DIR}/bringup-wg.service" /etc/systemd/system/bringup-wg.service

if docker exec amnezia-wireguard test -f /opt/amnezia/wireguard/wg0.conf; then
  docker cp amnezia-wireguard:/opt/amnezia/wireguard/wg0.conf /opt/amnezia/amnezia-wireguard/wg0.conf
  chmod 600 /opt/amnezia/amnezia-wireguard/wg0.conf
fi

systemctl daemon-reload
systemctl enable --now bringup-wg.service
/usr/local/sbin/bringup-wg.sh
echo "Classic WireGuard persisted. Client profile: /root/ios-wireguard.conf"
