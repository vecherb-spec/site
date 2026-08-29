#!/usr/bin/env bash
# Open Cloudflare-like HTTPS ports and redirect them to mtg :4433.
set -euo pipefail
if [[ "${EUID}" -ne 0 ]]; then
  echo "Запустите от root."
  exit 1
fi
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
install -m 0755 "${SCRIPT_DIR}/mtg-altports.sh" /usr/local/sbin/mtg-altports.sh
install -m 0644 "${SCRIPT_DIR}/mtg-altports.service" /etc/systemd/system/mtg-altports.service
systemctl daemon-reload
systemctl enable --now mtg-altports.service
/usr/local/sbin/mtg-altports.sh apply

python3 - <<'PY'
import json, pathlib, re
raw = pathlib.Path("/root/mtg-access.txt").read_text()
data = json.loads(raw)
secret = data["secret"]["base64"]
for port in (2083, 2053, 2087, 2096, 8444, 4433):
    url = f"https://t.me/proxy?port={port}&secret={secret}&server=77.110.100.102"
    pathlib.Path(f"/root/mtg-access-{port}.txt").write_text(url + "\n")
    pathlib.Path(f"/root/mtg-access-{port}.txt").chmod(0o600)
    print(url)
PY
