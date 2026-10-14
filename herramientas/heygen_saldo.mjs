// Saldo de la cuenta de HeyGen (para medir cuanto gasta un video: correrlo antes y despues).
//   node herramientas/heygen_saldo.mjs [--guardar archivo.json]
// La key se lee de .env (HEYGEN_API_KEY) y nunca se imprime.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const env = readFileSync(path.join(RAIZ, '.env'), 'utf8');
const key = (env.match(/^\s*HEYGEN_API_KEY\s*=\s*"?([^"\r\n]+)"?/m) || [])[1];
if (!key) throw new Error('Falta HEYGEN_API_KEY en .env');

const salida = {};
for (const ruta of ['/v2/user/remaining_quota', '/v3/user/me', '/v1/user/me']) {
  try {
    const r = await fetch('https://api.heygen.com' + ruta, { headers: { 'X-Api-Key': key } });
    const txt = await r.text();
    let j; try { j = JSON.parse(txt); } catch { j = txt.slice(0, 300); }
    salida[ruta] = { http: r.status, data: j?.data ?? j };
  } catch (e) { salida[ruta] = { error: e.message }; }
}
const i = process.argv.indexOf('--guardar');
if (i > 0) writeFileSync(process.argv[i + 1], JSON.stringify({ fecha: new Date().toISOString(), ...salida }, null, 1));
console.log(JSON.stringify(salida, null, 1));
