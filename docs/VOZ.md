# Voz: tu voz clonada en local (Qwen3-TTS)

Toda la voz de los videos sale de **Qwen3-TTS 1.7B Base** en modo clon: le das 10-20 s de tu voz con su transcripcion
exacta y lee cualquier texto con tu timbre y tu acento. Corre en tu PC (gratis, sin limite). `voces/` esta en
`.gitignore`: **tu voz nunca se sube al repositorio**.

## 1. Clonar tu voz (una sola vez)

Graba 15-20 s hablando natural, sin musica ni eco (el microfono del telefono sirve). Luego:

```bash
.venv/Scripts/python.exe herramientas/clonar_voz.py mi-grabacion.mp3 --voz narrador [--desde 0] [--dur 15]
```

Deja `voces/narrador/referencia.wav` (mono 24 kHz, volumen normalizado) y `referencia.txt` (lo que Whisper `medium`
entendio). **Abre `referencia.txt` y corrigelo** hasta que sea exactamente lo que dices: si no calza, el clon sale raro.
Pon el nombre en `.env` (`VOZ=narrador`) o en `marca.json > voz`.

Alternativa sin grabacion (voz inventada): `.venv-tts/Scripts/python.exe herramientas/tts_qwen.py disenar --voz narrador
--instruct "voz masculina joven, calida, ritmo agil" --texto "Una frase de prueba de unos diez segundos..."` (usa el modelo
VoiceDesign).

## 2. Escribir para la voz

- Espanol neutro con "tu", **con tildes** (la voz pronuncia mejor). Frases cortas: cada frase es un ancla de animacion.
- Numeros como se dicen ("mil cuatrocientos cuarenta") y siglas/marcas como se pronuncian.
- `Palabra{como se dice}`: la voz lee lo de las llaves y la animacion usa la palabra escrita.
  Ej.: `like{laik}`, `TuMarca{tu marca}`, `ADN{a de ene}`.

## 3. Generar

```bash
.venv/Scripts/python.exe herramientas/voz.py quiz/q2-tema              # todas las frases -> quiz/q2-tema/voz/f0.wav ... fN.wav
.venv/Scripts/python.exe herramientas/voz.py podcast/ep2-tema          # f0-f5 + f6 tips + f7 cta + f8 cierre
```

Usa `--modelo 1.7B --dtype bf16 --lote 4` (lo mejor en CPU). El modelo se carga una vez por llamada.

## 4. Revisar con Whisper (siempre, antes de animar o de gastar HeyGen)

```bash
.venv/Scripts/python.exe herramientas/revisar_voz.py quiz/q2-tema
```

Marca `REVISAR` las frases con parecido menor a 0,85 y deja el detalle en `voz/whisper.txt`. Para cada frase dudosa:

1. Genera 2-3 versiones: `.venv/Scripts/python.exe herramientas/voz.py quiz/q2-tema --solo 5 --semilla 11 --sufijo _b` (y `_c` con otra semilla).
2. Revisa esas versiones: `.venv/Scripts/python.exe herramientas/revisar_voz.py quiz/q2-tema --solo 5 --sufijo _b`.
3. Escuchalas, quedate con la mejor y copiala encima de `voz/f5.wav`.
4. Si una palabra sale mal siempre, cambia la frase: escribela como se dice (`{...}`) o dila de otra forma.

Errores tipicos de Whisper o de la voz: palabras parecidas ("numero"/"humero", "pena"/"vena"), siglas, nombres de marca,
"like". A veces el que se equivoca es Whisper: si al escucharla esta bien, sirve.

## 5. Despues

`bash quiz/proyecto.sh q2-tema voz` (o `podcast/proyecto.sh`) une las frases con sus pausas, las alinea palabra por
palabra (`anim.py alinear`) y deja los tiempos en `proyectos/<...>/trabajo/tiempos.json`.

## 6. Plan B: grabar tu voz o usar ElevenLabs (PC basico)

La voz local (Qwen3-TTS) pide ~16 GB de RAM y ~6 GB extra de disco. Si tu PC no da, no instales `.venv-tts` ni clones
tu voz: pon tu mismo los audios de cada frase y el resto del kit funciona igual (Whisper, alineacion, HeyGen, render).

**Donde van:** en la carpeta `voz/` del episodio (creala si no existe), un archivo por frase, en este orden:

| Formato | Carpeta | Archivos | Que dice cada uno |
|---|---|---|---|
| Podcast | `podcast/<ep>/voz/` | `f0.wav` ... `f8.wav` (9) | `f0`-`f5` = las 6 `frases` de `guion.json`; `f6` = `tips`; `f7` = `cta`; `f8` = `cierre` |
| Quiz | `quiz/<q>/voz/` | `f0.wav` ... `f15.wav` (16) | `f0` = la frase 0 de `frases`, `f1` = la frase 1, y asi |

`cta` y `cierre`: si `guion.json` no los trae, se usan los de `marca/marca.json > podcast`. Ojo: `f0` y `f5` del
podcast son los que HeyGen convierte en video del presentador.

**Reglas:**

- Di **exactamente** el texto de cada frase: la animacion se sincroniza palabra por palabra comparando tu audio con el
  guion. Si cambias una palabra al grabar, cambiala tambien en `guion.json`.
- Donde el guion diga `Palabra{como se dice}`, di (o pega en ElevenLabs) lo que va entre llaves.
- Un archivo por frase, sin musica ni eco. Los silencios del inicio y del final se recortan solos y las pausas entre
  frases las pone el kit (`preparar.py`).
- Tienen que ser `.wav`. ElevenLabs baja `.mp3`: conviertelos con ffmpeg (`ffmpeg -i f0.mp3 f0.wav`) o pidele a Claude
  "convierte a wav los mp3 de podcast/<ep>/voz/".
- Grabando: el celular sirve. Lee cada frase en un archivo aparte, o graba todo seguido y pidele a Claude que lo corte
  en `f0.wav` ... `f8.wav` (te puede ayudar `herramientas/transcribir.py`).

**Despues** te saltas `herramientas/voz.py` y sigues igual: `revisar_voz.py` (opcional: comprueba que se entienda) y
`bash podcast/proyecto.sh <ep>` (o `bash quiz/proyecto.sh <q>`). No necesitas `VOZ` en `.env` ni la carpeta `voces/`.
