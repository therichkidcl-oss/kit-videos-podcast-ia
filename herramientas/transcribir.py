# Transcribe un audio en espanol con tiempos por palabra (faster-whisper en CPU). Sirve para revisar que la voz
# generada dijo bien cada frase. El audio se decodifica con ffmpeg (sin depender de PyAV).
# Uso: python herramientas/transcribir.py <audio> <salida.json> [modelo: small|medium]
# Salida: [{"text": "...", "start": 0.0, "end": 0.4}, ...]
import json
import subprocess
import sys

import numpy as np
from faster_whisper import WhisperModel


def leer(audio):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", audio, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.int16).astype(np.float32) / 32768


def main():
    audio, salida = sys.argv[1], sys.argv[2]
    modelo = sys.argv[3] if len(sys.argv) > 3 else "small"
    m = WhisperModel(modelo, device="cpu", compute_type="int8")
    segmentos, _ = m.transcribe(leer(audio), language="es", word_timestamps=True, beam_size=5)
    palabras = []
    for s in segmentos:
        for w in s.words or []:
            texto = w.word.strip()
            if texto:
                palabras.append({"text": texto, "start": round(w.start, 3), "end": round(w.end, 3)})
    with open(salida, "w", encoding="utf-8") as f:
        json.dump(palabras, f, ensure_ascii=False)


if __name__ == "__main__":
    main()
