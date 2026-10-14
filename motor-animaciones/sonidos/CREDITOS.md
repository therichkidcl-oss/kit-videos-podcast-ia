# Efectos de sonido

- **Sintetizados, incluidos en el repo** (`golpe`, `golpe-corto`, `aire`, `aire-salida`, `tick`, `tick-suave`, `nota`,
  `nota-doble`, `swell`, `descarte`, `corte`, `bip`): generados por `scripts/biblioteca_sonidos.py`. Sin derechos de
  terceros.
- **Sustitutos, creados al instalar** (`golpe-grave`, `impacto`, `barrido`, `transicion`, `click`, `tecla`, `tecleo`,
  `campana`, `ping`, `brillo`, `notificacion`, `subida`, `fallo`, `glitch`, `glitch-fuerte`, `pop`): en el kit original
  eran efectos de Pixabay, que no se redistribuyen aqui. `python herramientas/preparar_audio.py` crea cada uno copiando
  un sintetizado parecido (por ejemplo `impacto` <- `golpe`, `click` <- `tick`) y deja su ficha en `sonidos.json`
  (campo `copia_de`). No van al repo (estan en `.gitignore`).

Si quieres un efecto mejor, reemplaza el `.wav` del sustituto por el tuyo (mismo nombre; 48 kHz, sin silencio inicial,
pico a -1 dBFS) y ajusta en `sonidos.json` su `dur` (duracion en s) y `pico` (en que segundo esta el golpe). Usa solo
efectos con licencia para uso comercial (por ejemplo los de Pixabay o Mixkit).

`sonidos.json` guarda de cada uno la duracion, donde esta su golpe (`pico`, en s), con que se alinea (`ancla`:
`pico` = el golpe cae en el instante del evento; `fin` = termina en el) y la ganancia por defecto (`gain_db`) que
iguala las familias bajo la voz.
