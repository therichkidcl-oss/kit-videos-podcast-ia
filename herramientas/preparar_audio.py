# Prepara el audio del motor de animaciones. Correlo UNA vez despues de clonar el repo (repetirlo no rompe nada).
#
# 1) Musica: descarga cada tema de motor-animaciones/musica/musica.json desde su URL oficial de Mixkit (la que va entre
#    parentesis en el campo "fuente") a motor-animaciones/musica/<archivo>. La licencia gratuita de Mixkit te deja usar
#    esa musica en tus videos (tambien comerciales y monetizados), pero no redistribuir los archivos sueltos: por eso
#    no vienen en el repo y cada persona los baja aqui, desde Mixkit.
# 2) Efectos: los 16 efectos de Pixabay del kit original tampoco vienen en el repo. Para cada uno que falte se crea
#    un sustituto copiando un efecto sintetizado parecido (los 12 sintetizados si vienen: no tienen derechos de nadie)
#    y se actualiza su ficha en motor-animaciones/sonidos/sonidos.json (dur, pico, ancla, gain_db...).
#    Si quieres, reemplaza cualquiera por tu propio efecto (mismo nombre, .wav) y ajusta su "dur" y "pico" en
#    sonidos.json (o pidele a Claude que los mida).
#
# Uso:  python herramientas/preparar_audio.py              descarga lo que falte y crea los sustitutos
#       python herramientas/preparar_audio.py --revisar    solo revisa (no cambia nada); sale con error si falta algo
#
# Solo usa la libreria estandar de Python (ffprobe, si esta instalado, se usa para comprobar la musica bajada).
import argparse
import filecmp
import json
import re
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

KIT = Path(__file__).resolve().parent.parent
MUS = KIT / "motor-animaciones" / "musica"
SON = KIT / "motor-animaciones" / "sonidos"

ORIGEN_SUSTITUTO = "sustituto sintetizado (pon aqui tu propio efecto si quieres)"

# efecto de Pixabay que falta -> efecto sintetizado parecido que lo reemplaza
SUSTITUTOS = {
    "golpe-grave": "golpe",
    "impacto": "golpe",
    "barrido": "aire",
    "transicion": "aire",
    "click": "tick",
    "tecla": "tick-suave",
    "tecleo": "tick-suave",
    "campana": "nota",
    "ping": "bip",
    "brillo": "nota-doble",
    "notificacion": "nota-doble",
    "subida": "swell",
    "fallo": "descarte",
    "glitch": "corte",
    "glitch-fuerte": "corte",
    "pop": "tick",
}

# para que sirve cada uno (lo lee Claude al elegir efectos con "sonido.py --lista")
USOS = {
    "golpe-grave": "el golpe grande de un revelado de marca o del titular principal",
    "impacto": "un revelado con fuerza: el golpe cae en el instante del evento",
    "barrido": "movimiento rapido, una ficha que cruza la pantalla",
    "transicion": "un video que se convierte en ficha, un viaje de camara, un cambio de escena",
    "click": "un cursor que pulsa un boton",
    "tecla": "una tecla",
    "tecleo": "un buscador o un prompt que se escribe",
    "campana": "exito, confirmacion",
    "ping": "un dato clave",
    "brillo": "algo se ilumina, un mapa que se enciende",
    "notificacion": "una notificacion o un mensaje que entra",
    "subida": "subida de tension antes de un revelado (el final cae en el golpe)",
    "fallo": "algo falla, un 'no'",
    "glitch": "cambio digital sutil",
    "glitch-fuerte": "corte brusco; usalo poco",
    "pop": "algo pequeno que aparece; evitalo en el estilo sobrio",
}

# campos que se copian de la ficha del efecto sintetizado de origen
CAMPOS = ("familia", "dur", "pico", "ancla", "gain_db")


def es_mp3(f):
    """True si el archivo parece un MP3 de verdad (y no una pagina de error)."""
    try:
        with open(f, "rb") as h:
            b = h.read(3)
    except OSError:
        return False
    return b[:3] == b"ID3" or (len(b) >= 2 and b[0] == 0xFF and (b[1] & 0xE0) == 0xE0)


def url_de(tema):
    """URL directa del MP3: la que va entre parentesis en "fuente" (o "fuente" entera si ya es un .mp3)."""
    fuente = tema.get("fuente", "")
    m = re.search(r"\((https?://[^\s)]+\.mp3)\)", fuente)
    if m:
        return m.group(1)
    return fuente.strip() if re.fullmatch(r"https?://\S+\.mp3", fuente.strip()) else None


def duracion(f):
    """duracion en segundos con ffprobe (None si ffprobe no esta)."""
    if not shutil.which("ffprobe"):
        return None
    try:
        r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)],
                           capture_output=True, text=True, timeout=60)
        return float(r.stdout.strip())
    except (ValueError, subprocess.SubprocessError, OSError):
        return None


def descargar(url, destino):
    """baja url a destino (pasando por un .part); 3 intentos."""
    parcial = destino.with_name(destino.name + ".part")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (kit-videos-podcast-ia; preparar_audio.py)"})
    ultimo = None
    for intento in range(1, 4):
        try:
            with urllib.request.urlopen(req, timeout=90) as r, open(parcial, "wb") as h:
                shutil.copyfileobj(r, h, 1 << 16)
            if parcial.stat().st_size < 50_000 or not es_mp3(parcial):
                raise ValueError("lo descargado no es un MP3")
            parcial.replace(destino)
            return
        except (urllib.error.URLError, OSError, ValueError) as e:
            ultimo = e
            parcial.unlink(missing_ok=True)
            if intento < 3:
                time.sleep(2 * intento)
    raise RuntimeError(f"no se pudo descargar {url}: {ultimo}")


def musica(revisar):
    temas = json.loads((MUS / "musica.json").read_text(encoding="utf-8"))
    res = {"bajados": [], "ya_estaban": [], "faltan": [], "errores": []}
    for clave, tema in temas.items():
        destino = MUS / tema["archivo"]
        if destino.is_file() and destino.stat().st_size > 50_000 and es_mp3(destino):
            res["ya_estaban"].append(clave)
            continue
        if revisar:
            res["faltan"].append(clave)
            continue
        url = url_de(tema)
        if not url:
            res["errores"].append(f"{clave}: musica.json no trae la URL del MP3 en 'fuente'")
            continue
        print(f"  bajando {clave} ({tema.get('titulo', '')}) desde {url} ...", flush=True)
        try:
            descargar(url, destino)
        except RuntimeError as e:
            res["errores"].append(f"{clave}: {e}")
            continue
        d = duracion(destino)
        if d is not None and tema.get("dur") and abs(d - float(tema["dur"])) > 3:
            print(f"  AVISO: {clave} dura {d:.1f} s y musica.json dice {tema['dur']} s (revisa que sea el tema correcto)")
        res["bajados"].append(clave)
    return res


def ficha_sustituto(nombre, origen, man):
    base = man[origen]
    f = {"archivo": f"{nombre}.wav"}
    for c in CAMPOS:
        f[c] = base[c]
    f["descripcion"] = f"Sustituto (copia de '{origen}'): {USOS[nombre]}."
    f["origen"] = ORIGEN_SUSTITUTO
    f["copia_de"] = origen
    return f


def efectos(revisar):
    ruta_json = SON / "sonidos.json"
    texto = ruta_json.read_text(encoding="utf-8")
    man = json.loads(texto)
    res = {"creados": [], "ya_estaban": [], "propios": [], "faltan": [], "errores": []}
    for nombre, origen in SUSTITUTOS.items():
        wav, wav_origen = SON / f"{nombre}.wav", SON / f"{origen}.wav"
        if origen not in man or not wav_origen.is_file():
            res["errores"].append(f"{nombre}: falta el efecto sintetizado '{origen}' (vuelve a clonar el repo)")
            continue
        ficha = man.get(nombre) or {}
        if wav.is_file():
            if filecmp.cmp(wav, wav_origen, shallow=False):
                res["ya_estaban"].append(nombre)
                if not revisar:
                    man[nombre] = ficha_sustituto(nombre, origen, man)   # por si la ficha quedo vieja
            else:
                res["propios"].append(nombre)                           # tu propio efecto (o el original): no se toca
                if ficha.get("origen") == ORIGEN_SUSTITUTO:
                    print(f"  AVISO: {nombre}.wav es distinto del sustituto: si es tu efecto, ajusta su 'dur' y 'pico' "
                          f"en sonidos.json")
            continue
        if revisar:
            res["faltan"].append(nombre)
            continue
        shutil.copyfile(wav_origen, wav)
        man[nombre] = ficha_sustituto(nombre, origen, man)
        res["creados"].append(nombre)
    nuevo = json.dumps(man, ensure_ascii=False, indent=1)
    if not revisar and nuevo != texto:
        ruta_json.write_bytes(nuevo.encode("utf-8"))           # finales LF, como el resto del repo
        res["json"] = True
    return res


def main():
    for st in (sys.stdout, sys.stderr):
        try:
            st.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, ValueError, OSError):
            pass
    ap = argparse.ArgumentParser(description="Descarga la musica de Mixkit y crea los efectos sustitutos del motor.")
    ap.add_argument("--revisar", action="store_true", help="solo revisa que este todo; no descarga ni cambia nada")
    a = ap.parse_args()

    print("Musica (Mixkit, se descarga de su web oficial):")
    m = musica(a.revisar)
    print("Efectos de sonido (sustitutos sintetizados):")
    e = efectos(a.revisar)

    print("\nRESUMEN")
    print(f"  musica:  {len(m['bajados'])} bajados, {len(m['ya_estaban'])} ya estaban"
          + (f", FALTAN {len(m['faltan'])}: {', '.join(m['faltan'])}" if m["faltan"] else ""))
    print(f"  efectos: {len(e['creados'])} creados, {len(e['ya_estaban'])} ya estaban, {len(e['propios'])} propios"
          + (f", FALTAN {len(e['faltan'])}: {', '.join(e['faltan'])}" if e["faltan"] else ""))
    if e.get("json"):
        print("  sonidos.json actualizado")
    errores = m["errores"] + e["errores"]
    for x in errores:
        print("  ERROR: " + x)
    if errores:
        print("\nAlgo fallo. Revisa tu conexion a internet y vuelve a correr: python herramientas/preparar_audio.py")
        sys.exit(1)
    if m["faltan"] or e["faltan"]:
        print("\nFalta audio. Correlo sin --revisar: python herramientas/preparar_audio.py")
        sys.exit(1)
    print("\nListo: el motor ya tiene toda la musica y los efectos.")


if __name__ == "__main__":
    main()
