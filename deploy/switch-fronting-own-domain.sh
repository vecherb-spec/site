#!/usr/bin/env bash
# Switch FakeTLS cover domain to www.medialive.tech so SNI matches this VPS IP.
set -euo pipefail
CONF=/etc/mtg.toml
STREAM=/etc/nginx/stream.d/mtg.conf
BIN=/usr/local/bin/mtg
BACKUP=/root/mtg-fronting-backup-$(date +%Y%m%d%H%M%S)
mkdir -p "${BACKUP}"
cp -a "${CONF}" "${STREAM}" "${BACKUP}/"

secret="$("${BIN}" generate-secret --hex www.medialive.tech)"
cat > "${CONF}" <<EOF
secret = "${secret}"
bind-to = "0.0.0.0:4433"
public-ipv4 = "77.110.100.102"
prefer-ip = "prefer-ipv4"
concurrency = 1024
auto-update = false

[domain-fronting]
host = "127.0.0.1"
port = 4443
EOF
chmod 0644 "${CONF}"
install -m 0644 /root/site-deploy/stream-mtg.conf "${STREAM}"

systemctl restart mtg
nginx -t
systemctl reload nginx
sleep 1
systemctl is-active mtg nginx

fail=0
check() {
  local host="$1"
  code="$(curl -sk -o /dev/null -w '%{http_code}' --max-time 15 --resolve "${host}:443:127.0.0.1" "https://${host}/" || echo 000)"
  echo "${host} -> ${code}"
  if [[ "${code}" != 200 && "${code}" != 301 && "${code}" != 302 ]]; then
    fail=1
  fi
}
check www.medialive.tech
check medialive.tech
check calc.medialive.ru
check quiz.medialive.ru
check restream.medialive.ru

if [[ "${fail}" -ne 0 ]]; then
  echo "Сайт не ответил, откатываю mtg/stream из ${BACKUP}"
  cp -a "${BACKUP}/mtg.toml" "${CONF}"
  cp -a "${BACKUP}/mtg.conf" "${STREAM}"
  systemctl restart mtg
  nginx -t && systemctl reload nginx
  exit 1
fi

"${BIN}" doctor "${CONF}" || true
"${BIN}" access "${CONF}" | tee /root/mtg-access.txt
python3 - <<'PY'
import json, pathlib
data = json.loads(pathlib.Path("/root/mtg-access.txt").read_text())
secret = data["secret"]["base64"]
url = f"https://t.me/proxy?port=443&secret={secret}&server=77.110.100.102"
pathlib.Path("/root/mtg-access-443.txt").write_text(url + "\n")
print("LINK", url)
PY
chmod 0600 /root/mtg-access.txt /root/mtg-access-443.txt
echo "backup ${BACKUP}"
