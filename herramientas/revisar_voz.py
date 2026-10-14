# Revisa con Whisper que la voz generada diga lo que dice el guion: transcribe cada voz/f<i>.wav, lo compara con el texto
# hablado y marca las frases dudosas (parecido < 0,85). Deja el detalle en voz/whisper.txt.
# Uso (con el python del entorno principal): python herramientas/revisar_voz.py <carpeta> [--solo 3,5] [--sufijo _b] [--modelo small]
import argparse
import difflib
import subprocess
import sys
import unicodedata
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel

sys.path.insert(0, str(Path(__file__).resolve().parent))
from voz import frases, hablado  # noqa: E402


def norm(s):
    s = "".join(c for c in unicodedata.normalize("NFD", s.lower()) if unicodedata.category(c) != "Mn")
    return "".join(c if c.isalnum() else " " for c in s).split()


def leer(audio):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(audio), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.int16).astype(np.float32) / 32768


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("carpeta"); ap.add_argument("--solo", default=""); ap.add_argument("--sufijo", default="")
    ap.add_argument("--modelo", default="small")
    a = ap.parse_args()
    ep = Path(a.carpeta).resolve()
    FR = frases(ep)
    idx = [int(x) for x in a.solo.split(",") if x.strip()] or range(len(FR))
    m = WhisperModel(a.modelo, device="cpu", compute_type="int8")
    out, malas = [], []
    for i in idx:
        wav = ep / "voz" / f"f{i}{a.sufijo}.wav"
        seg, _ = m.transcribe(leer(wav), language="es", beam_size=5)
        oido = " ".join(s.text.strip() for s in seg)
        r = difflib.SequenceMatcher(None, norm(hablado(FR[i])), norm(oido)).ratio()
        marca = "OK " if r >= .85 else "REVISAR"
        out.append(f"f{i}{a.sufijo} {r:.2f} {marca}\n  guion: {hablado(FR[i])}\n  oido:  {oido}")
        if r < .85:
            malas.append(f"f{i}")
    (ep / "voz" / f"whisper{a.sufijo}.txt").write_text("\n".join(out) + "\n", encoding="utf-8")
    print("\n".join(out))
    print("\nPara rehacer:", ",".join(x[1:] for x in malas) if malas else "nada, todo suena bien")


if __name__ == "__main__":
    main()
