#!/usr/bin/env bash
# FORMATO QUIZ: prepara el proyecto de animacion de un quiz. Uso: bash quiz/proyecto.sh q1-tema [modelo|voz|todo]
#   modelo = crea proyectos/quiz-<q> (si no existe) y arma el GLB si el quiz tiene modelo.json
#   voz    = une la voz (preparar.py, con la pausa de la cuenta regresiva), la copia al proyecto y la alinea
set -e
. "$(dirname "$0")/../config.sh"
Q=$KIT/quiz; ep=$1; modo=${2:-todo}
d=$PROY/quiz-$ep
if [ "$modo" != voz ]; then
  bash "$KIT/herramientas/nuevo_proyecto.sh" "$d"
  if [ -f "$Q/$ep/modelo.json" ]; then "$PY" "$KIT/comun/modelo.py" "$Q/$ep" "$d" > /dev/null; echo "$ep: modelo 3D listo"; fi
fi
if [ "$modo" != modelo ]; then
  (cd "$Q" && "$PY" comun/preparar.py "$ep")
  cp "$Q/$ep/voz/voz.wav" "$d/assets/audio/voz.wav"; cp "$Q/$ep/voz/voz.wav" "$d/assets/audio/voz-original.wav"; cp "$Q/$ep/voz/guion.txt" "$d/trabajo/guion.txt"
  (cd "$d" && "$PY" "$ANIM" alinear > trabajo/alinear.log 2>&1)
  echo "$ep: voz alineada ($(grep -o '[0-9]* palabras' "$d/trabajo/alinear.log" | tail -1))"
fi
