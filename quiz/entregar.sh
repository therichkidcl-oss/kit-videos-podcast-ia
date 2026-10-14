#!/usr/bin/env bash
# FORMATO QUIZ: renderiza en fila, deja cada video en ENTREGAS (.env; por defecto entregas/) y, si hay Telegram en .env,
# lo manda en segundo plano (no frena el render del siguiente).
# Uso: bash quiz/entregar.sh "q1-tema|Quiz 01 - Titulo" "q2-otro|Quiz 02 - Titulo" ...
. "$(dirname "$0")/../config.sh"
for item in "$@"; do
  item=${item//$'\r'/}                    # listas escritas en Windows traen \r al final: rompe el nombre del archivo
  ep=${item%%|*}; nombre=${item#*|}
  d=$PROY/quiz-$ep
  if ! bash "$KIT/quiz/revisar.sh" "$ep" render > "$d/trabajo/entrega.log" 2>&1; then echo "FALLO $ep (ver $d/trabajo/entrega.log)"; continue; fi
  cp "$d/out/quiz-${ep}_1920p30.mp4" "$ENTREGAS/$nombre.mp4"
  echo "$nombre: listo en $ENTREGAS | $(grep -o '[0-9.]* s .*LUFS' "$d/trabajo/entrega.log" | tail -1)"
  if hay_telegram; then
    ( "$PY" "$KIT/herramientas/telegram_enviar.py" --video "$ENTREGAS/$nombre.mp4" --caption "$nombre" > /dev/null 2>&1 \
        && echo "$nombre: enviado por Telegram" || echo "$nombre: NO se pudo enviar por Telegram" ) &
  fi
done
wait
