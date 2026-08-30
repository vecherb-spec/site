#!/bin/bash
# Replacement for Amnezia start.sh in amnezia-wireguard.
# wg-quick fails (readlink); iptables-legacy cannot load ip_tables — use nft.

echo "Container startup"

CONF=/opt/amnezia/wireguard/wg0.conf

# Do not call wg-quick: it can exit 0 and leave wg0 on a random port with no peers.
if [[ -f "${CONF}" ]]; then
  echo "bringing wg0 up manually"
  wg-quick down "${CONF}" 2>/dev/null || true
  sysctl -w net.ipv4.ip_forward=1 >/dev/null || true
  if ! ip link show wg0 >/dev/null 2>&1; then
    ip link add dev wg0 type wireguard
  fi
  grep -E '^(PrivateKey|ListenPort|FwMark|\[Peer\]|PublicKey|PresharedKey|AllowedIPs|Endpoint|PersistentKeepalive)' \
    "${CONF}" > /tmp/wg0.setconf
  wg setconf wg0 /tmp/wg0.setconf
  ip -4 addr show dev wg0 | grep -q '10.8.1.0/24' || ip addr add 10.8.1.0/24 dev wg0
  ip link set wg0 up
fi

IPT=iptables-nft
command -v iptables-nft >/dev/null || IPT=iptables

"${IPT}" -C INPUT -i wg0 -j ACCEPT 2>/dev/null || "${IPT}" -A INPUT -i wg0 -j ACCEPT
"${IPT}" -C FORWARD -i wg0 -j ACCEPT 2>/dev/null || "${IPT}" -A FORWARD -i wg0 -j ACCEPT
"${IPT}" -C OUTPUT -o wg0 -j ACCEPT 2>/dev/null || "${IPT}" -A OUTPUT -o wg0 -j ACCEPT
"${IPT}" -C FORWARD -i wg0 -o eth0 -s 10.8.1.0/24 -j ACCEPT 2>/dev/null || \
  "${IPT}" -A FORWARD -i wg0 -o eth0 -s 10.8.1.0/24 -j ACCEPT
"${IPT}" -C FORWARD -i wg0 -o eth1 -s 10.8.1.0/24 -j ACCEPT 2>/dev/null || \
  "${IPT}" -A FORWARD -i wg0 -o eth1 -s 10.8.1.0/24 -j ACCEPT
"${IPT}" -C FORWARD -m state --state ESTABLISHED,RELATED -j ACCEPT 2>/dev/null || \
  "${IPT}" -A FORWARD -m state --state ESTABLISHED,RELATED -j ACCEPT
"${IPT}" -t nat -C POSTROUTING -s 10.8.1.0/24 -o eth0 -j MASQUERADE 2>/dev/null || \
  "${IPT}" -t nat -A POSTROUTING -s 10.8.1.0/24 -o eth0 -j MASQUERADE
"${IPT}" -t nat -C POSTROUTING -s 10.8.1.0/24 -o eth1 -j MASQUERADE 2>/dev/null || \
  "${IPT}" -t nat -A POSTROUTING -s 10.8.1.0/24 -o eth1 -j MASQUERADE

tail -f /dev/null
