#!/usr/bin/env bash
# Put Telegram MTProto on public 443 via SNI split.
# HTTPS vhosts move to 127.0.0.1:4443. Does not touch docker/Amnezia.
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Запустите от root."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKUP="/root/nginx-backup-mtg-443-$(date +%Y%m%d%H%M%S)"
STREAM_DST="/etc/nginx/stream.d/mtg.conf"
HOOK="/etc/letsencrypt/renewal-hooks/deploy/fix-mtg-sni-split.sh"

mkdir -p "${BACKUP}/sites-available" /etc/nginx/stream.d /etc/letsencrypt/renewal-hooks/deploy
cp -a /etc/nginx/nginx.conf "${BACKUP}/"
cp -a /etc/nginx/sites-available/. "${BACKUP}/sites-available/"
echo "${BACKUP}" > /root/nginx-backup-mtg-443-latest

export DEBIAN_FRONTEND=noninteractive
apt-get install -y libnginx-mod-stream

if [[ ! -e /etc/nginx/modules-enabled/50-mod-stream.conf && ! -e /etc/nginx/modules-enabled/mod-stream.conf ]]; then
  so=""
  for candidate in /usr/lib/nginx/modules/ngx_stream_module.so /usr/share/nginx/modules/ngx_stream_module.so; do
    if [[ -f "${candidate}" ]]; then
      so="${candidate}"
      break
    fi
  done
  if [[ -z "${so}" ]]; then
    echo "Нет ngx_stream_module.so — пакет stream не встал."
    exit 1
  fi
  printf 'load_module %s;\n' "${so}" > /etc/nginx/modules-enabled/50-mod-stream.conf
fi

python3 - <<'PY'
import re
from pathlib import Path

enabled = Path("/etc/nginx/sites-enabled")
seen = set()
for link in enabled.iterdir():
    target = link.resolve() if link.is_symlink() else link
    if not target.is_file() or target in seen:
        continue
    seen.add(target)
    lines = target.read_text().splitlines(True)
    out = []
    for line in lines:
        s = line.lstrip()
        if re.match(r"listen\s+\[::\]:443\b", s):
            continue
        if re.match(r"listen\s+443\s+ssl\b", s) and "127.0.0.1" not in s:
            line = line.replace("listen 443 ssl", "listen 127.0.0.1:4443 ssl", 1)
        out.append(line)
    text = "".join(out)
    if text != target.read_text():
        target.write_text(text)
        print("patched", target)
PY

install -m 0644 "${SCRIPT_DIR}/stream-mtg.conf" "${STREAM_DST}"

if ! grep -q "include /etc/nginx/stream.d/" /etc/nginx/nginx.conf; then
  cat >> /etc/nginx/nginx.conf <<'EOF'

stream {
	include /etc/nginx/stream.d/*.conf;
}
EOF
fi

install -m 0755 /dev/stdin "${HOOK}" <<'HOOK'
#!/usr/bin/env bash
set -euo pipefail
python3 - <<'PY'
import re
from pathlib import Path
enabled = Path("/etc/nginx/sites-enabled")
seen = set()
for link in enabled.iterdir():
    target = link.resolve() if link.is_symlink() else link
    if not target.is_file() or target in seen:
        continue
    seen.add(target)
    orig = target.read_text()
    lines = orig.splitlines(True)
    out = []
    for line in lines:
        s = line.lstrip()
        if re.match(r"listen\s+\[::\]:443\b", s) and "127.0.0.1" not in s and "[::1]" not in s:
            continue
        if re.match(r"listen\s+443\s+ssl\b", s) and "127.0.0.1" not in s:
            line = line.replace("listen 443 ssl", "listen 127.0.0.1:4443 ssl", 1)
        out.append(line)
    text = "".join(out)
    if text != orig:
        target.write_text(text)
PY
nginx -t
systemctl reload nginx
HOOK

nginx -t
systemctl reload nginx

/usr/local/bin/mtg access /etc/mtg.toml > /root/mtg-access.txt
python3 - <<'PY'
import json, pathlib, re
raw = pathlib.Path("/root/mtg-access.txt").read_text()
data = json.loads(raw)
secret = data["secret"]["base64"]
url = f"https://t.me/proxy?port=443&secret={secret}&server=77.110.100.102"
tg = f"tg://proxy?port=443&secret={secret}&server=77.110.100.102"
path = pathlib.Path("/root/mtg-access-443.txt")
path.write_text(url + "\n" + tg + "\n")
print(url)
PY
chmod 0600 /root/mtg-access-443.txt /root/mtg-access.txt

echo
echo "Бэкап nginx: ${BACKUP}"
echo "Откат: sudo ${SCRIPT_DIR}/rollback-mtg-443.sh"
echo "Ссылка на порт 443: /root/mtg-access-443.txt"
