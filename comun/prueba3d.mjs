// Banco de pruebas del 3D: renderiza vistas de camara con los puntos marcados, sin armar el video.
//   node ../../comun/prueba3d.mjs <carpeta del episodio o quiz> <vistas.json>     (en la carpeta del proyecto de animacion)
//   ej.: node ../../comun/prueba3d.mjs ../../quiz/q2-huesos trabajo/vistas.json
// vistas.json = { "nombre": { az, el, d, roll, hx, hy, ancla, piezas, flex, mov, marcas: ["punto", ...] }, ... }
// Deja trabajo/prueba3d/<nombre>.png y trabajo/prueba3d/hoja.jpg (todas juntas).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const { chromium } = createRequire(path.join(process.cwd(), 'package.json'))('playwright-core');
const { serve } = await import(pathToFileURL(path.join(process.cwd(), 'server.mjs')).href);

const C = path.dirname(fileURLToPath(import.meta.url));
const [ep, archivo] = process.argv.slice(2);
const proy = process.cwd();
fs.copyFileSync(path.join(C, 'h3d.js'), path.join(proy, 'assets', 'h3d.js'));
fs.writeFileSync(path.join(proy, 'trabajo', 'modelo.js'), 'window.MODELO = ' + fs.readFileSync(path.resolve(ep, 'modelo.json'), 'utf8') + ';');
fs.writeFileSync(path.join(proy, 'trabajo', 'prueba3d.html'), `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#0d100c}#c3d{position:absolute;left:0;top:0;width:1080px;height:1920px}
.m{position:absolute;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;background:#ff00ff;z-index:5}.m span{position:absolute;left:20px;top:-8px;font:700 24px sans-serif;color:#fff;white-space:nowrap;text-shadow:0 0 4px #000}</style>
<script type="importmap">{"imports":{"three":"../assets/vendor/three.module.min.js"}}</script></head>
<body><canvas id="c3d" width="1080" height="1920"></canvas><div id="mk"></div>
<script src="modelo.js"></script>
<script>window.__listo = new Promise(r => window.__h3dOk = r);
window.vista = s => { H3D.pintar(s); const mk = document.getElementById('mk'); mk.innerHTML = '';
  for (const n of s.marcas || []) { const p = H3D.punto(n); const d = document.createElement('div'); d.className = 'm'; d.style.left = p.x + 'px'; d.style.top = p.y + 'px'; d.innerHTML = '<span>' + n + '</span>'; mk.appendChild(d); } };</script>
<script type="module" src="../assets/h3d.js"></script></body></html>`);
const vistas = JSON.parse(fs.readFileSync(archivo, 'utf8'));
const srv = await serve(0, proy);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('pageerror', e => console.error('[pageerror]', e.message));
p.on('console', m => m.type() === 'error' && !/404/.test(m.text()) && console.error('[console]', m.text()));
await p.goto(`http://127.0.0.1:${srv.address().port}/trabajo/prueba3d.html`);
await p.evaluate(() => window.__listo);
const dir = path.join(proy, 'trabajo', 'prueba3d');
fs.mkdirSync(dir, { recursive: true });
for (const f of fs.readdirSync(dir)) fs.unlinkSync(path.join(dir, f));
const nombres = Object.keys(vistas);
for (const n of nombres) { await p.evaluate(s => window.vista(s), vistas[n]); await p.screenshot({ path: path.join(dir, `${n}.png`) }); }
await b.close(); srv.close();
const ent = nombres.map(n => ['-i', path.join(dir, `${n}.png`)]).flat();
const filtro = nombres.map((_, i) => `[${i}:v]scale=360:640,drawtext=fontfile='C\\:/Windows/Fonts/arial.ttf':text='${nombres[i]}':x=8:y=8:fontsize=26:fontcolor=magenta[v${i}]`).join(';') +
  ';' + nombres.map((_, i) => `[v${i}]`).join('') + `hstack=inputs=${nombres.length}`;
execFileSync('ffmpeg', ['-v', 'error', '-y', ...ent, '-filter_complex', nombres.length > 1 ? filtro : filtro.replace(/;\[v0\]hstack=inputs=1$/, ''), ...(nombres.length > 1 ? [] : ['-map', '[v0]']), path.join(dir, 'hoja.jpg')]);
console.log('hoja ->', path.join(dir, 'hoja.jpg'));
