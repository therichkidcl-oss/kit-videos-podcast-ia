# Voz local con Qwen3-TTS (Apache-2.0), en CPU. Corre con el entorno .venv-tts (Python 3.12).
#
# 1) Disenar una voz (crea la referencia que despues se reutiliza en todos los videos):
#    .venv-tts\Scripts\python.exe herramientas/tts_qwen.py disenar --voz narrador --instruct "..." --texto "..." [--semilla 7]
#    -> voces/<voz>/referencia.wav + referencia.txt + instruct.txt
#
# 2) Hablar con esa voz (un solo proceso para muchos textos: el modelo se carga una vez):
#    .venv-tts\Scripts\python.exe herramientas/tts_qwen.py hablar --voz narrador --trabajos trabajos.json
#        [--modelo 0.6B|1.7B] [--lote N] [--dtype fp32|bf16] [--semilla N] [--temperatura 0.6]
#    trabajos.json = [{"texto": "...", "salida": "ruta.wav"}, ...]
#    --lote N genera N textos a la vez: en CPU cada paso cuesta casi lo mismo con 1 que con N textos.
import argparse
import contextlib
import io
import json
import os
import time
from pathlib import Path

os.environ.setdefault("HF_HUB_DISABLE_PROGRESS_BARS", "1")
import soundfile as sf
import torch
from transformers.utils import logging as hf_logging

# Al importar avisa que falta flash-attn (solo sirve con GPU NVIDIA): en CPU no aplica, se oculta
with contextlib.redirect_stdout(io.StringIO()):
    from qwen_tts import Qwen3TTSModel
hf_logging.set_verbosity_error()

RAIZ = Path(__file__).resolve().parent.parent
VOCES = RAIZ / "voces"
TIPOS = {"fp32": torch.float32, "bf16": torch.bfloat16}
torch.set_num_threads(max(1, os.cpu_count() // 2))


def cargar(nombre, dtype="fp32"):
    t0 = time.time()
    try:   # si el modelo ya esta descargado se usa la copia local (sin internet ni consultas a huggingface.co)
        from huggingface_hub import snapshot_download
        nombre = snapshot_download(nombre, local_files_only=True)
    except Exception:
        pass
    modelo = Qwen3TTSModel.from_pretrained(nombre, device_map="cpu", dtype=TIPOS[dtype])
    print(f"modelo {nombre} ({dtype}) cargado en {time.time() - t0:.0f} s", flush=True)
    return modelo


def disenar(a):
    if a.semilla is not None:
        torch.manual_seed(a.semilla)
    modelo = cargar("Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign")
    t0 = time.time()
    wavs, sr = modelo.generate_voice_design(text=a.texto, language="Spanish", instruct=a.instruct)
    dur = len(wavs[0]) / sr
    carpeta = VOCES / a.voz
    carpeta.mkdir(parents=True, exist_ok=True)
    sf.write(carpeta / "referencia.wav", wavs[0], sr)
    (carpeta / "referencia.txt").write_text(a.texto, encoding="utf-8")
    (carpeta / "instruct.txt").write_text(a.instruct, encoding="utf-8")
    gen = time.time() - t0
    print(f"voz '{a.voz}': {dur:.1f} s de audio en {gen:.0f} s (RTF {gen / dur:.2f})", flush=True)


def hablar(a):
    carpeta = VOCES / a.voz
    ref_audio = str(carpeta / "referencia.wav")
    ref_text = (carpeta / "referencia.txt").read_text(encoding="utf-8")
    trabajos = json.loads(Path(a.trabajos).read_text(encoding="utf-8"))
    modelo = cargar(f"Qwen/Qwen3-TTS-12Hz-{a.modelo}-Base", a.dtype)
    prompt = modelo.create_voice_clone_prompt(ref_audio=ref_audio, ref_text=ref_text, x_vector_only_mode=False)
    # Los textos de largo parecido van en el mismo lote: el lote dura lo que tarda el mas largo
    orden = sorted(trabajos, key=lambda t: len(t["texto"]), reverse=True)
    total_audio = 0.0
    total_gen = 0.0
    for k in range(0, len(orden), a.lote):
        lote = orden[k:k + a.lote]
        if a.semilla is not None:
            torch.manual_seed(a.semilla)
        t0 = time.time()
        # --temperatura baja = se pega mas al tono y acento de la referencia (por defecto el modelo usa 0,9)
        extra = {"temperature": a.temperatura, "subtalker_temperature": a.temperatura} if a.temperatura else {}
        wavs, sr = modelo.generate_voice_clone(text=[t["texto"] for t in lote], language="Spanish", voice_clone_prompt=prompt, **extra)
        gen = time.time() - t0
        dur = 0.0
        for t, wav in zip(lote, wavs):
            Path(t["salida"]).parent.mkdir(parents=True, exist_ok=True)
            sf.write(t["salida"], wav, sr)
            dur += len(wav) / sr
        total_audio += dur
        total_gen += gen
        nombres = ", ".join(Path(t["salida"]).name for t in lote)
        print(f"{nombres}: {dur:.1f} s de audio en {gen:.0f} s (RTF {gen / dur:.2f})", flush=True)
    if total_audio:
        print(f"TOTAL: {total_audio:.1f} s de audio en {total_gen:.0f} s (RTF {total_gen / total_audio:.2f})", flush=True)


def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)
    d = sub.add_parser("disenar")
    d.add_argument("--voz", required=True)
    d.add_argument("--instruct", required=True)
    d.add_argument("--texto", required=True)
    d.add_argument("--semilla", type=int)
    h = sub.add_parser("hablar")
    h.add_argument("--voz", required=True)
    h.add_argument("--trabajos", required=True)
    h.add_argument("--modelo", default="1.7B", choices=["0.6B", "1.7B"])
    h.add_argument("--lote", type=int, default=1)
    h.add_argument("--dtype", default="fp32", choices=list(TIPOS))
    h.add_argument("--semilla", type=int)
    h.add_argument("--temperatura", type=float, help="0,5-0,9; mas baja = mas parecida a la referencia")
    a = p.parse_args()
    {"disenar": disenar, "hablar": hablar}[a.cmd](a)


if __name__ == "__main__":
    main()
