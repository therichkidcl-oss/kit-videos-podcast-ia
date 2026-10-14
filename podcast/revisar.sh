#!/usr/bin/env bash
# FORMATO PODCAST: arma un episodio (clips de HeyGen a JPG + parche) y saca una hoja de revision o el render final.
# Uso: bash podcast/revisar.sh ep1-tema [revisar|render]
set -e
. "$(dirname "$0")/../config.sh"
S=$KIT/podcast
ep=$1; modo=${2:-revisar}
d=$PROY/podcast-$ep
cd "$d"
for c in intro climax; do                                   # clips nuevos -> cuadros JPG a 30 fps
  if [ -s "$S/$ep/avatar/$c.mp4" ] && [ "$S/$ep/avatar/$c.mp4" -nt "assets/clips/$c/f0001.jpg" ]; then
    rm -f assets/clips/$c/*.jpg
    ffmpeg -v error -i "$S/$ep/avatar/$c.mp4" -vf fps=30 -q:v 3 "assets/clips/$c/f%04d.jpg"
  fi
done
"$PY" "$S/comun/parche.py" "$ep"
if [ "$modo" = revisar ]; then
  # un cuadro a mitad y otro al final de cada frase (0-8): gancho, 4 bloques, climax, tips, app y cierre
  ts=$("$PY" "$KIT/comun/tiempos_revision.py")
  "$PY" "$ANIM" revisar $ts --hoja "$ep" 2>&1 | tail -1
else
  rm -f out/*.mp4
  "$PY" "$ANIM" render --fps=30 > trabajo/render.log 2>&1
  "$PY" "$KIT/comun/qa.py" "out/podcast-${ep}_1920p30.mp4" out/qa.jpg | head -1
fi
