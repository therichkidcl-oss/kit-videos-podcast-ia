# Rutas del kit para los scripts .sh (se cargan con: . "$(dirname "$0")/../config.sh"). Todo es relativo a esta carpeta.
# Se pueden cambiar en .env: PY, PY_TTS, ENTREGAS, VOZ (ver .env.example). Las API keys del .env NUNCA se leen aqui.
KIT=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
_env() { [ -f "$KIT/.env" ] && grep -E "^$1=" "$KIT/.env" | tail -1 | cut -d= -f2- | tr -d '\r"'"'"; }
if [ -x "$KIT/.venv/Scripts/python.exe" ]; then _py=$KIT/.venv/Scripts/python.exe; else _py=$KIT/.venv/bin/python; fi
if [ -x "$KIT/.venv-tts/Scripts/python.exe" ]; then _tts=$KIT/.venv-tts/Scripts/python.exe; else _tts=$KIT/.venv-tts/bin/python; fi
PY=${PY:-$(_env PY)}; PY=${PY:-$_py}                      # entorno principal: motor, alineacion, Whisper, 3D, control de calidad
PY_TTS=${PY_TTS:-$(_env PY_TTS)}; PY_TTS=${PY_TTS:-$_tts} # entorno de la voz (Qwen3-TTS)
ENTREGAS=${ENTREGAS:-$(_env ENTREGAS)}; ENTREGAS=${ENTREGAS:-$KIT/entregas}
ANIM=$KIT/motor-animaciones/scripts/anim.py
PROY=$KIT/proyectos
mkdir -p "$PROY" "$ENTREGAS"
# hay Telegram configurado? (solo mira que exista la linea; nunca lee ni muestra el valor)
hay_telegram() { [ -f "$KIT/.env" ] && grep -qE '^TELEGRAM_BOT_TOKEN=.+' "$KIT/.env" && grep -qE '^TELEGRAM_CHAT_ID=.+' "$KIT/.env"; }
