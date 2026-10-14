# Modelos 3D (opcional)

Si un episodio o quiz tiene `modelo.json`, el video muestra un modelo 3D con three.js (`comun/h3d.js`) que gira, se
acerca y enciende piezas al ritmo de la voz. Sin `modelo.json` se usan imagenes (ver los ejemplos).

## 1. Descargar los modelos (no vienen en el repo)

**BodyParts3D 4.0** (anatomia humana completa, © DBCLS, CC BY 4.0): https://dbarchive.biosciencedbc.jp/en/bodyparts3d/
Descarga `isa_BP3D_4.0_obj_99.zip` y `partof_BP3D_4.0_obj_99.zip` y descomprimelos en `modelos/bp3d/`:

```
modelos/bp3d/isa_BP3D_4.0_obj_99/FJ1234.obj ...
modelos/bp3d/partof_BP3D_4.0_obj_99/FJ5678.obj ...
```

(Si ya los tienes en otra carpeta, pon esa ruta en `.env` como `BP3D_DIR=C:/ruta/a/la/carpeta`.) Cada pieza es un
archivo `FJxxxx.obj`; los nombres de cada FJ estan en los `.txt` que vienen en el zip (`isa_parts_list_e.txt`,
`partof_parts_list_e.txt`).

**Pulmones (Human Reference Atlas, NIH, CC BY 4.0)**: BodyParts3D trae los pulmones solo como arbol bronquial. Para
pulmones con lobulos, descarga el pulmon femenino del Human Reference Atlas (https://humanatlas.io, biblioteca de
organos 3D de referencia, tambien en https://3d.nih.gov) y guardalo como `modelos/hra_lung_f.glb`.

`modelos/cuerpo-completo.json` es un modelo listo de **57 piezas** (esqueleto por grupos, pulmones HRA por lobulos,
traquea, bronquios, diafragma, corazon y vasos, encefalo, digestivo, urinario, ojos y algunos musculos) para quizzes de
temas mezclados: copialo como `quiz/<q>/modelo.json`.

## 2. modelo.json

```json
{
 "partes": [
  { "n": "femur", "fj": "FJ3365", "tipo": "hueso", "caras": 7000 },
  { "n": "pie", "fj": ["FJ3360", "FJ3385"], "tipo": "hueso", "caras": 12000 },
  { "n": "pdSup", "glb": "hra_lung_f.glb", "nodos": ["..."], "ajuste": { "escala": 1.05, "offset": [9.25, -183, 732.5] }, "tipo": "pulmon" }
 ],
 "formas":  [ { "n": "menisco", "tipo": "cartilago", "centro": [x, y, z], "radios": [rx, ry, rz] } ],
 "tubos":   [ { "n": "ciatico", "tipo": "nervio", "puntos": [[x, y, z], ...], "radio": 6 } ],
 "cadenas": [ { "n": "pie", "eje": "x", "niveles": [ { "pivote": [x, y, z], "partes": ["pie"] } ] } ],
 "puntos":  { "gastro": [x, y, z], "talon": { "p": [x, y, z], "de": "pie" } }
}
```

- `n` = nombre de la pieza (lo usas en camaras, piezas y puntos). `fj` = uno o varios OBJ de BodyParts3D que se unen.
- `tipo` = color y material: hueso, musculo, tendon, ligamento, disco, nervio, fascia, cartilago, corazon, arteria, vena,
  valvula, pulmon, encefalo, higado, estomago, intestino, pancreas, vesicula (agrega mas en `COL` de `comun/h3d.js`).
- `caras` = cuantos triangulos deja el decimado (menos = mas liviano; 2.000-12.000).
- `glb` + `nodos` + `ajuste`: piezas de otro GLB (relativo a `modelos/`), pasadas a milimetros BP3D.
- Coordenadas en **mm BP3D**: x = derecha del cuerpo NEGATIVA, y = anterior (adelante) NEGATIVA, z = arriba.
- Puntos: `[x, y, z]`, `{ "p": [...], "de": "pieza" }` (sigue a esa pieza si se mueve), `"centro:pieza"` o `"tubo:n:0.5"`.

`comun/modelo.py` arma `assets/3d/modelo.glb` y escribe `assets/3d/puntos.json` con el centro y la caja de cada pieza:
usalo para elegir camaras y puntos. Lo llaman `quiz/proyecto.sh` y `podcast/proyecto.sh`.

## 3. Estado de cada fotograma

`H3D.pintar({ az, el, d, roll, fov, hx, hy, ancla, piezas, flex, mov })`:

- Camara: `az` (0 = de frente, 180 = por detras, -90 = lado derecho del cuerpo), `el` (elevacion en grados), `d`
  (distancia en mm; el cuerpo entero se ve a ~13.000), `ancla` / `fx, fy, fz` (punto que mira), `hx, hy` (donde cae
  ese punto en la pantalla de 1080x1920).
- `piezas: { n: { o, g, a, r, dib } }`: opacidad, brillo del color de marca (nombrar), amarillo (trabaja), rojo (lesion,
  late si esta en `pulso`), `dib` = cuanto se dibuja un tubo (0-1).
- `flex: { cadena: grados }` y `mov: { n: [dx, dy, dz] }`.

## 4. Calibrar camaras antes de animar

En la carpeta del proyecto de animacion:

```bash
node ../../comun/prueba3d.mjs ../../quiz/q2-tema trabajo/vistas.json
```

`vistas.json = { "nombre": { "az": 20, "el": 5, "d": 2200, "hx": 380, "hy": 790, "ancla": [0, -110, 450], "piezas": {...}, "marcas": ["punto1"] } }`
deja `trabajo/prueba3d/<nombre>.png` y una hoja con todas: mira que la pieza se vea grande, centrada y que los puntos
marcados caigan donde quieres poner etiquetas.

## 5. Otros modelos (no anatomia)

Cualquier GLB sirve como pieza externa (`glb` + `nodos`). Ajusta `escala` y `offset` para llevarlo a milimetros y
centrarlo cerca del origen, y nombra los nodos que quieras encender. El credito en pantalla sale de
`marca.json > credito_3d` (o `QUIZ.credito` por quiz): ponlo si la licencia del modelo lo pide.
