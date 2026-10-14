#!/usr/bin/env bash
# Crea un proyecto de animacion vertical (1080x1920) con la plantilla del motor + las fuentes y three.js del kit.
# Uso: bash herramientas/nuevo_proyecto.sh <carpeta>     (si ya existe no hace nada)
set -e
. "$(dirname "$0")/../config.sh"
d=$1
[ -d "$d" ] && exit 0
"$PY" "$ANIM" nuevo "$d" --vertical --dur 30 --tema profundidad --sonido musica --densidad espectaculo > "$KIT/proyectos/.nuevo.log" 2>&1 \
  || { cat "$KIT/proyectos/.nuevo.log"; exit 1; }
mkdir -p "$d/assets/fonts" "$d/assets/vendor" "$d/assets/3d" "$d/assets/audio" "$d/assets/clips/intro" "$d/assets/clips/climax"
cp "$KIT"/comun/assets/fonts/*.woff2 "$d/assets/fonts/"
cp "$KIT"/comun/assets/vendor/* "$d/assets/vendor/"
cp "$d/index.html" "$d/trabajo/index.base.html"
echo "proyecto creado: $d"
