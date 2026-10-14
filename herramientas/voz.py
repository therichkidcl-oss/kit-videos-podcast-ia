# Genera la voz de un episodio o quiz con Qwen3-TTS (tu voz clonada en voces/<voz>/): una frase por archivo voz/f<i>.wav.
# Uso: python herramientas/voz.py <carpeta del episodio o quiz> [--solo 3,5] [--semilla 7] [--sufijo _b]
#   --solo     rehace solo esas frases (las que sonaron raro)
#   --semilla  y --sufijo: versiones alternativas (voz/f3_b.wav) para escuchar y quedarte con la mejor (copiala a f3.wav)
# Texto: "Palabra{como se dice}" -> la voz lee "como se dice" y la animacion muestra "Palabra".
# Podcast: f0-f5 = "frases" · f6 = "tips" · f7 = "cta" · f8 = "cierre" (cta y cierre por defecto en marca.json > podcast).
# Quiz: f0..fN = "frases". La voz sale de .env (VOZ) o de marca.json ("voz"); el python de la voz de .env (PY_TTS) o .venv-tts.
import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path

KIT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(KIT / "comun"))
import marca  # noqa: E402


def env(k, defecto=None):
    if os.environ.get(k):
        return os.environ[k]
    f = KIT / ".env"
    for l in (f.read_text(encoding="utf-8", errors="ignore").splitlines() if f.exists() else []):
        if l.strip().startswith(k + "="):
            return l.split("=", 1)[1].strip().strip('"').strip("'") or defecto
    return defecto


def frases(ep):
    G = json.loads((ep / "guion.json").read_text(encoding="utf-8"))
    if "preguntas" in G:
        return G["frases"]
    MP = marca.cargar().get("podcast", {})
    return G["frases"] + [G["tips"], G.get("cta") or MP["cta"], G.get("cierre") or MP["cierre"]]


def hablado(s):
    return re.sub(r"[^\s{}«»\"¿¡(]+\{([^}]*)\}", r"\1", s)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("carpeta"); ap.add_argument("--solo", default=""); ap.add_argument("--semilla", default="")
    ap.add_argument("--sufijo", default="")
    a = ap.parse_args()
    ep = Path(a.carpeta).resolve()
    (ep / "voz").mkdir(exist_ok=True)
    FR = frases(ep)
    idx = [int(x) for x in a.solo.split(",") if x.strip()] or range(len(FR))
    trabajos = [{"texto": hablado(FR[i]), "salida": str(ep / "voz" / f"f{i}{a.sufijo}.wav")} for i in idx]
    tj = ep / "voz" / "trabajos.json"
    tj.write_text(json.dumps(trabajos, ensure_ascii=False, indent=1), encoding="utf-8")
    win = (KIT / ".venv-tts" / "Scripts" / "python.exe")
    py = env("PY_TTS") or str(win if win.exists() else KIT / ".venv-tts" / "bin" / "python")
    voz = env("VOZ") or marca.cargar().get("voz", "narrador")
    if not (KIT / "voces" / voz / "referencia.wav").exists():
        sys.exit(f"No existe voces/{voz}/referencia.wav: clona tu voz primero (docs/VOZ.md)")
    cmd = [py, str(KIT / "herramientas" / "tts_qwen.py"), "hablar", "--voz", voz, "--trabajos", str(tj),
           "--modelo", "1.7B", "--dtype", "bf16", "--lote", "4"] + (["--semilla", a.semilla] if a.semilla else [])
    subprocess.run(cmd, check=True)
    print(f"{ep.name}: {len(trabajos)} frases con la voz '{voz}' -> voz/")


if __name__ == "__main__":
    main()
