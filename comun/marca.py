# Marca del kit: lee marca/marca.json, copia sus imagenes al proyecto de animacion y deja el bloque `const MARCA = {...}`
# que usan los dos formatos. Tambien pinta las escenas con el color de la marca: todo el codigo esta disenado en verde
# (#7AC943) y aqui cada verde se rota al tono de tu color (mismo brillo relativo), asi no hay que tocar el CSS.
# Lo usan podcast/comun/parche.py y quiz/comun/parche.py.
import colorsys
import json
import re
import shutil
from pathlib import Path

KIT = Path(__file__).resolve().parent.parent
BASE_HEX = "#7AC943"                                   # verde con el que esta disenado todo


def cargar():
    m = json.loads((KIT / "marca" / "marca.json").read_text(encoding="utf-8"))
    m.setdefault("color", BASE_HEX)
    return m


def copiar(m, proy):
    """Copia las imagenes de la marca a <proy>/assets/marca y devuelve el objeto MARCA con rutas del proyecto."""
    dst = Path(proy) / "assets" / "marca"
    if dst.exists():
        shutil.rmtree(dst)
    dst.mkdir(parents=True)

    def img(rel, sub=""):
        if not rel:
            return ""
        src = KIT / rel
        if not src.exists():
            raise SystemExit(f"marca.json: no existe {rel}")
        (dst / sub).mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst / sub / src.name)
        return f"assets/marca/{sub + '/' if sub else ''}{src.name}"

    per = KIT / m.get("personaje", "marca/personaje")
    if per.is_dir():
        shutil.copytree(per, dst / "personaje")
    app = m.get("app", {})
    return {
        "nombre": m.get("nombre", "Tu Marca"),
        "web": m.get("web", "tumarca.com"),
        "insignia": m.get("insignia", "TU MARCA"),
        "palabraClave": m.get("palabra_clave", "MARCA"),
        "dm": m.get("dm", {"titulo": "Tu link", "sub": "GRATIS"}),
        "credito3d": m.get("credito_3d", ""),
        "logo": img(m.get("logo")),
        "cabeza": img(m.get("cabeza")),
        "busto": img(m.get("busto")),
        "presentador": img(m.get("presentador")),
        "personajeCentro": m.get("personaje_centro", {}),
        "app": {"pantallas": [img(p, "app") for p in app.get("pantallas", [])], "toques": app.get("toques", [])},
    }


def bloque(obj):
    return "const MARCA = " + json.dumps(obj, ensure_ascii=False) + ";\n"


def _hsl(r, g, b):
    h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    return h * 360, s, l


def _rgb(h, s, l):
    r, g, b = colorsys.hls_to_rgb((h % 360) / 360, min(1, max(0, l)), min(1, max(0, s)))
    return round(r * 255), round(g * 255), round(b * 255)


def _hex2rgb(x):
    x = x.lstrip("#")
    if len(x) == 3:
        x = "".join(c * 2 for c in x)
    return int(x[0:2], 16), int(x[2:4], 16), int(x[4:6], 16)


def colorear(js, color):
    """Rota al tono de `color` todos los verdes del codigo (hex, rgba(...) y triples '122,201,67')."""
    if color.lower() == BASE_HEX.lower():
        return js
    h0, s0, l0 = _hsl(*_hex2rgb(BASE_HEX))
    h1, s1, l1 = _hsl(*_hex2rgb(color))

    def nuevo(r, g, b):
        h, s, l = _hsl(r, g, b)
        if not (60 <= h <= 140 and s > .05):           # solo la familia del verde (no toca oro, rojo ni azul)
            return None
        return _rgb(h1 + (h - h0), s * (s1 / s0 if s0 else 1), l + (l1 - l0) * min(1, s / s0))

    def f_hex(mt):
        x = mt.group(0)
        c = nuevo(*_hex2rgb(x))
        return x if c is None else "#%02x%02x%02x" % c

    def f_tri(mt):
        c = nuevo(int(mt.group(2)), int(mt.group(3)), int(mt.group(4)))
        return mt.group(0) if c is None else f"{mt.group(1)}{c[0]},{c[1]},{c[2]}"

    js = re.sub(r"#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b", f_hex, js)
    js = re.sub(r"(rgba?\(\s*|['\"])(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(?=\s*[,)'\"])", f_tri, js)
    return js
