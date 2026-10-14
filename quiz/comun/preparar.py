# FORMATO QUIZ: une la voz de un quiz (f0..fN) dejando el silencio de la cuenta regresiva despues de cada
# pregunta, y escribe el guion de alineacion. Uso (desde la carpeta quiz/): python comun/preparar.py q1-tema
# guion.json: frases (texto que se dice; Palabra{como se dice}), "preguntas": [[frase pregunta, frase respuesta], ...],
# "cuenta": segundos de cuenta regresiva (4). Pausas: tras pregunta = cuenta + .4; resto .42 (retencion .4).
import json
import subprocess
import sys
from pathlib import Path

R = Path(__file__).resolve().parent.parent
EP = R / sys.argv[1]
V = EP / "voz"
G = json.loads((EP / "guion.json").read_text(encoding="utf-8"))
FR, PREG = G["frases"], G["preguntas"]
CUENTA = G.get("cuenta", 4)
PAUSA = {q: round(CUENTA + .4, 2) for q, _ in PREG}
REC = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse"
dur = lambda p: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)], capture_output=True, text=True).stdout)

for i in range(len(FR)):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(V / f"f{i}.wav"), "-af", REC, "-ar", "44100", "-ac", "1", str(V / f"r_f{i}.wav")], check=True)
pausas = sorted({.25, .42, *PAUSA.values()})
for d in pausas:
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", str(d), str(V / f"s_{int(round(d * 1000))}.wav")], check=True)
lista, t, marcas = [V / "s_250.wav"], .25, []
for i in range(len(FR)):
    marcas.append(round(t, 3))
    lista.append(V / f"r_f{i}.wav"); t += dur(V / f"r_f{i}.wav")
    if i < len(FR) - 1:
        g = PAUSA.get(i, .42)
        lista.append(V / f"s_{int(round(g * 1000))}.wav"); t += g
(V / "lista.txt").write_text("".join(f"file '{p.as_posix()}'\n" for p in lista), encoding="utf-8")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(V / "lista.txt"), "-c:a", "pcm_s16le", str(V / "voz.wav")], check=True)
(V / "guion.txt").write_text("\n".join(FR) + "\n", encoding="utf-8")
(V / "marcas.json").write_text(json.dumps({"marcas": marcas, "total": round(dur(V / "voz.wav"), 3)}, indent=1), encoding="utf-8")
print(sys.argv[1], "voz", round(dur(V / "voz.wav"), 2), "s")
