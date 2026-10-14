#!/usr/bin/env bash
# FORMATO PODCAST: clips de HeyGen (gancho + climax) por episodio con la foto del presentador (marca.json > presentador),
# mirando el saldo antes de cada uno. Para si el saldo que quedaria baja de HEYGEN_PISO (unidades; .env, por defecto 0).
# Costo aprox.: 2,2-2,3 unidades por segundo de voz (60 unidades = 1 dolar). Sin clips el video usa la foto quieta.
# Uso: bash podcast/heygen.sh ep1-tema [ep2-otro ...]
. "$(dirname "$0")/../config.sh"
S=$KIT/podcast
F=$KIT/$("$PY" -c "import json; print(json.load(open(r'$KIT/marca/marca.json', encoding='utf-8'))['presentador'])")
PISO=$(_env HEYGEN_PISO); PISO=${PISO:-0}
cd "$KIT"
saldo() { node herramientas/heygen_saldo.mjs 2>/dev/null | grep -o '"remaining_quota": [0-9]*' | head -1 | grep -o '[0-9]*$'; }
dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }
clip() {   # clip <ep> <intro|climax>: hasta 2 intentos (a veces falla una vez)
  local A=$S/$1
  for i in 1 2; do
    node herramientas/heygen.mjs --foto "$F" --audio "$A/voz/$2.wav" --salida "$A/avatar/$2.mp4" --resolucion 1080p --formato 9:16 \
      --titulo "$1-$2" > "$A/avatar/$2.log" 2>&1 && return 0
    sleep 5
  done
  return 1
}
for ep in "$@"; do
  A=$S/$ep
  if [ -s "$A/avatar/intro.mp4" ] && [ -s "$A/avatar/climax.mp4" ]; then echo "$ep: ya tenia clips"; continue; fi
  q=$(saldo); seg=$("$PY" -c "print($(dur "$A/voz/intro.wav")+$(dur "$A/voz/climax.wav"))")
  costo=$("$PY" -c "import math; print(math.ceil($seg*2.3)+6)")
  if [ -z "$q" ] || [ $((q - costo)) -lt "$PISO" ]; then echo "PARO en $ep: saldo ${q:-?}, costaria ~$costo, piso $PISO"; break; fi
  mkdir -p "$A/avatar"
  clip "$ep" intro & clip "$ep" climax & wait
  ok="ok"; [ -s "$A/avatar/intro.mp4" ] && [ -s "$A/avatar/climax.mp4" ] || ok="FALLO (ver $A/avatar/*.log)"
  echo "$ep: $ok (${seg}s de voz, saldo antes $q, despues $(saldo))"
done
echo "saldo final: $(saldo) unidades"
