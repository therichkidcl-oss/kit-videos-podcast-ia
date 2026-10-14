#!/usr/bin/env bash
# FORMATO PODCAST: por episodio une la voz (f0..f8), crea proyectos/podcast-<ep>, la alinea y arma el modelo 3D (si hay).
# Uso: bash podcast/proyecto.sh ep1-tema [ep2-otro ...]
set -e
. "$(dirname "$0")/../config.sh"
S=$KIT/podcast
for ep in "$@"; do
  d=$PROY/podcast-$ep
  (cd "$S" && "$PY" comun/preparar.py "$ep")
  bash "$KIT/herramientas/nuevo_proyecto.sh" "$d"
  cp "$S/$ep/voz/voz.wav" "$d/assets/audio/voz.wav"; cp "$S/$ep/voz/voz.wav" "$d/assets/audio/voz-original.wav"; cp "$S/$ep/voz/guion.txt" "$d/trabajo/guion.txt"
  (cd "$d" && "$PY" "$ANIM" alinear > trabajo/alinear.log 2>&1)
  if [ -f "$S/$ep/modelo.json" ]; then "$PY" "$KIT/comun/modelo.py" "$S/$ep" "$d" > /dev/null; fi
  echo "$ep listo: $(grep -o '[0-9]* palabras' "$d/trabajo/alinear.log" | tail -1)"
done
