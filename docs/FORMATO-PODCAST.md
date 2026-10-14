# Formato PODCAST

Reel vertical de 40-50 s: un presentador (avatar de HeyGen hecho con tu foto, como si hablara desde un estudio de
podcast) lanza un gancho, la explicacion sigue con animacion, vuelve para un dato clave y cierra con tips, tu app y
"Comenta MARCA". El presentador solo habla en el gancho y el climax (~8 s por video) para gastar poco en HeyGen.

## 1. Estructura (9 frases)

| Frase | Que se ve | Quien habla |
|---|---|---|
| f0 gancho | presentador + insignia de la marca + rotulo con la pregunta ("¿Por que...?") + 0-2 pildoras de situacion + "Te explico..." | avatar (lipsync HeyGen) |
| f1-f4 | 4 bloques de explicacion: titulo 3D cromo + color de marca arriba; modelo 3D (o imagen) con etiquetas con linea, aros, pildoras, tags y flechas | voz en off |
| f5 climax | presentador + insignia "DATO CLAVE" + tarjeta del dato con fuente (numero, barras, grilla de 100 o personas) | avatar (lipsync HeyGen) |
| f6 tips | "Tres tips" (o `TIPS_TITULO`): busto del personaje + 3 tarjetas que entran al decir cada tip | voz en off |
| f7 cta | telefono con las capturas de tu app + logo + URL grande ("entra a tumarca.com") | voz en off |
| f8 cierre | "Comenta MARCA" + comentario que se escribe + mensaje con el link + boton Seguir | voz en off |

Siempre: barra de avance abajo (y 1515), fondo limpio con halos de tu color, musica `intro-tambores` desde 48 s a
-16 dB con ducking, efectos de sonido, credito 3D si hay modelo. Cero emojis. Nada se encima: cada bloque sale entero
antes del corte (a mitad de la pausa entre frases).

## 2. Guion

- Gancho = una pregunta o problema que la gente busca, con palabras simples. 6 frases cortas (f0-f5) + `tips` (f6):
  ~120-130 palabras. Espanol neutro con "tu", con tildes; numeros como se dicen; `Palabra{como se dice}`.
- Climax = un dato llamativo con fuente real (ponla en `climax.fuente`).
- Tips que aporten valor (algo que la persona pueda hacer hoy).
- f7 (`cta`) y f8 (`cierre`) salen de `marca.json > podcast` salvo que el episodio traiga los suyos en `guion.json`.

## 3. Archivos de un episodio (`podcast/<ep>/`)

- `guion.json`: `titulo`, `frases` (6), `tips`, `claves` (`[nombre, frase 0-6, palabra sin tildes]`: los momentos donde
  aparece cada cosa), opcional `cta`, `cierre` y `musica`.
- `config.js`: `INTRO` (rotulos del gancho, pildoras y tiempos), `TRES` (desde cuando se ve el 3D), `TIPS`
  (`[icono, titulo, subtitulo, tiempo]` x3) y opcional `TIPS_TITULO`.
- `escenas.js`: `EP3D` para el motor declarativo (`podcast/comun/declarativo.js`, ahi esta el formato completo).
- `modelo.json` (con 3D) o `img/` (sin 3D, imagenes 800x800 que van a `assets/ep/`).
- `voz/` (generada) y `avatar/` (clips de HeyGen): no van al repositorio.

Iconos disponibles: los de lucide que trae la plantilla (sun, moon, cloud, zap, flag, timer, sparkles, target, heart,
brain, rocket, star, trophy...). Lista completa: `grep -o "^  [a-zA-Z]*: '<" motor-animaciones/plantilla/index.html`.

### EP3D con modelo 3D

```js
const EP3D = {
  camara: [                                                          // fotogramas clave: [tiempo, estado, curva]
    [TRES.ini, { az: -155, el: 4, d: 1600, roll: 0, fov: 26, hx: 540, hy: 940, fx: -75, fy: -50, fz: 230 }],
    [X1, { az: -160 }, E.lin],                                       // gira lento hasta el corte del bloque 1
    [X1 + .9, { az: -150, d: 950, hy: 900, fx: -70, fy: -40, fz: 60 }, E.io3],   // y viaja a la vista del bloque 2
    ...
  ],
  piezas: {                                                          // pasos(estado inicial, [t, cambio], ...)
    musculoA: pasos({ o: 1, g: 0 }, [T.nombraA, { g: 1 }], [T.otra, { g: 0, o: .3 }], [T.lesion, { r: 1 }]),
  },
  pulso: ['musculoA'],                                               // su rojo late
  flex: { pie: pasos({ f: 0 }, [T.punta + .1, { f: 45 }, .8]) },     // cadenas articuladas en grados
  bloques: [
    { titulo: ['Tu', 'pantorrilla', X0 + .1, 104],
      etiquetas: [{ html: '<b class="v">Gemelos</b><small>por fuera</small>', punto: 'musculoA', t0: T.gemelos, t1: T.soleo - .15, dx: 230, dy: -150 }] },
    { titulo: [...], pills: [{ icono: 'moon', texto: 'Por horas al dormir', t0: T.horas, y: 520 }] },
    { titulo: [...], tags: [{ texto: 'Tendon', punto: 'aquiles', t0: T.x, dx: 0, dy: -70 }], flechas: [{ punto: 'talon', t0: T.y, icono: 'arrowUp' }] },
    { titulo: [...], aros: [{ punto: 'musculoA', t0: T.z, color: '#E5484D', tam: 220 }] },
  ],
  climax: { tipo: 'numero', titulo: 'Le pasa a...', fuente: 'FUENTE 2024', grande: '6 de 10', sub: 'adultos', t0: T.seis },
};
```

- `X0..X7` = cortes entre frases (fin de cada bloque). `T.<clave>` = cuando la voz dice esa palabra.
- Colores de las piezas: `g` = color de la marca (nombrar), `a` = amarillo (trabaja), `r` = rojo (lesion).
- Etiquetas: el motor las limita a x 300-790 e y 470-1400; elige `dx`/`dy` mirando la vista de prueba.
- Pildoras en `y: 520` (bajo el titulo) cuando el modelo ocupa la parte de abajo; tags y pildoras no a la misma altura.
- Climax `barras`: `barras: [[linea1, linea2, valor, color, texto], ...], tiempos: [t1, t2]`; `grilla`: `n` de 100 + `grande`;
  `personas`: `total`, `k` (cuantas en rojo), `grande`.
- `EP3D.extra = [fn0, fn1, fn2, fn3]`: piezas propias de un bloque (funcion `(t, hay3D)`), para lo que el motor no trae.

## 4. Receta

```bash
# 1. escribe podcast/ep2-tema/guion.json, config.js, escenas.js y modelo.json (o img/)
.venv/Scripts/python.exe herramientas/voz.py podcast/ep2-tema                          # f0..f8 con tu voz
.venv/Scripts/python.exe herramientas/revisar_voz.py podcast/ep2-tema   # SOBRE TODO f0 y f5 antes de pagar HeyGen
bash podcast/proyecto.sh ep2-tema                                    # une la voz, corta intro.wav/climax.wav, proyecto, alinea, GLB
bash podcast/heygen.sh ep2-tema                                      # clips del gancho y el climax (mira el saldo)
bash podcast/revisar.sh ep2-tema                                     # hoja: proyectos/podcast-ep2-tema/trabajo/revision/ep2-tema.png
bash podcast/entregar.sh "ep2-tema|02 - Titulo"                      # render 30 fps + control de calidad -> entregas/
```

Las claves (`T.*`) solo existen despues de alinear: escribe `config.js` y `escenas.js` con los nombres de `claves` y
ajusta con la hoja de revision. Calibra las camaras con `prueba3d.mjs` ([MODELOS-3D.md](MODELOS-3D.md)).

## 5. Costos y tiempos (PC de 16 nucleos)

- HeyGen: ~8 s de avatar por video = ~US$0,30. Voz: gratis (~40 s de calculo). Render: ~1,5-2,5 min por video.

## 6. Trampas

- Render SIEMPRE a 30 fps (los scripts ya pasan `--fps=30`).
- Nunca dos renders a la vez sobre el MISMO proyecto (el MP4 sale corrupto). Si cortas un render en segundo plano,
  revisa que no quede un `node render.mjs` vivo antes de relanzar.
- No edites un `.sh` mientras corre (bash lo lee por partes).
- Musculos semitransparentes se ven oscuros: mejor ocultarlos (`o: 0`) que dejarlos a 0,15-0,3.
- Nombres globales de la plantilla que no debes redeclarar: `Q`, `barra`, `nodo`, `_v`, `T`, `FR`.
