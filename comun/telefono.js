/* =====================================================================
   TELEFONO CON TU APP (lo usan los dos formatos). Pasa por las capturas de MARCA.app.pantallas (marca/app/*.png,
   copiadas a assets/marca/app) con un deslizamiento; si una captura es mas alta que la pantalla, baja sola (scroll).
   Antes de cada cambio un dedo toca donde dice MARCA.app.toques: [n de la pantalla que viene (1, 2...), x 0-1, y 0-1].
   Arriba el logo de la marca; abajo la URL (MARCA.web) en grande cuando la voz la nombra (tWeb).
   Uso: const TEL = telefono({ a, b, tWeb, x, y, s, logo: { x, y }, url: { x, y }, salida: t => 0..1 });  render: TEL.pintar(t)
   Va DESPUES de la base (usa en, entra, ocultar) y ANTES del codigo que llama a telefono() (las clases no se elevan).
   ===================================================================== */
css(`
.tl-phone{width:520px;height:1060px;border-radius:66px;background:#050605;border:12px solid #1b1e19;overflow:hidden;
  box-shadow:0 60px 120px -30px rgba(0,0,0,.95),0 0 0 2px rgba(255,255,255,.08),0 0 90px rgba(122,201,67,.25)}
.tl-phone .notch{position:absolute;left:50%;top:12px;width:130px;height:34px;border-radius:20px;background:#000;transform:translateX(-50%);z-index:9}
.tl-pan{position:absolute;inset:0;overflow:hidden;background:#0b0e0a;opacity:0}
.tl-pan img{position:absolute;left:0;top:0;width:100%;height:auto;display:block}
.toque{width:88px;height:88px;border-radius:50%;background:rgba(255,255,255,.26);border:3px solid rgba(255,255,255,.95);box-shadow:0 10px 30px rgba(0,0,0,.55)}
.onda3{width:88px;height:88px;border-radius:50%;border:4px solid #fff}
.tl-url{display:flex;align-items:center;gap:16px;height:104px;padding:0 46px 0 34px;border-radius:999px;background:linear-gradient(180deg,#9be060,#7AC943);color:#0b0e0a;
  font:800 52px var(--sans);white-space:nowrap;box-shadow:0 0 50px rgba(122,201,67,.5)}
.tl-logo{width:400px}
.tl-logo img{width:100%;display:block;filter:drop-shadow(0 20px 40px rgba(0,0,0,.8)) drop-shadow(0 0 30px rgba(122,201,67,.25))}
`);

/* ---------- el dedo que usa la app ---------- */
class Toque {
  constructor(keys, toques) {
    this.k = keys; this.toques = toques;
    this.el = mk('div', 'L toque', WORLDF); this.el.style.zIndex = 30;
    this.onda = mk('div', 'L onda3', WORLDF); this.onda.style.zIndex = 30;
    toques.forEach(x => sfx(x, 'click', { vol: .85 }));
  }
  pintar(t) {
    const k = KF(t, this.k);
    if (!(k.o > .002)) { off(this.el); off(this.onda); return; }
    const c = this.toques.filter(x => t >= x - .08 && t < x + .55).pop();
    put(this.el, { x: k.x, y: k.y, s: 1 - .24 * (c != null ? bump(t, c - .08, .24) : 0), o: k.o });
    if (c != null && t >= c) { const q = clamp((t - c) / .55); put(this.onda, { x: k.x, y: k.y, s: lerp(.6, 2.3, E.out3(q)), o: (1 - q) * .9 * k.o }); }
    else off(this.onda);
  }
}

function telefono(o) {
  const PANT = MARCA.app.pantallas.length ? MARCA.app.pantallas : [MARCA.logo];
  const el = mk('div', 'L tl-phone z6', WORLDF, '<i class="notch"></i>' + PANT.map(s => `<div class="tl-pan"><img alt="" src="${s}"></div>`).join(''));
  const pans = [...el.querySelectorAll('.tl-pan')], imgs = pans.map(p => p.querySelector('img'));
  const n = PANT.length, W = 496, H = 1036;
  const S = Array.from({ length: n }, (_, i) => o.a + .1 + i * (o.b - o.a - .4) / n);          // inicio de cada pantalla
  const enTel = (fx, fy) => ({ x: o.x + (fx * W - W / 2) * o.s, y: o.y + (fy * H - H / 2) * o.s });
  const keys = [], taps = [];
  for (let i = 1; i < n; i++) {
    const d = (MARCA.app.toques || []).find(q => q[0] === i) || [i, .5, .72], p = enTel(d[1], d[2]), tt = S[i] - .2;
    if (keys.length && tt - .42 <= keys[keys.length - 1][0]) continue;                           // pantallas muy seguidas: sin toque
    keys.push([tt - .42, { x: p.x + 120, y: p.y + 200, o: 0 }], [tt - .1, { x: p.x, y: p.y, o: 1 }, E.out3], [tt + .1, {}], [tt + .28, { o: 0 }]);
    taps.push(tt);
  }
  const toq = taps.length ? new Toque(norm(keys), taps) : null;
  const url = mk('div', 'L tl-url z7', WORLDF, `${icon('globe', 48, 2.4)}<span>${MARCA.web}</span>`);
  const logo = mk('div', 'L tl-logo z7', WORLDF, `<img alt="" src="${MARCA.logo}">`);
  sfx(o.a + .05, 'aire', { vol: .7 }); sfx(o.a + .1, 'golpe', { vol: .9 }); sfx(o.tWeb - .08, 'golpe-corto', { vol: .85 });
  S.slice(1).forEach(x => sfx(x, 'barrido', { vol: .35 }));
  function pantalla(p, t, a, b) {                                         // sale entera antes de que entre la siguiente
    const v = P(t, a, .14, E.out3), q = b == null ? 0 : P(t, b - .13, .13, E.in3);
    p.style.opacity = (v * (1 - q)).toFixed(3);
    p.style.transform = `translateX(${((1 - v) * 60 - q * 60).toFixed(1)}px)`;
  }
  return {
    pintar(t) {
      if (!en(t, o.a, o.b)) { ocultar(el, logo, url); toq?.pintar(-1); return; }
      const q = o.salida ? o.salida(t) : 0, pt = entra(t, o.a + .05, .6, E.spring);
      put(el, { x: o.x, y: o.y + (1 - pt) * 700, s: o.s * (1 - .05 * q), r: (1 - pt) * -5, o: (pt > 0 ? 1 : 0) * (1 - q), b: q * 8 });
      pans.forEach((p, i) => {
        pantalla(p, t, S[i], S[i + 1]);
        const im = imgs[i], h = im.naturalWidth ? im.naturalHeight * W / im.naturalWidth : H;    // captura larga: scroll
        if (h > H + 4) im.style.transform = `translateY(${(-(h - H) * E.io3(P(t, S[i] + .35, Math.max(.3, (S[i + 1] ?? o.b) - S[i] - .7), E.lin))).toFixed(1)}px)`;
      });
      const pu = P(t, o.tWeb - .08, .45, E.back);
      if (pu > 0) put(url, { x: o.url.x, y: o.url.y, s: lerp(.6, .9, pu), o: clamp(pu * 2) * (1 - q), b: q * 6 }); else off(url);
      const pl = P(t, o.a + .08, .45, E.back);
      if (pl > 0) put(logo, { x: o.logo.x, y: o.logo.y, s: lerp(1.7, 1, pl), o: clamp(pl * 3) * (1 - q), b: q * 8 }); else off(logo);
      toq?.pintar(t);
    },
  };
}
