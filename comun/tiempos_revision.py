# Momentos para la hoja de revision (anim.py revisar <tiempos> --hoja): se corre en la carpeta del proyecto de animacion.
# Con guion.json de quiz: por pregunta leyendo, en la cuenta y en la revelacion; en las demas frases a mitad y al final.
# Sin guion (podcast): a mitad y al final de cada frase.
# Uso: python comun/tiempos_revision.py [ruta/guion.json]
import json
import sys

w = json.load(open("trabajo/tiempos.json", encoding="utf-8"))
fr = {}
for x in w:
    fr.setdefault(x["frase"], []).append(x)
F = [[v[0]["s"], v[-1]["e"]] for _, v in sorted(fr.items())]
g = json.load(open(sys.argv[1], encoding="utf-8")) if len(sys.argv) > 1 else {}
out, usadas = [], set()
for q, a in g.get("preguntas", []):
    out += [F[q][0] + .9, F[q][1] + 2.2, F[a][0] + 1.1]
    usadas |= {q, a}
for k in range(len(F)):
    if k not in usadas:
        out += [F[k][0] + .45 * (F[k][1] - F[k][0]), F[k][1] - .15]
if usadas:
    out.append(F[-1][1] + .3)
print(" ".join(f"{x:.2f}" for x in sorted(out)))
