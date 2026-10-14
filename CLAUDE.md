# Instrucciones para Claude: kit de videos estilo podcast con IA (formato podcast y formato quiz)

Este repo produce videos animados de punta a punta: guion -> voz clonada local -> proyecto de animacion -> clips del
presentador (HeyGen) -> hoja de revision -> render MP4 -> entrega. Las recetas de podcast y quiz son verticales
(1080x1920); los videos horizontales (1920x1080) se hacen con `motor-animaciones/` directo. Lee esto entero antes de
producir. Detalle de cada parte en `docs/`.

Lo usan alumnos de un curso que pueden partir de cero: explica cada paso en palabras simples, haz tu los comandos y
no des por sabido nada (que es una terminal, un `.env`, una ruta).

## Antes de cualquier cosa: audio del motor

La musica (Mixkit) y 16 efectos de sonido NO vienen en el repo: se crean con `herramientas/preparar_audio.py`.
Comprueba con `.venv/Scripts/python.exe herramientas/preparar_audio.py --revisar` (o `python ...`): si dice que falta
algo (o al renderizar aparece `No hay tema ...` o `sonido desconocido ...`), correlo sin `--revisar`. Es idempotente
y solo usa la libreria estandar.

## Reglas

1. **Secretos:** las keys viven solo en `.env` (ignorado por git). Leelas solo desde los scripts; NUNCA las imprimas,
   copies, pidas por chat ni pongas en codigo o commits. Si falta una, abrele el `.env` al usuario (por ejemplo
   `notepad .env`) o dile la ruta exacta, para que EL pegue la key y guarde; despues compruebala sin mostrarla
   (`node herramientas/heygen_saldo.mjs`). Si el usuario pega una key en el chat, no la repitas y dile que la rote.
2. **Voz del usuario:** `voces/` es privada (ignorada por git). Nunca la subas, ni audios (`*.wav`, `*.mp3`) ni videos.
3. **Marca:** nada de nombres, colores o logos fijos en el codigo: todo sale de `marca/marca.json` (docs/MARCA.md).
4. **Revisar siempre** la hoja de revision y `out/qa.jpg` (20 cuadros reales del MP4) antes de entregar: nada encimado,
   nada fuera de cuadro, textos legibles, 3D bien encuadrado, la voz se entiende.
5. **Pronunciacion:** revisa la voz con Whisper (`herramientas/revisar_voz.py`) ANTES de animar o de pagar HeyGen.
6. **HeyGen cuesta plata:** mira el saldo (`node herramientas/heygen_saldo.mjs`) y respeta `HEYGEN_PISO`.
7. Escribe en el idioma y tono del usuario. Guiones: frases cortas, con tildes, numeros como se dicen.

## Primer uso en una PC nueva

1. `docs/INSTALACION.md` (programas, `.venv`, `herramientas/preparar_audio.py`, `.venv-tts`, `.env`). Comprueba con
   `.venv/Scripts/python.exe motor-animaciones/scripts/entorno.py` y `herramientas/preparar_audio.py --revisar`.
2. Voz: `herramientas/clonar_voz.py` con una grabacion del usuario (docs/VOZ.md) y revisar `referencia.txt`.
   Si el PC tiene menos de 16 GB de RAM o poco disco, no instales `.venv-tts`: usa el Plan B de docs/VOZ.md (el
   usuario graba o usa ElevenLabs y los audios van en `<ep>/voz/f0.wav ... fN.wav`, uno por frase; saltate `voz.py`).
3. Marca: completar `marca/marca.json` y reemplazar las imagenes de `marca/` (docs/MARCA.md, docs/PERSONAJE.md).
   Para el quiz hacen falta las 7 caras del personaje; para el podcast, la foto del presentador (HeyGen) y el busto.
   No llames a HeyGen con la foto de ejemplo ("TU FOTO AQUI"): sin clips el video usa la foto quieta.
4. Probar con los ejemplos: `quiz/q1-ejemplo` y `podcast/ep1-ejemplo` (README > Tu primer video).

## Producir un QUIZ (docs/FORMATO-QUIZ.md)

1. Elige 6 preguntas de temas mezclados, de menos a mas dificil; la 6a "la que casi nadie acierta".
   Opciones cortas (3), un dato de una linea por respuesta.
2. Crea `quiz/<q>/` copiando `quiz/q1-ejemplo/` (guion.json con las 16 frases + config.js; `img/` o `modelo.json`).
3. `.venv/Scripts/python.exe herramientas/voz.py quiz/<q>` -> `.venv/Scripts/python.exe herramientas/revisar_voz.py quiz/<q>` -> rehacer
   lo dudoso con `--solo N --semilla S --sufijo _b` y quedarse con la mejor version.
4. `bash quiz/proyecto.sh <q>` -> `bash quiz/revisar.sh <q>` -> mirar `proyectos/quiz-<q>/trabajo/revision/<q>.png`
   (con Read) y corregir `config.js` hasta que este perfecto.
5. `bash quiz/entregar.sh "<q>|Quiz NN - Titulo"` -> mirar `proyectos/quiz-<q>/out/qa.jpg` -> el MP4 queda en `entregas/`.

## Producir un PODCAST (docs/FORMATO-PODCAST.md)

1. Guion: gancho (pregunta que la gente busca), 4 frases de explicacion, climax con dato y fuente real, 3 tips.
2. Crea `podcast/<ep>/` copiando `podcast/ep1-ejemplo/` (guion.json, config.js, escenas.js; `img/` o `modelo.json`).
3. Voz y revision como en el quiz (sobre todo f0 y f5: son las que van a HeyGen).
4. `bash podcast/proyecto.sh <ep>` -> `bash podcast/heygen.sh <ep>` -> `bash podcast/revisar.sh <ep>` -> mirar la hoja,
   ajustar `config.js` / `escenas.js` (claves `T.*`, camaras, dx/dy de etiquetas).
5. `bash podcast/entregar.sh "<ep>|NN - Titulo"` -> `out/qa.jpg` -> `entregas/`.

Con 3D: calibra camaras con `node ../../comun/prueba3d.mjs <carpeta> trabajo/vistas.json` desde el proyecto
(docs/MODELOS-3D.md) y mira `assets/3d/puntos.json` para centros y cajas de cada pieza.

## Producir un video HORIZONTAL (1920x1080, YouTube)

No hay receta de comandos fija: sigue `motor-animaciones/SKILL.md` (modo `audio` sobre la voz del usuario; modos
`cara`, `capas` o `combinado` si hay un video hablando a camara). `anim.py nuevo` sin `--vertical` crea el proyecto
horizontal. Para un clip horizontal del presentador: `node herramientas/heygen.mjs --foto <foto horizontal> --audio
<audio> --salida <clip.mp4> --formato 16:9` (mira el saldo antes). Deja el proyecto dentro de `proyectos/`.

## Como esta hecho (para modificarlo)

- `motor-animaciones/`: motor de animacion sincronizada con la voz. `scripts/anim.py nuevo|alinear|revisar|render`.
  Su `SKILL.md` y `references/` explican la plantilla (`put`, `mk`, `KF`, `norm`, `P`, `E`, `sfx`, `Rotulo`,
  `Comentario`, `Cursor`, `FondoBase`, `pintarCapas`). Cada fotograma es una funcion pura de `t`: `render(t)`.
- `herramientas/nuevo_proyecto.sh`: crea `proyectos/<x>` con la plantilla vertical + fuentes + three.js.
- `quiz/comun/parche.py` y `podcast/comun/parche.py`: arman `index.html` desde `trabajo/index.base.html`:
  tiempos `T` (claves), `FR` (frases), `PAL` (palabras), voz con cola, musica, `MARCA`, `HAY3D`, escenas y modelo.
  Orden quiz: MARCA + config.js + `comun/telefono.js` + `quiz/comun/base_quiz.js`.
  Orden podcast: MARCA + config.js + base_pre.js + escenas.js + declarativo.js + `comun/telefono.js` + base_post.js.
- `comun/marca.py`: carga la marca, copia sus imagenes y rota todos los verdes (`#7AC943` y familia) al color de la marca.
  Si agregas CSS, disenalo en verde y se pintara solo.
- `comun/telefono.js`: telefono con las capturas de la app (los dos formatos). `comun/h3d.js`: motor 3D.
- `preparar.py` de cada formato: une las frases con sus pausas (quiz: pausa de la cuenta tras cada pregunta; podcast:
  ademas corta `intro.wav` y `climax.wav` para HeyGen).

## Trampas conocidas

- Render a 30 fps (`--fps=30`, ya en los scripts). Nunca dos renders sobre el mismo proyecto a la vez.
- Globales de la plantilla que no se redeclaran: `Q`, `T`, `FR`, `PAL`, `barra`, `nodo`, `_v`. Los tiempos del quiz son `QT`.
- En `config.js` nada a nivel superior que dependa de la base (se carga despues); las clases no se elevan.
- Caras del personaje: corte de .04 s, nunca fundido largo (queda un fantasma).
- Camara 3D: alcance hasta 30 m; el cuerpo entero se ve a `d` ~13000.
- Listas de nombres generadas en Windows traen `\r`: `entregar.sh` ya lo limpia.
- `.env` en Windows: rutas como `C:/...`.

## Antes de subir cambios (git push)

```bash
git status --short                       # nada de .env, voces/, *.wav, *.mp4, proyectos/, entregas/
git grep -nIE "(sk-|api[_-]?key\s*=\s*\S{8,}|[0-9]{8,10}:[A-Za-z0-9_-]{30,}|Bearer [A-Za-z0-9])" -- . ':!*.md'
```

Revisa tambien el historial si alguna vez se commiteo algo sensible (`git log -p | grep -iE "key|token"`).
