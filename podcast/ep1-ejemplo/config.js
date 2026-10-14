/* ep1-ejemplo (por que el cielo es azul): datos del gancho, del inicio de la explicacion y de los 3 tips. */
const INTRO = {
  a: ['¿Por qué el cielo', 'es azul?'], tA: [FR[0][0] - .02, T.azul0 - .04],
  sit: [],                                                    // pildoras con situaciones: [['moon', 'En la noche', T.noche], ...]
  salA: T.explico, b: ['Te lo explico', 'en 1 minuto'], tB: [T.explico - .02, T.minuto - .1],
};
const TRES = { ini: FR[1][0] - .05 };                        // desde cuando se ve el 3D (si el episodio tiene modelo.json)
const TIPS_TITULO = ['Tres', 'datos'];
const TIPS = [
  ['sunrise', 'Al atardecer', 'el cielo se pone rojo', T.atardecer],
  ['moon', 'En la Luna', 'el cielo es negro', T.luna],
  ['cloud', 'Las nubes', 'se ven blancas', T.nubes],
];
