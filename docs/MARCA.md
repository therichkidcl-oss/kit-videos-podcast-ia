# Tu marca: marca/marca.json

Todo lo que identifica a tu proyecto sale de `marca/marca.json` y de las imagenes de `marca/`. El codigo no tiene ningun
nombre, color ni logo fijo: al armar cada video, `comun/marca.py` copia tus imagenes al proyecto (`assets/marca/`),
inyecta `const MARCA = {...}` y pinta las escenas con tu color.

## Campos

| Campo | Ejemplo | Donde se ve |
|---|---|---|
| `nombre` | `"Tu Marca"` | titulo de la pagina (interno) |
| `web` | `"tumarca.com"` | pildora grande con la URL al final (los dos formatos) |
| `insignia` | `"TU MARCA EN 1 MINUTO"` | insignia arriba en el gancho del podcast |
| `palabra_clave` | `"MARCA"` | "Comenta MARCA" del cierre del podcast |
| `dm` | `{"titulo": "Tu link a Tu Marca", "sub": "APP GRATIS"}` | mensaje con el link en el cierre del podcast |
| `color` | `"#7C5CFF"` | color principal: todo lo verde del diseno se rota a este tono (ver abajo) |
| `logo` | `"marca/logo.png"` | insignias, quiz, telefono, mensaje (PNG transparente, ~900x260) |
| `cabeza` | `"marca/cabeza.png"` | circulo que avanza en la barra de progreso (cuadrado, 256x256) |
| `busto` | `"marca/busto.png"` | personaje en busto sobre los 3 tips del podcast (500x486 transparente) |
| `presentador` | `"marca/presentador.png"` | foto para HeyGen y respaldo quieto si no hay clips (vertical) |
| `personaje` | `"marca/personaje"` | carpeta con las 7 caras del quiz: `personaje-<cara>.png` ([PERSONAJE.md](PERSONAJE.md)) |
| `personaje_centro` | `{"pregunta": 512, ...}` | x del centro del cuerpo en cada imagen de 1024 px (para que no "salte" al cambiar de cara) |
| `app.pantallas` | `["marca/app/pantalla-1.png", ...]` | capturas de tu app o web que pasan en el telefono (3-4, verticales; si son mas altas que la pantalla bajan solas) |
| `app.toques` | `[[1, 0.5, 0.86], [2, 0.5, 0.42]]` | donde toca el dedo antes de pasar a la pantalla n: `[n, x 0-1, y 0-1]` de la captura |
| `credito_3d` | `"Modelo 3D: BodyParts3D © DBCLS · CC BY 4.0"` | credito en pantalla cuando hay modelo 3D |
| `voz` | `"narrador"` | carpeta `voces/<voz>/` (si `.env` no trae `VOZ`) |
| `podcast.cta` | `"Si quieres aprender más, entra a TuMarca{tu marca} punto com."` | frase 7 del podcast (cada episodio puede traer la suya en `guion.json > cta`) |
| `podcast.clave_web` | `"tumarca"` | palabra escrita de la URL en `cta` (sin tildes ni signos): ahi aparece la pildora de la web |
| `podcast.cierre` | `"Comenta Marca{marca}, y te mando el link para usarla gratis. Sígueme para más."` | frase 8 del podcast |
| `podcast.clave_palabra` | `"marca"` | palabra clave del cierre tal como esta escrita (ahi se escribe el comentario) |

El cierre del podcast se sincroniza con las palabras `comenta`, `<clave_palabra>`, `mando`, `gratis`, `sigueme` y `mas`:
si cambias la frase, conserva esas palabras (o ajusta `CLAVES` en `podcast/comun/parche.py`).

## El color

Todo el CSS esta disenado en verde (`#7AC943`, sus claros y oscuros, halos y brillos). Al armar, cada color de la
familia del verde se rota al tono de tu `color` conservando su brillo relativo; el oro (`#F5C400`), el rojo de las
respuestas malas y el azul del boton Seguir no cambian. Con eso basta: no hay que tocar CSS. Si quieres otro
acento secundario, cambia `ORO` en las bases.

## Imagenes de ejemplo

Las de `marca/` son marcadores de posicion hechos por `marca/generar_ejemplo.py` (con tu color). Reemplazalas por las
tuyas con el mismo nombre (o cambia las rutas en `marca.json`). Formatos: PNG; el personaje y el busto con fondo
transparente; las capturas de app a 1080 de ancho.
