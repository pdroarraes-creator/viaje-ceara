#!/data/data/com.termux/files/usr/bin/bash
# Instala y arranca la Castanha en Termux (celular viejo). Uso: bash termux-instalar.sh
set -e
cd "$(dirname "$0")"
echo "[1/4] Instalando dependencias del sistema..."
pkg update -y >/dev/null 2>&1 || true
pkg install -y nodejs-lts git ffmpeg >/dev/null
echo "[2/4] Instalando el bot (puede tardar unos minutos)..."
npm install --no-audit --no-fund
if [ ! -f .env ]; then
  echo "[3/4] Configuración."
  printf "Pegá la BOT_KEY (no se ve al pegar) y Enter: "
  read -rs KEY; echo
  printf "WORKER_URL=https://viaje-ceara-ask.pdroarraes.workers.dev\nBOT_KEY=%s\nPHONE=5491128706685\n" "$KEY" > .env
  chmod 600 .env
else
  echo "[3/4] .env ya existe, lo dejo como está."
fi
# arranque automático al prender el celular (requiere la app Termux:Boot instalada y abierta una vez)
mkdir -p "$HOME/.termux/boot"
printf '#!/data/data/com.termux/files/usr/bin/bash\ntermux-wake-lock\ncd "%s"\nnohup ./run.sh castanha > "$HOME/castanha.log" 2>&1 &\n' "$(pwd)" > "$HOME/.termux/boot/castanha.sh"
chmod +x "$HOME/.termux/boot/castanha.sh" run.sh
echo "[4/4] Arrancando la Castanha. Si es la primera vez, va a aparecer un código de 8 letras:"
echo "  WhatsApp de la Castanha > Ajustes > Dispositivos vinculados > Vincular dispositivo > Vincular con número de teléfono"
./run.sh castanha
