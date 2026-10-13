#!/data/data/com.termux/files/usr/bin/bash
# Uso: ./run.sh castanha   (lee .env en esta carpeta)
cd "$(dirname "$0")"
[ -f .env ] || { echo "Falta el archivo .env (copiá .env.example y completalo)"; exit 1; }
set -a; . ./.env; set +a
command -v termux-wake-lock >/dev/null && termux-wake-lock
while true; do node index.js "$1"; echo "se cortó, reintento en 10 s"; sleep 10; done
