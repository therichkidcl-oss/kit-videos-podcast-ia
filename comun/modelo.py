# Arma assets/3d/modelo.glb desde el modelo.json de un episodio o quiz: piezas de BodyParts3D 4.0 (DBCLS, CC BY 4.0) en
# sus coordenadas reales (para que calcen entre si), decimadas, con nombre por pieza. Tambien acepta piezas de otro GLB
# ("glb", "nodos", "ajuste"). Escribe assets/3d/puntos.json con el centro y la caja de cada pieza (en mm BP3D:
# x = derecha del cuerpo negativa, y = anterior negativa, z = arriba) para disenar camaras, etiquetas y tubos.
# Los OBJ de BodyParts3D van en modelos/bp3d/ (o en la carpeta que diga BP3D_DIR en .env): ver docs/MODELOS-3D.md.
# Uso: python comun/modelo.py <carpeta del episodio o quiz> <carpeta del proyecto de animacion>
import json
import os
import sys
from pathlib import Path

import fast_simplification
import numpy as np
import trimesh

KIT = Path(__file__).resolve().parent.parent


def env(k, defecto):
    if os.environ.get(k):
        return os.environ[k]
    f = KIT / ".env"
    for l in (f.read_text(encoding="utf-8", errors="ignore").splitlines() if f.exists() else []):
        if l.strip().startswith(k + "="):
            return l.split("=", 1)[1].strip().strip('"').strip("'") or defecto
    return defecto


BP3D = Path(env("BP3D_DIR", KIT / "modelos" / "bp3d"))
OBJ = [str(BP3D / "isa_BP3D_4.0_obj_99"), str(BP3D / "partof_BP3D_4.0_obj_99")]
ep, proy = sys.argv[1], sys.argv[2]
cfg = json.load(open(os.path.join(ep, "modelo.json"), encoding="utf-8"))
dst = os.path.join(proy, "assets", "3d")
os.makedirs(dst, exist_ok=True)
escena, info = trimesh.Scene(), {}
_glb = {}


def externo(p):
    """Pieza de otro GLB (ej. pulmon del Human Reference Atlas, CC BY 4.0): nodos por nombre, pasados a mm BP3D.
    p["glb"] = ruta, p["nodos"] = [nombres], p["ajuste"] = {"escala": s, "offset": [x, y, z]} (x = x*s, y = -z*s, z = y*s)."""
    if p["glb"] not in _glb:
        ruta = Path(p["glb"]) if Path(p["glb"]).is_absolute() else KIT / "modelos" / p["glb"]
        _glb[p["glb"]] = trimesh.load(ruta)
    sc, a = _glb[p["glb"]], p["ajuste"]
    ms = []
    for n in p["nodos"]:
        g = sc.geometry[n].copy()
        v = g.vertices * 1000 * a["escala"]
        g.vertices = np.column_stack([v[:, 0], -v[:, 2], v[:, 1]]) + np.array(a["offset"])
        ms.append(g)
    return ms


for p in cfg["partes"]:
    fjs = [] if "glb" in p else p["fj"] if isinstance(p["fj"], list) else [p["fj"]]
    ms = externo(p) if "glb" in p else []
    for fj in fjs:
        ruta = next((os.path.join(d, fj + ".obj") for d in OBJ if os.path.exists(os.path.join(d, fj + ".obj"))), None)
        if not ruta:
            sys.exit(f"no existe {fj} ({p['n']}) en {BP3D} (ver docs/MODELOS-3D.md)")
        ms.append(trimesh.load(ruta, force="mesh", process=False))
    m = trimesh.util.concatenate(ms) if len(ms) > 1 else ms[0]
    m.merge_vertices()
    v, f = m.vertices.astype(np.float32), m.faces.astype(np.int64)
    maxc = p.get("caras", 9000)
    if len(f) > maxc:
        v, f = fast_simplification.simplify(v, f, target_reduction=1 - maxc / len(f))
    out = trimesh.Trimesh(v, f, process=True)
    escena.add_geometry(out, node_name=p["n"], geom_name=p["n"])
    info[p["n"]] = {"centro": out.bounds.mean(axis=0).round(1).tolist(), "min": out.bounds[0].round(1).tolist(),
                    "max": out.bounds[1].round(1).tolist(), "caras": int(len(out.faces))}
escena.export(os.path.join(dst, "modelo.glb"))
json.dump(info, open(os.path.join(dst, "puntos.json"), "w", encoding="utf-8"), indent=1)
print(json.dumps({k: v["centro"] for k, v in info.items()}))
print("KB", round(os.path.getsize(os.path.join(dst, "modelo.glb")) / 1024))
