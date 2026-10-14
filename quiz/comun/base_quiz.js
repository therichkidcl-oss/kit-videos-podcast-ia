/* =====================================================================
   FORMATO QUIZ. Orden en index.html: MARCA (marca.json) + qN/config.js (QUIZ + vista3D) + comun/telefono.js + este archivo.
   Cada pregunta: la voz la lee, cuenta regresiva en silencio (QUIZ.cuenta s, barra verde -> amarillo -> rojo + tic-tac),
   revelacion (correcta en verde, malas en rojo) y la voz da la respuesta con un dato. Momentos de retencion (like,
   "casi nadie acierta la ultima", sigueme) y cierre (comenta cuantas acertaste + tu web con el telefono animado).
   El personaje va al borde derecho de rodillas hacia arriba (assets/marca/personaje/personaje-<cara>.png, espejado),
   animado: respira, se balancea, se mueve cuando habla (palabras de PAL) y cambia de cara con un saltito.
   A la izquierda un modelo 3D (HAY3D, modelo.json) o, sin modelo, una imagen por pregunta (p.imagen / p.imagenRev).
   Los verdes (#7AC943) se pintan con el color de la marca al armar (comun/marca.py).
   ===================================================================== */
const grid = $('grid'), glowN = $('glowN'), glowA = $('glowA'), glowB = $('glowB');
const VERDE = '122,201,67', ORO = '245,196,0', ROJO = '229,72,77';
const en = (t, a, b) => t >= a && t < b;
const ocultar = (...els) => els.flat().forEach(e => e && off(e));
const entra = (t, t0, d = .45, e = E.back) => P(t, t0, d, e);
const corte = (i) => (FR[i][1] + FR[i + 1][0]) / 2;
function pasos(ini, ...cambios) {                        // fotogramas clave por cambios (cada uno dura d y termina en t)
  const k = [[0, { ...ini }]]; let v = { ...ini };
  for (const [t, c, d = .35] of cambios) {
    const t0 = Math.max(t - d, k[k.length - 1][0] + .01);
    k.push([t0, { ...v }], [Math.max(t, t0 + .01), { ...v, ...c }]); v = { ...v, ...c };
  }
  return norm(k);
}

/* ---------- vista 3D generica para quizzes de temas mezclados: cada pregunta dice que sistema se ve (grupos), su camara
   y que se enciende al revelar. QUIZ.vista = { grupos: { esq: [...] }, base: { el, hx, hy } }; en cada pregunta
   p.vista = { g: ['esq'], ocultar: [], cam: { az, el, d, f: [x, y, z] }, rev: { cam, piezas: { n: { g, a, r, o } }, ocultar, mostrar } } */
let _VM = null;
function vistaMixta(t, QT) {
  const V = QUIZ.vista, todas = [...new Set(Object.values(V.grupos).flat())];
  if (!_VM) {
    const cam = c => { const o = { ...c }; if (c.f) { [o.fx, o.fy, o.fz] = c.f; delete o.f; } return o; };
    const visibles = (v, extra = {}) => new Set(v.g.flatMap(g => V.grupos[g]).filter(n => !(v.ocultar || []).includes(n) && !(extra.ocultar || []).includes(n)).concat(extra.mostrar || []));
    const ck = [[0, { az: 0, el: 5, d: 2400, hx: 380, hy: 790, fx: 0, fy: -100, fz: 1200, ...V.base, ...cam(QT[0].vista.cam) }]];
    const pz = Object.fromEntries(todas.map(n => [n, []]));
    QT.forEach((p, i) => {
      const v = p.vista, c0 = { ...V.base, ...cam(v.cam) }, c1 = { ...c0, ...cam(v.rev?.cam || {}) }, giro = v.giro ?? 8;
      if (i) ck.push([p.ini + .02, {}, E.lin], [p.ini + .75, c0, E.io3]);       // quieta hasta que parte la pregunta
      ck.push([p.tr - .05, { az: c0.az + giro }, E.lin], [p.tr + .75, { ...c1, az: (c1.az ?? c0.az) + giro }, E.io3], [p.fin - .15, { az: (c1.az ?? c0.az) + giro * 2 }, E.lin]);
      const vis = visibles(v), rev = visibles(v, v.rev || {}), hl = v.rev?.piezas || {};
      todas.forEach(n => {
        if (i) pz[n].push([p.ini + .45, { o: vis.has(n) ? 1 : 0, g: 0, a: 0, r: 0 }, .45]);
        pz[n].push([p.tr + .35, { o: rev.has(n) ? 1 : 0, g: 0, a: 0, r: 0, ...(hl[n] || {}) }, .4]);
        if (hl[n]) pz[n].push([p.fin - .1, { g: 0, a: 0, r: 0 }, .3]);
      });
    });
    const v0 = visibles(QT[0].vista);
    _VM = { cam: norm(ck), K: Object.fromEntries(todas.map(n => [n, pasos({ o: v0.has(n) ? 1 : 0, g: 0, a: 0, r: 0 }, ...pz[n].sort((a, b) => a[0] - b[0]))])) };
  }
  const k = KF(t, _VM.cam), piezas = {};
  for (const n in _VM.K) { const v = KF(t, _VM.K[n]); piezas[n] = { o: v.o, g: v.g, a: v.a, r: v.r }; }
  return { az: k.az, el: k.el, d: k.d, roll: 0, fov: 26, hx: k.hx, hy: k.hy, ancla: [k.fx, k.fy, k.fz], piezas };
}

/* ---------- tiempos de cada pregunta (desde la voz alineada) ---------- */
const QT = QUIZ.preguntas.map((p, i) => {
  const ini = p.q === 0 ? 0 : corte(p.q - 1), c0 = FR[p.q][1] + .15;
  return { ...p, i, ini, tq: FR[p.q][0], c0, c1: c0 + QUIZ.cuenta, tr: FR[p.a][0] - .08, fin: p.a + 1 < FR.length ? corte(p.a) : CONFIG.dur };
});
const RET = QUIZ.retencion.map(r => ({ ...r, ini: corte(r.f - 1), fin: corte(r.f) }));
const CIE = { ini: corte(QUIZ.cierre[0] - 1), fin: CONFIG.dur + 1 };

/* ---------- fuentes e iconos ---------- */
css(`
@font-face{font-family:'Anton';font-weight:400;font-display:block;src:url(assets/fonts/anton.woff2) format('woff2')}
@font-face{font-family:'Inter';font-weight:400;font-display:block;src:url(assets/fonts/inter-latin-400-normal.woff2) format('woff2')}
@font-face{font-family:'Inter';font-weight:600;font-display:block;src:url(assets/fonts/inter-latin-600-normal.woff2) format('woff2')}
@font-face{font-family:'Inter';font-weight:700 900;font-display:block;src:url(assets/fonts/inter-latin-700-normal.woff2) format('woff2')}
`);
Object.assign(ICON, {
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
});

css(`
:root{--anton:'Anton',Impact,sans-serif}
.qz-chip{display:flex;align-items:center;gap:14px;height:66px;padding:0 28px 0 16px;border-radius:999px;background:rgba(8,10,8,.78);border:1.5px solid rgba(122,201,67,.75);
  font:600 25px var(--mono);letter-spacing:.14em;color:#fff;white-space:nowrap;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
.qz-chip img{height:36px;width:auto;display:block}
.qz-chip b{color:#9be060;font-weight:700}
.qz-q{width:960px;padding:30px 44px 38px;border-radius:34px;text-align:center;background:linear-gradient(180deg,rgba(28,33,26,.94),rgba(10,12,9,.95));
  border:1.5px solid rgba(122,201,67,.6);box-shadow:0 40px 90px -30px rgba(0,0,0,.95),0 0 60px rgba(122,201,67,.16)}
.qz-q .n{display:inline-flex;align-items:center;gap:10px;margin-bottom:14px;font:700 22px var(--mono);letter-spacing:.18em;text-transform:uppercase;color:#9be060}
.qz-q .n .dots{display:inline-flex;gap:7px;margin-left:6px}
.qz-q .n .dots i{width:12px;height:12px;border-radius:50%;background:rgba(255,255,255,.18)}
.qz-q .n .dots i.on{background:#7AC943;box-shadow:0 0 10px rgba(122,201,67,.9)}
.qz-q .n .dots i.ya{background:#4f8a26}
.qz-q .tx{font:800 54px/1.12 var(--sans);color:#fff;letter-spacing:-.01em}
.qz-q .dif{display:inline-flex;align-items:center;gap:10px;margin:0 0 14px;padding:8px 18px;border-radius:999px;background:rgba(229,72,77,.18);border:1.5px solid rgba(229,72,77,.8);
  font:700 22px var(--mono);letter-spacing:.14em;color:#ff8f92;text-transform:uppercase}
.qz-op{display:flex;align-items:center;gap:20px;width:500px;height:96px;padding:0 24px 0 18px;border-radius:26px;background:linear-gradient(180deg,rgba(30,35,28,.95),rgba(14,16,13,.96));
  border:2px solid rgba(255,255,255,.16);border-bottom-width:6px;border-bottom-color:rgba(0,0,0,.55);box-shadow:0 26px 50px -24px rgba(0,0,0,.95)}
.qz-op i{display:flex;align-items:center;justify-content:center;width:58px;height:58px;border-radius:50%;background:rgba(122,201,67,.14);border:2px solid rgba(122,201,67,.7);
  font:800 30px var(--sans);font-style:normal;color:#9be060;flex:none}
.qz-op span{font:800 38px/1.05 var(--sans);color:#fff;white-space:nowrap;letter-spacing:-.01em}
.qz-op.ok{background:linear-gradient(180deg,#a6e86c,#7AC943);border-color:#c9f5a2;border-bottom-color:#4f8a26;box-shadow:0 0 50px rgba(122,201,67,.6),0 26px 50px -24px rgba(0,0,0,.9)}
.qz-op.ok i{background:#0b0e0a;border-color:#0b0e0a;color:#9be060}
.qz-op.ok span{color:#0b0e0a}
.qz-op.mal{background:linear-gradient(180deg,rgba(80,24,26,.95),rgba(46,14,15,.96));border-color:rgba(229,72,77,.85);border-bottom-color:#5a1416}
.qz-op.mal i{background:#E5484D;border-color:#E5484D;color:#fff}
.qz-op.mal span{color:rgba(255,255,255,.62)}
.qz-tim{width:500px;height:22px;border-radius:11px;background:rgba(255,255,255,.12);box-shadow:inset 0 0 0 1px rgba(0,0,0,.4)}
.qz-tim i{position:absolute;left:0;top:0;bottom:0;border-radius:11px}
.qz-num{display:flex;align-items:center;justify-content:center;width:124px;height:124px;border-radius:50%;background:rgba(8,10,8,.86);border:5px solid #7AC943;
  font:400 76px var(--anton);color:#fff;box-shadow:0 0 40px rgba(122,201,67,.5),0 20px 40px -14px rgba(0,0,0,.9)}
.qz-dato{display:flex;align-items:center;gap:16px;width:520px;padding:16px 24px 18px 18px;border-radius:24px;background:linear-gradient(180deg,rgba(28,40,22,.95),rgba(14,20,11,.96));
  border:1.5px solid rgba(122,201,67,.8);box-shadow:0 0 40px rgba(122,201,67,.22),0 24px 50px -24px rgba(0,0,0,.9)}
.qz-dato svg{color:#9be060;flex:none}
.qz-dato span{font:800 30px/1.15 var(--sans);color:#fff}
.qz-big{display:flex;flex-direction:column;align-items:center;gap:18px;width:960px;padding:34px 44px 40px;border-radius:34px;text-align:center;
  background:linear-gradient(180deg,rgba(28,33,26,.94),rgba(10,12,9,.95));border:1.5px solid rgba(122,201,67,.6);box-shadow:0 40px 90px -30px rgba(0,0,0,.95),0 0 60px rgba(122,201,67,.16)}
.qz-big .tx{font:800 60px/1.08 var(--sans);color:#fff}
.qz-big .tx b{color:#9be060}
.qz-big .ic{display:flex;align-items:center;justify-content:center;width:150px;height:150px;border-radius:50%;background:radial-gradient(circle,#ff6b70,#d7333a 70%);color:#fff;
  box-shadow:0 0 60px rgba(229,72,77,.7)}
.qz-big .ic svg{fill:#fff}
.qz-aviso{display:flex;align-items:center;gap:14px;height:84px;padding:0 34px 0 24px;border-radius:999px;background:linear-gradient(180deg,rgba(90,22,24,.95),rgba(50,12,14,.96));
  border:2px solid rgba(229,72,77,.9);font:800 36px var(--sans);color:#fff;white-space:nowrap;box-shadow:0 0 50px rgba(229,72,77,.45)}
.qz-aviso svg{color:#ff8f92}
.qz-seguir{display:flex;align-items:center;justify-content:center;gap:14px;width:420px;height:110px;border-radius:30px;background:#0095f6;color:#fff;font:800 46px var(--sans);
  box-shadow:0 24px 60px -18px rgba(0,149,246,.85)}
.qz-seguir.on{background:#23272f;box-shadow:none;border:2px solid rgba(255,255,255,.2)}
.qz-url{display:flex;align-items:center;gap:16px;height:104px;padding:0 46px 0 34px;border-radius:999px;background:linear-gradient(180deg,#9be060,#7AC943);color:#0b0e0a;
  font:800 52px var(--sans);white-space:nowrap;box-shadow:0 0 50px rgba(122,201,67,.5)}
.qz-logo{width:420px}
.qz-logo img{width:100%;display:block;filter:drop-shadow(0 20px 40px rgba(0,0,0,.8)) drop-shadow(0 0 30px rgba(122,201,67,.25))}
.qz-profe{width:1024px;height:1536px}
.qz-profe img{position:absolute;left:0;top:0;width:1024px;height:1536px;display:block;opacity:0;transform:scaleX(-1)}
.qz-halo{width:760px;height:900px;border-radius:50%;background:radial-gradient(closest-side,rgba(122,201,67,.30),rgba(122,201,67,.08) 60%,rgba(122,201,67,0))}
.qz-suelo{width:520px;height:70px;border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.65),rgba(0,0,0,0))}
.qz-com .tx .w{font-size:48px!important}
.qz-com .tx .car{height:50px}
.qz-com .tx .ph{font-size:28px}
#c3d{position:absolute;left:0;top:0;width:1080px;height:1920px;z-index:3;pointer-events:none;display:none}
.ma-etq{padding:14px 24px 16px;border-radius:22px;background:linear-gradient(180deg,rgba(26,30,24,.92),rgba(12,14,11,.94));border:1.5px solid rgba(122,201,67,.7);
  box-shadow:0 30px 70px -24px rgba(0,0,0,.95),0 0 40px rgba(122,201,67,.22);text-align:left}
.ma-etq b{display:block;font:800 36px/1.08 var(--sans);color:#fff;white-space:nowrap;letter-spacing:-.01em}
.ma-etq b.v{color:#9be060}
.ma-etq small{display:block;margin-top:6px;font:600 19px var(--mono);letter-spacing:.12em;text-transform:uppercase;color:#a9b89c;white-space:nowrap}
.ma-ln{height:3px;border-radius:2px;background:linear-gradient(90deg,#7AC943,rgba(255,255,255,.9));box-shadow:0 0 12px rgba(122,201,67,.8)}
.ma-pt{width:22px;height:22px;border-radius:50%;background:#7AC943;border:4px solid #fff;box-shadow:0 0 22px rgba(122,201,67,.95)}
.ma-tag{display:flex;align-items:center;height:52px;padding:0 20px;border-radius:999px;font:700 23px var(--mono);letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;
  background:linear-gradient(180deg,#9be060,#7AC943);color:#0b0e0a;box-shadow:0 18px 40px -16px rgba(122,201,67,.7)}
.ma-tag.oro{background:linear-gradient(180deg,#ffe066,#F5C400)}
.ma-aro{border-radius:50%;border:5px solid #9be060;box-shadow:0 0 30px rgba(122,201,67,.8),inset 0 0 24px rgba(122,201,67,.45)}
.ma-cred{font:500 18px var(--mono);color:rgba(255,255,255,.55);white-space:nowrap;letter-spacing:.02em;text-shadow:0 2px 6px #000}
`);

/* ---------- etiqueta con linea a un punto del 3D ---------- */
class Etiqueta {
  constructor(html) { this.ln = mk('div', 'L ma-ln z6', WORLDF); this.pt = mk('div', 'L ma-pt z7', WORLDF); this.el = mk('div', 'L ma-etq z7', WORLDF, html); }
  pintar(o, a, c) {
    if (!(o > .002) || !a) { ocultar(this.el, this.ln, this.pt); return; }
    put(this.el, { x: c.x, y: c.y, s: lerp(.8, 1, E.back(clamp(o))), o: clamp(o * 2) });
    const dx = c.x - a.x, dy = c.y - a.y;
    this.ln.style.width = Math.hypot(dx, dy).toFixed(1) + 'px';
    put(this.ln, { x: a.x, y: a.y, ax: 0, ay: 50, r: Math.atan2(dy, dx) * 180 / Math.PI, sx: Math.max(.001, E.out3(clamp(o * 1.4))), o: clamp(o * 2) });
    put(this.pt, { x: a.x, y: a.y, s: lerp(.3, 1, E.back(clamp(o))), o: clamp(o * 2) });
  }
}

/* =====================================================================
   PERSONAJE: 7 caras de 1024x1536; se alinean por el centro de las piernas (CENTRO = x en la imagen, marca.json
   personaje_centro; si falta, 512). PRF = pie (bajo las rodillas) y escala en pantalla.
   ===================================================================== */
const CARAS = ['pregunta', 'piensa', 'sorpresa', 'celebra', 'fallo', 'like', 'espera'];
const CENTRO = Object.fromEntries(CARAS.map(c => [c, MARCA.personajeCentro[c] ?? 512]));
const PRF = { x: 850, y: 1500, s: .6 };                        // pie del profe (bajo las rodillas) y escala: borde derecho
const halo = mk('div', 'L qz-halo', WORLDF); halo.style.zIndex = 2;
const suelo = mk('div', 'L qz-suelo', WORLDF); suelo.style.zIndex = 2;
const profe = mk('div', 'L qz-profe', WORLDF, CARAS.map(c => `<img alt="" src="assets/marca/personaje/personaje-${c}.png" data-c="${c}" style="left:${CENTRO[c] - 512}px">`).join(''));
profe.style.zIndex = 4;
const IMG = Object.fromEntries([...profe.querySelectorAll('img')].map(i => [i.dataset.c, i]));
/* linea de caras: [t, cara] en orden (la arma el quiz); salto al cambiar */
const CARA_T = [[0, 'espera']];
const cara = (t, c) => CARA_T.push([t, c]);
QT.forEach(p => {
  cara(p.tq - .05, 'pregunta'); cara(p.c0 + .1, 'piensa'); cara(p.tr, p.cara || 'celebra');
});
RET.forEach(r => (r.caras || []).forEach(([k, c]) => cara(T[k] - .05, c)));
(QUIZ.carasCierre || []).forEach(([k, c]) => cara(T[k] - .05, c));
CARA_T.sort((a, b) => a[0] - b[0]);
CARA_T.slice(1).forEach(([t, c]) => sfx(t, c === 'celebra' ? 'subida' : 'pop', { vol: c === 'celebra' ? .35 : .3 }));
function caraEn(t) { let i = 0; while (i + 1 < CARA_T.length && CARA_T[i + 1][0] <= t) i++; return i; }
function habla(t) {                                          // 0..1 mientras dice una palabra (suave en los bordes)
  let lo = 0, hi = PAL.length - 1, k = -1;
  while (lo <= hi) { const m = (lo + hi) >> 1; if (PAL[m][0] <= t) { k = m; lo = m + 1; } else hi = m - 1; }
  if (k < 0) return 0;
  const [a, b] = PAL[k];
  return t > b + .06 ? 0 : clamp((t - a) / .05) * (1 - clamp((t - b) / .06));
}
function pintarProfe(t) {
  const pe = entra(t, .05, .55, E.spring), i = caraEn(t), [tc, c] = CARA_T[i], prev = i ? CARA_T[i - 1][1] : c;
  const f = clamp((t - tc) / .04);
  CARAS.forEach(k => { const o = k === c ? f : k === prev ? 1 - f : 0; const im = IMG[k]; if (im._o !== o) { im._o = o; im.style.opacity = o.toFixed(3); } });
  const salto = i ? bump(t, tc, .38) : 0, fiesta = c === 'celebra' ? bump(t, tc + .05, .5) : 0;
  const h = habla(t);
  const y = PRF.y - 24 * salto - 30 * fiesta - 5 * h * Math.abs(Math.sin(t * 13)) + (1 - pe) * 120;
  const r = 1.1 * Math.sin(t * .9) + .7 * h * Math.sin(t * 8.5);
  const sx = PRF.s * (1 + .006 * Math.sin(t * 2.2) + .035 * salto), sy = PRF.s * (1 + .01 * Math.sin(t * 2.2) - .02 * salto + .03 * fiesta);
  put(profe, { x: PRF.x + (1 - pe) * 520, y, ax: 50, ay: 100, r, sx, sy, o: clamp(pe * 3) });
  put(halo, { x: PRF.x, y: PRF.y - 520, s: 1 + .03 * Math.sin(t * 1.4), o: .9 * pe });
  put(suelo, { x: PRF.x, y: PRF.y + 8, sx: 1 - .1 * salto, o: .8 * pe });
}

/* =====================================================================
   CABECERA, PREGUNTA, OPCIONES, CUENTA REGRESIVA, DATO
   ===================================================================== */
const chip = mk('div', 'L qz-chip z7', WORLDF, `<img alt="" src="${MARCA.logo}"><span>QUIZ · <b>${QUIZ.tema.toUpperCase()}</b></span>`);
const N = QT.length;
const QX = { x: 540, y: 380 }, OPX = 330, OPY = [1072, 1186, 1300], TIMY = 1408;
const dots = i => `<span class="dots">${QT.map((_, k) => `<i class="${k === i ? 'on' : k < i ? 'ya' : ''}"></i>`).join('')}</span>`;
const QE = QT.map(p => {
  const card = mk('div', 'L qz-q z7', WORLDF, (p.i === N - 1 ? `<div class="dif">${icon('flame', 26, 2.4)}${QUIZ.textoDificil || 'La que casi nadie acierta'}</div><br>` : '') +
    `<div class="n">Pregunta ${p.i + 1}/${N}${dots(p.i)}</div><div class="tx">${p.texto}</div>`);
  const ops = p.ops.map((o, k) => mk('div', 'L qz-op z7', WORLDF, `<i>${'ABC'[k]}</i><span>${o}</span>`));
  const dato = mk('div', 'L qz-dato z7', WORLDF, `${icon('lightbulb', 40, 2.4)}<span>${p.dato}</span>`);
  sfx(p.ini + .05, 'aire', { vol: .5 }); ops.forEach((_, k) => sfx(p.tq + .35 + k * .12, 'tick-suave', { vol: .5 }));
  for (let s = 0; s < QUIZ.cuenta; s++) sfx(p.c0 + s, 'tick', { vol: .55 });
  sfx(p.tr, 'nota-doble', { vol: .85 }); sfx(p.tr + .02, 'golpe-corto', { vol: .5 });
  return { card, ops, dato };
});
const tim = mk('div', 'L qz-tim z7', WORLDF, '<i></i>'), timF = tim.querySelector('i');
const num = mk('div', 'L qz-num z8', WORLDF, '');
function escenaPregunta(t) {
  QT.forEach((p, i) => {
    const e = QE[i];
    if (!en(t, p.ini, p.fin)) { ocultar(e.card, e.ops, e.dato); return; }
    const q = P(t, p.fin - .34, .32, E.in3), pc = entra(t, p.ini + .02, .5, E.out4);
    put(e.card, { x: QX.x, y: QX.y - (1 - pc) * 40, s: lerp(.92, 1, pc) * (1 - .04 * q), o: clamp(pc * 2) * (1 - q), b: q * 6 });
    const rev = t >= p.tr;
    e.ops.forEach((el, k) => {
      const po = entra(t, p.tq + .3 + k * .12, .4, E.out4);
      const st = !rev ? '' : k === p.ok ? 'ok' : 'mal';
      if (el._st !== st) { el._st = st; el.className = 'L qz-op z7 ' + st; el.querySelector('i').innerHTML = st === 'ok' ? icon('check', 32, 3.6) : st === 'mal' ? icon('x', 30, 3.6) : 'ABC'[k]; }
      const pop = st === 'ok' ? bump(t, p.tr, .35) : 0, temb = st === 'mal' ? 8 * Math.sin((t - p.tr) * 40) * (1 - clamp((t - p.tr) / .35)) : 0;
      if (po > 0) put(el, { x: OPX + (1 - po) * 160 + temb, y: OPY[k], s: (1 + .06 * pop) * (st === 'mal' ? lerp(1, .96, P(t, p.tr, .3)) : 1), o: clamp(po * 2) * (1 - q) * (st === 'mal' ? lerp(1, .75, P(t, p.tr + .2, .4)) : 1) });
      else off(el);
    });
    const pd = entra(t, p.tr + .25, .45, E.back);
    if (pd > 0) put(e.dato, { x: OPX, y: TIMY, s: lerp(.7, 1, pd), o: clamp(pd * 2) * (1 - q) }); else off(e.dato);
  });
  /* cuenta regresiva */
  const p = QT.find(p => en(t, p.c0 - .3, p.tr + .25));
  if (!p) { ocultar(tim, num); return; }
  const ap = P(t, p.c0 - .3, .3, E.out3) * (1 - P(t, p.tr, .2, E.in3)), u = clamp((t - p.c0) / QUIZ.cuenta);
  put(tim, { x: OPX, y: TIMY, o: ap });
  timF.style.width = ((1 - u) * 100).toFixed(2) + '%';
  const col = u < .5 ? mix(VERDE.split(',').map(Number), [245, 196, 0], u * 2) : mix([245, 196, 0], [229, 72, 77], (u - .5) * 2);
  timF.style.background = col; timF.style.boxShadow = `0 0 16px ${col}`;
  const s = Math.max(1, Math.ceil(QUIZ.cuenta - (t - p.c0) - 1e-6)), ts = p.c0 + (QUIZ.cuenta - s);
  if (num._s !== s) { num._s = s; num.textContent = s; }
  num.style.borderColor = col;
  put(num, { x: 96, y: 590, s: (1 + .18 * bump(t, ts, .3)), o: ap });
}

/* =====================================================================
   3D: canvas de three.js; camara y piezas por pregunta en vista3D(t, QT) del quiz (HAY3D lo pone parche.py si el quiz
   tiene modelo.json). Sin 3D: una imagen por pregunta (p.imagen y, al revelar, p.imagenRev) y los puntos de etiquetas,
   tags y aros van en pixeles de pantalla: punto: [x, y].
   ===================================================================== */
let _h3dOk = null;
const H3D_LISTO = HAY3D ? new Promise((ok, mal) => { _h3dOk = ok; setTimeout(() => mal(new Error('el modelo 3D no cargo (assets/h3d.js)')), 30000); }) : Promise.resolve();
const punto = n => Array.isArray(n) ? { x: n[0], y: n[1] } : HAY3D ? H3D.punto(n) : { x: 380, y: 790 };
css(`.qz-img{width:560px;height:560px;border-radius:40px;overflow:hidden;background:#0b0e0a;border:2px solid rgba(122,201,67,.55);
  box-shadow:0 40px 90px -30px rgba(0,0,0,.95),0 0 60px rgba(122,201,67,.22)}
.qz-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}`);
const IMQ = QT.map(p => p.imagen ? mk('div', 'L qz-img z5', WORLDF, `<img alt="" src="${p.imagen}">` + (p.imagenRev ? `<img class="rv" alt="" src="${p.imagenRev}" style="opacity:0">` : '')) : null);
function escenaImagenes(t) {
  QT.forEach((p, i) => {
    const el = IMQ[i]; if (!el) return;
    if (!en(t, p.ini, p.fin)) { off(el); return; }
    const pe = entra(t, p.ini + .1, .55, E.back), q = P(t, p.fin - .34, .32, E.in3), rv = el.querySelector('.rv');
    if (rv) rv.style.opacity = P(t, p.tr, .25).toFixed(3);
    put(el, { x: 380, y: 790 + 8 * Math.sin(t * 1.3), s: lerp(.7, 1, pe) * (1 + .05 * bump(t, p.tr, .4)) * (1 - .06 * q), r: 1.2 * Math.sin(t * .8), o: clamp(pe * 2) * (1 - q), b: q * 6 });
  });
}
window.__h3dOk = v => _h3dOk(v);
const C3D = document.createElement('canvas'); C3D.id = 'c3d'; C3D.width = 1080; C3D.height = 1920;
WORLDF.appendChild(C3D);
const cred3 = mk('div', 'L ma-cred z7', WORLDF, QUIZ.credito || MARCA.credito3d || '');
const REV = QT.map(p => {
  const r = p.rev || {};
  return { et: (r.etiquetas || []).map(e => ({ ...e, el: new Etiqueta(e.html) })),
           tags: (r.tags || []).map(g => ({ ...g, el: mk('div', `L ma-tag${g.oro ? ' oro' : ''} z7`, WORLDF, g.texto) })),
           aros: (r.aros || []).map(a => { const el = mk('div', 'L ma-aro z6', WORLDF); el.style.width = el.style.height = (a.tam || 120) + 'px'; if (a.color) el.style.borderColor = a.color; return { ...a, el }; }) };
});
function escena3D(t) {
  const v = P(t, .1, .5, E.out2) * (1 - P(t, APP_A - .2, .35, E.in3));
  if (!HAY3D) { C3D.style.display = 'none'; off(cred3); escenaImagenes(t); if (!(v > .002)) return false; }
  else if (!(v > .002) || !window.H3D) { C3D.style.display = 'none'; off(cred3); return false; }
  else {
    C3D.style.display = 'block'; C3D.style.opacity = v.toFixed(3);
    H3D.pintar(vista3D(t, QT));
    put(cred3, { x: 44, y: 1470, ax: 0, o: .85 * v });
  }
  /* etiquetas, tags y aros de la revelacion */
  QT.forEach((p, i) => {
    const R0 = REV[i], vis = en(t, p.tr, p.fin), q = P(t, p.fin - .34, .32, E.in3);
    if (!vis) { R0.et.forEach(e => e.el.pintar(0)); ocultar(R0.tags.map(g => g.el), R0.aros.map(a => a.el)); return; }
    R0.et.forEach(e => { const a = punto(e.punto); e.el.pintar(P(t, p.tr + (e.d || .15), .45) * (1 - q), a, { x: clamp(a.x + (e.dx ?? 0), 170, 640), y: clamp(a.y + (e.dy ?? -200), 520, 1000) }); });
    R0.tags.forEach((g, k) => {
      const a = punto(g.punto), pg = entra(t, p.tr + .15 + k * (g.paso ?? .12), .35);
      if (pg > 0) put(g.el, { x: clamp(a.x + (g.dx ?? 0), 100, 700), y: a.y + (g.dy ?? 0), s: lerp(.5, 1, pg), o: clamp(pg * 2) * (1 - q) }); else off(g.el);
    });
    R0.aros.forEach(a => {
      const pt = punto(a.punto), pa = entra(t, p.tr + .1, .45), lat = a.late ? 1 + .12 * Math.abs(Math.sin((t - p.tr) * 4.5)) : 1 + .05 * Math.sin(t * 7);
      if (pa > 0) put(a.el, { x: pt.x, y: pt.y, s: lerp(.4, 1, pa) * lat, o: clamp(pa * 2) * (1 - q) }); else off(a.el);
    });
  });
  return true;
}

/* =====================================================================
   RETENCION: like + "casi nadie acierta la ultima" / sigueme
   ===================================================================== */
const RE = RET.map(r => {
  const o = { r };
  if (r.tipo === 'like') {
    o.big = mk('div', 'L qz-big z7', WORLDF, `<div class="ic">${icon('heart', 92, 2)}</div><div class="tx">${r.texto}</div>`);
    o.ic = o.big.querySelector('.ic');
    o.av = mk('div', 'L qz-aviso z7', WORLDF, `${icon('triangleAlert', 40, 2.6)}<span>${r.aviso}</span>`);
    sfx(T[r.tLike] - .05, 'notificacion', { vol: .7 }); sfx(T[r.tAviso] - .05, 'impacto', { vol: .55 });
  } else {
    o.big = mk('div', 'L qz-big z7', WORLDF, `<div class="tx">${r.texto}</div>`);
    o.seg = mk('div', 'L qz-seguir z7', WORLDF, `${icon('plus', 44, 3)}<span>Seguir</span>`);
    o.tClic = T[r.tSigue] + .55;
    o.cur = new Cursor(norm([[T[r.tSigue] - .1, { x: 160, y: 1460, o: 0 }], [T[r.tSigue] + .15, { o: 1 }, E.out3], [o.tClic - .05, { x: 360, y: 1205 }, E.io3], [o.tClic + .45, {}], [o.tClic + .7, { o: 0 }]]), { clics: [o.tClic] });
    sfx(o.tClic + .05, 'nota', { vol: .7 });
  }
  return o;
});
function escenaRetencion(t) {
  RE.forEach(o => {
    const r = o.r;
    if (!en(t, r.ini, r.fin)) { ocultar(o.big, o.av, o.seg); o.cur?.pintar(-1); return; }
    const q = P(t, r.fin - .34, .32, E.in3), pb = entra(t, r.ini + .03, .5, E.back);
    put(o.big, { x: QX.x, y: QX.y + 20 + (1 - pb) * 40, s: lerp(.85, 1, pb) * (1 - .04 * q), o: clamp(pb * 2) * (1 - q), b: q * 6 });
    if (r.tipo === 'like') {
      const pl = bump(t, T[r.tLike], .4);
      o.ic.style.transform = `scale(${(1 + .25 * pl + .05 * Math.sin(t * 6)).toFixed(3)})`;
      const pa = entra(t, T[r.tAviso] - .1, .45);
      if (pa > 0) put(o.av, { x: OPX, y: 1186 + 12 * Math.sin((t - T[r.tAviso]) * 30) * (1 - clamp((t - T[r.tAviso]) / .4)), s: lerp(.6, 1, pa), o: clamp(pa * 2) * (1 - q) }); else off(o.av);
    } else {
      const ps = entra(t, T[r.tSigue] - .05, .45), on = t >= o.tClic;
      if (o.seg._on !== on) { o.seg._on = on; o.seg.classList.toggle('on', on); o.seg.innerHTML = `${icon(on ? 'check' : 'plus', 44, 3)}<span>${on ? 'Siguiendo' : 'Seguir'}</span>`; }
      if (ps > 0) put(o.seg, { x: OPX, y: 1200, s: lerp(.6, 1, ps) * (1 - .08 * bump(t, o.tClic, .2)), o: clamp(ps * 2) * (1 - q) }); else off(o.seg);
      o.cur.pintar(t);
    }
  });
}

/* =====================================================================
   CIERRE: «Comenta cuantas acertaste» (comentario que se escribe) y luego el telefono con tu app (comun/telefono.js)
   mientras la voz dice «entra a tumarca.com».
   ===================================================================== */
const CI = QUIZ.cierreDatos;
const APP_A = T[CI.tApp || CI.tEnvia] - .15, APP_W = T[CI.tWeb], APP_B = CONFIG.dur + 1;
const com = new Comentario({ palabra: CI.palabra, etiqueta: 'COMENTA', t0: CIE.ini + .05, tEscribe: T[CI.tEscribe], tEnvia: T[CI.tEnvia] - .25, textoEnviado: CI.enviado, ancho: 680 });
com.el.classList.add('qz-com');
const TEL = telefono({ a: APP_A, b: APP_B, tWeb: APP_W, x: 380, y: 905, s: .76, logo: { x: 540, y: 300 }, url: { x: 380, y: 1418 } });
const escenaApp = t => TEL.pintar(t);
const bigC = mk('div', 'L qz-big z7', WORLDF, `<div class="tx">${CI.texto}</div>`);
function escenaCierre(t) {
  if (t < CIE.ini) { com.pintar(t, { o: 0 }); ocultar(bigC); escenaApp(t); return; }
  const pb = entra(t, CIE.ini + .03, .5, E.back), q = P(t, APP_A - .3, .3, E.in3);
  if (q < 1) put(bigC, { x: QX.x, y: QX.y + 20 + (1 - pb) * 40, s: lerp(.85, 1, pb), o: clamp(pb * 2) * (1 - q) }); else off(bigC);
  com.pintar(t, { x: 380, y: 1150, o: 1 - q });
  escenaApp(t);
}

/* =====================================================================
   BARRA DE AVANCE (retencion): rapida al inicio, lenta al final, con la cabeza de la marca en la punta
   ===================================================================== */
css(`
.ma-barra{width:840px;height:12px;border-radius:6px;background:rgba(255,255,255,.16);box-shadow:0 0 0 1px rgba(0,0,0,.35),0 6px 18px rgba(0,0,0,.5)}
.ma-barra i{position:absolute;left:0;top:0;bottom:0;border-radius:6px;background:linear-gradient(90deg,#4f8a26,#7AC943 70%,#c9f5a2);box-shadow:0 0 16px rgba(122,201,67,.85)}
.ma-cabeza{width:80px;height:80px;border-radius:50%;overflow:hidden;border:3px solid #7AC943;background:#0b0e0a;box-shadow:0 0 22px rgba(122,201,67,.8),0 8px 18px rgba(0,0,0,.6)}
.ma-cabeza img{width:100%;height:100%;object-fit:cover;display:block}
`);
const BARRA = { x0: 80, w: 840, y: 1515 };
const barraAv = mk('div', 'L ma-barra', STAGE, '<i></i>'); barraAv.style.zIndex = 70;
const barraF = barraAv.querySelector('i');
const cabezaAv = mk('div', 'L ma-cabeza', STAGE, `<img alt="" src="${MARCA.cabeza || MARCA.logo}">`); cabezaAv.style.zIndex = 71;
const avance = t => Math.log(1 + 18 * clamp(t / CONFIG.dur)) / Math.log(19);
function escenaBarra(t) {
  const pe = P(t, .15, .5, E.out3), p = avance(t);
  put(barraAv, { x: BARRA.x0, y: BARRA.y, ax: 0, o: pe });
  barraF.style.width = (p * 100).toFixed(3) + '%';
  put(cabezaAv, { x: BARRA.x0 + p * BARRA.w, y: BARRA.y - 2 + 2.5 * Math.sin(t * 5), r: 6 * Math.sin(t * 3), s: lerp(.5, 1, pe), o: pe });
}

/* ---------- fondo limpio (negro con halos del color de la marca y un toque oro) y render ---------- */
const CAMK = norm([[0, { x: CX, y: CY, s: 1 }]]);
const ENTRADAS = [...QT.map(p => p.ini).filter(x => x > 0), ...RET.map(r => r.ini), CIE.ini];
function layout() {}
function estadoVideo(t) { return { fondo: 1, persona: 0, halo: 0 }; }
class FondoLimpio extends FondoBase {
  pintar(t, { dx = 0, dy = 0 } = {}) {
    const x = this.preparar(), W = this.W, H = this.H, br = KF(t, this.k).brillo * (1 + .35 * this.onda(t));
    const gb = x.createLinearGradient(0, 0, 0, H);
    gb.addColorStop(0, '#0a0d09'); gb.addColorStop(.5, '#070906'); gb.addColorStop(1, '#040504');
    x.globalCompositeOperation = 'source-over'; x.fillStyle = gb; x.fillRect(0, 0, W, H);
    const halo = (gx, gy, r, rgb, al) => {
      const g = x.createRadialGradient(gx, gy, 0, gx, gy, r);
      g.addColorStop(0, `rgba(${rgb},${al.toFixed(3)})`); g.addColorStop(.55, `rgba(${rgb},${(al * .32).toFixed(3)})`); g.addColorStop(1, `rgba(${rgb},0)`);
      x.fillStyle = g; x.fillRect(gx - r, gy - r, 2 * r, 2 * r);
    };
    x.globalCompositeOperation = 'lighter';
    halo(W * .64 + dx * .06, H * .4 + dy * .04, 900, '151,206,76', .12 * (.9 + .1 * Math.sin(t * .8)) * br);
    halo(W * .1, H * .05, 640, VERDE, .07 * br);
    halo(W * .9, H * .97, 780, ORO, .05);
    x.globalCompositeOperation = 'source-over';
  }
}
const ESPACIO = new FondoLimpio(norm([[0, { vel: 26, brillo: 1 }]]), { ondas: ENTRADAS });
function render(t) {
  let cam = KF(t, CAMK);
  for (const e of ENTRADAS) if (t >= e && t < e + .6) cam = { ...cam, s: cam.s * (1 + .03 * (1 - P(t, e, .55, E.out4))) };
  const dx = -(cam.x - CX) * cam.s, dy = -(cam.y - CY) * cam.s;
  WORLD.style.transform = WORLDF.style.transform = `translate(${dx.toFixed(2)}px,${dy.toFixed(2)}px) scale(${cam.s.toFixed(5)})`;
  pintarCapas(t, estadoVideo(t));
  ESPACIO.pintar(t, { dx, dy });
  grid.style.opacity = 0; glowN.style.opacity = 0; glowA.style.opacity = 0; glowB.style.opacity = 0;
  const pc = entra(t, .05, .45, E.out4);
  put(chip, { x: CX, y: 196 - (1 - pc) * 20, s: lerp(.9, 1, pc), o: pc });
  escena3D(t);
  pintarProfe(t);
  escenaPregunta(t);
  escenaRetencion(t);
  escenaCierre(t);
  escenaBarra(t);
  for (const p of PULSES) {
    const k = (t - p.t0) / p.dur;
    if (k <= 0 || k >= 1) off(p.e);
    else put(p.e, { x: p.x, y: p.y, s: lerp(1, p.to, E.out3(k)), o: .8 * (1 - E.out2(k)) });
  }
}
