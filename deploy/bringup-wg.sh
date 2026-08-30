#!/usr/bin/env bash
# Bring up classic WireGuard inside amnezia-wireguard.
# wg-quick is broken in this image (readlink); iptables-legacy cannot load ip_tables.
set -euo pipefail

CONTAINER="${WG_CONTAINER:-amnezia-wireguard}"
HOST_DIR="${WG_HOST_DIR:-/opt/amnezia/amnezia-wireguard}"
HOST_CONF="${HOST_DIR}/wg0.conf"
HOST_START="${HOST_DIR}/start.sh"

wait_running() {
  local i
  for i in $(seq 1 45); do
    if docker inspect -f '{{.State.Running}}' "${CONTAINER}" 2>/dev/null | grep -qx true; then
      return 0
    fi
    sleep 2
  done
  echo "Container ${CONTAINER} is not running." >&2
  return 1
}

wait_running

if [[ -f "${HOST_CONF}" ]]; then
  docker exec "${CONTAINER}" mkdir -p /opt/amnezia/wireguard
  docker cp "${HOST_CONF}" "${CONTAINER}:/opt/amnezia/wireguard/wg0.conf"
fi

if [[ -f "${HOST_START}" ]]; then
  docker cp "${HOST_START}" "${CONTAINER}:/opt/amnezia/start.sh"
  docker exec "${CONTAINER}" chmod 755 /opt/amnezia/start.sh
fi

# Always apply setconf. Do not call wg-quick (it can "succeed" with an empty iface).
docker exec -i "${CONTAINER}" /bin/bash -s <<'EOS'
set -euo pipefail
CONF=/opt/amnezia/wireguard/wg0.conf
test -f "${CONF}"

sysctl -w net.ipv4.ip_forward=1 >/dev/null || true

if ! ip link show wg0 >/dev/null 2>&1; then
  ip link add dev wg0 type wireguard
fi

# Amnezia's wg refuses fopen() outside /etc/wireguard (EACCES on /tmp and /opt).
mkdir -p /etc/wireguard
grep -E '^(\[Interface\]|\[Peer\]|PrivateKey|ListenPort|FwMark|PublicKey|PresharedKey|AllowedIPs|Endpoint|PersistentKeepalive)' \
  "${CONF}" > /etc/wireguard/wg0.setconf
chmod 600 /etc/wireguard/wg0.setconf
wg setconf wg0 /etc/wireguard/wg0.setconf

if ! ip -4 addr show dev wg0 | grep -q '10.8.1.0/24'; then
  ip addr add 10.8.1.0/24 dev wg0
fi
ip link set wg0 up

IPT=iptables-nft
command -v iptables-nft >/dev/null || IPT=iptables

ensure() {
  local table="${1:-filter}"
  shift
  if [[ "${table}" == filter ]]; then
    "${IPT}" -C "$@" 2>/dev/null || "${IPT}" -A "$@"
  else
    "${IPT}" -t "${table}" -C "$@" 2>/dev/null || "${IPT}" -t "${table}" -A "$@"
  fi
}

ensure filter INPUT -i wg0 -j ACCEPT
ensure filter FORWARD -i wg0 -j ACCEPT
ensure filter OUTPUT -o wg0 -j ACCEPT
ensure filter FORWARD -i wg0 -o eth0 -s 10.8.1.0/24 -j ACCEPT
ensure filter FORWARD -i wg0 -o eth1 -s 10.8.1.0/24 -j ACCEPT
ensure filter FORWARD -m state --state ESTABLISHED,RELATED -j ACCEPT
ensure nat POSTROUTING -s 10.8.1.0/24 -o eth0 -j MASQUERADE
ensure nat POSTROUTING -s 10.8.1.0/24 -o eth1 -j MASQUERADE

wg show
EOS

if command -v ufw >/dev/null && ufw status | grep -q "Status: active"; then
  ufw allow 36486/udp comment "Classic WireGuard" >/dev/null || true
fi

echo "WireGuard wg0 is up in ${CONTAINER}"
