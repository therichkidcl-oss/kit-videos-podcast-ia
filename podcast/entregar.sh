#!/usr/bin/env bash
# FORMATO PODCAST: renderiza episodios en fila, los deja en ENTREGAS (.env; por defecto entregas/) y, si hay Telegram en
# .env, los manda en segundo plano. Uso: bash podcast/entregar.sh "ep1-tema|01 - Titulo" "ep2-otro|02 - Titulo" ...
. "$(dirname "$0")/../config.sh"
for item in "$@"; do
  item=${item//$'\r'/}                    # listas escritas en Windows traen \r al final: rompe el nombre del archivo
  ep=${item%%|*}; nombre=${item#*|}
  d=$PROY/podcast-$ep
  if ! bash "$KIT/podcast/revisar.sh" "$ep" render > "$d/trabajo/entrega.log" 2>&1; then echo "FALLO $ep (ver $d/trabajo/entrega.log)"; continue; fi
  cp "$d/out/podcast-${ep}_1920p30.mp4" "$ENTREGAS/$nombre.mp4"
  echo "$nombre: listo en $ENTREGAS | $(grep -o '[-0-9.]* LUFS' "$d/trabajo/entrega.log" | tail -1)"
  if hay_telegram; then
    ( "$PY" "$KIT/herramientas/telegram_enviar.py" --video "$ENTREGAS/$nombre.mp4" --caption "$nombre" > /dev/null 2>&1 \
        && echo "$nombre: enviado por Telegram" || echo "$nombre: NO se pudo enviar por Telegram" ) &
  fi
done
wait
