/* q1-ejemplo: quiz de ejemplo SIN 3D. Cada pregunta muestra una imagen (img/ -> assets/quiz/) y, al revelar, imagenRev.
   Los puntos de tags y aros van en pixeles de pantalla [x, y] porque no hay modelo. Para un quiz con 3D ver docs/FORMATO-QUIZ.md. */
const QUIZ = {
  tema: 'Cultura general', cuenta: 4,
  preguntas: [
    { q: 0, a: 1, texto: '¿Cuál es el planeta más grande del sistema solar?', ops: ['Marte', 'Júpiter', 'Saturno'], ok: 1,
      dato: 'Le caben más de 1.000 Tierras', cara: 'celebra', imagen: 'assets/quiz/1.png' },
    { q: 3, a: 4, texto: '¿Cuántos lados tiene un hexágono?', ops: ['Cinco', 'Seis', 'Ocho'], ok: 1,
      dato: 'Como las celdas de un panal', cara: 'like', imagen: 'assets/quiz/2.png' },
    { q: 5, a: 6, texto: '¿Qué gas toman las plantas para hacer fotosíntesis?', ops: ['Oxígeno', 'Dióxido de carbono', 'Nitrógeno'], ok: 1,
      dato: 'Y a cambio liberan oxígeno', cara: 'celebra', imagen: 'assets/quiz/3.png' },
    { q: 7, a: 8, texto: '¿Cuál es el océano más grande del mundo?', ops: ['Atlántico', 'Índico', 'Pacífico'], ok: 2,
      dato: 'Cubre casi un tercio del planeta', cara: 'sorpresa', imagen: 'assets/quiz/4.png' },
    { q: 9, a: 10, texto: '¿Cuántos minutos tiene un día?', ops: ['1.240', '1.440', '1.640'], ok: 1,
      dato: '24 horas × 60 minutos', cara: 'celebra', imagen: 'assets/quiz/5.png' },
    { q: 12, a: 13, texto: '¿Qué animal tiene tres corazones?', ops: ['La ballena', 'El pulpo', 'El tiburón'], ok: 1,
      dato: '2 para las branquias y 1 para el cuerpo', cara: 'sorpresa', imagen: 'assets/quiz/6.png', imagenRev: 'assets/quiz/6b.png',
      rev: { tags: [{ texto: '3 corazones', punto: [380, 540], oro: true }] } },
  ],
  retencion: [
    { f: 2, tipo: 'like', texto: '¡Dale <b>like</b> si acertaste!', aviso: 'Casi nadie acierta la última', tLike: 'like', tAviso: 'nadie2',
      caras: [['like', 'like'], ['nadie2', 'sorpresa']] },
    { f: 11, tipo: 'sigue', texto: 'Antes de la última… <b>sígueme</b>', tSigue: 'sigueme', caras: [['ultima11', 'pregunta'], ['sigueme', 'like']] },
  ],
  cierre: [14, 15],
  cierreDatos: { texto: '¿Cuántas <b>acertaste</b>?', palabra: '¡Acerté 6/6!', tEscribe: 'acertaste14', tEnvia: 'quieres15', tApp: 'quieres15', enviado: '✓ Comentado', tWeb: 'web' },
  carasCierre: [['comenta', 'espera'], ['quieres15', 'pregunta'], ['web', 'like']],
};
function vista3D(t, QT) { return null; }          // sin modelo 3D (con 3D: return vistaMixta(t, QT) o tu propia vista)
