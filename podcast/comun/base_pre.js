/* =====================================================================
   BASE COMUN del FORMATO PODCAST. Orden en index.html (lo arma parche.py): MARCA + HAY3D + epN/config.js (INTRO, TRES,
   TIPS) + base_pre.js + epN/escenas.js (EP3D) + declarativo.js + comun/telefono.js + base_post.js.
   Frases: 0 gancho (presentador) · 1-4 explicacion (3D o imagenes) · 5 climax (presentador + dato) · 6 tres tips ·
   7 la app («entra a tumarca.com») · 8 cierre («Comenta MARCA» + sigueme). Los verdes se pintan con el color de la marca.
   Regla: nada se encima en las transiciones (cortes a mitad de cada pausa entre frases).
   ===================================================================== */
const grid = $('grid'), glowN = $('glowN'), glowA = $('glowA'), glowB = $('glowB');
const CORTE = i => (FR[i][1] + FR[i + 1][0]) / 2;
/* frases: 0 intro · 1-4 animacion · 5 climax · 6 kinesiologo · 7 app · 8 cierre */
const X0 = CORTE(0), X1 = CORTE(1), X2 = CORTE(2), X3 = CORTE(3), X4 = CORTE(4), X5 = CORTE(5), X6 = CORTE(6), X7 = CORTE(7);
const SAL = .32;
const VERDE = '122,201,67', ORO = '245,196,0', ROJO = '229,72,77';
const MARCAS = /*MARCAS*/{}/*FIN*/;                        // inicio del climax en la voz (para el lipsync)

const en = (t, a, b) => t >= a && t < b;
const flota = (t, i = 0, a = 5) => a * Math.sin(t * 1.1 + i * 1.9);
const ocultar = (...els) => els.flat().forEach(e => e && off(e));
function pop(el, p, desde = .5) { el.style.opacity = clamp(p * 2).toFixed(3); el.style.transform = `scale(${lerp(desde, 1, E.back(clamp(p))).toFixed(4)})`; }
const vis = (el, o) => { el.style.opacity = clamp(o).toFixed(3); };
const salida = (t, b) => P(t, b - SAL - .02, SAL, E.in3);    // el bloque sale entero antes del corte b
const entra = (t, t0, d = .45, e = E.back) => P(t, t0, d, e);

/* ---------- fuentes de la app e iconos que faltan (lucide) ---------- */
css(`
@font-face{font-family:'Anton';font-weight:400;font-display:block;src:url(assets/fonts/anton.woff2) format('woff2')}
@font-face{font-family:'Inter';font-weight:400;font-display:block;src:url(assets/fonts/inter-latin-400-normal.woff2) format('woff2')}
@font-face{font-family:'Inter';font-weight:600;font-display:block;src:url(assets/fonts/inter-latin-600-normal.woff2) format('woff2')}
@font-face{font-family:'Inter';font-weight:700 900;font-display:block;src:url(assets/fonts/inter-latin-700-normal.woff2) format('woff2')}
`);
Object.assign(ICON, {
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  house: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  crosshair: '<circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/>',
  stethoscope: '<path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/>',
  messageCircle: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  shirt: '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
});
/* ---------- clips (JPG a 30 fps): el presentador de HeyGen. Sin clips (n = 0) se usa la foto MARCA.presentador quieta
   con un zoom lento (sirve para probar sin gastar HeyGen). ---------- */
const CLIPS = /*CLIPS*/{}/*FIN*/;
const PEND = [];
const fotoClip = (c, k) => `assets/clips/${c}/f${String(k).padStart(4, '0')}.jpg`;
function verClip(img, c, t, t0) {
  const m = CLIPS[c];
  if (!m || !m.n) {
    if (img._src !== MARCA.presentador) { img._src = MARCA.presentador; img.src = MARCA.presentador; }
    img.style.transform = `scale(${(1 + .03 * (t - t0)).toFixed(4)})`; PEND.push(img); return;
  }
  const k = Math.min(m.n - 1, Math.max(0, Math.floor((t - t0) * m.fps + 1e-6)));
  const src = fotoClip(c, k + 1);
  if (img._src !== src) { img._src = src; img.src = src; }
  PEND.push(img);
}

/* ---------- etiqueta con linea al punto del 3D ---------- */
class Etiqueta {
  constructor(html, cls = '') {
    this.ln = mk('div', 'L ma-ln z6', WORLDF); this.pt = mk('div', 'L ma-pt z7', WORLDF);
    this.el = mk('div', `L ma-etq z7 ${cls}`, WORLDF, html);
  }
  pintar(o, a, c) {
    if (!(o > .002) || !a) { ocultar(this.el, this.ln, this.pt); return; }
    put(this.el, { x: c.x, y: c.y, s: lerp(.8, 1, E.back(clamp(o))), o: clamp(o * 2) });
    const dx = c.x - a.x, dy = c.y - a.y;
    this.ln.style.width = Math.hypot(dx, dy).toFixed(1) + 'px';
    put(this.ln, { x: a.x, y: a.y, ax: 0, ay: 50, r: Math.atan2(dy, dx) * 180 / Math.PI, sx: Math.max(.001, E.out3(clamp(o * 1.4))), o: clamp(o * 2) });
    put(this.pt, { x: a.x, y: a.y, s: lerp(.3, 1, E.back(clamp(o))), o: clamp(o * 2) });
  }
}

css(`
:root{--anton:'Anton',Impact,sans-serif;--inter:'Inter',system-ui,sans-serif}
/* titulos 3D (skill animacion-app-promo): Impact, linea 1 cromo con extrusion, linea 2 color de la marca metalizado con glow */
.t3d{font-family:Impact,'Haettenschweiler','Arial Narrow Bold',sans-serif;font-weight:400;line-height:.95;letter-spacing:.012em;text-transform:uppercase;white-space:nowrap;text-align:center}
.t3d .cr,.t3d .vd{display:block;color:transparent;-webkit-background-clip:text;background-clip:text}
.t3d .cr{background-image:linear-gradient(180deg,#ffffff 0%,#e3e6eb 36%,#80868f 50%,#f0f2f5 63%,#a6adb7 100%);
  filter:drop-shadow(0 0 16px rgba(0,0,0,.9)) drop-shadow(0 2px 0 #50555d) drop-shadow(0 3px 0 #2e3137) drop-shadow(0 5px 0 #17191c) drop-shadow(0 20px 30px rgba(0,0,0,.7))}
.t3d .vd{background-image:linear-gradient(180deg,#eaffd6 0%,#8fdb55 40%,#4a8a22 56%,#b2ef80 72%,#74c43e 100%);
  filter:drop-shadow(0 0 16px rgba(0,0,0,.9)) drop-shadow(0 2px 0 #3c6b1b) drop-shadow(0 3px 0 #2a4d12) drop-shadow(0 5px 0 #15280a) drop-shadow(0 0 34px rgba(122,201,67,.55))}
.pill{display:flex;align-items:center;gap:14px;height:84px;padding:0 34px 0 26px;border-radius:999px;background:rgba(8,10,8,.86);border:2px solid rgba(122,201,67,.8);
  font:800 34px var(--sans);color:#fff;white-space:nowrap;box-shadow:0 24px 60px -20px rgba(0,0,0,.9),0 0 40px rgba(122,201,67,.28);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
.pill svg{color:#9be060}
.pill.llena{background:linear-gradient(180deg,#9be060,#7AC943);border-color:transparent;color:#0b0e0a}
.pill.llena svg{color:#0b0e0a}
.insig{display:flex;align-items:center;gap:14px;height:68px;padding:0 30px 0 18px;border-radius:999px;background:rgba(8,10,8,.76);border:1.5px solid rgba(122,201,67,.75);
  font:600 26px var(--mono);letter-spacing:.14em;color:#fff;white-space:nowrap;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
.insig img{height:38px;width:auto;display:block}
.pres{overflow:hidden;background:#000;z-index:0}
.pres img{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;object-position:50% 30%;display:block}
.pres .sombra{position:absolute;left:0;right:0;bottom:0;height:55%;background:linear-gradient(to bottom,rgba(5,6,5,0),rgba(5,6,5,.85))}
#c3d{position:absolute;left:0;top:0;width:1080px;height:1920px;z-index:3;pointer-events:none;display:none}
.ma-etq{padding:16px 26px 18px;border-radius:22px;background:linear-gradient(180deg,rgba(26,30,24,.92),rgba(12,14,11,.94));border:1.5px solid rgba(122,201,67,.7);
  box-shadow:0 30px 70px -24px rgba(0,0,0,.95),0 0 40px rgba(122,201,67,.22);text-align:left;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
.ma-etq b{display:block;font:800 40px/1.08 var(--sans);color:#fff;white-space:nowrap;letter-spacing:-.01em}
.ma-etq b.v{color:#9be060}
.ma-etq small{display:block;margin-top:8px;font:600 20px var(--mono);letter-spacing:.12em;text-transform:uppercase;color:#a9b89c;white-space:nowrap}
.ma-ln{height:3px;border-radius:2px;background:linear-gradient(90deg,#7AC943,rgba(255,255,255,.9));box-shadow:0 0 12px rgba(122,201,67,.8)}
.ma-pt{width:24px;height:24px;border-radius:50%;background:#7AC943;border:4px solid #fff;box-shadow:0 0 22px rgba(122,201,67,.95)}
.ma-aro{border-radius:50%;border:5px solid #9be060;box-shadow:0 0 30px rgba(122,201,67,.8),inset 0 0 24px rgba(122,201,67,.45)}
.ma-base{height:12px;border-radius:6px;background:linear-gradient(90deg,#7AC943,#fff,#7AC943);box-shadow:0 0 26px rgba(122,201,67,.95)}
.ma-tag{display:flex;align-items:center;height:58px;padding:0 22px;border-radius:999px;font:700 26px var(--mono);letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;
  background:linear-gradient(180deg,#9be060,#7AC943);color:#0b0e0a;box-shadow:0 18px 40px -16px rgba(122,201,67,.7)}
.ma-tag.osc{background:rgba(0,0,0,.7);color:#c9f0a6;border:1.5px solid rgba(122,201,67,.6);box-shadow:none}
.ma-cred{font:500 19px var(--mono);color:rgba(255,255,255,.62);white-space:nowrap;letter-spacing:.02em;text-shadow:0 2px 6px #000}
.ma-anal{width:600px;height:700px}
.ma-img{width:700px;height:700px;border-radius:44px;overflow:hidden;background:#0b0e0a;border:2px solid rgba(122,201,67,.55);
  box-shadow:0 40px 90px -30px rgba(0,0,0,.95),0 0 60px rgba(122,201,67,.22)}
.ma-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.ma-fila{display:flex;align-items:center;gap:22px;width:820px;height:78px;padding:0 26px 0 12px;border-radius:20px;background:rgba(16,18,24,.88);border:1.5px solid rgba(255,255,255,.12);
  box-shadow:0 24px 50px -24px rgba(0,0,0,.9)}
.ma-fila .ini{display:flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:14px;background:rgba(122,201,67,.16);border:1.5px solid rgba(122,201,67,.6);
  font:800 34px var(--sans);color:#9be060;font-style:normal;flex:none}
.ma-fila span{font:800 38px var(--sans);color:#fff;white-space:nowrap;letter-spacing:-.01em}
.ma-fila span small{font:600 20px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:#8e9a86;margin-left:14px}
.ma-fila.on{border-color:rgba(122,201,67,.9);background:linear-gradient(180deg,rgba(40,58,30,.95),rgba(20,30,15,.95));box-shadow:0 0 40px rgba(122,201,67,.35)}
.ma-fila.on .ini{background:#7AC943;color:#0b0e0a;border-color:transparent}
.ma-letra{display:flex;align-items:center;justify-content:center;width:160px;height:180px;border-radius:28px;background:linear-gradient(180deg,rgba(30,34,28,.92),rgba(12,14,11,.94));
  border:1.5px solid rgba(122,201,67,.7);box-shadow:0 30px 60px -20px rgba(0,0,0,.9),0 0 40px rgba(122,201,67,.3)}
.ma-flecha{color:#9be060;filter:drop-shadow(0 0 16px rgba(122,201,67,.9)) drop-shadow(0 4px 8px rgba(0,0,0,.6))}
.ma-card{border-radius:30px;background:linear-gradient(180deg,rgba(26,30,24,.94),rgba(10,12,9,.96));border:1.5px solid rgba(122,201,67,.55);
  box-shadow:0 40px 100px -24px rgba(0,0,0,.95),0 0 60px rgba(122,201,67,.18)}
.ma-busto{width:500px;height:486px}
.ma-busto img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:block;filter:drop-shadow(0 30px 40px rgba(0,0,0,.6))}
.ma-busto .halo{position:absolute;left:-14%;top:-10%;width:128%;height:120%;border-radius:50%;background:radial-gradient(closest-side,rgba(122,201,67,.45),rgba(122,201,67,.12) 60%,rgba(122,201,67,0))}
.ma-kine{display:flex;align-items:center;gap:24px;width:860px;padding:24px 32px 24px 24px;border-radius:28px;background:linear-gradient(180deg,rgba(26,30,24,.94),rgba(10,12,9,.96));
  border:1.5px solid rgba(122,201,67,.55);box-shadow:0 30px 70px -24px rgba(0,0,0,.95),0 0 50px rgba(122,201,67,.18)}
.ma-kine i{display:flex;align-items:center;justify-content:center;width:100px;height:100px;border-radius:24px;background:linear-gradient(160deg,#9be060,#4f8a26);color:#0b0e0a;flex:none;
  box-shadow:0 12px 26px -10px rgba(122,201,67,.8)}
.ma-kine b{display:block;font:800 46px/1.05 var(--sans);color:#fff;white-space:nowrap;letter-spacing:-.01em}
.ma-kine small{display:block;font:600 22px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:#9be060;margin-top:8px;white-space:nowrap}
.toque{width:88px;height:88px;border-radius:50%;background:rgba(255,255,255,.26);border:3px solid rgba(255,255,255,.95);box-shadow:0 10px 30px rgba(0,0,0,.55)}
.onda3{width:88px;height:88px;border-radius:50%;border:4px solid #fff}
.seguir{display:flex;align-items:center;justify-content:center;gap:16px;width:540px;height:124px;border-radius:32px;background:#0095f6;color:#fff;font:800 52px var(--sans);box-shadow:0 24px 60px -18px rgba(0,149,246,.85)}
.seguir.on{background:#23272f;box-shadow:none;border:2px solid rgba(255,255,255,.2)}
.ma-dm{display:flex;align-items:center;gap:22px;padding:20px 32px 20px 20px;border-radius:26px;background:linear-gradient(180deg,#171c15,#0e110c);border:1.5px solid rgba(122,201,67,.6);
  box-shadow:0 30px 70px -24px rgba(0,0,0,.95),0 0 40px rgba(122,201,67,.2)}
.ma-dm img{height:78px;width:auto;display:block}
.ma-dm b{display:block;font:800 34px var(--sans);color:#fff;white-space:nowrap}
.ma-dm small{display:block;font:600 22px var(--mono);letter-spacing:.08em;color:#9be060;margin-top:6px;white-space:nowrap}
`);

/* =====================================================================
   PRESENTADOR (lipsync HeyGen, assets/clips/intro y climax): intro [0, X0] y climax [X4, X5]. Entra y sale junto con todo lo suyo.
   ===================================================================== */
const AV = mk('div', 'L pres', STAGE, '<img class="fg" alt=""><div class="sombra"></div>');
AV.style.width = CONFIG.ancho + 'px'; AV.style.height = CONFIG.alto + 'px';
STAGE.insertBefore(AV, WORLD);
const AV_IMG = AV.querySelector('img.fg');
const AVK_I = norm([[0, { x: CX, y: CY, s: 1, rx: 0, o: 1 }], [X0 - SAL - .02, {}], [X0 - .02, { y: CY + 380, s: .5, rx: 10, o: 0 }, E.in3]]);
const AVK_C = norm([[X4, { x: CX, y: CY + 480, s: .5, rx: 10, o: 0 }], [X4 + .42, { y: CY, s: 1, rx: 0, o: 1 }, E.out4],
  [X5 - SAL - .02, {}], [X5 - .02, { y: CY + 380, s: .5, rx: 10, o: 0 }, E.in3]]);
sfx(X0 - SAL, 'transicion', { vol: .8 }); sfx(X4, 'transicion', { vol: .8 }); sfx(X5 - SAL, 'transicion', { vol: .75 });
function escenaAvatar(t) {
  let clip = null, k = null, t0 = 0;
  if (t < X0) { clip = 'intro'; k = KF(t, AVK_I); t0 = 0; }
  else if (t >= X4 && t < X5) { clip = 'climax'; k = KF(t, AVK_C); t0 = MARCAS.climax; }
  if (!clip || !(k.o > .002)) { off(AV); return; }
  verClip(AV_IMG, clip, t, t0);
  const ficha = 1 - k.s;
  AV.style.borderRadius = (ficha * 110).toFixed(1) + 'px';
  AV.style.boxShadow = ficha > .02 ? `0 60px 140px -30px rgba(0,0,0,.9),0 0 0 3px rgba(${VERDE},${(ficha * 1.4).toFixed(3)})` : 'none';
  put(AV, k);
}


/* =====================================================================
   0 · INTRO [0, X0] — rotulos bajo la cara (uno sale entero antes del otro) y las dos situaciones en pildoras.
   Datos en INTRO (config.js del episodio): a/tA, sit [[icono, texto, t0], ...], salA, b/tB.
   ===================================================================== */
const insig0 = mk('div', 'L insig z7', WORLDF, `<img alt="" src="${MARCA.logo}"><span>${MARCA.insignia}</span>`);
const ROT_Y = 1060;
const SAL_A = INTRO.salA - .45;
const rotA = new Rotulo(INTRO.a, { acento: [1], tiempos: INTRO.tA, sal: SAL_A, tam: INTRO.tamA || 100 });
const SIT0 = INTRO.sit.map(([ic, txt, t0]) => ({ el: mk('div', 'L pill z7', WORLDF, `${icon(ic, 40, 2.4)}<span>${txt}</span>`), t0: t0 - .08 }));
const rotB = new Rotulo(INTRO.b, { acento: [1], tiempos: INTRO.tB, sal: X0 - SAL - .02, tam: INTRO.tamB || 90 });
sfx(.05, 'golpe', { vol: .9 });
SIT0.forEach(s => sfx(s.t0 + .02, 'pop', { vol: .6 }));
function escena0(t) {
  if (t >= X0) { ocultar(insig0, SIT0.map(s => s.el)); rotA.pintar(t, { o: 0 }); rotB.pintar(t, { o: 0 }); return; }
  const q = salida(t, X0), pi = P(t, .35, .4, E.out4);
  put(insig0, { x: CX, y: 232 - (1 - pi) * 24, s: lerp(.9, 1, pi), o: pi * (1 - q) });
  rotA.pintar(t, { x: CX, y: ROT_Y, rx: 4, ry: 0 });
  const qs = P(t, SAL_A, .35, E.in3);
  SIT0.forEach((s, i) => {
    const p = entra(t, s.t0, .45), d = i ? 1 : -1;
    if (p > 0 && qs < 1) put(s.el, { x: CX + d * (1 - p) * 120, y: 1265 + i * 100, s: lerp(.7, 1, p), o: clamp(p * 2) * (1 - qs) }); else off(s.el);
  });
  rotB.pintar(t, { x: CX, y: ROT_Y, rx: 4, ry: 0 });
}

/* =====================================================================
   3D [TRES.ini, X4] — canvas de three.js dentro de WORLDF (sigue al golpe de camara). Camara por fotogramas clave en
   CAM3 y estado de las piezas en estado3D(t) (declarativo.js con EP3D de escenas.js). Modelo en window.MODELO.
   HAY3D = false (episodio sin modelo.json): no hay canvas y cada bloque muestra su imagen (EP3D.bloques[i].imagen).
   ===================================================================== */
let _h3dOk = null;
const H3D_LISTO = HAY3D ? new Promise((ok, mal) => { _h3dOk = ok; setTimeout(() => mal(new Error('el modelo 3D no cargo (assets/h3d.js)')), 30000); }) : Promise.resolve();
const punto = n => Array.isArray(n) ? { x: n[0], y: n[1] } : HAY3D && window.H3D ? H3D.punto(n) : { x: CX, y: 840 };
window.__h3dOk = v => _h3dOk(v);
const C3D = document.createElement('canvas'); C3D.id = 'c3d'; C3D.width = 1080; C3D.height = 1920;
WORLDF.appendChild(C3D);
let VIS3 = 0;
function escena3D(t) {
  VIS3 = P(t, TRES.ini, .35, E.out2) * (1 - salida(t, X4));
  if (!(VIS3 > .002) || !window.H3D) { C3D.style.display = 'none'; return false; }
  C3D.style.display = 'block'; C3D.style.opacity = VIS3.toFixed(3);
  C3D.style.filter = VIS3 < .99 ? `blur(${((1 - VIS3) * 10).toFixed(1)}px)` : 'none';
  const k = KF(t, CAM3), est = estado3D(t);
  H3D.pintar({ ...k, ...est });
  return true;
}
const cred3 = mk('div', 'L ma-cred z7', WORLDF, MARCA.credito3d || '');

/* =====================================================================
   MARCO: titulo de cada bloque arriba (Anton con contorno negro y sombra dura; la clave sobre brochazo)
   ===================================================================== */
const T3 = (a, b, tam = 112) => `<div class="t3d" style="font-size:${tam}px">${a ? `<span class="cr">${a}</span>` : ''}${b ? `<span class="vd">${b}</span>` : ''}</div>`;
const titulo = (html, t0, b, y = 290) => ({ el: mk('div', 'L z7', WORLDF, html), t0, b, y });
function pintarTitulo(T0, t) {
  const p = P(t, T0.t0, .5, E.back), q = salida(t, T0.b);
  if (p > 0 && q < 1) put(T0.el, { x: CX, y: T0.y + (1 - p) * 40, s: lerp(.7, 1, p) * (1 - .06 * q), o: clamp(p * 2) * (1 - q), b: (1 - clamp(p * 1.6)) * 6 + q * 8 }); else off(T0.el);
}

