// Supports des personnages : chacun a sa forme (racines, branche, rocher, muret, souche, coffre, panier, tombe…),
// son sol, ses objets décoratifs et ses effets. Le haut du support est toujours à y = 0.3 (repère du socle).
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { surfaceTexture } from './surface.js';

function rnd(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const matCache = new Map();
const mt = (c, o = {}) => {                                                      // matériaux partagés : même couleur = même matériau (permet de fusionner les objets)
  const key = c + JSON.stringify(o, (k, v) => (v && v.isTexture ? v.uuid : v));
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, flatShading: true, ...o }));
  return matCache.get(key);
};
/** fusionne tous les objets immobiles qui partagent le même matériau en un seul : des dizaines d'appels de dessin en moins */
function mergeStatic(root) {
  root.updateMatrixWorld(true);
  const groups = new Map();
  root.traverse((o) => {
    if (!o.isMesh || Array.isArray(o.material) || o.userData.flame !== undefined || o.userData.waterMesh || o.userData.noMerge) return;
    if (!groups.has(o.material)) groups.set(o.material, []);
    groups.get(o.material).push(o);
  });
  for (const [m, list] of groups) {
    if (list.length < 2) continue;
    const geos = list.map((o) => {
      const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
      g.applyMatrix4(o.matrixWorld);
      for (const n of Object.keys(g.attributes)) if (n !== 'position' && n !== 'normal' && n !== 'uv') g.deleteAttribute(n);
      return g;
    });
    let merged = null; try { merged = mergeGeometries(geos, false); } catch (e) { merged = null; }
    if (!merged) continue;
    const mesh = new THREE.Mesh(merged, m); mesh.castShadow = list.some((o) => o.castShadow); mesh.receiveShadow = true;
    list.forEach((o) => o.parent && o.parent.remove(o));
    root.add(mesh);
  }
}
const TOP = 0.3;

// ------------------------------------------------------------------ textures supplémentaires
const cache = new Map();
function canvasTex(draw, w = 256, h = 256, repeat = [1, 1]) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); t.anisotropy = 4; t.userData.keep = true; return t;
}
const e2 = (ctx, x, y, rx, ry, f, rot = 0) => { ctx.fillStyle = f; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, 6.3); ctx.fill(); };
export function tex(kind) {
  if (cache.has(kind)) return cache.get(kind);
  const R = rnd(kind.length * 131 + kind.charCodeAt(1));
  let t;
  switch (kind) {
    case 'bark': t = canvasTex((c, w, h) => { c.fillStyle = '#6b4a2c'; c.fillRect(0, 0, w, h); for (let i = 0; i < 70; i++) { c.strokeStyle = R() < 0.5 ? 'rgba(40,22,8,.55)' : 'rgba(150,110,70,.35)'; c.lineWidth = 2 + R() * 4; const x = R() * w; c.beginPath(); c.moveTo(x, 0); for (let y = 0; y <= h; y += 20) c.lineTo(x + Math.sin(y * 0.05 + i) * 6, y); c.stroke(); } for (let i = 0; i < 6; i++) e2(c, R() * w, R() * h, 8, 5, 'rgba(30,15,5,.6)'); }, 256, 256, [3, 1]); break;
    case 'bricks': t = canvasTex((c, w, h) => { c.fillStyle = '#9a9488'; c.fillRect(0, 0, w, h); for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) { const x = q * 64 + (r % 2) * 32, y = r * 64; c.fillStyle = ['#aaa398', '#8d877b', '#b5aea0', '#7f7a70'][(r + q * 2) % 4]; c.fillRect(x + 3, y + 3, 58, 58); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(x + 3, y + 3, 58, 6); } c.strokeStyle = '#4e4a42'; c.lineWidth = 4; for (let r = 0; r <= 4; r++) { c.beginPath(); c.moveTo(0, r * 64); c.lineTo(w, r * 64); c.stroke(); } e2(c, 60, 230, 30, 14, 'rgba(70,140,50,.7)'); e2(c, 190, 20, 26, 10, 'rgba(70,140,50,.6)'); }, 256, 256, [3, 1]); break;
    case 'slab': t = canvasTex((c, w, h) => { c.fillStyle = '#9d978a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 90; i++) e2(c, R() * w, R() * h, 4 + R() * 10, 3 + R() * 6, R() < 0.5 ? 'rgba(60,55,45,.2)' : 'rgba(255,255,255,.12)', R() * 3); for (let i = 0; i < 20; i++) e2(c, R() * w, R() * h, 6 + R() * 10, 4 + R() * 6, 'rgba(70,130,50,.55)'); c.strokeStyle = 'rgba(40,36,28,.7)'; c.lineWidth = 2; for (let i = 0; i < 3; i++) { c.beginPath(); let x = R() * w, y = R() * h; c.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (R() - 0.5) * 50; y += 12 + R() * 16; c.lineTo(x, y); } c.stroke(); } }); break;
    case 'rings': t = canvasTex((c, w, h) => { c.fillStyle = '#c99a62'; c.fillRect(0, 0, w, h); for (let r = 120; r > 4; r -= 9 + R() * 4) { c.strokeStyle = `rgba(110,70,30,${0.35 + R() * 0.3})`; c.lineWidth = 2 + R() * 2; c.beginPath(); c.ellipse(128 + (R() - 0.5) * 6, 128 + (R() - 0.5) * 6, r, r * 0.97, 0, 0, 6.3); c.stroke(); } c.strokeStyle = 'rgba(70,40,15,.6)'; c.lineWidth = 3; c.beginPath(); c.moveTo(128, 128); c.lineTo(240, 100); c.stroke(); e2(c, 128, 128, 5, 5, '#6a3f1a'); }); break;
    case 'wood': t = canvasTex((c, w, h) => { c.fillStyle = '#8a5a30'; c.fillRect(0, 0, w, h); for (let i = 0; i < 6; i++) { c.fillStyle = i % 2 ? '#94622f' : '#7c5128'; c.fillRect(0, i * 43, w, 41); c.strokeStyle = 'rgba(50,28,10,.6)'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, i * 43); c.lineTo(w, i * 43); c.stroke(); for (let k = 0; k < 6; k++) { c.strokeStyle = 'rgba(60,35,14,.35)'; c.lineWidth = 1.5; c.beginPath(); const y = i * 43 + 6 + R() * 30; c.moveTo(0, y); c.bezierCurveTo(80, y + 4, 160, y - 4, w, y + 2); c.stroke(); } } }); break;
    case 'weave': t = canvasTex((c, w, h) => { c.fillStyle = '#b8873c'; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 16) { c.fillStyle = ((x + y) / 16) % 2 ? '#d1a257' : '#9a6c2c'; c.fillRect(x + 1, y + 1, 14, 14); } c.strokeStyle = 'rgba(60,35,10,.4)'; c.lineWidth = 2; for (let y = 0; y <= h; y += 16) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } }, 256, 256, [4, 1]); break;
    case 'redearth': t = canvasTex((c, w, h) => { c.fillStyle = '#a8532f'; c.fillRect(0, 0, w, h); for (let i = 0; i < 120; i++) e2(c, R() * w, R() * h, 4 + R() * 14, 3 + R() * 8, R() < 0.5 ? 'rgba(90,35,15,.35)' : 'rgba(230,140,90,.3)', R() * 3); for (let i = 0; i < 14; i++) e2(c, R() * w, R() * h, 4 + R() * 6, 3 + R() * 4, '#8d8678'); for (let i = 0; i < 40; i++) { c.strokeStyle = ['#4f9a36', '#78b845'][i % 2]; c.lineWidth = 1.6; const x = R() * w, y = R() * h; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (R() - 0.5) * 6, y - 8 - R() * 8); c.stroke(); } }); break;
    case 'drymud': t = canvasTex((c, w, h) => { c.fillStyle = '#7b5b3a'; c.fillRect(0, 0, w, h); const pts = Array.from({ length: 22 }, () => [R() * w, R() * h]); c.strokeStyle = 'rgba(35,20,8,.8)'; c.lineWidth = 3; for (const [x, y] of pts) { const near = pts.map(([a, b]) => [Math.hypot(a - x, b - y), a, b]).sort((p, q) => p[0] - q[0]).slice(1, 4); for (const [, a, b] of near) { c.beginPath(); c.moveTo(x, y); c.lineTo(a, b); c.stroke(); } } for (let i = 0; i < 70; i++) e2(c, R() * w, R() * h, 3 + R() * 9, 2 + R() * 5, R() < 0.5 ? 'rgba(160,120,80,.3)' : 'rgba(40,24,10,.25)', R() * 3); }); break;
    case 'swamp': t = canvasTex((c, w, h) => { c.fillStyle = '#4a4a2a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 30; i++) e2(c, R() * w, R() * h, 10 + R() * 26, 6 + R() * 14, R() < 0.5 ? 'rgba(40,60,30,.6)' : 'rgba(30,25,12,.5)', R() * 3); for (let i = 0; i < 7; i++) { const x = R() * w, y = R() * h; e2(c, x, y, 18 + R() * 20, 9 + R() * 10, 'rgba(50,120,110,.8)'); e2(c, x - 6, y - 3, 8, 3, 'rgba(255,255,255,.35)'); } }); break;
    case 'ancient': t = canvasTex((c, w, h) => { c.fillStyle = '#8a877b'; c.fillRect(0, 0, w, h); for (let i = 0; i < 80; i++) e2(c, R() * w, R() * h, 4 + R() * 12, 3 + R() * 6, R() < 0.5 ? 'rgba(50,48,40,.25)' : 'rgba(255,255,255,.12)', R() * 3); for (let i = 0; i < 24; i++) e2(c, R() * w, R() * h, 6 + R() * 14, 4 + R() * 8, 'rgba(70,130,50,.6)'); c.strokeStyle = 'rgba(40,36,28,.85)'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.arc(128, 128, 78, 0, 6.3); c.stroke(); c.beginPath(); for (let a = 0; a < 12; a += 0.2) { const r = 6 + a * 5; c.lineTo(128 + Math.cos(a) * r, 128 + Math.sin(a) * r); } c.stroke(); for (let i = 0; i < 8; i++) { const a = i * 0.785, x = 128 + Math.cos(a) * 100, y = 128 + Math.sin(a) * 100; c.beginPath(); c.moveTo(x - 6, y); c.lineTo(x + 6, y); c.moveTo(x, y - 6); c.lineTo(x, y + 6); c.stroke(); } }); break;
    case 'blackstone': t = canvasTex((c, w, h) => { c.fillStyle = '#17171e'; c.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) e2(c, R() * w, R() * h, 6 + R() * 16, 4 + R() * 8, 'rgba(255,255,255,.05)', R() * 3); c.shadowColor = '#b36bff'; c.shadowBlur = 10; c.strokeStyle = 'rgba(190,120,255,.8)'; c.lineWidth = 2; for (let i = 0; i < 5; i++) { c.beginPath(); let x = R() * w, y = R() * h; c.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (R() - 0.5) * 60; y += (R() - 0.5) * 60; c.lineTo(x, y); } c.stroke(); } }); break;
    case 'rockTop': t = canvasTex((c, w, h) => { c.fillStyle = '#8d877b'; c.fillRect(0, 0, w, h); for (let i = 0; i < 100; i++) e2(c, R() * w, R() * h, 4 + R() * 14, 3 + R() * 8, R() < 0.5 ? 'rgba(50,45,35,.25)' : 'rgba(255,255,255,.14)', R() * 3); for (let i = 0; i < 16; i++) e2(c, R() * w, R() * h, 8 + R() * 14, 5 + R() * 8, 'rgba(80,140,55,.6)'); c.strokeStyle = 'rgba(35,30,22,.8)'; c.lineWidth = 3; for (let i = 0; i < 4; i++) { c.beginPath(); let x = R() * w, y = R() * h; c.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (R() - 0.5) * 50; y += 10 + R() * 20; c.lineTo(x, y); } c.stroke(); } }); break;
    case 'cracked': t = canvasTex((c, w, h) => { c.fillStyle = '#3a342f'; c.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) e2(c, R() * w, R() * h, 5 + R() * 12, 3 + R() * 7, 'rgba(255,255,255,.06)', R() * 3); c.shadowColor = '#ff7a1a'; c.shadowBlur = 14; c.strokeStyle = '#ffb24a'; c.lineWidth = 3; c.lineCap = 'round'; for (let i = 0; i < 7; i++) { c.beginPath(); let x = 128 + (R() - 0.5) * 60, y = 128 + (R() - 0.5) * 60; c.moveTo(x, y); const a = i * 0.9; for (let k = 0; k < 6; k++) { x += Math.cos(a + (R() - 0.5)) * 28; y += Math.sin(a + (R() - 0.5)) * 28; c.lineTo(x, y); } c.stroke(); } }); break;
    case 'roots': t = canvasTex((c, w, h) => { c.fillStyle = '#3a2a1a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 80; i++) e2(c, R() * w, R() * h, 4 + R() * 12, 3 + R() * 6, R() < 0.5 ? 'rgba(20,12,6,.4)' : 'rgba(120,90,50,.25)', R() * 3); for (let i = 0; i < 40; i++) e2(c, R() * w, R() * h, 6 + R() * 12, 4 + R() * 6, ['#3f7a2b', '#5aa036', '#2e6a22'][i % 3]); for (let i = 0; i < 8; i++) e2(c, R() * w, R() * h, 3, 3, ['#ffd23f', '#ff7aa0', '#ffffff'][i % 3]); }); break;
    default: t = surfaceTexture(kind);
  }
  cache.set(kind, t); return t;
}

// ------------------------------------------------------------------ formes de base
function lumpGeo(r, h, seed, jag = 0.12) {
  const R = rnd(seed), g = new THREE.IcosahedronGeometry(1, 2), p = g.attributes.position, flat = 0.35;
  const k = []; for (let i = 0; i < 16; i++) k.push(R() * 6.28);
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const a = Math.atan2(z, x), n = 1 + (Math.sin(a * 3 + k[0]) * 0.5 + Math.sin(a * 5 + k[1]) * 0.3 + Math.sin(y * 4 + k[2]) * 0.3) * jag;
    x *= r * n; z *= r * n; y *= h * n; if (y > flat * h) y = flat * h;
    p.setXYZ(i, x, y + TOP - flat * h, z);
  }
  g.computeVertexNormals(); return g;
}
const mesh = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; };
const tube = (pts, r, mat, seg = 24) => mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(...q))), seg, r, 6), mat);

function rootsShape() {
  const g = new THREE.Group(), R = rnd(5);
  g.add(mesh(new THREE.CylinderGeometry(1.75, 1.9, 0.7, 24), mt(0x3a2a1a), 0, TOP - 0.35, 0));
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * 6.28 + R() * 0.4, r0 = 2.0, r1 = 0.7 + R() * 0.5, w = (R() - 0.5) * 0.8;
    g.add(tube([[Math.cos(a) * r0, -0.45, Math.sin(a) * r0], [Math.cos(a + w) * (r0 * 0.7), TOP + 0.02, Math.sin(a + w) * r0 * 0.7], [Math.cos(a + w * 1.6) * r1, TOP + 0.1 + R() * 0.12, Math.sin(a + w * 1.6) * r1], [Math.cos(a + w * 2.2) * r1 * 0.5, TOP + 0.04, Math.sin(a + w * 2.2) * r1 * 0.5]], 0.09 + R() * 0.05, mt(0x5a3b22)));
  }
  return g;
}
function branchShape(curved, color) {
  const g = new THREE.Group(), bm = mt(color || 0x6b4a2c, { map: tex('bark') });
  if (curved) g.add(tube([[-2.3, -0.7, 0], [-1.2, -0.2, 0], [0, TOP - 0.45, 0], [1.2, -0.25, 0], [2.3, -0.8, 0]], 0.45, bm, 40));
  else { const m = mesh(new THREE.CylinderGeometry(0.46, 0.52, 4.6, 14), bm, 0, TOP - 0.48, 0); m.rotation.z = Math.PI / 2; g.add(m); }
  for (const s of [-1, 1]) { const tw = mesh(new THREE.CylinderGeometry(0.05, 0.1, 0.9, 6), bm, s * 1.5, TOP - 0.1, 0.3 * s); tw.rotation.set(0.5 * s, 0, -0.9 * s); g.add(tw); }
  return g;
}
const earthShape = (c, rt = 1.85, rb = 2.0, h = 0.7) => mesh(new THREE.CylinderGeometry(rt, rb, h, 28), mt(c), 0, TOP - h / 2, 0);
function wallShape() {
  const side = mt(0xffffff, { map: tex('bricks') }), top = mt(0xffffff, { map: tex('slab') });
  return mesh(new THREE.BoxGeometry(3.7, 0.75, 1.9), [side, side, top, side, side, side], 0, TOP - 0.375, 0);
}
function stumpShape() {
  const g = new THREE.Group(), side = mt(0xffffff, { map: tex('bark') }), top = mt(0xffffff, { map: tex('rings') });
  g.add(mesh(new THREE.CylinderGeometry(1.45, 1.6, 0.95, 24), [side, top, side], 0, TOP - 0.475, 0));
  for (let i = 0; i < 5; i++) { const a = i * 1.25; const rt = tube([[Math.cos(a) * 1.5, TOP - 0.5, Math.sin(a) * 1.5], [Math.cos(a) * 1.9, -0.3, Math.sin(a) * 1.9], [Math.cos(a) * 2.3, -0.5, Math.sin(a) * 2.3]], 0.1, mt(0x5a3b22), 10); g.add(rt); }
  return g;
}
function chestShape() {
  const g = new THREE.Group(), wood = mt(0xffffff, { map: tex('wood') }), band = mt(0x3a3a40, { metalness: 0.5, roughness: 0.5 });
  g.add(mesh(new THREE.BoxGeometry(2.7, 0.6, 1.7), wood, 0, TOP - 0.3, 0));
  for (const x of [-0.95, 0.95]) g.add(mesh(new THREE.BoxGeometry(0.16, 0.64, 1.76), band, x, TOP - 0.3, 0));
  g.add(mesh(new THREE.BoxGeometry(2.74, 0.06, 1.74), band, 0, TOP - 0.42, 0));
  g.add(mesh(new THREE.BoxGeometry(0.32, 0.36, 0.08), mt(0xe0b030, { metalness: 0.7, roughness: 0.3 }), 0, TOP - 0.28, 0.9));
  return g;
}
function basketShape() {
  const g = new THREE.Group(), w = mt(0xffffff, { map: tex('weave') });
  g.add(mesh(new THREE.CylinderGeometry(1.35, 1.7, 0.9, 20), [w, w, w], 0, TOP - 0.45, 0));
  g.add(mesh(new THREE.TorusGeometry(1.36, 0.07, 6, 24), mt(0x8a5a22), 0, TOP - 0.01, 0).rotateX(Math.PI / 2));
  return g;
}
function tombShape() {
  const g = new THREE.Group(), sl = mt(0xffffff, { map: tex('slab') });
  g.add(mesh(new THREE.BoxGeometry(2.9, 0.5, 1.9), sl, 0, TOP - 0.25, 0));
  const st = mesh(new THREE.BoxGeometry(0.95, 1.4, 0.22), sl, -1.15, TOP + 0.7, -0.55); st.rotation.z = 0.06; g.add(st);
  g.add(mesh(new THREE.CylinderGeometry(0.475, 0.475, 0.22, 14), sl, -1.15, TOP + 1.4, -0.55).rotateX(Math.PI / 2));
  g.add(mesh(new THREE.BoxGeometry(0.1, 0.5, 0.05), mt(0x3a372f), -1.15, TOP + 0.95, -0.42), mesh(new THREE.BoxGeometry(0.34, 0.1, 0.05), mt(0x3a372f), -1.15, TOP + 1.05, -0.42));
  return g;
}
function circleShape() {
  const g = new THREE.Group(), R = rnd(11);
  g.add(mesh(new THREE.CylinderGeometry(1.8, 1.9, 0.5, 28), mt(0x2d2740), 0, TOP - 0.25, 0));
  for (let i = 0; i < 7; i++) { const a = (i / 7) * 6.28, h = 0.7 + R() * 0.5; const s = mesh(new THREE.BoxGeometry(0.34, h, 0.26), mt(0x7d7a8a), Math.cos(a) * 1.75, TOP + h / 2 - 0.12, Math.sin(a) * 1.75 * 0.85); s.rotation.set((R() - 0.5) * 0.2, -a, (R() - 0.5) * 0.15); g.add(s); }
  return g;
}
function isletShape() {
  const g = new THREE.Group();
  const water = mesh(new THREE.CylinderGeometry(1.95, 1.95, 0.1, 32), new THREE.MeshStandardMaterial({ color: 0x1f9bb8, transparent: true, opacity: 0.85, roughness: 0.15, map: tex('water') }), 0, 0.12, 0);
  g.add(water, mesh(new THREE.CylinderGeometry(1.2, 1.5, 0.55, 22), mt(0x5a4026), 0, TOP - 0.28, 0));
  g.userData.waterMesh = water; return g;
}
function swampShape() { return earthShape(0x3a3a22, 1.85, 2.0, 0.6); }

const rockShape = (r, h, color, seed, jag = 0.12, extra = {}) => mesh(lumpGeo(r, h, seed, jag), mt(color, extra), 0, 0, 0);

// ------------------------------------------------------------------ décors
const grass = (g, n, r0, r1, seed, col = 0x4fa03a) => { const R = rnd(seed); for (let i = 0; i < n; i++) { const a = R() * 6.28, r = r0 + R() * (r1 - r0); for (let k = 0; k < 4; k++) { const b = mesh(new THREE.ConeGeometry(0.025, 0.22 + R() * 0.2, 4), mt(col, { flatShading: false })); b.position.set(Math.cos(a) * r + (R() - 0.5) * 0.08, TOP + 0.1, Math.sin(a) * r * 0.85 + (R() - 0.5) * 0.08); b.rotation.set((R() - 0.5) * 0.5, 0, (R() - 0.5) * 0.5); b.castShadow = false; g.add(b); } } };
const stones = (g, n, r0, r1, seed, col = 0x8a857a, sz = 0.12) => { const R = rnd(seed); for (let i = 0; i < n; i++) { const a = R() * 6.28, r = r0 + R() * (r1 - r0); const s = mesh(new THREE.IcosahedronGeometry(sz * (0.6 + R() * 0.9), 0), mt(col)); s.scale.y = 0.65; s.position.set(Math.cos(a) * r, TOP + 0.03, Math.sin(a) * r * 0.85); g.add(s); } };
const flowers = (g, n, r0, r1, seed, cols = [0xff6b8a, 0xffd23f, 0xffffff]) => { const R = rnd(seed); for (let i = 0; i < n; i++) { const a = R() * 6.28, r = r0 + R() * (r1 - r0), f = new THREE.Group(); const st = mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.22, 4), mt(0x3f8a2e)); st.position.y = 0.11; const hd = mesh(new THREE.SphereGeometry(0.06, 7, 5), mt(cols[i % cols.length], { flatShading: false })); hd.position.y = 0.24; f.add(st, hd); f.position.set(Math.cos(a) * r, TOP, Math.sin(a) * r * 0.85); g.add(f); } };
const leaves = (g, n, r0, r1, seed, cols = [0x3f9a3a, 0x5ab04a], big = 0.28) => { const R = rnd(seed); for (let i = 0; i < n; i++) { const a = R() * 6.28, r = r0 + R() * (r1 - r0); const l = mesh(new THREE.SphereGeometry(big * (0.7 + R() * 0.6), 7, 4), mt(cols[i % cols.length], { side: THREE.DoubleSide })); l.scale.set(1, 0.12, 0.45); l.position.set(Math.cos(a) * r, TOP + 0.08 + R() * 0.1, Math.sin(a) * r * 0.85); l.rotation.set((R() - 0.5) * 0.5, R() * 6, (R() - 0.5) * 0.5); l.castShadow = false; g.add(l); } };
const mush = (g, n, r0, r1, seed) => { const R = rnd(seed); for (let i = 0; i < n; i++) { const a = R() * 6.28, r = r0 + R() * (r1 - r0), s = new THREE.Group(); const st = mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.14, 6), mt(0xf2ead0)); st.position.y = 0.07; const cp = mesh(new THREE.SphereGeometry(0.09, 8, 5, 0, 6.3, 0, 1.57), mt(R() < 0.5 ? 0xd9402f : 0xf2a23a, { flatShading: false })); cp.position.y = 0.14; s.add(st, cp); s.position.set(Math.cos(a) * r, TOP, Math.sin(a) * r * 0.85); g.add(s); } };
const reeds = (g, n, r0, r1, seed) => { const R = rnd(seed); for (let i = 0; i < n; i++) { const a = R() * 6.28, r = r0 + R() * (r1 - r0), f = new THREE.Group(), h = 0.6 + R() * 0.5; const st = mesh(new THREE.CylinderGeometry(0.012, 0.018, h, 5), mt(0x56903a)); st.position.y = h / 2; const tp = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.16, 6), mt(0x6b4a2a)); tp.position.y = h; f.add(st, tp); f.position.set(Math.cos(a) * r, TOP - 0.05, Math.sin(a) * r * 0.85); f.rotation.z = (R() - 0.5) * 0.3; g.add(f); } };
const pads = (g, n, r0, r1, seed, y = 0.2) => { const R = rnd(seed); for (let i = 0; i < n; i++) { const a = R() * 6.28, r = r0 + R() * (r1 - r0); const p = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 12, 1, false, 0.5, 5.5), mt(0x3f9a3a, { flatShading: false })); p.position.set(Math.cos(a) * r, y, Math.sin(a) * r * 0.85); p.rotation.y = R() * 6; g.add(p); if (i % 2 === 0) { const f = mesh(new THREE.ConeGeometry(0.07, 0.12, 6), mt(0xff8fb1, { flatShading: false })); f.position.set(p.position.x, y + 0.07, p.position.z); g.add(f); } } };
const shells = (g, n, r0, r1, seed) => { const R = rnd(seed); for (let i = 0; i < n; i++) { const a = R() * 6.28, r = r0 + R() * (r1 - r0); const s = mesh(R() < 0.5 ? new THREE.ConeGeometry(0.07, 0.13, 7) : new THREE.SphereGeometry(0.07, 7, 4, 0, 6.3, 0, 1.6), mt([0xf4e6d0, 0xe99a8a, 0xf7c9b6][i % 3], { flatShading: false })); s.position.set(Math.cos(a) * r, TOP + 0.05, Math.sin(a) * r * 0.85); s.rotation.z = R() * 1.5; g.add(s); } };
const coral = (g, n, r0, r1, seed) => { const R = rnd(seed); for (let i = 0; i < n; i++) { const a = R() * 6.28, r = r0 + R() * (r1 - r0), f = new THREE.Group(); for (let k = 0; k < 3; k++) { const b = mesh(new THREE.CylinderGeometry(0.02, 0.04, 0.3 + R() * 0.2, 5), mt([0xff6b8a, 0xff9f43, 0xe28cff][i % 3], { flatShading: false })); b.position.set((k - 1) * 0.07, 0.17, 0); b.rotation.z = (k - 1) * 0.4; f.add(b); } f.position.set(Math.cos(a) * r, TOP - 0.05, Math.sin(a) * r * 0.85); g.add(f); } };
const coins = (g, n, r0, r1, seed) => { const R = rnd(seed); for (let i = 0; i < n; i++) { const a = R() * 6.28, r = r0 + R() * (r1 - r0); const c = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.025, 12), mt(0xffcc33, { metalness: 0.7, roughness: 0.3, flatShading: false })); c.position.set(Math.cos(a) * r, TOP + 0.02 + (i % 3) * 0.03, Math.sin(a) * r * 0.8); c.rotation.set(R() * 0.5, R() * 6, R() * 0.5); g.add(c); } };
const fruits = (g, n, r0, r1, seed) => { const R = rnd(seed); for (let i = 0; i < n; i++) { const a = R() * 6.28, r = r0 + R() * (r1 - r0); const f = mesh(new THREE.SphereGeometry(0.12, 10, 8), mt([0xe0452f, 0xffa530, 0xf2d53a, 0x7ac043][i % 4], { flatShading: false })); f.position.set(Math.cos(a) * r, TOP + 0.1, Math.sin(a) * r * 0.85); g.add(f); } };
const feathers = (g, n, r0, r1, seed) => { const R = rnd(seed); for (let i = 0; i < n; i++) { const a = R() * 6.28, r = r0 + R() * (r1 - r0); const f = mesh(new THREE.PlaneGeometry(0.1, 0.5), new THREE.MeshStandardMaterial({ color: [0xf5f5f5, 0xcf9b52, 0x8a6a4a][i % 3], side: THREE.DoubleSide })); f.position.set(Math.cos(a) * r, TOP + 0.05, Math.sin(a) * r * 0.85); f.rotation.set(-1.45, R() * 6, R() * 0.4); g.add(f); } };
const candles = (g, n, r, seed) => { const R = rnd(seed); for (let i = 0; i < n; i++) { const a = (i / n) * 6.28 + 0.4; const s = new THREE.Group(); const c = mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.2, 8), mt(0xf4ecd8)); c.position.y = 0.1; const f = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd36b })); f.position.y = 0.24; f.userData.flame = i; s.add(c, f); s.position.set(Math.cos(a) * r, TOP, Math.sin(a) * r * 0.85); g.add(s); } };
const crystals = (g, n, r, seed) => { const R = rnd(seed); for (let i = 0; i < n; i++) { const a = R() * 6.28; const c = mesh(new THREE.OctahedronGeometry(0.11 + R() * 0.08), new THREE.MeshStandardMaterial({ color: 0xb36bff, emissive: 0x7a3acc, emissiveIntensity: 0.9, flatShading: true })); c.scale.y = 1.8; c.position.set(Math.cos(a) * r, TOP + 0.15, Math.sin(a) * r * 0.85); g.add(c); } };
const potion = (g, x, z) => { const b = new THREE.Group(); b.add(mesh(new THREE.SphereGeometry(0.11, 10, 8), new THREE.MeshStandardMaterial({ color: 0x8a3acc, emissive: 0x5a1a9a, emissiveIntensity: 0.6, transparent: true, opacity: 0.9 })), mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.12, 8), mt(0xdde8e8, { flatShading: false }), 0, 0.14, 0)); b.position.set(x, TOP + 0.1, z); g.add(b); };
const flames = (g, n, r, seed) => { const R = rnd(seed); for (let i = 0; i < n; i++) { const a = (i / n) * 6.28 + 0.3; const m = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.28, 6), new THREE.MeshBasicMaterial({ color: 0xff8a2a, transparent: true, opacity: 0.9 })); m.position.set(Math.cos(a) * r, TOP + 0.14, Math.sin(a) * r * 0.85); m.userData.flame = i; g.add(m); } };
const rootsDrape = (g, n, r, seed) => { const R = rnd(seed); for (let i = 0; i < n; i++) { const a = R() * 6.28; g.add(tube([[Math.cos(a) * r, TOP + 0.02, Math.sin(a) * r * 0.85], [Math.cos(a) * (r + 0.25), TOP - 0.3, Math.sin(a) * (r + 0.25) * 0.85], [Math.cos(a) * (r + 0.45), TOP - 0.8, Math.sin(a) * (r + 0.45) * 0.85]], 0.06, mt(0x5a3b22), 10)); } };
const mossBlobs = (g, n, r, seed) => { const R = rnd(seed); for (let i = 0; i < n; i++) { const a = R() * 6.28; const m = mesh(new THREE.SphereGeometry(0.2 + R() * 0.15, 7, 5), mt(0x4f9a36, { flatShading: false })); m.scale.y = 0.35; m.position.set(Math.cos(a) * r, TOP - 0.05 - R() * 0.35, Math.sin(a) * r * 0.85); g.add(m); } };
const fence = (g) => { const w = mt(0x8a5a2e); for (let i = 0; i < 6; i++) g.add(mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), w, -1.5 + i * 0.6, TOP + 0.25, -1.15)); for (const y of [0.18, 0.38]) g.add(mesh(new THREE.BoxGeometry(3.2, 0.07, 0.06), w, 0, TOP + y, -1.15)); };
const sword = (g) => { const s = new THREE.Group(); s.add(mesh(new THREE.BoxGeometry(0.08, 0.9, 0.02), mt(0xc9d2da, { metalness: 0.7, roughness: 0.3, flatShading: false }), 0, 0.45, 0), mesh(new THREE.BoxGeometry(0.34, 0.06, 0.06), mt(0xd9a52a, { metalness: 0.6, flatShading: false }), 0, 0.92, 0), mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.22, 6), mt(0x6a3a1a), 0, 1.06, 0)); s.position.set(-1.05, TOP, -0.5); s.rotation.z = 0.12; g.add(s); };
const jug = (g, x, z) => { g.add(mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.26, 10), mt(0x9a5a3a, { flatShading: false }), x, TOP + 0.13, z)); };
const driftwood = (g) => { const d = mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.8, 6), mt(0x9a7a52)); d.rotation.z = 1.4; d.position.set(1.1, TOP + 0.05, 0.5); g.add(d); };
const floatPebbles = (g, seed) => { const R = rnd(seed); for (let i = 0; i < 6; i++) { const a = R() * 6.28, r = 1.2 + R() * 0.5; const s = mesh(new THREE.IcosahedronGeometry(0.07 + R() * 0.08, 0), mt(0x1b1b22, { emissive: 0x3a1a5a, emissiveIntensity: 0.4 })); s.position.set(Math.cos(a) * r, TOP - 0.2 + R() * 0.9, Math.sin(a) * r * 0.85); g.add(s); } };

// ------------------------------------------------------------------ catalogue des 25 supports
/** renvoie { shape, props, disc: {r, tex}|null, fx } pour un personnage */
export function buildPedestal(id) {
  const shape = new THREE.Group(), props = new THREE.Group();
  let disc = null, fx = 'moss';
  const S = (o) => shape.add(o);
  switch (id) {
    case 'kalanoro': S(rootsShape()); disc = { r: 1.0, tex: 'roots' }; fx = 'moss'; leaves(props, 7, 1.0, 1.5, 1); flowers(props, 7, 0.9, 1.5, 2); rootsDrape(props, 3, 1.85, 3); break;
    case 'maki': S(branchShape(false, 0x6b4a2c)); fx = 'leaves'; leaves(props, 10, 0.7, 1.9, 4, [0x3f9a3a, 0x59b04a, 0x2f8a3a], 0.34); flowers(props, 4, 0.9, 1.7, 5); break;
    case 'fosa': S(rockShape(1.75, 1.0, 0x8d7a66, 21)); disc = { r: 1.4, tex: 'rockTop' }; fx = 'rock'; grass(props, 8, 1.0, 1.5, 6); { const b = mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.9, 5), mt(0x5a3f26)); b.rotation.z = 1.2; b.position.set(1.2, TOP + 0.1, 0.4); props.add(b); } break;
    case 'omby': S(earthShape(0xa8532f)); disc = { r: 1.75, tex: 'redearth' }; fx = 'rock'; grass(props, 9, 0.9, 1.6, 7); stones(props, 5, 1.0, 1.6, 8); break;
    case 'kisoa': S(earthShape(0x7b5b3a)); disc = { r: 1.75, tex: 'drymud' }; fx = 'mud'; grass(props, 6, 1.0, 1.6, 9, 0x6a9a3a); rootsDrape(props, 4, 1.8, 10); break;
    case 'sahona': S(isletShape()); disc = { r: 1.0, tex: 'mud' }; fx = 'pond'; pads(props, 5, 1.2, 1.7, 11); reeds(props, 7, 1.15, 1.7, 12); break;
    case 'saka': S(wallShape()); disc = null; fx = 'rock'; flowers(props, 8, 0.4, 1.5, 13); grass(props, 7, 0.4, 1.6, 14); stones(props, 3, 1.3, 1.6, 15); break;
    case 'alika': S(earthShape(0x8a6a44)); disc = { r: 1.75, tex: 'redearth' }; fx = 'rock'; fence(props); stones(props, 6, 0.9, 1.6, 16); grass(props, 5, 1.0, 1.5, 17); break;
    case 'sifaka': S(branchShape(false, 0x8a6a40)); fx = 'leaves'; leaves(props, 10, 0.7, 1.9, 18, [0x4fa03a, 0x6cb84a], 0.32); flowers(props, 6, 0.8, 1.8, 19, [0xff8fb1, 0xffd23f]); break;
    case 'ayeaye': S(stumpShape()); disc = null; fx = 'moss'; mush(props, 6, 1.0, 1.4, 20); leaves(props, 6, 0.9, 1.5, 21, [0x3a4a2a, 0x4a3a22]); break;
    case 'tana': S(branchShape(true, 0x7a5a30)); fx = 'leaves'; leaves(props, 12, 0.7, 2.0, 22, [0x3fc04a, 0x7ad04a, 0x2f9a5a], 0.34); flowers(props, 4, 0.8, 1.6, 23, [0xff7a3a, 0xffd23f]); break;
    case 'tenrec': { const m = mesh(new THREE.SphereGeometry(1.9, 24, 10, 0, 6.3, 0, 1.57), mt(0x6a4a2a, { flatShading: false }), 0, TOP - 0.62, 0); m.scale.y = 0.34; S(m); disc = { r: 0.95, tex: 'leaves' }; fx = 'leaves'; leaves(props, 9, 0.8, 1.7, 24, [0x9a5a22, 0xc8841e, 0x7a4a1a], 0.26); rootsDrape(props, 3, 1.6, 25); } break;
    case 'lolo': S(rockShape(1.3, 0.8, 0x15151c, 26, 0.16, { emissive: 0x2a1040, emissiveIntensity: 0.5 })); disc = { r: 1.1, tex: 'blackstone' }; fx = 'mist'; floatPebbles(props, 27); break;
    case 'vazimba': S(rockShape(1.65, 1.0, 0x7c7a6e, 28, 0.1)); disc = { r: 1.4, tex: 'ancient' }; fx = 'moss'; rootsDrape(props, 4, 1.5, 29); mossBlobs(props, 6, 1.5, 30); break;
    case 'angatra': S(tombShape()); disc = null; fx = 'mist'; grass(props, 9, 0.5, 1.6, 31, 0x2f4a2a); break;
    case 'trimobe': S(rockShape(1.8, 1.1, 0x4a423c, 32, 0.16)); disc = { r: 1.5, tex: 'cracked' }; fx = 'fire'; flames(props, 4, 1.35, 33); break;
    case 'tortue': S(earthShape(0xe1c78e, 1.85, 2.0, 0.6)); disc = { r: 1.8, tex: 'sand' }; fx = 'sand'; shells(props, 8, 0.9, 1.6, 34); stones(props, 5, 1.0, 1.6, 35, 0x9a9080); break;
    case 'sorciere': S(circleShape()); disc = { r: 1.75, tex: 'rune' }; fx = 'rune'; candles(props, 4, 1.25, 36); crystals(props, 3, 1.1, 37); potion(props, 0.9, 0.7); break;
    case 'darafify': S(rockShape(1.5, 1.45, 0x9a8f80, 38, 0.12)); disc = { r: 1.25, tex: 'rockTop' }; fx = 'feathers'; feathers(props, 7, 0.8, 1.35, 39); grass(props, 5, 0.9, 1.3, 40); break;
    case 'rapeto': S(rockShape(1.95, 1.1, 0x7a766a, 41, 0.18)); disc = { r: 1.7, tex: 'rockTop' }; fx = 'rock'; rootsDrape(props, 5, 1.7, 42); mossBlobs(props, 8, 1.7, 43); break;
    case 'ikotofetsy': S(chestShape()); disc = null; fx = 'glint'; coins(props, 14, 0.4, 1.3, 44); jug(props, -1.05, 0.5); break;
    case 'imahaka': S(swampShape()); disc = { r: 1.75, tex: 'swamp' }; fx = 'pond'; reeds(props, 9, 1.0, 1.7, 45); pads(props, 2, 1.2, 1.6, 46, TOP + 0.01); break;
    case 'ibonia': S(rockShape(1.55, 1.0, 0x80858f, 47, 0.1)); disc = { r: 1.3, tex: 'rockTop' }; fx = 'glint'; grass(props, 7, 0.9, 1.4, 48); flowers(props, 6, 0.9, 1.4, 49, [0xff7a9a, 0xffd23f, 0xffffff]); sword(props); break;
    case 'ikotobekibo': S(basketShape()); disc = { r: 1.3, tex: 'weave' }; fx = 'leaves'; fruits(props, 7, 0.9, 1.2, 50); leaves(props, 5, 0.9, 1.3, 51); break;
    case 'zazavavindrano': S(rockShape(1.6, 1.0, 0x6f8a9a, 52, 0.12)); disc = { r: 1.25, tex: 'water' }; fx = 'water'; shells(props, 7, 0.9, 1.4, 53); coral(props, 5, 1.0, 1.45, 54); break;
    default: S(earthShape(0x7a5a3a)); disc = { r: 1.7, tex: 'moss' }; break;
  }
  shape.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  mergeStatic(shape); mergeStatic(props);
  return { shape, props, disc, fx };
}
