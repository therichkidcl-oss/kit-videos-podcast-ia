#!/usr/bin/env bash
# FORMATO QUIZ: arma un quiz y saca una hoja de revision (cuadros clave) o el render final con su control de calidad.
# Uso: bash quiz/revisar.sh q1-tema [revisar|render]   -> proyectos/quiz-<q>/trabajo/revision/<q>*.jpg | out/*.mp4 + out/qa.jpg
set -e
. "$(dirname "$0")/../config.sh"
ep=$1; modo=${2:-revisar}
d=$PROY/quiz-$ep
cd "$d"
"$PY" "$KIT/quiz/comun/parche.py" "$ep"
if [ "$modo" = revisar ]; then
  # por pregunta: leyendo, en la cuenta y en la revelacion; en las demas frases: a mitad y al final
  ts=$("$PY" "$KIT/comun/tiempos_revision.py" "$KIT/quiz/$ep/guion.json")
  "$PY" "$ANIM" revisar $ts --hoja "$ep" 2>&1 | tail -1
else
  rm -f out/*.mp4
  "$PY" "$ANIM" render --fps=30 > trabajo/render.log 2>&1
  "$PY" "$KIT/comun/qa.py" "out/quiz-${ep}_1920p30.mp4" out/qa.jpg | head -1
fi
