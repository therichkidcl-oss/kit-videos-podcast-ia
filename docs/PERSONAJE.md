# Tu personaje (quiz) y el busto (podcast)

El quiz necesita a tu personaje **de las rodillas hacia arriba** en 7 expresiones. Va al borde derecho del video,
espejado (asi mira y senala hacia el quiz), y el motor lo anima: respira, se balancea, se mueve cuando la voz habla y
cambia de cara con un corte y un saltito (nunca con fundido: queda un fantasma).

| Archivo | Cuando sale |
|---|---|
| `personaje-pregunta.png` | mientras la voz lee cada pregunta |
| `personaje-piensa.png` | durante la cuenta regresiva |
| `personaje-celebra.png` | al revelar (por defecto; cada pregunta puede pedir otra con `cara`) |
| `personaje-sorpresa.png` | revelaciones sorprendentes y "casi nadie acierta" |
| `personaje-like.png` | "dale like", "sigueme" y la web del cierre |
| `personaje-fallo.png` | disponible para tus preguntas (`cara: 'fallo'`) |
| `personaje-espera.png` | al inicio y en "comenta cuantas acertaste" |

Requisitos: PNG **1024x1536** con fondo transparente, el personaje entero de cabeza a rodillas con un poco de margen,
el mismo tamano y la misma posicion de los pies en las 7 (solo cambian cara y brazos). Despues de hacerlas, mide en
cada una la x del centro del cuerpo (entre las piernas) y anotala en `marca.json > personaje_centro`: asi no "salta"
al cambiar de cara.

## Hacerlas con ChatGPT (o cualquier generador de imagenes)

1. Arma una **ficha del personaje** (una imagen con tu personaje de frente y de lado) o usa tu mascota/logo ilustrado.
2. Abre un **chat nuevo por cada imagen** y adjunta siempre la ficha (en el mismo chat el estilo se va desviando).
3. Pega la base + la expresion. Pide PNG transparente vertical 1024x1536.
4. Guarda cada una como `marca/personaje/personaje-<cara>.png`.

Base (al inicio de cada prompt, en ingles funciona mejor):

```
Same character as the attached reference sheet, same illustration style (clean lines, soft shading).
Three-quarter shot from the KNEES UP (head to knees fully visible, small margin around, nothing cut except below the
knees). Body turned slightly toward the viewer's RIGHT. Transparent background PNG, no floor, no shadow, no text,
no frame. Vertical 1024x1536.
```

(En la imagen mira y senala a la DERECHA; el video la espeja y la pone al borde derecho, asi en pantalla mira hacia el
quiz. Si tu personaje lleva texto o un logo en la ropa, al espejarse queda al reves: mejor sin texto.)

Expresiones:

1. `pregunta` — confident smile, raising one index finger and pointing up toward the viewer's right, presenting a question.
2. `piensa` — thinking: one hand on the chin, eyes looking up, slightly squinting, the other hand on the hip.
3. `sorpresa` — shocked: eyes wide open, mouth open in an "O", both hands raised with open palms at shoulder height.
4. `celebra` — celebrating: huge open-mouth smile, both fists pumped up, leaning a bit forward with energy.
5. `fallo` — disappointed: facepalm with one hand on the forehead, eyes closed, sighing, shoulders dropped.
6. `like` — playful: winking, big thumbs up toward the viewer's right, cheeky smile.
7. `espera` — neutral listening pose: arms crossed, calm half smile, looking toward the viewer's right.

## Busto (podcast)

`marca/busto.png`: el personaje (o tu presentador ilustrado) en busto, ~500x486, fondo transparente, sonriendo y
explicando. Sale sobre las 3 tarjetas de tips.

## Presentador (podcast)

`marca/presentador.png` es una **foto real** (o un render realista) para HeyGen: vertical, de pecho hacia arriba, mirando
a camara, boca cerrada, buena luz y un fondo de estudio. HeyGen la hace hablar con tu voz.
