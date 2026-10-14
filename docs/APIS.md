# APIs y keys

Regla de oro: **las keys van solo en `.env`** (esta en `.gitignore`). Los scripts las leen cuando las necesitan y nunca
las imprimen. No las pegues en un chat, en el codigo ni en un commit. Antes de cada `git push`, revisa que no se cuele
ninguna (ver "Antes de subir cambios" en [CLAUDE.md](../CLAUDE.md)).

| Servicio | Para que | Obligatorio | Costo | Variable en `.env` |
|---|---|---|---|---|
| HeyGen (Avatar IV, API v3) | presentador que habla en el gancho y el climax del podcast | solo podcast (sin clips usa tu foto quieta) | ~2,2 unidades por segundo de voz; 60 unidades = US$1; ~US$0,30 por video | `HEYGEN_API_KEY`, `HEYGEN_PISO` |
| Telegram Bot API | recibir cada video terminado en tu telefono | no | gratis | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` |
| Hugging Face | descarga unica de Qwen3-TTS y Whisper | si, la primera vez (sin cuenta) | gratis | ninguna |
| ChatGPT (web, manual) | dibujar tu personaje y sus 7 caras | solo si no tienes ilustraciones | tu plan | ninguna (se usa en el navegador) |

Todo lo demas es local y gratis: voz (Qwen3-TTS), alineacion (MMS_FA), Whisper, 3D (three.js) y render (Chrome).

## HeyGen

1. Crea una cuenta en https://app.heygen.com y carga saldo de API (es aparte del plan web).
2. Copia tu API token (Settings > API) en `.env` como `HEYGEN_API_KEY=...`.
3. Saldo: `node herramientas/heygen_saldo.mjs` (muestra `remaining_quota` en unidades).
4. Pon `HEYGEN_PISO` con el saldo que no quieres tocar: `podcast/heygen.sh` para antes de bajar de ahi.
5. La foto del presentador es `marca.json > presentador`: foto vertical, de la cintura o pecho hacia arriba, buena luz,
   mirando a camara, boca cerrada. HeyGen la anima con el audio (`herramientas/heygen.mjs --foto --audio --salida`).

Solo se generan dos clips por video (gancho ~4 s y climax ~4 s) para gastar poco. Si un clip falla, el script reintenta
una vez; si vuelve a fallar mira `podcast/<ep>/avatar/*.log`.

## Telegram (opcional)

1. Habla con @BotFather, crea un bot y copia el token en `TELEGRAM_BOT_TOKEN`.
2. Escribele algo a tu bot y saca tu chat id con @userinfobot: va en `TELEGRAM_CHAT_ID`.
3. Prueba: `.venv/Scripts/python.exe herramientas/telegram_enviar.py --texto "hola"`. Videos de mas de 48 MB se comprimen solos.

Con las dos variables puestas, `entregar.sh` manda cada video apenas termina (en segundo plano).
