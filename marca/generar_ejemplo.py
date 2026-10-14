# Genera las imagenes de EJEMPLO de la marca (marcadores de posicion): logo, cabeza, busto, presentador, las 7 caras del
# personaje y 3 capturas de app. Reemplazalas por las tuyas con los mismos nombres (ver docs/MARCA.md y docs/PERSONAJE.md).
# Tambien hace las imagenes de los ejemplos sin 3D (quiz/q1-ejemplo/img y podcast/ep1-ejemplo/img).
# Uso: python marca/generar_ejemplo.py
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

M = Path(__file__).resolve().parent
KIT = M.parent
C = json.loads((M / "marca.json").read_text(encoding="utf-8"))["color"]
RGB = tuple(int(C[i:i + 2], 16) for i in (1, 3, 5))
CLARO = tuple(min(255, int(v + (255 - v) * .45)) for v in RGB)


def fuente(tam, negrita=True):
    for f in (["arialbd.ttf", "DejaVuSans-Bold.ttf"] if negrita else ["arial.ttf", "DejaVuSans.ttf"]):
        try:
            return ImageFont.truetype(f, tam)
        except OSError:
            pass
    return ImageFont.load_default()


def centrado(d, xy, txt, f, fill):
    b = d.textbbox((0, 0), txt, font=f)
    d.text((xy[0] - (b[2] - b[0]) / 2, xy[1] - (b[3] - b[1]) / 2 - b[1]), txt, font=f, fill=fill)


def logo():
    im = Image.new("RGBA", (900, 260), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((10, 30, 210, 230), 50, fill=RGB)
    centrado(d, (110, 130), "TM", fuente(110), (12, 14, 18))
    centrado(d, (565, 130), "TU MARCA", fuente(120), (255, 255, 255))
    im.save(M / "logo.png")


def cabeza():
    im = Image.new("RGBA", (256, 256), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.ellipse((0, 0, 255, 255), fill=RGB)
    centrado(d, (128, 128), "TM", fuente(110), (12, 14, 18))
    im.save(M / "cabeza.png")


def figura(d, cx, top, esc, cara="pregunta", ropa=(48, 54, 66)):
    """Silueta simple de rodillas hacia arriba: cabeza, torso, brazos y cara segun la expresion."""
    s = lambda v: int(v * esc)
    d.rounded_rectangle((cx - s(230), top + s(330), cx + s(230), top + s(1240)), s(120), fill=ropa)            # torso y piernas
    d.rounded_rectangle((cx - s(330), top + s(380), cx - s(200), top + s(900)), s(65), fill=ropa)               # brazo izq
    d.rounded_rectangle((cx + s(200), top + s(380), cx + s(330), top + s(900)), s(65), fill=ropa)               # brazo der
    d.ellipse((cx - s(160), top, cx + s(160), top + s(320)), fill=(236, 200, 170))                              # cabeza
    d.pieslice((cx - s(170), top - s(20), cx + s(170), top + s(230)), 180, 360, fill=(40, 30, 26))              # pelo
    ey, ex = top + s(170), s(60)
    ojo = s(22) if cara != "sorpresa" else s(30)
    for k in (-1, 1):
        d.ellipse((cx + k * ex - ojo, ey - ojo, cx + k * ex + ojo, ey + ojo), fill=(20, 20, 24))
    my = top + s(250)
    if cara in ("celebra", "like"):
        d.chord((cx - s(70), my - s(40), cx + s(70), my + s(40)), 0, 180, fill=(120, 30, 40))
    elif cara == "fallo":
        d.arc((cx - s(60), my, cx + s(60), my + s(60)), 200, 340, fill=(60, 30, 30), width=s(10))
    elif cara == "sorpresa":
        d.ellipse((cx - s(28), my - s(20), cx + s(28), my + s(40)), fill=(120, 30, 40))
    else:
        d.line((cx - s(45), my + s(10), cx + s(45), my + s(10)), fill=(90, 40, 40), width=s(10))
    d.rounded_rectangle((cx - s(120), top + s(420), cx + s(120), top + s(470)), s(20), fill=RGB)                 # franja de marca


def personaje():
    (M / "personaje").mkdir(exist_ok=True)
    for c in ["pregunta", "piensa", "sorpresa", "celebra", "fallo", "like", "espera"]:
        im = Image.new("RGBA", (1024, 1536), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
        figura(d, 512, 150, 1.0, c)
        txt = Image.new("RGBA", im.size, (0, 0, 0, 0))                 # el video espeja al personaje: el rotulo va al reves
        centrado(ImageDraw.Draw(txt), (512, 1440), c.upper(), fuente(70), (255, 255, 255, 230))
        im.alpha_composite(txt.transpose(Image.FLIP_LEFT_RIGHT))
        im.save(M / "personaje" / f"personaje-{c}.png")


def busto():
    im = Image.new("RGBA", (500, 486), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    figura(d, 250, 40, .55, "celebra")
    im.save(M / "busto.png")


def presentador():
    im = Image.new("RGB", (1080, 1920), (30, 34, 42)); d = ImageDraw.Draw(im)
    for y in range(1920):
        v = int(30 + 40 * y / 1920); d.line((0, y, 1080, y), fill=(v, v + 4, v + 12))
    figura(d, 540, 420, 1.15, "pregunta")
    centrado(d, (540, 1640), "TU FOTO AQUI", fuente(80), (255, 255, 255))
    centrado(d, (540, 1730), "(presentador para HeyGen)", fuente(46, False), (210, 215, 225))
    im.save(M / "presentador.png")


def app():
    (M / "app").mkdir(exist_ok=True)
    for n, alto, titulo in ((1, 2340, "Inicio"), (2, 3400, "Lecciones"), (3, 2340, "Asistente")):
        im = Image.new("RGB", (1080, alto), (14, 16, 22)); d = ImageDraw.Draw(im)
        d.rectangle((0, 0, 1080, 300), fill=(22, 25, 33))
        d.rounded_rectangle((60, 130, 200, 270), 36, fill=RGB); centrado(d, (130, 200), "TM", fuente(60), (12, 14, 18))
        d.text((240, 160), titulo, font=fuente(80), fill=(255, 255, 255))
        y = 360
        while y < alto - 360:
            d.rounded_rectangle((60, y, 1020, y + 300), 40, fill=(28, 32, 42))
            d.rounded_rectangle((100, y + 50, 300, y + 250), 30, fill=CLARO)
            d.rounded_rectangle((340, y + 70, 940, y + 120), 20, fill=(70, 76, 92))
            d.rounded_rectangle((340, y + 160, 800, y + 200), 20, fill=(50, 56, 70))
            y += 350
        d.rounded_rectangle((60, alto - 300, 1020, alto - 140), 60, fill=RGB)
        centrado(d, (540, alto - 220), "EMPEZAR", fuente(70), (12, 14, 18))
        im.save(M / "app" / f"pantalla-{n}.png")


def tarjetas(carpeta, textos):
    carpeta.mkdir(parents=True, exist_ok=True)
    for nombre, txt in textos:
        im = Image.new("RGB", (800, 800), (20, 24, 32)); d = ImageDraw.Draw(im)
        for r in range(380, 0, -6):
            v = int(255 * (1 - r / 380) * .35)
            d.ellipse((400 - r, 400 - r, 400 + r, 400 + r), fill=(20 + v * RGB[0] // 255, 24 + v * RGB[1] // 255, 32 + v * RGB[2] // 255))
        centrado(d, (400, 400), txt, fuente(150 if len(txt) < 5 else 96), (255, 255, 255))
        im.save(carpeta / nombre)


logo(); cabeza(); personaje(); busto(); presentador(); app()
tarjetas(KIT / "quiz" / "q1-ejemplo" / "img", [("1.png", "PLANETA"), ("2.png", "6"), ("3.png", "CO2"), ("4.png", "OCEANO"),
                                               ("5.png", "24 h"), ("6.png", "?"), ("6b.png", "PULPO")])
tarjetas(KIT / "podcast" / "ep1-ejemplo" / "img", [("1.png", "SOL"), ("2.png", "AIRE"), ("3.png", "AZUL"), ("4.png", "CIELO")])
print("imagenes de ejemplo listas")
