# Musica de fondo

Los MP3 **no vienen en el repo**: los descarga cada persona desde la web oficial de Mixkit con

```bash
python herramientas/preparar_audio.py
```

Son temas de [Mixkit](https://mixkit.co/free-stock-music/) con la **Mixkit Stock Music Free License**
(https://mixkit.co/license/#musicFree): uso gratis en proyectos personales y comerciales, tambien en videos de
YouTube monetizados, sin atribucion obligatoria. Lo que esa licencia NO permite es redistribuir los archivos sueltos
(por ejemplo, subirlos a un repositorio publico): por eso cada uno los baja de Mixkit. Mixkit no registra su musica
gratuita en Content ID.

| Clave | Tema | Autor | Descarga oficial |
|---|---|---|---|
| intro-scifi | Sci-Fi Score | Arulo | https://assets.mixkit.co/music/464/464.mp3 |
| intro-tambores | Epical Drums 01 | Grigoriy Nuzhny | https://assets.mixkit.co/music/676/676.mp3 |
| explicacion-jazz | Smooth Like Jazz | Ahjay Stelino | https://assets.mixkit.co/music/24/24.mp3 |
| explicacion-tech | Cyberpunk City | Alejandro Magana (A. M.) | https://assets.mixkit.co/music/140/140.mp3 |

Para agregar un tema: busca uno en Mixkit marcado "Free License" (no "Restricted") y agrega su entrada a
`musica.json` con el enlace directo al MP3 entre parentesis en `fuente` (igual que los de arriba); luego corre
`python herramientas/preparar_audio.py` y lo baja solo. `desde` = segundo en que empieza la parte que interesa;
`nivel_db` = nivel de la musica respecto a la voz (-18 a -22). Si usas musica propia, dejala en esta carpeta con el
nombre de `archivo` (el `.gitignore` evita que se suba).

Si YouTube reclamara alguna vez un tema, se disputa con el enlace a la licencia de Mixkit.
