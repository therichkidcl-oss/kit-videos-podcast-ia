// Motor 3D del kit (pensado para BodyParts3D 4.0, DBCLS, CC BY 4.0; sirve cualquier GLB) pintado con three.js en el canvas #c3d.
// Lee window.MODELO (modelo.json del episodio, lo mete parche.py) y assets/3d/modelo.glb (piezas en mm BP3D).
// Cada fotograma es funcion pura del estado: H3D.pintar({ az, el, d, roll, fov, hx, hy, ancla, piezas, flex, mov }).
//   piezas: { nombre: { o: opacidad, g: brillo verde, a: amarillo, r: rojo, dib: 0..1 (tubos: cuanto se dibuja) } }
//   flex:   { cadena: grados }  (se reparte entre sus niveles; positivo = flexion hacia adelante)
//   mov:    { nombre: [dx, dy, dz] en mm BP3D }  (desplaza una pieza)
// Ejes BP3D: x = derecha del cuerpo negativa, y = anterior negativa, z = arriba. Mundo three: (x, z, -y).
import * as THREE from 'three';
import { GLTFLoader } from './vendor/GLTFLoader.js';

const CFG = window.MODELO;
const W = 1080, H = 1920;
const canvas = document.getElementById('c3d');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(26, W / H, 5, 30000);
scene.add(cam);
scene.add(new THREE.HemisphereLight(0xfff4e2, 0x14200f, 1.05));
const luz = (c, i, p, t = [0, 0, -1]) => { const l = new THREE.DirectionalLight(c, i); l.position.set(...p); cam.add(l); l.target.position.set(...t); cam.add(l.target); };
const MARCA3D = new THREE.Color(window.COLOR_MARCA || '#7AC943');               // color de la marca (lo pone parche.py)
luz(0xffffff, 2.3, [-.6, .9, 1]); luz(0xdfe8ff, .55, [.9, -.2, .6]); luz(MARCA3D.clone().lerp(new THREE.Color(0xffffff), .25), 1.7, [.2, .5, -1], [0, 0, 0]);

const COL = { hueso: 0xeee2cb, musculo: 0xb4473c, tendon: 0xeae3d2, ligamento: 0xd9cfb4, disco: 0x8fb8de, nervio: 0xf2c94c,
  fascia: 0xf3ead6, cartilago: 0x9fd3ea };
const RUG = { hueso: .66, musculo: .48, tendon: .4, ligamento: .45, disco: .35, nervio: .35, fascia: .4, cartilago: .3 };
/* corazon y vasos (formato quiz): miocardio, arterias (rojo), venas y tronco pulmonar (azul), valvulas */
Object.assign(COL, { corazon: 0xa83a32, arteria: 0xc8322d, vena: 0x3d63b8, valvula: 0xf1e3c4 });
Object.assign(RUG, { corazon: .42, arteria: .38, vena: .38, valvula: .35 });
/* organos (formato quiz): pulmon, encefalo y digestivo */
Object.assign(COL, { pulmon: 0xd99088, encefalo: 0xdcaaa2, higado: 0x8f3b2d, estomago: 0xd88a78, intestino: 0xe3a796, pancreas: 0xe5c27e, vesicula: 0x5b8f3e });
Object.assign(RUG, { pulmon: .5, encefalo: .55, higado: .4, estomago: .45, intestino: .48, pancreas: .5, vesicula: .4 });
const VERDE = MARCA3D.clone(), AMARILLO = new THREE.Color(0xF5C400), ROJO = new THREE.Color(0xE5484D);
const BP = ([x, y, z]) => new THREE.Vector3(x, z, -y);
const TIPO = Object.fromEntries((CFG.partes || []).map(p => [p.n, p.tipo || 'hueso']));
const piezas = {}, envol = {}, centroLocal = {}, tubos = {};

function material(tipo) {
  const m = new THREE.MeshStandardMaterial({ color: COL[tipo] ?? COL.hueso, roughness: RUG[tipo] ?? .5, metalness: 0, transparent: true });
  m.userData.base = new THREE.Color(COL[tipo] ?? COL.hueso);
  return m;
}
/* piezas del GLB: se hornea la rotacion BP3D -> mundo en la geometria; cada una va dentro de un grupo (desplazar/cadenas) */
const gltf = await new GLTFLoader().loadAsync(new URL('3d/modelo.glb', import.meta.url).href);
gltf.scene.updateMatrixWorld(true);
const ROT = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
const mallas = [];
gltf.scene.traverse(o => { if (o.isMesh) mallas.push(o); });
for (const o of mallas) {
  const n = o.name || o.parent?.name;
  const g = o.geometry.clone().applyMatrix4(o.matrixWorld).applyMatrix4(ROT);
  g.computeVertexNormals(); g.computeBoundingBox();
  const tipo = TIPO[n] || 'hueso';
  const m = new THREE.Mesh(g, material(tipo));
  m.renderOrder = tipo === 'hueso' ? 0 : 1;
  const w = new THREE.Group(); w.add(m); scene.add(w);
  piezas[n] = m; envol[n] = w; centroLocal[n] = g.boundingBox.getCenter(new THREE.Vector3());
}
/* formas simples que BodyParts3D no trae (cartilago, ligamento): elipsoide en mm BP3D { n, tipo, centro, radios:[rx,ry,rz] } */
for (const f of CFG.formas || []) {
  const g = new THREE.SphereGeometry(1, 40, 24);
  g.applyMatrix4(new THREE.Matrix4().makeScale(f.radios[0], f.radios[2], f.radios[1])).translate(...BP(f.centro).toArray());
  g.computeBoundingBox();
  const m = new THREE.Mesh(g, material(f.tipo || 'cartilago'));
  m.renderOrder = 1;
  const w = new THREE.Group(); w.add(m); scene.add(w);
  piezas[f.n] = m; envol[f.n] = w; centroLocal[f.n] = g.boundingBox.getCenter(new THREE.Vector3());
}
/* tubos (nervios, fascia, tendones que BodyParts3D no trae): CatmullRom por puntos BP3D; se dibujan de a poco con dib.
   Un punto {p, de:'pieza'} sigue a esa pieza: el tubo es dinamico y se rehace en cada fotograma (lineas de fuerza). */
const dinamicos = [];
for (const tb of CFG.tubos || []) {
  if (tb.puntos.some(q => !Array.isArray(q))) dinamicos.push(tb);
  const curva = new THREE.CatmullRomCurve3(tb.puntos.map(q => BP(Array.isArray(q) ? q : q.p)), false, 'catmullrom', .5);
  const seg = tb.seg || 160, rad = tb.radial || 16;
  const g = new THREE.TubeGeometry(curva, seg, tb.radio || 4, rad, false);
  const m = new THREE.Mesh(g, material(tb.tipo || 'nervio'));
  m.renderOrder = 2;
  const w = new THREE.Group(); w.add(m); scene.add(w);
  piezas[tb.n] = m; envol[tb.n] = w; tubos[tb.n] = { curva, seg, rad };
  g.computeBoundingBox(); centroLocal[tb.n] = g.boundingBox.getCenter(new THREE.Vector3());
}
/* cadenas articuladas (columna): niveles de abajo hacia arriba, cada uno gira en su pivote y arrastra a los de arriba */
const cadenas = {};
for (const c of CFG.cadenas || []) {
  let padre = scene, prev = new THREE.Vector3();
  const grupos = [];
  for (const nv of c.niveles) {
    const piv = BP(nv.pivote), g = new THREE.Group();
    g.position.copy(piv.clone().sub(prev)); padre.add(g); g.updateMatrixWorld(true);
    for (const n of nv.partes) if (envol[n]) g.attach(envol[n]);
    grupos.push(g); padre = g; prev = piv;
  }
  cadenas[c.n] = { grupos, eje: c.eje || 'x' };
}
scene.updateMatrixWorld(true);

/* puntos de referencia: [x,y,z] BP3D, {p:[x,y,z], de:'pieza'} (siguen a esa pieza), 'centro:PIEZA' o 'tubo:NOMBRE:0.5' */
const tmp = new THREE.Vector3();
function puntoMundo(def) {
  if (typeof def === 'string') {
    const [k, a, f] = def.split(':');
    if (k === 'centro') { piezas[a].updateMatrixWorld(true); return centroLocal[a].clone().applyMatrix4(piezas[a].matrixWorld); }
    if (k === 'tubo') { piezas[a].updateMatrixWorld(true); return tubos[a].curva.getPoint(+f).applyMatrix4(piezas[a].matrixWorld); }
    return puntoMundo(CFG.puntos[def]);
  }
  if (Array.isArray(def)) return BP(def);
  const v = BP(def.p);
  if (def.de && piezas[def.de]) { piezas[def.de].updateMatrixWorld(true); return v.applyMatrix4(piezas[def.de].matrixWorld); }
  return v;
}
const P = n => puntoMundo(CFG.puntos?.[n] ?? n);
function proyectar(v) { tmp.copy(v).project(cam); return { x: (tmp.x + 1) / 2 * W, y: (1 - tmp.y) / 2 * H, z: tmp.z }; }

function camara(s) {
  const az = (s.az ?? 0) * Math.PI / 180, el = (s.el ?? 0) * Math.PI / 180, d = s.d ?? 520;
  const tg = P(s.ancla || CFG.ancla);
  if (s.ancla2 && s.am) tg.lerp(P(s.ancla2), s.am);                    // foco que se mueve suave entre dos puntos
  cam.position.set(tg.x + d * Math.cos(el) * Math.sin(az), tg.y + d * Math.sin(el), tg.z + d * Math.cos(el) * Math.cos(az));
  cam.up.set(0, 1, 0);
  cam.lookAt(tg);
  cam.rotateZ((s.roll ?? 0) * Math.PI / 180);
  cam.fov = s.fov ?? 26;
  cam.clearViewOffset();
  cam.updateMatrixWorld(true);
  if (s.hx != null) { const p = proyectar(tg); cam.setViewOffset(W, H, p.x - s.hx, p.y - s.hy, W, H); }
  cam.updateMatrixWorld(true);
}

window.H3D = {
  pintar(s) {
    for (const n in cadenas) {
      const c = cadenas[n], a = ((s.flex?.[n] ?? 0) * Math.PI / 180) / c.grupos.length;
      c.grupos.forEach(g => { g.rotation.set(c.eje === 'x' ? a : 0, c.eje === 'y' ? a : 0, c.eje === 'z' ? a : 0); });
    }
    for (const n in envol) { const d = s.mov?.[n]; if (d) envol[n].position.copy(BP(d)); else if (!envol[n].parent?.isGroup || envol[n].parent === scene) envol[n].position.set(0, 0, 0); }
    scene.updateMatrixWorld(true);
    for (const tb of dinamicos) {                                     // tubos que siguen a sus piezas: se rehacen
      const t = tubos[tb.n], curva = new THREE.CatmullRomCurve3(tb.puntos.map(q => puntoMundo(q)), false, 'catmullrom', .5);
      const m = piezas[tb.n], g = new THREE.TubeGeometry(curva, t.seg, tb.radio || 4, t.rad, false);
      m.geometry.dispose(); m.geometry = g; t.curva = curva;
    }
    camara(s);
    for (const n in piezas) {
      const k = s.piezas?.[n] ?? {}, m = piezas[n].material, o = k.o ?? 1;
      piezas[n].visible = o > .003;
      m.opacity = o; m.depthWrite = o > .97;
      m.color.copy(m.userData.base).lerp(VERDE, .75 * (k.g ?? 0)).lerp(AMARILLO, .75 * (k.a ?? 0)).lerp(ROJO, .8 * (k.r ?? 0));
      m.emissive.copy(VERDE).multiplyScalar(.42 * (k.g ?? 0)).add(AMARILLO.clone().multiplyScalar(.35 * (k.a ?? 0))).add(ROJO.clone().multiplyScalar(.45 * (k.r ?? 0)));
      if (tubos[n]) {
        const t = tubos[n], dib = k.dib ?? 1;
        piezas[n].geometry.setDrawRange(0, Math.floor(clamp01(dib) * t.seg) * t.rad * 6);
      }
    }
    renderer.render(scene, cam);
  },
  punto(n) { return proyectar(P(n)); },
  radioPx(n, r) { const c = P(n), right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0).multiplyScalar(r); const a = proyectar(c), b = proyectar(c.clone().add(right)); return Math.hypot(b.x - a.x, b.y - a.y); },
};
function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
window.__h3dOk?.(true);
