# Control de calidad de un MP4 terminado: datos tecnicos, volumen (LUFS) y una hoja con 20 cuadros REALES del video.
# Uso: python comun/qa.py <video.mp4> <hoja.jpg>
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw

mp4, hoja = sys.argv[1], sys.argv[2]
pr = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=codec_type,width,height,r_frame_rate,sample_rate,channels",
                                "-show_entries", "format=duration,size", "-of", "json", mp4], capture_output=True, text=True).stdout)
dur = float(pr["format"]["duration"])
v = next(s for s in pr["streams"] if s["codec_type"] == "video")
a = next((s for s in pr["streams"] if s["codec_type"] == "audio"), None)
ebu = subprocess.run(["ffmpeg", "-i", mp4, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
lufs = re.findall(r"I:\s+([-\d.]+) LUFS", ebu)[-1]
pico = re.findall(r"Peak:\s+([-\d.]+) dBFS", ebu)[-1]
print(f"{Path(mp4).name}: {v['width']}x{v['height']} {v['r_frame_rate']} fps · {dur:.2f} s · audio {a['sample_rate'] if a else '-'} Hz · "
      f"{lufs} LUFS · pico {pico} dBFS · {int(pr['format']['size']) / 1048576:.1f} MB")
tmp = Path(tempfile.mkdtemp())
ts = [round(.6 + i * (dur - 1.2) / 19, 2) for i in range(20)]
c = Image.new("RGB", (216 * 10, 384 * 2))
for i, t in enumerate(ts):
    f = tmp / f"c{i}.jpg"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", mp4, "-frames:v", "1", "-vf", "scale=216:384", str(f)], check=True)
    im = Image.open(f); ImageDraw.Draw(im).text((6, 4), f"{t} s", fill=(255, 0, 255))
    c.paste(im, ((i % 10) * 216, (i // 10) * 384))
c.save(hoja, quality=85)
print("hoja ->", hoja)
