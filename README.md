# Rumbo a Ceará 2027

Itinerario bilingüe (español / português) del viaje familiar a Ceará, Brasil: Fortaleza, Beach Park e Icaraizinho de Amontada, del 27/01 al 10/02/2027.

El sitio muestra el plan día por día, links a fotos y videos de cada lugar, y costos promedio por familia y por persona en reales, dólares y pesos.

El asistente para preguntar funciona solo en la versión del sitio abierta dentro de Claude.

## Asistente público (Cloudflare Worker + Gemini)

El código del servidor está en `worker/`. La contraseña del grupo y la clave de Gemini se guardan como secretos en Cloudflare, nunca en este repositorio. Las preguntas y respuestas quedan guardadas en Workers KV para mejorar el sitio. Paso a paso en `worker/COMO-CONFIGURAR.md`.
