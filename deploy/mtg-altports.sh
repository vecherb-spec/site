#!/usr/bin/env bash
# Map extra TCP ports to mtg (4433) without touching 80/443/8443.
set -euo pipefail
MTG_PORT="${MTG_PORT:-4433}"
PORTS=(2053 2083 2087 2096 8444)

apply_rule() {
  local bin="$1" port="$2"
  if "${bin}" -t nat -C PREROUTING -p tcp --dport "${port}" -j REDIRECT --to-ports "${MTG_PORT}" 2>/dev/null; then
    return 0
  fi
  "${bin}" -t nat -I PREROUTING 1 -p tcp --dport "${port}" -j REDIRECT --to-ports "${MTG_PORT}"
}

clear_rule() {
  local bin="$1" port="$2"
  while "${bin}" -t nat -C PREROUTING -p tcp --dport "${port}" -j REDIRECT --to-ports "${MTG_PORT}" 2>/dev/null; do
    "${bin}" -t nat -D PREROUTING -p tcp --dport "${port}" -j REDIRECT --to-ports "${MTG_PORT}"
  done
}

cmd="${1:-apply}"
bins=(iptables)
command -v ip6tables >/dev/null && bins+=(ip6tables)

for port in "${PORTS[@]}"; do
  if [[ "${cmd}" == "clear" ]]; then
    for bin in "${bins[@]}"; do clear_rule "${bin}" "${port}"; done
    continue
  fi
  for bin in "${bins[@]}"; do apply_rule "${bin}" "${port}"; done
  if command -v ufw >/dev/null && ufw status | grep -q "Status: active"; then
    ufw allow "${port}/tcp" comment "Telegram MTProto alt" >/dev/null || ufw allow "${port}/tcp" >/dev/null || true
  fi
done

if [[ "${cmd}" == "apply" ]]; then
  echo "Redirect -> :${MTG_PORT} on ${PORTS[*]}"
fi
