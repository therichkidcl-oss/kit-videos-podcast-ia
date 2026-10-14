/* =====================================================================
   6 · TRES TIPS [X5, X6] — el personaje en busto arriba (MARCA.busto) y tres tarjetas que entran cuando la voz dice cada
   tip (TIPS en config.js).
   ===================================================================== */
const TIT6 = titulo(T3(...(typeof TIPS_TITULO !== 'undefined' ? TIPS_TITULO : ['Tres', 'tips']), 120), X5 + .05, X6);   // TIPS_TITULO opcional en config.js
const busto6 = mk('div', 'L ma-busto z6', WORLDF, `<i class="halo"></i><img alt="" src="${MARCA.busto || MARCA.logo}">`);
const TIP6 = TIPS.map(([ic, a, b, t0], i) => ({ el: mk('div', 'L ma-kine z7', WORLDF, `<i>${icon(ic, 52, 2.4)}</i><span><b>${a}</b><small>${b}</small></span>`), t0: t0 - .1 }));
TIP6.forEach(c => { c.el.style.width = '880px'; c.el.querySelector('b').style.fontSize = '42px'; });
sfx(X5 + .1, 'aire', { vol: .6 }); TIP6.forEach(c => sfx(c.t0 + .02, 'pop', { vol: .6 }));
function escena6(t) {
  pintarTitulo(TIT6, t);
  if (!en(t, X5, X6)) { ocultar(busto6, TIP6.map(c => c.el)); return; }
  const q = salida(t, X6), pb = entra(t, X5 + .04, .55, E.spring);
  put(busto6, { x: CX, y: 640 + (1 - pb) * 160 + flota(t, 0, 4), s: .62 * lerp(.7, 1, pb) * (1 - .06 * q), o: clamp(pb * 3) * (1 - q), b: q * 8 });
  TIP6.forEach((c, i) => {
    const p = entra(t, c.t0, .45, E.out4);
    if (p > 0) put(c.el, { x: CX + (1 - p) * 160, y: 930 + i * 170, s: lerp(.92, 1, p), o: clamp(p * 2) * (1 - q), b: q * 6 }); else off(c.el);
  });
}

/* =====================================================================
   7 · LA APP [X6, X7] — telefono con las capturas de tu app (comun/telefono.js, MARCA.app) mientras la voz dice
   «entra a tumarca.com»: logo arriba y la URL en grande cuando la nombra (T.web).
   ===================================================================== */
const TEL7 = telefono({ a: X6, b: X7, tWeb: T.web, x: CX, y: 895, s: .9, logo: { x: CX, y: 245 }, url: { x: CX, y: 1418 }, salida: t => salida(t, X7) });
function escena7(t) { TEL7.pintar(t); }

/* =====================================================================
   8 · CIERRE [X7, fin] — «Comenta MARCA» (MARCA.palabraClave) + comentario que se escribe + mensaje con el link + «Sigueme».
   ===================================================================== */
const rot8 = new Rotulo(['Comenta', `«${MARCA.palabraClave}»`], { acento: [1], tiempos: [Math.max(X7 + .03, T.comenta - .02), T.clave8 - .04], tam: 120 });
const com8 = new Comentario({ palabra: MARCA.palabraClave, etiqueta: 'COMENTA', t0: X7 + .05, tEscribe: T.clave8 - .04, tEnvia: T.mando - .1, textoEnviado: '✓ Te mando el link' });
const dm8 = mk('div', 'L ma-dm z7', WORLDF, `<img alt="" src="${MARCA.logo}"><span><b>${MARCA.dm.titulo}</b><small>${MARCA.dm.sub}</small></span>`);
const seguir8 = mk('div', 'L seguir z7', WORLDF, `${icon('plus', 46, 3)}<span>Seguir</span>`);
const SEG_T = Math.min(T.mas8 + .3, CONFIG.dur - .6);
const cur8 = new Cursor(norm([[T.sigueme - .05, { x: 880, y: 1600, o: 0 }], [T.sigueme + .2, { o: 1 }, E.out3], [SEG_T - .05, { x: 640, y: 1385 }, E.io3], [SEG_T + .5, {}], [SEG_T + .8, { o: 0 }]]), { clics: [SEG_T] });
sfx(T.gratis - .06, 'notificacion', { vol: .8 }); sfx(SEG_T + .06, 'nota', { vol: .8 });
function escenaCierre(t) {
  if (t < X7) { rot8.pintar(t, { o: 0 }); com8.pintar(t, { o: 0 }); ocultar(dm8, seguir8); cur8.pintar(-1); return; }
  rot8.pintar(t, { x: CX, y: 400 });
  com8.pintar(t, { y: 790 });
  const pd = P(t, T.gratis - .08, .45, E.back);
  if (pd > 0) put(dm8, { x: CX, y: 1090, s: lerp(.6, 1, pd), o: clamp(pd * 2) }); else off(dm8);
  const ps = P(t, T.sigueme - .08, .4, E.back);
  if (ps > 0) {
    const on = t >= SEG_T;
    if (seguir8._on !== on) { seguir8._on = on; seguir8.classList.toggle('on', on); seguir8.innerHTML = `${icon(on ? 'check' : 'plus', 46, 3)}<span>${on ? 'Siguiendo' : 'Seguir'}</span>`; }
    put(seguir8, { x: CX, y: 1340, s: lerp(.6, 1, ps) * (1 - .08 * bump(t, SEG_T, .2)), o: clamp(ps * 2) });
  } else off(seguir8);
  cur8.pintar(t);
}

/* =====================================================================
   BARRA DE AVANCE (retencion), abajo durante todo el video: avanza rapido al inicio y frena al final (parece que ya
   termina, pero llega lento): p = log(1 + 18u) / log(19). En la punta va la cabeza de la marca (MARCA.cabeza).
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

const CAMK = norm([[0, { x: CX, y: CY, s: 1 }]]);
const ENTRADAS = [X0, X1, X2, X3, X5, X6, X7];
function layout() {}
function estadoVideo(t) { return { fondo: 1, persona: 0, halo: 0 }; }

/* FONDO LIMPIO: negro con halos del color de la marca y un toque oro */
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
    halo(W * .5 + dx * .06, H * .45 + dy * .04, 1000, '151,206,76', .12 * (.9 + .1 * Math.sin(t * .8)) * br);
    halo(W * .1, H * .03, 640, VERDE, .08 * br);
    halo(W * .9, H * .97, 780, ORO, .05);
    x.globalCompositeOperation = 'source-over';
  }
}
const FONDOK = norm([[0, { vel: 26, brillo: 1 }]]);
const ESPACIO = new FondoLimpio(FONDOK, { ondas: ENTRADAS });

function render(t) {
  PEND.length = 0;
  let cam = KF(t, CAMK);
  for (const e of ENTRADAS) if (t >= e && t < e + .6) cam = { ...cam, s: cam.s * (1 + .04 * (1 - P(t, e, .55, E.out4))) };
  const dx = -(cam.x - CX) * cam.s, dy = -(cam.y - CY) * cam.s;
  WORLD.style.transform = WORLDF.style.transform = `translate(${dx.toFixed(2)}px,${dy.toFixed(2)}px) scale(${cam.s.toFixed(5)})`;
  pintarCapas(t, estadoVideo(t));
  if (ESPACIO) ESPACIO.pintar(t, { dx, dy });
  grid.style.opacity = 0; glowN.style.opacity = 0; glowA.style.opacity = 0; glowB.style.opacity = 0;
  escenaAvatar(t);
  escena0(t);
  const hay3D = escena3D(t);
  if (hay3D && VIS3 > .05) put(cred3, { x: CX, y: 1452, o: .9 * VIS3 * (1 - salida(t, X4)) }); else off(cred3);
  escena1(t, hay3D); escena2(t, hay3D); escena3(t, hay3D); escena4(t, hay3D);
  escenaClimax(t);
  escena6(t); escena7(t);
  escenaCierre(t);
  escenaBarra(t);
  for (const p of PULSES) {
    const k = (t - p.t0) / p.dur;
    if (k <= 0 || k >= 1) off(p.e);
    else put(p.e, { x: p.x, y: p.y, s: lerp(1, p.to, E.out3(k)), o: .8 * (1 - E.out2(k)) });
  }
}

