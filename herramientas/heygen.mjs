// Avatar que habla con HeyGen (Avatar IV, API v3): una foto + un audio -> video MP4 con labios sincronizados.
// La key va en .env como HEYGEN_API_KEY (nunca en el codigo ni en git).
//
//   node herramientas/heygen.mjs --foto avatar.jpg --audio gancho.wav --salida gancho.mp4
//        [--resolucion 720p|1080p] [--formato 9:16] [--expresividad low|medium|high] [--movimiento "..."] [--titulo "..."]
//
// La foto se achica a 1080 px de ancho antes de mandarla. El audio puede ser MP3 o WAV (max 32 MB).
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const API = 'https://api.heygen.com';

function leerKey() {
  const env = path.join(RAIZ, '.env');
  const linea = existsSync(env) && readFileSync(env, 'utf8').split(/\r?\n/).find((l) => l.startsWith('HEYGEN_API_KEY='));
  const key = linea ? linea.slice('HEYGEN_API_KEY='.length).trim() : process.env.HEYGEN_API_KEY;
  if (!key) throw new Error('Falta HEYGEN_API_KEY en .env');
  return key;
}

function args() {
  const a = process.argv.slice(2);
  const o = { resolucion: '720p', formato: '9:16' };
  for (let i = 0; i < a.length; i += 2) o[a[i].replace(/^--/, '')] = a[i + 1];
  for (const k of ['foto', 'audio', 'salida']) if (!o[k]) throw new Error(`Falta --${k}`);
  return o;
}

async function pedir(key, metodo, ruta, cuerpo) {
  const r = await fetch(API + ruta, {
    method: metodo,
    headers: { 'X-Api-Key': key, ...(cuerpo && !(cuerpo instanceof FormData) ? { 'Content-Type': 'application/json' } : {}) },
    body: cuerpo instanceof FormData ? cuerpo : cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  const texto = await r.text();
  let json;
  try { json = JSON.parse(texto); } catch { json = { crudo: texto }; }
  if (!r.ok) throw new Error(`${metodo} ${ruta} -> HTTP ${r.status}: ${texto.slice(0, 500)}`);
  return json;
}

const o = args();
const key = leerKey();

// 1) foto a 1080 de ancho (JPEG) en base64
const fotoTmp = path.join(os.tmpdir(), `heygen-foto-${Date.now()}.jpg`);
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', o.foto, '-vf', 'scale=1080:-2:flags=lanczos', '-q:v', '3', fotoTmp]);
const foto64 = readFileSync(fotoTmp).toString('base64');

// 2) subir el audio como asset
const form = new FormData();
const ext = path.extname(o.audio).toLowerCase();
form.append('file', new Blob([readFileSync(o.audio)], { type: ext === '.wav' ? 'audio/wav' : 'audio/mpeg' }), path.basename(o.audio));
const subida = await pedir(key, 'POST', '/v3/assets', form);
const audioId = subida?.data?.id ?? subida?.data?.asset_id;
if (!audioId) throw new Error('La subida del audio no devolvio id: ' + JSON.stringify(subida).slice(0, 300));
console.log('audio subido:', audioId);

// 3) crear el video
const cuerpo = {
  type: 'image',
  image: { type: 'base64', media_type: 'image/jpeg', data: foto64 },
  audio_asset_id: audioId,
  aspect_ratio: o.formato,
  resolution: o.resolucion,
  title: o.titulo || path.basename(o.salida, '.mp4'),
  ...(o.expresividad ? { expressiveness: o.expresividad } : {}),
  ...(o.movimiento ? { motion_prompt: o.movimiento } : {}),
};
const creado = await pedir(key, 'POST', '/v3/videos', cuerpo);
const id = creado?.data?.video_id;
if (!id) throw new Error('No devolvio video_id: ' + JSON.stringify(creado).slice(0, 300));
console.log('video en cola:', id);

// 4) esperar y bajar
const t0 = Date.now();
for (;;) {
  await new Promise((r) => setTimeout(r, 8000));
  const est = (await pedir(key, 'GET', `/v3/videos/${id}`)).data || {};
  const seg = Math.round((Date.now() - t0) / 1000);
  if (est.status === 'completed') {
    const bin = Buffer.from(await (await fetch(est.video_url)).arrayBuffer());
    mkdirSync(path.dirname(path.resolve(o.salida)), { recursive: true });
    writeFileSync(o.salida, bin);
    console.log(`listo en ${seg} s -> ${o.salida} (${(bin.length / 1048576).toFixed(1)} MB)`);
    break;
  }
  if (est.status === 'failed') throw new Error('HeyGen fallo: ' + (est.failure_message || JSON.stringify(est).slice(0, 300)));
  if (seg > 1800) throw new Error('Paso media hora sin terminar; id ' + id);
  process.stdout.write(`  ${est.status || '...'} ${seg} s\r`);
}
