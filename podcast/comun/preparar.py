# FORMATO PODCAST: une la voz de un episodio (f0..f8, todas en epN/voz/), corta el gancho (intro.wav) y el climax
# (climax.wav) para el lipsync de HeyGen y escribe el guion de alineacion. Deja voz/marcas.json con el inicio de cada frase.
# Frases: f0-f5 = guion.json "frases" · f6 = "tips" · f7 = "cta" · f8 = "cierre" (si faltan, los de marca.json > podcast).
# Uso (desde la carpeta podcast/): python comun/preparar.py epN-tema
import json
import subprocess
import sys
from pathlib import Path

R = Path(__file__).resolve().parent
EP = R.parent / sys.argv[1]
V = EP / "voz"
sys.path.insert(0, str(R.parent.parent / "comun"))
import marca  # noqa: E402

G = json.loads((EP / "guion.json").read_text(encoding="utf-8"))
MP = marca.cargar().get("podcast", {})
FR = G["frases"] + [G["tips"], G.get("cta") or MP["cta"], G.get("cierre") or MP["cierre"]]
assert len(FR) == 9, "el podcast lleva 6 frases + tips + cta + cierre"
PAUSA = {1: .5, 3: .55, 4: .42, 5: .42, 6: .42}
REC = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse"
dur = lambda p: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)], capture_output=True, text=True).stdout)

for i in range(len(FR)):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(V / f"f{i}.wav"), "-af", REC, "-ar", "44100", "-ac", "1", str(V / f"r_f{i}.wav")], check=True)
for d in sorted({.3, .34, *PAUSA.values()}):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", str(d), str(V / f"s_{int(d * 1000)}.wav")], check=True)
lista, t, marcas = [V / "s_300.wav"], .3, {}
for i in range(len(FR)):
    marcas[f"f{i}"] = round(t, 3)
    lista.append(V / f"r_f{i}.wav"); t += dur(V / f"r_f{i}.wav")
    if i < len(FR) - 1:
        g = PAUSA.get(i, .34)
        lista.append(V / f"s_{int(g * 1000)}.wav"); t += g
(V / "lista.txt").write_text("".join(f"file '{p.as_posix()}'\n" for p in lista), encoding="utf-8")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(V / "lista.txt"), "-c:a", "pcm_s16le", str(V / "voz.wav")], check=True)
(V / "guion.txt").write_text("\n".join(FR) + "\n", encoding="utf-8")
(V / "lista_intro.txt").write_text(f"file '{(V / 's_300.wav').as_posix()}'\nfile '{(V / 'r_f0.wav').as_posix()}'\n", encoding="utf-8")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(V / "lista_intro.txt"), "-c:a", "pcm_s16le", str(V / "intro.wav")], check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(V / "r_f5.wav"), "-c:a", "pcm_s16le", str(V / "climax.wav")], check=True)
info = {"marcas": marcas, "intro_dur": round(.3 + dur(V / "r_f0.wav"), 3), "climax_dur": round(dur(V / "r_f5.wav"), 3), "total": round(dur(V / "voz.wav"), 3)}
(V / "marcas.json").write_text(json.dumps(info, indent=1), encoding="utf-8")
print(sys.argv[1], json.dumps({k: info[k] for k in ("intro_dur", "climax_dur", "total")}))
