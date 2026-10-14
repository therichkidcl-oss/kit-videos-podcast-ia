# Instalacion

Lo mas facil: pega el prompt de "Instala todo con Claude" del [README](../README.md) en Claude Code y deja que Claude
haga estos pasos por ti. Esta pagina es el detalle, por si quieres hacerlo a mano o entender que hizo Claude.

Probado en Windows 11 con Git Bash (Python 3.12, Node 24, ffmpeg 8.1, Chrome). En macOS/Linux es igual cambiando
`.venv/Scripts/python.exe` por `.venv/bin/python`.

## 1. Programas

| Programa | Version | Para que | Windows (winget) | macOS (brew) |
|---|---|---|---|---|
| Git + Git Bash | cualquiera | bajar el kit y correr los `.sh` | `winget install Git.Git` | viene con Xcode CLT |
| Python | 3.12 | los dos entornos | `winget install Python.Python.3.12` | `brew install python@3.12` |
| Node.js | 18+ (probado 24) | render (Playwright) y HeyGen | `winget install OpenJS.NodeJS.LTS` | `brew install node` |
| ffmpeg | 6+ (probado 8.1) | audio, cuadros, MP4 | `winget install Gyan.FFmpeg` | `brew install ffmpeg` |
| Google Chrome | actual | el render abre Chrome con Playwright | `winget install Google.Chrome` | `brew install --cask google-chrome` |

Comprueba: `git --version`, `py -3.12 --version` (macOS/Linux: `python3.12 --version`), `node --version`,
`ffmpeg -version`. Si un comando no se reconoce justo despues de instalarlo, cierra y vuelve a abrir la terminal.

## 2. Bajar el kit

```bash
cd ~/Documents                     # o la carpeta donde quieras tenerlo
git clone https://github.com/therichkidcl-oss/kit-videos-podcast-ia.git
cd kit-videos-podcast-ia
```

Usa `git clone` (no el ZIP de GitHub): asi los `.sh` quedan con el formato correcto para bash.

## 3. Entorno principal (.venv)

Motor de animacion, alineacion de la voz (torch MMS_FA), Whisper, armado del 3D y control de calidad.

```bash
py -3.12 -m venv .venv                     # macOS/Linux: python3.12 -m venv .venv
.venv/Scripts/python.exe -m pip install -U pip
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/python.exe motor-animaciones/scripts/entorno.py           # comprueba ffmpeg, node, npm, Chrome y paquetes
```

Si creaste el entorno con `uv` (no trae pip): `uv pip install --python .venv/Scripts/python.exe -r requirements.txt`.
`entorno.py --instalar` instala lo que falte (incluye opcionales del motor). La primera alineacion descarga el modelo
MMS_FA de torchaudio y la primera transcripcion el modelo de Whisper (`small`, ~500 MB; `medium` para clonar la voz).

## 4. Musica y efectos de sonido

```bash
.venv/Scripts/python.exe herramientas/preparar_audio.py
```

Descarga los 4 temas de musica desde la web oficial de Mixkit (su licencia te deja usarlos en tus videos pero no
redistribuirlos, por eso no vienen en el repo) y crea los 16 efectos de sonido que faltan copiando efectos
sintetizados parecidos. Se puede repetir sin problema; `--revisar` solo comprueba que este todo. Detalle en
`motor-animaciones/musica/CREDITOS.md` y `motor-animaciones/sonidos/CREDITOS.md`.

## 5. Entorno de la voz (.venv-tts)

Qwen3-TTS corre local en CPU (Apache-2.0). Va en un entorno aparte porque fija versiones de transformers.
**Si tu PC es basico (menos de 16 GB de RAM) o vas a grabar tu voz / usar ElevenLabs, saltate este paso**
(ver "Plan B" en [VOZ.md](VOZ.md)).

```bash
py -3.12 -m venv .venv-tts
.venv-tts/Scripts/python.exe -m pip install -U pip
.venv-tts/Scripts/python.exe -m pip install -r requirements-tts.txt
```

El primer uso descarga `Qwen/Qwen3-TTS-12Hz-1.7B-Base` (~4 GB) desde Hugging Face; despues trabaja sin internet.
Con 8 nucleos o mas genera ~1 segundo de voz por segundo de calculo (`--lote 4`, `bf16`).

## 6. Configuracion (.env)

```bash
cp .env.example .env
```

Abre `.env` con un editor de texto (Bloc de notas, VS Code) y pega TU MISMO tu key de HeyGen despues de
`HEYGEN_API_KEY=` (y, si quieres, las de Telegram). Guarda. Nunca pegues la key en el chat de Claude ni la subas a
GitHub: `.env` esta en `.gitignore`. Deja las rutas vacias. Comprueba que la key funciona (no la muestra):

```bash
node herramientas/heygen_saldo.mjs
```

Luego: clona tu voz ([VOZ.md](VOZ.md)), pon tu marca ([MARCA.md](MARCA.md)) y, si vas a usar 3D, descarga los modelos
([MODELOS-3D.md](MODELOS-3D.md)).

## 7. Prueba completa

```bash
.venv/Scripts/python.exe marca/generar_ejemplo.py       # (opcional) regenera las imagenes de ejemplo con tu color
.venv/Scripts/python.exe herramientas/voz.py quiz/q1-ejemplo
bash quiz/proyecto.sh q1-ejemplo
bash quiz/revisar.sh q1-ejemplo                          # mira proyectos/quiz-q1-ejemplo/trabajo/revision/
bash quiz/entregar.sh "q1-ejemplo|Quiz de prueba"        # entregas/Quiz de prueba.mp4
```

Si el render se queja de Chrome o Playwright: `cd proyectos/quiz-q1-ejemplo && npm install` y comprueba que Chrome este
instalado (el motor usa `channel: 'chrome'`).

## Problemas conocidos

- **Rutas en `.env` (Windows):** usa `C:/ruta/a/tu/carpeta` con barras normales; `/c/ruta/...` no lo entiende Python.
- **Falta musica o un efecto** ("No hay tema ...", "sonido desconocido ..."): corre `herramientas/preparar_audio.py`.
- **Whisper y PyAV:** las herramientas del kit decodifican el audio con ffmpeg, asi que no dependen de PyAV.
- **Listas de nombres con `\r`:** si generas listas en Windows, `entregar.sh` ya limpia el `\r` final.
- **Render a 60 fps:** los scripts ya pasan `--fps=30`; si llamas a `anim.py render` a mano, agregalo.
