/* =====================================================================
   MOTOR DECLARATIVO de la serie (tanda 2): el episodio describe sus bloques 1-4 y el climax con datos en EP3D
   (epN/escenas.js) y aqui se arman estado3D(t), escena1..4(t, hay3D) y escenaClimax(t) con las mismas piezas y reglas
   de los episodios hechos a mano (titulos 3D, etiquetas con linea, aros, pildoras, tags; nada se encima: cada bloque
   sale entero antes del corte).
   EP3D = {
     camara: [[t, { az, el, d, hx, hy, fx, fy, fz, roll }, curva], ...]     foco (fx, fy, fz) en mm BP3D
     piezas: { nombre: [[t, { o, g, a, r, dib }], ...] }                    fotogramas clave por pieza (o=1, resto 0)
     pulso:  ['nombre', ...]                                                 su rojo late
     mov:    { nombre: [[t, { x, y, z }], ...] }                             desplazamiento en mm BP3D
     flex:   { cadena: [[t, { f }], ...] }
     bloques: [ { titulo: [a, b, t0, tam], imagen: 'assets/ep/foto.png' (sin 3D), etiquetas: [{ html, punto, t0, t1, dx, dy }], aros: [{ punto, t0, color, tam }],
                  pills: [{ icono, texto, t0, t1, y, llena, rojo }], tags: [{ texto, punto, t0, dx, dy, osc }],
                  flechas: [{ punto, t0, icono, dx, dy, eje }] }, x4 ]
     climax: { tipo: 'numero' | 'barras' | 'grilla' | 'personas', titulo, fuente, ... }
   }
   Sin 3D (HAY3D = false): sin camara ni piezas; cada bloque muestra su imagen y los puntos van en pixeles: punto: [x, y].
   ===================================================================== */
/* pasos({ o: 1 }, [t, { g: 1 }], [t2, { g: 0, r: 1 }, dur]) -> fotogramas clave de una pieza: cada cambio dura dur (.35 s)
   y termina en t; antes se mantiene el estado previo (funcion declarada: se puede usar en escenas.js antes de este archivo) */
function pasos(ini, ...cambios) {
  const k = [[0, { ...ini }]]; let v = { ...ini };
  for (const [t, c, d = .35] of cambios) {
    const t0 = Math.max(t - d, k[k.length - 1][0] + .01);
    k.push([t0, { ...v }], [Math.max(t, t0 + .01), { ...v, ...c }]); v = { ...v, ...c };
  }
  return k;
}
const D3_CAM = norm(EP3D.camara || [[0, { az: 0, el: 0, d: 2000, hx: 540, hy: 760, fx: 0, fy: 0, fz: 0 }]]);
const D3_PZ = Object.fromEntries(Object.entries(EP3D.piezas || {}).map(([n, k]) => [n, norm(k)]));
const D3_MOV = Object.fromEntries(Object.entries(EP3D.mov || {}).map(([n, k]) => [n, norm(k)]));
const D3_FLEX = Object.fromEntries(Object.entries(EP3D.flex || {}).map(([n, k]) => [n, norm(k)]));
const D3_PULSO = new Set(EP3D.pulso || []);
const CAM3 = D3_CAM;
function estado3D(t) {
  const k = KF(t, D3_CAM), pz = {};
  for (const n in D3_PZ) {
    const v = KF(t, D3_PZ[n]);
    pz[n] = { o: v.o ?? 1, g: v.g ?? 0, a: v.a ?? 0, r: (v.r ?? 0) * (D3_PULSO.has(n) ? .72 + .28 * Math.sin(t * 7.5) : 1), dib: v.dib ?? 1 };
  }
  const mov = {}; for (const n in D3_MOV) { const v = KF(t, D3_MOV[n]); mov[n] = [v.x ?? 0, v.y ?? 0, v.z ?? 0]; }
  const flex = {}; for (const n in D3_FLEX) flex[n] = KF(t, D3_FLEX[n]).f ?? 0;
  return { piezas: pz, mov, flex, ancla: [k.fx, k.fy, k.fz] };
}

/* ---------- piezas 2D de cada bloque ---------- */
const D3_LIM = [[X0, X1], [X1, X2], [X2, X3], [X3, X4]];
const D3_B = (EP3D.bloques || []).map((b, i) => {
  const [a0, b0] = D3_LIM[i];
  const o = { a: a0, b: b0 };
  if (b.titulo) o.tit = titulo(T3(b.titulo[0], b.titulo[1], b.titulo[3] || 104), b.titulo[2] - .06, b0);
  o.img = b.imagen ? mk('div', 'L ma-img z5', WORLDF, `<img alt="" src="${b.imagen}">`) : null;
  o.et = (b.etiquetas || []).map(e => ({ ...e, el: new Etiqueta(e.html) }));
  o.aros = (b.aros || []).map(r => { const el = mk('div', 'L ma-aro z6', WORLDF); el.style.width = el.style.height = (r.tam || 160) + 'px'; if (r.color) el.style.borderColor = r.color; return { ...r, el }; });
  o.pills = (b.pills || []).map(p => { const el = mk('div', `L pill${p.llena ? ' llena' : ''} z7`, WORLDF, `${icon(p.icono || 'zap', 40, 2.6)}<span>${p.texto}</span>`); if (p.rojo) el.style.borderColor = 'rgba(229,72,77,.85)'; return { ...p, el }; });
  o.tags = (b.tags || []).map(g => ({ ...g, el: mk('div', `L ma-tag${g.osc ? ' osc' : ''} z7`, WORLDF, g.texto) }));
  o.fl = (b.flechas || []).map(f => ({ ...f, el: mk('div', 'L ma-flecha z7', WORLDF, icon(f.icono || 'arrowDown', f.tam || 104, 3.5)) }));
  o.et.forEach(e => sfx(e.t0 - .04, 'golpe-corto', { vol: .55 }));
  o.aros.forEach(r => sfx(r.t0 - .06, r.color ? 'impacto' : 'brillo', { vol: .55 }));
  o.pills.forEach(p => sfx(p.t0 - .06, 'pop', { vol: .55 }));
  o.tags.forEach(g => sfx(g.t0 - .04, 'tick', { vol: .45 }));
  return o;
});
function d3Bloque(i, t, hay3D) {
  const o = D3_B[i]; if (!o) return;
  if (o.tit) pintarTitulo(o.tit, t);
  const todos = [...o.aros.map(r => r.el), ...o.pills.map(p => p.el), ...o.tags.map(g => g.el), ...o.fl.map(f => f.el), o.img];
  if (!en(t, o.a, o.b) || (HAY3D && !hay3D)) { ocultar(todos); o.et.forEach(e => e.el.pintar(0)); return; }
  const q = salida(t, o.b), fin = t1 => t1 ? 1 - P(t, t1, .25, E.in3) : 1;
  if (o.img) { const pe = entra(t, o.a + .1, .55); put(o.img, { x: CX, y: 840 + 8 * Math.sin(t * 1.3), s: lerp(.7, 1, pe) * (1 - .06 * q), o: clamp(pe * 2) * (1 - q), b: q * 6 }); }
  o.et.forEach(e => {
    const a = punto(e.punto);
    e.el.pintar(P(t, e.t0 - .06, .45) * fin(e.t1) * (1 - q), a, { x: clamp(a.x + (e.dx ?? 200), 300, 790), y: clamp(a.y + (e.dy ?? 320), 470, 1400) });
  });
  o.aros.forEach(r => {
    const a = punto(r.punto), p = entra(t, r.t0 - .1, .45);
    if (p > 0) put(r.el, { x: a.x, y: a.y, s: lerp(.5, 1, p) * (1 + .05 * Math.sin(t * 7)), o: clamp(p * 2) * fin(r.t1) * (1 - q) }); else off(r.el);
  });
  o.pills.forEach(p => {
    const v = entra(t, p.t0 - .1, .45);
    if (v > 0) put(p.el, { x: CX, y: p.y || 1390, s: lerp(.6, .92, v), o: clamp(v * 2) * fin(p.t1) * (1 - q) }); else off(p.el);
  });
  o.tags.forEach(g => {
    const a = punto(g.punto), p = entra(t, g.t0 - .06, .35);
    if (p > 0) put(g.el, { x: clamp(a.x + (g.dx ?? 0), 120, 960), y: a.y + (g.dy ?? -70), s: lerp(.5, 1, p), o: clamp(p * 2) * fin(g.t1) * (1 - q) }); else off(g.el);
  });
  o.fl.forEach(f => {
    const a = punto(f.punto), p = entra(t, f.t0 - .1, .4), m = 22 * Math.abs(Math.sin((t - f.t0) * 5)) * P(t, f.t0, .2);
    const dx = (f.dx ?? 0) + (f.eje === 'x' ? Math.sign(f.dx || 1) * -m : 0), dy = (f.dy ?? -110) + (f.eje !== 'x' ? Math.sign(f.dy ?? -1) * -m : 0);
    if (p > 0) put(f.el, { x: a.x + dx, y: a.y + dy, s: lerp(.4, 1, p), o: clamp(p * 2) * fin(f.t1) * (1 - q) }); else off(f.el);
  });
}
function escena1(t, h) { d3Bloque(0, t, h); EP3D.extra?.[0]?.(t, h); }       // extra: piezas propias del episodio por bloque
function escena2(t, h) { d3Bloque(1, t, h); EP3D.extra?.[1]?.(t, h); }
function escena3(t, h) { d3Bloque(2, t, h); EP3D.extra?.[2]?.(t, h); }
function escena4(t, h) { d3Bloque(3, t, h); EP3D.extra?.[3]?.(t, h); }

/* ---------- climax: presentador + una tarjeta de dato (numero, barras, grilla de 100 o personas) ---------- */
const insigC = mk('div', 'L insig z7', WORLDF, `<img alt="" src="${MARCA.logo}"><span>DATO CLAVE</span>`);
const CL = EP3D.climax;
const CL_CAB = `<text x="40" y="66" font-family="Outfit" font-weight="800" font-size="${CL.tamTitulo || 38}" fill="#fff">${CL.titulo}</text>` +
  (CL.fuente ? `<text x="40" y="100" font-family="JetBrains Mono" font-weight="600" font-size="18" letter-spacing="1" fill="#a9b89c">${CL.fuente}</text>` : '');
let CL_SVG = '';
if (CL.tipo === 'numero') {
  CL_SVG = `<text class="num" x="430" y="330" text-anchor="middle" font-family="Outfit" font-weight="800" font-size="${CL.tamNum || 170}" fill="${CL.color || '#F5C400'}" style="filter:drop-shadow(0 0 24px rgba(245,196,0,.35))">${CL.grande}</text>
<text class="sub" x="430" y="400" text-anchor="middle" font-family="Outfit" font-weight="700" font-size="34" fill="#fff" opacity="0">${CL.sub || ''}</text>
<text class="sub2" x="430" y="446" text-anchor="middle" font-family="Outfit" font-weight="700" font-size="28" fill="#cfd8c6" opacity="0">${CL.sub2 || ''}</text>`;
} else if (CL.tipo === 'barras') {
  const n = CL.barras.length, w = n === 2 ? 200 : 160, paso = n === 2 ? 300 : 240, x0 = n === 2 ? 160 : 110;
  CL_SVG = `<line x1="60" y1="440" x2="800" y2="440" stroke="rgba(255,255,255,.18)" stroke-width="3"/>` + CL.barras.map(([a, b, v, c, txt], i) => `<g class="b${i}">
<rect class="r" x="${x0 + i * paso}" y="440" width="${w}" height="0" rx="14" fill="${c}" style="filter:drop-shadow(0 0 14px ${c}88)"/>
<text class="v" x="${x0 + i * paso + w / 2}" y="430" text-anchor="middle" font-family="Outfit" font-weight="800" font-size="36" fill="#fff" opacity="0">${txt}</text>
<text x="${x0 + i * paso + w / 2}" y="474" text-anchor="middle" font-family="Outfit" font-weight="700" font-size="24" fill="#fff">${a}</text>
<text x="${x0 + i * paso + w / 2}" y="502" text-anchor="middle" font-family="Outfit" font-weight="700" font-size="24" fill="#cfd8c6">${b}</text></g>`).join('');
} else if (CL.tipo === 'grilla') {
  CL_SVG = Array.from({ length: 100 }, (_, i) => `<circle class="p${i}" cx="${70 + (i % 10) * 40}" cy="${150 + Math.floor(i / 10) * 34}" r="13" fill="#3a3f37"/>`).join('') +
    `<g class="txt" opacity="0"><text x="660" y="300" text-anchor="middle" font-family="Outfit" font-weight="800" font-size="110" fill="${CL.color || '#F5C400'}">${CL.grande}</text>
<text x="660" y="352" text-anchor="middle" font-family="Outfit" font-weight="700" font-size="28" fill="#fff">${CL.sub || ''}</text></g>`;
} else if (CL.tipo === 'personas') {
  const N = CL.total, w = Math.min(150, 680 / N);
  CL_SVG = Array.from({ length: N }, (_, i) => `<g class="pe${i}" transform="translate(${430 - N * w / 2 + i * w + (w - 100) / 2} 170) scale(${Math.min(1, w / 110)})"><circle cx="50" cy="40" r="34" fill="#3a3f37"/><rect x="8" y="86" width="84" height="130" rx="40" fill="#3a3f37"/></g>`).join('') +
    `<g class="txt" opacity="0"><text x="430" y="470" text-anchor="middle" font-family="Outfit" font-weight="800" font-size="44" fill="#fff">${CL.grande}</text></g>`;
}
const tarjC = mk('div', 'L ma-card z7', WORLDF, `<svg viewBox="0 0 860 520" width="860" height="520" style="display:block">${CL_CAB}${CL_SVG}</svg>`);
const CLq = s => tarjC.querySelector(s), CLqa = s => [...tarjC.querySelectorAll(s)];
(CL.sonidos || []).forEach(([x, id]) => sfx(x, id, { vol: .7 }));
function escenaClimax(t) {
  if (!en(t, X4, X5)) { ocultar(insigC, tarjC); return; }
  const q = salida(t, X5), pi = P(t, X4 + .5, .4, E.out4);
  put(insigC, { x: CX, y: 232 - (1 - pi) * 24, s: lerp(.9, 1, pi), o: pi * (1 - q) });
  const pt = entra(t, X4 + .2, .5, E.out4);
  if (!(pt > 0)) { off(tarjC); return; }
  put(tarjC, { x: CX, y: 1200 + (1 - pt) * 120, s: lerp(.9, 1, pt) * (1 - .05 * q), o: clamp(pt * 2) * (1 - q), b: q * 8 });
  if (CL.tipo === 'numero') {
    const p = P(t, CL.t0 - .1, .5, E.back), num = CLq('.num');
    num.setAttribute('opacity', clamp(p * 2).toFixed(3));
    num.setAttribute('transform', `translate(430 280) scale(${lerp(.5, 1, p).toFixed(3)}) translate(-430 -280)`);
    CLq('.sub').setAttribute('opacity', P(t, CL.t0 + .2, .3).toFixed(3)); CLq('.sub2').setAttribute('opacity', P(t, (CL.t1 ?? CL.t0 + .5), .3).toFixed(3));
  } else if (CL.tipo === 'barras') {
    const maxv = Math.max(...CL.barras.map(b => b[2]));
    CL.barras.forEach(([, , v], i) => {
      const p = P(t, CL.tiempos[i], .7, E.out3), h = 300 * v / maxv * p, r = CLq(`.b${i} .r`), tx = CLq(`.b${i} .v`);
      r.setAttribute('y', (440 - h).toFixed(1)); r.setAttribute('height', h.toFixed(1));
      tx.setAttribute('y', (430 - h).toFixed(1)); tx.setAttribute('opacity', clamp(p * 4).toFixed(3));
    });
  } else if (CL.tipo === 'grilla') {
    const n = Math.floor(100 * P(t, X4 + .4, 1.1, E.lin)), d = P(t, CL.t0 - .12, .3);
    CLqa('circle').forEach((c, i) => { const f = i < CL.n && d > 0 ? (CL.color || '#F5C400') : i < n ? '#EEF1EC' : '#3a3f37'; if (c._f !== f) { c._f = f; c.setAttribute('fill', f); } });
    CLq('.txt').setAttribute('opacity', d.toFixed(3));
  } else if (CL.tipo === 'personas') {
    for (let i = 0; i < CL.total; i++) {
      const g = CLq(`.pe${i}`), p = P(t, X4 + .4 + i * (.6 / CL.total), .3), on = i < CL.k && t >= CL.t0 - .15;
      const f = on ? (CL.color || '#E5484D') : p > .5 ? '#EEF1EC' : '#3a3f37';
      if (g._f !== f) { g._f = f; g.querySelectorAll('circle,rect').forEach(e => e.setAttribute('fill', f)); }
    }
    CLq('.txt').setAttribute('opacity', P(t, CL.t0 - .15, .3).toFixed(3));
  }
}
