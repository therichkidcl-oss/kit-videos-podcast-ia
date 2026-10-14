# FORMATO QUIZ: arma index.html de un quiz desde trabajo/index.base.html (plantilla del motor): tiempos T (claves de
# guion.json), FR, palabras (para que el personaje "hable"), voz con cola, marca (marca.json: logo, personaje, textos y
# color), musica, escenas (MARCA + qN/config.js + comun/telefono.js + comun/base_quiz.js), modelo 3D (si el quiz tiene
# modelo.json; si no, imagenes de qN/img/) y fuentes.
# Uso (en la carpeta del proyecto de animacion): python ../../quiz/comun/parche.py q1-tema
import json
import re
import shutil
import subprocess
import sys
import unicodedata
from pathlib import Path

R = Path(".")
C = Path(__file__).resolve().parent
KIT = C.parent.parent
sys.path.insert(0, str(KIT / "comun"))
import marca  # noqa: E402

EP = C.parent / sys.argv[1]
H3D = KIT / "comun" / "h3d.js"
M = marca.cargar()
h = (R / "trabajo" / "index.base.html").read_text(encoding="utf-8")
G = json.loads((EP / "guion.json").read_text(encoding="utf-8"))
CLAVES = [tuple(c) for c in G.get("claves", [])]


def norm(s):
    s = "".join(c for c in unicodedata.normalize("NFD", s.lower()) if unicodedata.category(c) != "Mn")
    return "".join(c for c in s if c.isalnum() or c == "-")


ws = json.loads((R / "trabajo/tiempos.json").read_text(encoding="utf-8"))
fr = {}
for w in ws:
    fr.setdefault(w["frase"], []).append(w)
T, faltan = {}, []
for k, f, p in CLAVES:
    n = 1
    if "#" in p:
        p, n = p.split("#"); n = int(n)
    hits = [w for w in fr.get(f, []) if norm(w["w"]) == p]
    (T.__setitem__(k, round(hits[n - 1]["s"], 2)) if len(hits) >= n else faltan.append(k))
if faltan:
    sys.exit("No encontre estas palabras clave en la voz alineada: " + ", ".join(faltan))
FR = [[round(v[0]["s"], 2), round(v[-1]["e"], 2)] for _, v in sorted(fr.items())]
PAL = [[round(w["s"], 2), round(w["e"], 2)] for w in ws]
it = list(T.items())
bloque = ("const T = {\n" + "\n".join("  " + ", ".join(f"{k}: {v}" for k, v in it[i:i + 8]) + "," for i in range(0, len(it), 8)) +
          "\n};\nconst FR = " + json.dumps(FR) + ";\nconst PAL = " + json.dumps(PAL) + ";")
ini = h.index("const T = {", h.index("Guion: inicio de cada palabra clave"))
fin = h.index("\n};", ini) + 3
h = h[:ini] + bloque + h[fin:]

voz, orig = R / "assets/audio/voz.wav", R / "assets/audio/voz-original.wav"
shutil.copy2(EP / "voz" / "voz.wav", orig)
dur = round(FR[-1][1] + 1.4, 2)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(orig), "-af", f"apad=whole_dur={dur}", str(voz)], check=True)
(R / "assets/audio/mezcla.wav").unlink(missing_ok=True)
h = re.sub(r"(const CONFIG = \{ dur: )[\d.]+", lambda m: f"{m.group(1)}{dur}", h, count=1)
h = re.sub(r"(const CONFIG = \{ dur: [\d.]+, audio: ')[^']*'", lambda m: m.group(1) + "assets/audio/voz.wav'", h, count=1)   # la voz (el proyecto nace sin audio)
assert "audio: 'assets/audio/voz.wav'" in h
h = h.replace("<title>Animación con voz</title>", f"<title>{M.get('nombre', '')} · {G.get('titulo', sys.argv[1])}</title>", 1)
h = h.replace('"fondo": "cortina"', '"fondo": "limpio"', 1)
h = re.sub(r'"acento": "#[0-9A-Fa-f]{6}"', f'"acento": "{M["color"]}"', h, count=1)
mus = G.get("musica", {"pista": "explicacion-tech", "desde": 0, "nivel_db": -17})
h = h.replace('"camaraEnMano": false}', '"camaraEnMano": false, "tramosMusica": [{"pista": "%s", "t0": 0, "desde": %s, "nivel_db": %s, "entrada": 0.3}], "ducking": 3}'
              % (mus["pista"], mus["desde"], mus["nivel_db"]), 1)
assert '"tramosMusica"' in h

if (EP / "img").is_dir():                                  # imagenes del quiz (sin 3D): qN/img/* -> assets/quiz/*
    shutil.copytree(EP / "img", R / "assets" / "quiz", dirs_exist_ok=True)
HAY3D = (EP / "modelo.json").exists()
partes = (EP / "config.js", KIT / "comun" / "telefono.js", C / "base_quiz.js")
esc = marca.bloque(marca.copiar(M, R)) + f"const HAY3D = {'true' if HAY3D else 'false'};\n" + "\n".join(p.read_text(encoding="utf-8") for p in partes)
esc = marca.colorear(esc, M["color"])
a = h.index("/* =====================================================================\n   ELEMENTOS  (DEMO")
b = h.index("/* =========================== FIN DE LA DEMO =========================== */") + len("/* =========================== FIN DE LA DEMO =========================== */")
h = h[:a] + esc.strip("\n") + "\n" + h[b:]
a3 = "  await cargarLogos();\n"
assert h.count(a3) == 1
h = h.replace(a3, a3 + "  await Promise.all(['400 20px Anton', '400 20px Inter', '600 20px Inter', '700 20px Inter'].map(f => document.fonts.load(f, 'ÁÉÍÓÚÑ¿?Abc')));\n"
              "  await Promise.all([...document.querySelectorAll('img')].map(i => i.decode().catch(() => {})));\n  await H3D_LISTO;\n")
if HAY3D:
    modelo = (EP / "modelo.json").read_text(encoding="utf-8")
    shutil.copy2(H3D, R / "assets" / "h3d.js")
    assert h.count("</body>") == 1
    h = h.replace("</body>", f'<script>window.MODELO = {modelo}; window.COLOR_MARCA = "{M["color"]}";</script>\n<script type="importmap">{{"imports":{{"three":"./assets/vendor/three.module.min.js"}}}}</script>\n<script type="module" src="assets/h3d.js"></script>\n</body>')
(R / "index.html").write_text(h, encoding="utf-8")
print("listo", sys.argv[1], "· dur", dur, "· T", len(T), "· frases", len(FR), "· 3D" if HAY3D else "· sin 3D")
