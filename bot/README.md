# Bots de WhatsApp (Caju y Castanha)
Ruta no oficial (dispositivo vinculado). Puede ser bloqueada por WhatsApp; no guardar acá nada que no se pueda reponer.
1. `npm install`
2. Primera vez, un bot por vez: `WORKER_URL=https://viaje-ceara-ask.pdroarraes.workers.dev BOT_KEY=... PHONE=<número del bot sin +> node index.js castanha`
   Escribe un código de 8 letras: en el WhatsApp de ese número, Ajustes → Dispositivos vinculados → Vincular con número de teléfono.
3. Después: `node index.js castanha` y `node index.js caju` (dos procesos).
En Cloudflare: secreto BOT_KEY y variable BOT_ROLES (JSON número→rol: pedro, raquel, hijo).
