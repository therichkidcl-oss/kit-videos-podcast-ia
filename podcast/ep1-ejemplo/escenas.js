/* ep1-ejemplo: bloques 1-4 y climax para el motor declarativo (declarativo.js). Episodio SIN 3D: cada bloque muestra
   su imagen (img/ -> assets/ep/) y los puntos van en pixeles [x, y]. Con 3D: camara, piezas y puntos con nombre
   (ver docs/FORMATO-PODCAST.md). */
const EP3D = {
  bloques: [
    { titulo: ['La luz', 'blanca', T.luz1, 104], imagen: 'assets/ep/1.png',
      pills: [{ icono: 'sun', texto: 'Trae todos los colores', t0: T.colores, y: 1290 }] },
    { titulo: ['Choca con', 'el aire', T.aire, 104], imagen: 'assets/ep/2.png',
      tags: [{ texto: 'Moléculas diminutas', punto: [540, 1240], t0: T.moleculas, dy: 0 }] },
    { titulo: ['El azul', 'se desvía', T.desvian, 104], imagen: 'assets/ep/3.png',
      pills: [{ icono: 'zap', texto: 'Su onda es más corta', t0: T.onda, y: 1290, llena: true }] },
    { titulo: ['Azul en', 'todo el cielo', T.todas, 96], imagen: 'assets/ep/4.png',
      aros: [{ punto: [540, 840], t0: T.todas, tam: 320 }] },
  ],
  climax: { tipo: 'numero', titulo: 'Cuánto más se desvía el azul', fuente: 'DISPERSIÓN DE RAYLEIGH', grande: '×6',
            sub: 'más que el rojo', sub2: 'por eso el cielo se ve azul', t0: T.seis, t1: T.rojo5 },
};
