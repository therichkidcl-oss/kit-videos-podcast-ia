# Kit de videos estilo podcast con IA

Kit del modulo **Clones Automatizados + Animaciones**. Con el haces videos estilo podcast de punta a punta desde
Claude Code: tu presentador (tu clon) habla con lipsync de HeyGen en los momentos clave, tu voz clonada en tu PC narra
el resto y las animaciones se sincronizan solas, palabra por palabra.

---

## EMPIEZA AQUI

### 1. Que es este kit

- **Videos estilo podcast.** Un presentador habla a camara (HeyGen anima tu foto con tu voz) **solo en los momentos
  clave**: el gancho del inicio y el dato clave. Asi gastas poco: ~8 segundos de HeyGen por video.
- **Tu voz clonada.** Con una grabacion tuya de 15-20 segundos, la IA (Qwen3-TTS) lee cualquier guion con tu voz.
  Corre en tu PC: gratis y sin limite.
- **Animaciones automaticas.** Claude Code arma la animacion (titulos, imagenes o modelo 3D, el dato con su fuente,
  tips, tu app en un telefono y el "Comenta ..." del final) sincronizada palabra por palabra con la voz, le pone musica
  y efectos de sonido, la revisa cuadro por cuadro y te entrega el MP4.
- **Formatos:**
  - **Vertical 1080x1920** (Reels, TikTok, Shorts): formato podcast (40-50 s) y formato quiz (60-75 s), cada uno con
    su receta de pocos comandos.
  - **Horizontal 1920x1080** (YouTube): lo arma Claude con el motor de animaciones del kit sobre tu voz
    (ver [Video horizontal](#video-horizontal-youtube-1920x1080)).
  - **Quiz** (vertical, sin HeyGen): 6 preguntas con cuenta regresiva, revelacion y tu personaje animado.
- **Ejemplos incluidos:** `podcast/ep1-ejemplo` (por que el cielo es azul) y `quiz/q1-ejemplo` (cultura general).

| Formato | Que se ve | Duracion |
|---|---|---|
| **Podcast** | El presentador lanza un gancho, la explicacion sigue en 4 bloques animados (imagenes o modelo 3D), vuelve con un dato clave, 3 tips, tu app en un telefono y "Comenta MARCA" | 40-50 s |
| **Quiz** | 6 preguntas con cuenta regresiva de 4 s, revelacion verde/rojo y un dato; tu personaje animado al borde derecho con 7 caras; retencion y cierre con tu app | 60-75 s |

### 2. Que necesitas

| Que | Detalle | Costo |
|---|---|---|
| **Claude** | Plan **Pro o superior** y la **app de escritorio**, pestana **Code**. Descarga: https://claude.com/download | tu plan |
| **HeyGen** | Cuenta con **saldo de API** (va aparte del plan web) y tu **API key** (en HeyGen: Settings > API) | ~US$0,04 por segundo de presentador (~US$0,30 por video) |
| **PC** | Windows 10/11 (tambien macOS o Linux), **16 GB de RAM** y **~15 GB libres** para la voz local y Whisper | - |
| **Internet** | Para instalar y bajar los modelos la primera vez | - |

Todo lo demas es gratis y corre en tu PC: voz, alineacion, animacion, musica, efectos y render.

**¿Tu PC es mas basico?** (menos de 16 GB de RAM o poco disco) No instales la voz local. Graba tu voz con el celular o
genera los audios en ElevenLabs y ponlos en la carpeta `voz/` del episodio, **un archivo por frase**:

- **Podcast:** `podcast/<episodio>/voz/f0.wav` ... `f8.wav`. `f0` a `f5` = las 6 `frases` de `guion.json`,
  `f6` = los `tips`, `f7` = la invitacion a tu web (`cta`) y `f8` = el `cierre` (si el guion no trae `cta` o `cierre`,
  salen de `marca/marca.json`).
- **Quiz:** `quiz/<quiz>/voz/f0.wav` ... `f15.wav`, uno por cada frase de `guion.json`, en orden.
- Di **exactamente** el texto del guion (la animacion se sincroniza con el). Donde diga `Palabra{como se dice}`, di lo
  que va entre llaves. Si ElevenLabs te da `.mp3`, pidele a Claude que los pase a `.wav`.
- Detalle completo: [docs/VOZ.md, Plan B](docs/VOZ.md#6-plan-b-grabar-tu-voz-o-usar-elevenlabs-pc-basico).

### 3. Instala todo con Claude

1. Instala la app de Claude (https://claude.com/download), inicia sesion y abre la pestana **Code**.
2. Elige una carpeta de trabajo (por ejemplo `Documentos`).
3. Copia este prompt, pegalo y deja que Claude trabaje. Te va a pedir permiso para instalar programas y correr
   comandos: aceptalo. Tarda un rato (baja varios GB la primera vez).

```text
Quiero instalar el "Kit de videos estilo podcast con IA". Hazlo todo tu, paso a paso, y explicame en palabras simples que vas haciendo. Si algo falla, arreglalo y sigue.

1. Clona https://github.com/therichkidcl-oss/kit-videos-podcast-ia en mi carpeta de Documentos (si ya existe, usala) y trabaja dentro de ella. Lee CLAUDE.md y docs/INSTALACION.md antes de seguir.
2. Revisa si tengo Git (con Git Bash), Python 3.12, Node.js 18 o superior, ffmpeg y Google Chrome. Instala solo lo que falte (en Windows con winget) y avisame si tengo que cerrar y volver a abrir algo.
3. Crea el entorno principal (.venv con requirements.txt) y compruebalo con motor-animaciones/scripts/entorno.py.
4. Corre herramientas/preparar_audio.py para bajar la musica y crear los efectos de sonido.
5. Revisa cuanta RAM y disco libre tengo. Si tengo 16 GB de RAM o mas y unos 15 GB libres, crea el entorno de la voz (.venv-tts con requirements-tts.txt). Si no, avisame y usamos el Plan B de docs/VOZ.md (grabar mi voz o usar ElevenLabs).
6. Crea el archivo .env copiando .env.example. NO me pidas mi API key de HeyGen por el chat: abreme el .env en el Bloc de notas (o dime exactamente donde esta) para que YO pegue mi key despues de HEYGEN_API_KEY= y lo guarde. Espera a que te diga "listo" y comprueba el saldo con node herramientas/heygen_saldo.mjs sin mostrar la key.
7. Si usamos la voz local, clona mi voz: dime donde dejar una grabacion mia de 15 a 20 segundos, corre herramientas/clonar_voz.py, muestrame referencia.txt para que lo corrija y pon VOZ en el .env.
8. Haz el episodio de ejemplo podcast/ep1-ejemplo completo: voz, revision con Whisper, proyecto, hoja de revision y entrega. Usa HeyGen solo si ya puse mi foto en marca/presentador.png; si no, hazlo sin HeyGen (con la foto quieta) para no gastar saldo. Muestrame la hoja de revision y dime donde quedo el MP4.
```

Cuando termine vas a tener tu primer MP4 en la carpeta `entregas/` del kit.

> **Tu key de HeyGen es como una clave de banco:** pegala tu en el archivo `.env` y nunca en un chat, en un correo ni
> en GitHub. El `.env` ya esta protegido para que no se suba.

### 4. Crea tu presentador

El presentador es una **foto** que HeyGen hace hablar con tu voz. Requisitos:

- **Vertical** (9:16, ideal 1080x1920), **de pecho hacia arriba**, **mirando a camara**, boca cerrada.
- **Buena luz** en la cara y fondo limpio o de estudio de podcast (microfono, luces calidas). Sin manos delante de la
  cara y sin texto.
- Puede ser una foto tuya o un presentador creado con IA: busca en Pinterest una referencia que te guste (pose y
  estudio de podcast) y usa el **trasplante de identidad de IA HUB** para poner la cara de tu clon en esa foto.
- Guardala como `marca/presentador.png` (reemplaza la de ejemplo que dice "TU FOTO AQUI").
- Usa tu propia cara o un personaje creado por ti: no uses la cara ni la voz de otra persona sin su permiso.

Despues pon **tu marca**: nombre, web, color, logo y capturas de tu app en `marca/marca.json` y `marca/`
([docs/MARCA.md](docs/MARCA.md)). Puedes pedirselo a Claude: *"configura mi marca: se llama X, mi web es x.com, mi
color es #FF5A1F y mi logo esta en ..."*. Para el quiz hace falta tu personaje con 7 caras
([docs/PERSONAJE.md](docs/PERSONAJE.md)).

### 5. Tu primer video

**Opcion A (recomendada): pideselo a Claude.**

```text
Haz un video podcast nuevo sobre: <tu tema>. Sigue CLAUDE.md y docs/FORMATO-PODCAST.md: escribe el guion con un gancho fuerte y un dato real con su fuente, genera la voz, revisala con Whisper, arma el proyecto, haz los clips de HeyGen (mira el saldo antes), revisa la hoja de revision y entregame el MP4.
```

**Opcion B: los comandos, uno por uno** (en Git Bash, dentro de la carpeta del kit):

```bash
# 1. Carpeta del episodio: copia el ejemplo y cambia guion.json (y config.js / escenas.js, ver docs/FORMATO-PODCAST.md)
mkdir -p podcast/ep2-mi-tema
cp -r podcast/ep1-ejemplo/{guion.json,config.js,escenas.js,img} podcast/ep2-mi-tema/

# 2. Voz con tu voz clonada (Plan B: en vez de esto, pon tus audios en podcast/ep2-mi-tema/voz/) y revision con Whisper
.venv/Scripts/python.exe herramientas/voz.py podcast/ep2-mi-tema
.venv/Scripts/python.exe herramientas/revisar_voz.py podcast/ep2-mi-tema

# 3. Proyecto de animacion + voz alineada palabra por palabra
bash podcast/proyecto.sh ep2-mi-tema

# 4. Presentador con HeyGen (gancho y dato clave): mira el saldo antes
node herramientas/heygen_saldo.mjs
bash podcast/heygen.sh ep2-mi-tema

# 5. Hoja de revision: proyectos/podcast-ep2-mi-tema/trabajo/revision/ep2-mi-tema.png
bash podcast/revisar.sh ep2-mi-tema

# 6. Render final: queda en entregas/02 - Mi tema.mp4
bash podcast/entregar.sh "ep2-mi-tema|02 - Mi tema"
```

En macOS/Linux cambia `.venv/Scripts/python.exe` por `.venv/bin/python`. Los momentos clave de `config.js` y
`escenas.js` (claves `T.*`) tienen que calzar con las `claves` de `guion.json`: por eso conviene que Claude escriba los
tres archivos. Quiz: mismos pasos con `quiz/` (sin HeyGen), ver [docs/FORMATO-QUIZ.md](docs/FORMATO-QUIZ.md).

### Video horizontal (YouTube 1920x1080)

Las recetas de podcast y quiz salen en vertical. Para un video horizontal, Claude usa el **motor de animaciones** del
kit (`motor-animaciones/SKILL.md`): animacion a pantalla completa sincronizada con tu voz, con la misma musica y los
mismos efectos. No tiene receta fija de comandos: pideselo asi.

```text
Haz un video horizontal 1920x1080 para YouTube con el motor de animaciones del kit (motor-animaciones/SKILL.md, modo audio) sobre este audio: <ruta a tu audio>. Usa la musica y los efectos del kit y entregame el MP4.
```

Si ademas tienes un video del presentador hablando (tuyo o de HeyGen), el motor puede alternar su cara con las
animaciones (modos `cara`, `capas` y `combinado`). `herramientas/heygen.mjs` acepta `--formato 16:9` para pedirle a
HeyGen un clip horizontal (usa una foto horizontal).

### Costos

- **HeyGen:** ~US$0,04 por segundo de presentador (60 unidades = US$1; ~2,2 unidades por segundo). Cada video usa
  ~8 s = ~US$0,30. Mira el saldo con `node herramientas/heygen_saldo.mjs` y pon `HEYGEN_PISO` en `.env` para que el
  kit pare antes de bajar de ese saldo.
- **Claude:** tu plan Pro o superior (cada video consume parte de tu uso).
- **Gratis:** voz local, Whisper, alineacion, animacion, render, musica (Mixkit) y efectos.
- **ElevenLabs** (solo si usas el Plan B): segun tu plan.
- Tiempos en un PC de 16 nucleos: voz ~40 s de calculo; render ~1,5-2,5 min por video.

### Problemas comunes

| Problema | Solucion |
|---|---|
| `No existe voces/<voz>/referencia.wav` | Clona tu voz ([docs/VOZ.md](docs/VOZ.md)) o usa el Plan B (tus audios en `voz/`). |
| `No hay tema ... en musica.json`, `sonido desconocido` o el video sale sin musica | `.venv/Scripts/python.exe herramientas/preparar_audio.py` |
| `Falta HEYGEN_API_KEY en .env` | Abre `.env` y pega tu key despues de `HEYGEN_API_KEY=` (sin espacios ni comillas). Guarda. |
| `PARO en ...: saldo ...` | Carga saldo de **API** en HeyGen (es aparte del plan web) o baja `HEYGEN_PISO` en `.env`. |
| Fallo un clip de HeyGen | Mira `podcast/<ep>/avatar/*.log`. Sin clips, el video usa tu foto quieta. |
| Whisper marca `REVISAR` | Rehaz esa frase con otra semilla (`--solo 5 --semilla 11 --sufijo _b`) o escribe la palabra como se dice: `Palabra{como se dice}`. |
| `python`, `node` o `ffmpeg` no se reconoce | Cierra y vuelve a abrir la terminal; si sigue, reinstalalo con winget ([docs/INSTALACION.md](docs/INSTALACION.md)). |
| Errores raros de bash con `\r` | Baja el kit con `git clone`, no como ZIP. |
| El render falla por Chrome o Playwright | `cd proyectos/<proyecto> && npm install` y revisa que Google Chrome este instalado. |
| `No encontre ...` al armar el proyecto | Una palabra de `claves` no aparece en la voz: revisa `guion.json` o la voz. |
| La voz tarda muchisimo o el PC se pega | Usa el Plan B (grabar tu voz o ElevenLabs). |

### Licencias

- **Musica:** 4 temas de Mixkit (Mixkit Stock Music Free License: uso gratis en tus videos, tambien comerciales y
  monetizados). No vienen en el repo porque esa licencia no deja redistribuir los archivos: `preparar_audio.py` los
  descarga de la web oficial de Mixkit al instalar. Detalle: `motor-animaciones/musica/CREDITOS.md`.
- **Efectos de sonido:** 12 sintetizados incluidos (sin derechos de nadie) + 16 sustitutos que crea
  `preparar_audio.py` copiando los sintetizados. Puedes reemplazarlos por tus propios efectos con licencia comercial.
  Detalle: `motor-animaciones/sonidos/CREDITOS.md`.
- **Fuentes:** SIL OFL (`comun/assets/fonts/LICENCIAS.md` y `motor-animaciones/plantilla/assets/fonts/LICENCIAS.md`).
  **three.js:** MIT (`comun/assets/vendor/`). **Qwen3-TTS:** Apache-2.0.
- **Modelos 3D:** no vienen en el repo; BodyParts3D (DBCLS) y el Human Reference Atlas (NIH) son CC BY 4.0 y piden
  credito en pantalla (`marca.json > credito_3d`).
- Las imagenes de `marca/` son marcadores de posicion: reemplazalas por las tuyas.
- Tu voz (`voces/`), tu `.env`, tus audios y tus videos **nunca se suben** (estan en `.gitignore`).

---

## Como esta armado

```
marca/             marca.json + tus imagenes: logo, cabeza, busto, presentador, personaje (7 caras), capturas de tu app
podcast/           comun/ (motor del formato) + un episodio por carpeta (guion.json, config.js, escenas.js, modelo.json, img/)
quiz/              comun/ (motor del formato) + un quiz por carpeta (guion.json, config.js, modelo.json, img/)
comun/             marca.py (marca y color), telefono.js (tu app animada), h3d.js (3D), modelo.py (GLB), qa.py, fuentes y three.js
herramientas/      voz (clonar, generar, revisar), preparar_audio.py, HeyGen, Telegram, nuevo proyecto
motor-animaciones/ motor de animacion sincronizada con la voz (anim.py: alinear, revisar, render), musica y sonidos
modelos/           modelos 3D que descargas tu (BodyParts3D, HRA) + cuerpo-completo.json (57 piezas listas)
docs/              instalacion, APIs, voz, marca, personaje, 3D y la receta de cada formato
proyectos/         (se crea solo, no se sube) un proyecto de animacion por video
entregas/          (se crea solo, no se sube) los MP4 terminados
```

## Documentacion

- [docs/INSTALACION.md](docs/INSTALACION.md): programas, entornos de Python, musica y efectos, `.env` y comprobacion.
- [docs/APIS.md](docs/APIS.md): HeyGen, Telegram (opcional: te manda cada video al celular) y como guardar las keys.
- [docs/VOZ.md](docs/VOZ.md): clonar tu voz, generar, revisar con Whisper, pronunciaciones y Plan B (grabar / ElevenLabs).
- [docs/MARCA.md](docs/MARCA.md): `marca.json` campo por campo (nombre, web, color, imagenes, app).
- [docs/PERSONAJE.md](docs/PERSONAJE.md): las 7 caras del personaje del quiz, el busto y el presentador.
- [docs/MODELOS-3D.md](docs/MODELOS-3D.md): BodyParts3D, otros GLB, `modelo.json`, camaras y piezas.
- [docs/FORMATO-PODCAST.md](docs/FORMATO-PODCAST.md) y [docs/FORMATO-QUIZ.md](docs/FORMATO-QUIZ.md): estructura,
  guion, receta y trampas de cada formato.
- [motor-animaciones/SKILL.md](motor-animaciones/SKILL.md): el motor de animaciones (tambien para videos horizontales).
- [CLAUDE.md](CLAUDE.md): instrucciones para que Claude Code produzca los videos de punta a punta.
