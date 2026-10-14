# Formato QUIZ

Reel vertical de ~60-75 s (mas de 1 minuto sirve para los programas de recompensas de TikTok) con el ritmo de los quiz
virales: 6 preguntas, cuenta regresiva, revelacion, retencion y cierre con tu app. Sin HeyGen: el personaje es una
ilustracion animada por codigo.

## 1. Estructura (16 frases)

| Frase | Que dice | Que se ve |
|---|---|---|
| f0 / f1 | Pregunta 1 / respuesta + dato | tarjeta "Pregunta 1/6", 3 opciones A/B/C, 4 s de cuenta en silencio (numero, tic-tac, barra verde -> amarillo -> rojo), revelacion (correcta en tu color con check, malas en rojo con x), dato abajo, 3D o imagen a la izquierda |
| f2 | "Dale like si acertaste. Y ojo: casi nadie acierta la ultima." | corazon que late + aviso rojo |
| f3-f10 | Preguntas 2 a 5 con sus respuestas | igual que la 1 |
| f11 | "Antes de la ultima, sigueme para..." | boton Seguir con cursor que lo toca |
| f12 / f13 | "La que casi nadie acierta: ..." / respuesta | etiqueta roja "La que casi nadie acierta" |
| f14 | "Comenta cuantas acertaste." | comentario "¡Acerte 6/6!" que se escribe solo |
| f15 | "Si quieres ..., entra a tumarca.com" | telefono con tus capturas + logo + URL grande |

Siempre: el personaje al borde derecho (espejado), insignia "QUIZ · TEMA" arriba, barra de avance abajo (rapida al
inicio, lenta al final) con tu cabeza/logo en la punta, musica `explicacion-tech` a -17 dB con ducking, efectos de sonido.
Temas mezclados y de menos a mas dificil retienen mas que un solo tema. Nunca uses trucos de susto falsos.

## 2. Archivos de un quiz (`quiz/<q>/`)

- `guion.json`: `titulo`, `frases` (las 16, con tildes; `Palabra{como se dice}`), `preguntas` (pares [frase pregunta,
  frase respuesta]: `[[0,1],[3,4],[5,6],[7,8],[9,10],[12,13]]`), `cuenta` (4), `claves` y `musica`.
  `claves` = `[nombre, frase, palabra escrita sin tildes]`: like, nadie2, ultima11, sigueme, comenta, acertaste14, quieres15
  y web (la palabra de tu URL en la frase 15). Si cambias esas frases, cambia tambien sus claves (`"palabra#2"` = la segunda
  vez que aparece).
- `config.js`: `QUIZ = { tema, cuenta, preguntas: [...], retencion, cierre, cierreDatos, carasCierre }` y `vista3D(t, QT)`.
  Cada pregunta: `{ q, a, texto, ops: [3 opciones cortas], ok: indice correcto, dato: 'una linea', cara: 'celebra'|'sorpresa'|'like',
  imagen, imagenRev, vista (3D), rev: { etiquetas, tags, aros } }`. Copia `quiz/q1-ejemplo/config.js` y cambia los textos.
- `img/` (sin 3D): imagenes cuadradas (800x800) que se copian a `assets/quiz/`.
- `modelo.json` (con 3D): ver [MODELOS-3D.md](MODELOS-3D.md). `modelos/cuerpo-completo.json` sirve para quizzes de anatomia.

### Quiz con 3D (vistaMixta)

Con `modelo.json`, en `config.js` define los grupos de piezas y una vista por pregunta, y usa el motor generico:

```js
const QUIZ = {
  tema: 'Anatomía', cuenta: 4, credito: '3D: BodyParts3D (DBCLS) · HRA (NIH) · CC BY 4.0',
  vista: { grupos: { esq: ['craneo', 'columna', 'costillas', 'femurD', 'femurI'], pul: ['pdSup', 'pdMed', 'pdInf', 'piSup', 'piInf'] },
           base: { el: 5, hx: 380, hy: 790 } },
  preguntas: [
    { q: 0, a: 1, texto: '¿Dónde está tu rótula?', ops: ['En el codo', 'En la rodilla', 'En el hombro'], ok: 1, dato: '...', cara: 'celebra',
      vista: { g: ['esq'], cam: { az: 0, el: 4, d: 13000, hy: 760, f: [0, -90, 800] },           // cuerpo entero al preguntar
               rev: { cam: { az: 20, d: 2200, f: [0, -110, 450] }, piezas: { rotulas: { g: 1 } } } },   // zoom y pieza encendida al revelar
      rev: { etiquetas: [{ html: '<b class="v">Rótula</b><small>delante de la rodilla</small>', punto: 'centro:rotulas', dx: 0, dy: -220 }] } },
    ...
  ], ...
};
function vista3D(t, QT) { return vistaMixta(t, QT); }
```

`vista = { g: [grupos visibles], ocultar: [piezas], cam: { az, el, d, hx, hy, f: [x, y, z] }, giro: grados que gira,
rev: { cam, piezas: { n: { g, a, r } }, ocultar, mostrar } }`. La camara se queda quieta en las pausas de retencion y
se mueve al empezar cada pregunta. Calibra cada camara con `prueba3d.mjs` antes.

## 3. Receta

```bash
# 1. escribe quiz/q2-tema/guion.json y config.js (copia el ejemplo); img/ o modelo.json
.venv/Scripts/python.exe herramientas/voz.py quiz/q2-tema                              # voz de las 16 frases
.venv/Scripts/python.exe herramientas/revisar_voz.py quiz/q2-tema    # rehaz lo que diga REVISAR (docs/VOZ.md)
bash quiz/proyecto.sh q2-tema                                        # proyecto + GLB + voz unida (pausa de cuenta) y alineada
bash quiz/revisar.sh q2-tema                                         # hoja: proyectos/quiz-q2-tema/trabajo/revision/q2-tema.png
#    mira TODA la hoja (nada encimado, textos legibles, 3D bien encuadrado), corrige config.js y repite
bash quiz/entregar.sh "q2-tema|Quiz 02 - Titulo"                     # render 30 fps + control de calidad -> entregas/
```

Varios quizzes: `bash quiz/entregar.sh "q2-a|Quiz 02 - ..." "q3-b|Quiz 03 - ..."` (renderiza en fila).
`proyectos/quiz-<q>/out/qa.jpg` = 20 cuadros reales del MP4 final: miralos antes de publicar.

## 4. Trampas

- La plantilla ya usa el global `Q`: los tiempos del quiz se llaman `QT`. No declares en `config.js` nombres que ya
  existen en `base_quiz.js` o en la plantilla (`barra`, `nodo`, `_v`, `T`, `FR`, `PAL`...).
- En `config.js` no uses a nivel superior constantes de `base_quiz.js` (se carga despues): todo dentro de funciones.
- Una pieza con dos listas de cambios: usar `push`, no reasignar (se pierde el estado anterior).
- Opciones cortas (caben ~20 caracteres a 38 px); preguntas de hasta 2 lineas; dato de una linea.
- Si una palabra clave no aparece en la voz alineada, `parche.py` lo dice ("No encontre ..."): revisa `claves` o la voz.
