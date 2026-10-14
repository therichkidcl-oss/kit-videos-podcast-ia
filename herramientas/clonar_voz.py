# Clona TU voz para Qwen3-TTS: de una grabacion tuya (10-20 s, hablando claro y sin musica) deja voces/<voz>/referencia.wav
# y voces/<voz>/referencia.txt (transcripcion exacta con Whisper medium). Revisa el texto: debe ser EXACTO lo que dices.
# Uso (python del entorno principal): python herramientas/clonar_voz.py <grabacion.mp3|wav> --voz <nombre> [--desde 0] [--dur 15]
# voces/ esta en .gitignore: tu voz NUNCA se sube al repositorio.
import argparse
import subprocess
import sys
from pathlib import Path

from faster_whisper import WhisperModel

sys.path.insert(0, str(Path(__file__).resolve().parent))
from revisar_voz import leer  # noqa: E402

KIT = Path(__file__).resolve().parent.parent


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("grabacion"); ap.add_argument("--voz", required=True)
    ap.add_argument("--desde", type=float, default=0); ap.add_argument("--dur", type=float, default=15)
    a = ap.parse_args()
    d = KIT / "voces" / a.voz
    d.mkdir(parents=True, exist_ok=True)
    ref = d / "referencia.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(a.desde), "-t", str(a.dur), "-i", a.grabacion, "-ac", "1", "-ar", "24000",
                    "-af", "loudnorm=I=-18:TP=-1.5:LRA=11", str(ref)], check=True)
    m = WhisperModel("medium", device="cpu", compute_type="int8")
    seg, _ = m.transcribe(leer(ref), language="es", beam_size=5)
    texto = " ".join(s.text.strip() for s in seg)
    (d / "referencia.txt").write_text(texto + "\n", encoding="utf-8")
    print(f"voz '{a.voz}' lista en voces/{a.voz}/\nTexto (corrigelo a mano si Whisper se equivoco):\n  {texto}")


if __name__ == "__main__":
    main()
