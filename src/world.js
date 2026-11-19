import * as THREE from 'three';
import { mat, toon, ell, cone, cyl, box, buildCrab, toonGradient } from './chars.js';
import { buildTrees, buildGrass, buildClouds, buildBirds, buildGroundCover, wind } from './decor.js';
import { IS_MOBILE } from './device.js';
import { soilFronts, vHash, buildWorms } from './soil.js';
import { buildLandmark, buildRing, buildMeadowArea, buildFrontFringe } from './landmarks.js';

// ------------------------------------------------------------------ thèmes
const BASE = { fogNear: 34, fogFar: 115, hemi: [0xfff1d6, 0x8a6a38, 1.2], sun: [0xffc079, 3.0], sunPos: [-18, 13, 18], sunDisc: false, water: '#19c3d8', cloud: 0xffffff, mount: 0xa9bfd0 };
const P = (o) => ({ ...BASE, ...o });
// ambiance « heure dorée » : lumière chaude, ciel rosé, ombres longues
export const THEMES = {
  forest:      P({ kind: 'forest', topBase: '#74c455', patch: '#4ea03a', sideA: '#d6a874', sideB: '#a97c4c', sky: ['#6fb0ee', '#ffc98c', '#fff1cf'], fog: 0xffdcae, mount: 0xa9bfd0, land: 0x6fbf4c }),
  tsingy:      P({ kind: 'tsingy', topBase: '#8fc85a', patch: '#6fae44', sideA: '#c8683c', sideB: '#9a4628', sky: ['#5aa0e8', '#ffb77a', '#ffe3b0'], fog: 0xffcf9c, mount: 0xd0a888, land: 0x9fc860 }),
  baobab:      P({ kind: 'baobab', topBase: '#b9c75e', patch: '#9db648', sideA: '#b5532f', sideB: '#8a3b25', sky: ['#6a4fb8', '#ff7f5a', '#ffd27a'], fog: 0xffae7a, mount: 0xb86a78, land: 0xb8c060, sunDisc: true, sun: [0xff9a5a, 3.1], sunPos: [18, 10, 18] }),
  rova:        P({ kind: 'forest', topBase: '#7fcf5a', patch: '#58b040', sideA: '#c8795a', sideB: '#9a4f38', sky: ['#7a8ff0', '#ff9e9a', '#ffe0c0'], fog: 0xffc8b0, mount: 0xb8a0c0, land: 0x76c452 }),
  nosybe:      P({ kind: 'beach', topBase: '#f2dca8', patch: '#7cc84e', sideA: '#e6c08a', sideB: '#b8925e', sky: ['#2f9fff', '#8fdcff', '#fff4d0'], fog: 0xcdeeff, water: '#12d0e0', mount: 0x7fb0d0, land: 0xf0dca8, sun: [0xffe0a0, 3.0] }),
  boraha:      P({ kind: 'beach', topBase: '#f0d8a0', patch: '#6cc04a', sideA: '#e0b880', sideB: '#b08a58', sky: ['#3a8fe8', '#ffb8a0', '#fff0d0'], fog: 0xffd6c0, water: '#18bcd8', mount: 0x9ab0c8, land: 0xe8d49a }),
  isalo:       P({ kind: 'canyon', topBase: '#d9a35a', patch: '#7fb844', sideA: '#c8602e', sideB: '#8f3c1c', sky: ['#4a78d8', '#ff9060', '#ffd8a0'], fog: 0xffb888, water: '#2ab8c8', mount: 0xc87858, land: 0xd8a060 }),
  andasibe:    P({ kind: 'forest', topBase: '#5fb84a', patch: '#3f9a3a', sideA: '#a98a62', sideB: '#7a5e3c', sky: ['#6fa8c8', '#c8e0b8', '#f0f4d0'], fog: 0xc8e4c0, fogNear: 24, fogFar: 90, mount: 0x88b098, land: 0x4fa83e, sun: [0xfff0b8, 2.4] }),
  bemaraha:    P({ kind: 'tsingy', topBase: '#9acb68', patch: '#78b050', sideA: '#a39d92', sideB: '#6e6a62', sky: ['#5a98d8', '#ffc89a', '#fff0d8'], fog: 0xffdcc0, mount: 0xb8b0a8, land: 0x88b860 }),
  ranomafana:  P({ kind: 'forest', topBase: '#58b448', patch: '#3a9638', sideA: '#9a8260', sideB: '#6e5a3c', sky: ['#68a0b8', '#b8d8c8', '#e8f4e0'], fog: 0xb8d8c8, fogNear: 22, fogFar: 85, mount: 0x7fa890, land: 0x48a03e, sun: [0xfff0c0, 2.3] }),
  antsirabe:   P({ kind: 'forest', topBase: '#88c860', patch: '#62ac48', sideA: '#c88a5a', sideB: '#985e38', sky: ['#6890e0', '#ffb890', '#ffe8d0'], fog: 0xffd0b0, mount: 0xb0a8c8, land: 0x80c05a }),
  antsiranana: P({ kind: 'beach', topBase: '#e8d49a', patch: '#78c050', sideA: '#d89a70', sideB: '#a8683e', sky: ['#2f88f0', '#ffa078', '#ffe0b0'], fog: 0xffd0a8, water: '#10c0d8', mount: 0xc89080, land: 0xe0cc92 }),
  toliara:     P({ kind: 'baobab', topBase: '#d8c470', patch: '#a8bc50', sideA: '#c8784a', sideB: '#96502c', sky: ['#4f7fe0', '#ff9a60', '#ffdd9a'], fog: 0xffc088, water: '#20c0d0', mount: 0xc88868, land: 0xd0c068, sunDisc: true, sun: [0xff9d5a, 3.1], sunPos: [18, 10, 18] }),
  ambohimanga:    P({ kind: 'forest', topBase: '#86c860', patch: '#62ac48', sideA: '#c8785a', sideB: '#9a4f38', sky: ['#6a90e8', '#ffb890', '#ffe8d0'], fog: 0xffd0b0, mount: 0xb0a8c8, land: 0x7cc056 }),
  tritriva:       P({ kind: 'forest', topBase: '#62b84e', patch: '#3f9a3a', sideA: '#7a6a5a', sideB: '#52463e', sky: ['#5a98d8', '#bfe0f0', '#f0f6e8'], fog: 0xcfe6e0, fogNear: 26, fogFar: 95, mount: 0x7fa8a0, land: 0x56ac44 }),
  ambre:          P({ kind: 'forest', topBase: '#4fb048', patch: '#368c36', sideA: '#8a7a5a', sideB: '#5e523a', sky: ['#5aa0b8', '#a8d8c8', '#e8f4e0'], fog: 0xb0d8c8, fogNear: 22, fogFar: 85, mount: 0x6f9a88, land: 0x409a3a, sun: [0xfff0c0, 2.3] }),
  ankarafantsika: P({ kind: 'canyon', topBase: '#c8a860', patch: '#88b848', sideA: '#c0502a', sideB: '#8a3418', sky: ['#4a78d8', '#ff9868', '#ffd8a0'], fog: 0xffb888, water: '#2ab8c8', mount: 0xc87858, land: 0xd0a468 }),
  komba:          P({ kind: 'beach', topBase: '#f0dca8', patch: '#6cc04a', sideA: '#e0b880', sideB: '#b08a58', sky: ['#2f9fff', '#8fdcff', '#fff4d0'], fog: 0xcdeeff, water: '#12d0e0', mount: 0x7fb0d0, land: 0xeed8a2 }),
  iranja:         P({ kind: 'beach', topBase: '#f6e8c0', patch: '#7ccc58', sideA: '#ecd0a0', sideB: '#c0a070', sky: ['#2a90f8', '#9ae0ff', '#fff6d8'], fog: 0xd8f0ff, water: '#10d8e0', mount: 0x8ab8d8, land: 0xf4e4b4 }),
  kirindy:        P({ kind: 'baobab', topBase: '#c8c060', patch: '#98b44a', sideA: '#b86a3a', sideB: '#864622', sky: ['#4f7fe0', '#ff9a60', '#ffdd9a'], fog: 0xffc088, water: '#20b8c8', mount: 0xc88868, land: 0xc8bc66, sunDisc: true, sun: [0xff9d5a, 3.1], sunPos: [18, 10, 18] }),
  ankaratra:      P({ kind: 'tsingy', topBase: '#7a8a62', patch: '#5a7a48', sideA: '#4a3a3e', sideB: '#2e2226', sky: ['#3a2a5a', '#d8603a', '#ffb060'], fog: 0xe89060, fogNear: 24, fogFar: 90, mount: 0x5a4a54, land: 0x6a5a50, lava: true, water: '#d03008', cloud: 0xffc8a0, sun: [0xff8a4a, 3.0], sunPos: [16, 10, 18] }),
  tsaratanana:    P({ kind: 'tsingy', topBase: '#8a9a78', patch: '#6a8a58', sideA: '#4e4248', sideB: '#30262c', sky: ['#2a2a5a', '#e0663a', '#ffc070'], fog: 0xf09868, fogNear: 24, fogFar: 90, mount: 0x6a5c68, land: 0x786a60, lava: true, water: '#d03008', cloud: 0xffd0b0, sun: [0xff8240, 3.0], sunPos: [16, 10, 18] }),
  tsiafajavona:   P({ kind: 'canyon', topBase: '#5a504a', patch: '#6a7a50', sideA: '#2e2428', sideB: '#1a1216', sky: ['#2a1030', '#d03a2a', '#ff9a3a'], fog: 0xe86a3a, fogNear: 20, fogFar: 80, mount: 0x4a3a44, land: 0x4a4044, lava: true, water: '#e03a08', cloud: 0xff9a70, sun: [0xff6a30, 3.2], sunPos: [14, 9, 18] }),
};

// ------------------------------------------------------------------ utilitaires
function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function canvasTex(w, h, draw, repeat = false) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  return t;
}
function speckle(ctx, w, h, base, colors, n, r = 2) {
  ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
  const R = rng(7);
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = colors[Math.floor(R() * colors.length)];
    ctx.globalAlpha = 0.25 + R() * 0.45;
    ctx.beginPath(); ctx.arc(R() * w, R() * h, 0.6 + R() * r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function gradientTex(stops) {
  return canvasTex(4, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, stops[0]); g.addColorStop(0.55, stops[1]); g.addColorStop(1, stops[2]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
}
function glowTex(color = '255,240,200') {
  return canvasTex(128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, `rgba(${color},1)`); g.addColorStop(0.35, `rgba(${color},0.35)`); g.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
}

// ------------------------------------------------------------------ matériaux de blocs
const bmCache = new Map();
function blockMaterials(th, key) {
  if (bmCache.has(key)) return bmCache.get(key);
  const res = makeBlockMaterials(th, key);
  for (const arr of Object.values(res)) for (const m of arr.flat()) { m.userData.keep = true; if (m.map) m.map.userData.keep = true; }
  bmCache.set(key, res); return res;
}
function makeBlockMaterials(th, worldId) {
  const lump = (ctx, w, h, col, n, r0, r1) => { const R = rng(11); ctx.fillStyle = col; for (let i = 0; i < n; i++) { const x = R() * w, y = R() * h, r = r0 + R() * (r1 - r0); for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) { ctx.beginPath(); ctx.ellipse(x + dx, y + dy, r * 1.3, r, R() * 3, 0, 6.3); ctx.fill(); } } };
  // dessus : pierre claire avec grands patchs d'herbe et petites fleurs (comme dans les jeux « cartoon »)
  const topTex = canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = th.topBase; ctx.fillRect(0, 0, w, h);
    lump(ctx, w, h, 'rgba(0,0,0,.05)', 40, 4, 12);
    lump(ctx, w, h, th.patch, 9, 22, 44);
    lump(ctx, w, h, 'rgba(255,255,255,.14)', 10, 8, 18);
    const R = rng(3); const fl = ['#ffd23f', '#ff7a9a', '#ffffff', '#8fd3ff'];
    for (let i = 0; i < 16; i++) { ctx.fillStyle = fl[i % 4]; ctx.beginPath(); ctx.arc(R() * w, R() * h, 2.6, 0, 6.3); ctx.fill(); }
  }, true);
  // côtés : strates de roche avec liserés plus sombres
  const sideTex = canvasTex(8, 8, (ctx, w, h) => { ctx.fillStyle = th.sideA; ctx.fillRect(0, 0, w, h); }, true);   // face avant unie : aucun indice sur les pièges
  const dirtTex = canvasTex(8, 8, (ctx, w, h) => { ctx.fillStyle = th.sideA; ctx.fillRect(0, 0, w, h); }, true);
  topTex.repeat.set(1, DEPTH);                      // évite l'étirement du motif sur la profondeur du bloc
  const M = (map, extra = {}) => toon({ map, ...extra });
  const top = M(topTex), side = M(sideTex), dirt = M(dirtTex);
  const bt = { color: 0xf0d9a0 };
  const fm = soilFronts(th.sideA).map((t) => M(t));                  // face avant « terre réaliste » (même motif pour tous les blocs)
  const brTop = M(topTex, bt);
  return {
    exV: fm.map((m) => [m, m, top, dirt, m, m]),
    plV: fm.map((m) => [m, m, dirt, dirt, m, m]),
    brV: fm.map((m) => [m, m, brTop, dirt, m, m]),
    exposed: [side, side, top, dirt, side, side],
    plain: [dirt, dirt, dirt, dirt, dirt, dirt],
    brittle: [M(sideTex, bt), M(sideTex, bt), M(topTex, bt), dirt, M(sideTex, bt), M(sideTex, bt)],
  };
}

const DEPTH = 2.4;
const boxGeo = new THREE.BoxGeometry(1, 1, 1);

function tileMesh(mats, brittle = false, c = 0, y = 0) {
  const h = vHash(c, y);
  const m = new THREE.Mesh(boxGeo, brittle ? mats.brV[h] : mats.exV[h]);
  m.scale.set(1, 1, DEPTH); m.castShadow = true; m.receiveShadow = true;
  return m;
}

// ------------------------------------------------------------------ éléments de décor
function treeForest(R, big) {
  const g = new THREE.Group();
  const h = (big ? 9 : 6) + R() * 5;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.55, h, 7), mat(0x5a3d26, { flatShading: true }));
  trunk.position.y = h / 2; g.add(trunk);
  const cols = [0x2f7d35, 0x3c9140, 0x27672f, 0x4aa247];
  for (let i = 0; i < 4; i++) {
    const s = 2.4 + R() * 2;
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), mat(cols[Math.floor(R() * 4)], { flatShading: true }));
    c.position.set((R() - 0.5) * 3, h + (R() - 0.2) * 1.8, (R() - 0.5) * 2.5); g.add(c);
  }
  return g;
}
function ravinala(R) {
  const g = new THREE.Group();
  const h = 6 + R() * 4;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, h, 6), mat(0x7a5a35, { flatShading: true }));
  trunk.position.y = h / 2; g.add(trunk);
  const leaf = mat(0x2f9a45, { flatShading: true, side: THREE.DoubleSide });
  for (let i = 0; i < 11; i++) {
    const a = -Math.PI * 0.5 + (i / 10) * Math.PI;
    const l = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 4.2, 1, 1), leaf);
    l.position.set(Math.sin(a) * 0.4, h + Math.cos(a) * 1.0 + 0.7, (i % 2 ? 0.06 : -0.06));
    l.rotation.z = -a * 0.35 * 0 + a * -0.55 * 0; l.rotation.set(0, 0, a * -0.9);
    l.position.x = Math.sin(a) * 1.6; l.position.y = h + 0.9 + Math.cos(a) * 1.4;
    g.add(l);
  }
  return g;
}
function needle(R) {
  const g = new THREE.Group();
  const n = 2 + Math.floor(R() * 4);
  for (let i = 0; i < n; i++) {
    const h = 3 + R() * 12, r = 0.5 + R() * 1.2;
    const c = new THREE.Mesh(new THREE.ConeGeometry(r, h, 5 + Math.floor(R() * 2)), mat(R() > 0.5 ? 0x8b877f : 0x6f6b64, { flatShading: true }));
    c.position.set((R() - 0.5) * 4, h / 2 - 0.5, (R() - 0.5) * 3); c.rotation.z = (R() - 0.5) * 0.12; g.add(c);
  }
  return g;
}
function baobab(R) {
  const g = new THREE.Group();
  const h = 7 + R() * 5;
  const pts = [];
  for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(new THREE.Vector2(1.15 + Math.sin(t * 2.2 + 0.2) * 0.75 - t * 0.55, t * h)); }
  const trunk = new THREE.Mesh(new THREE.LatheGeometry(pts, 10), mat(0x8a5f3c, { flatShading: true }));
  g.add(trunk);
  const bm = mat(0x7a5232, { flatShading: true });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const b = cyl(0.14, 2.6 + R(), bm, Math.cos(a) * 0.9, h + 0.5, Math.sin(a) * 0.9);
    b.rotation.z = Math.cos(a) * 0.9; b.rotation.x = Math.sin(a) * 0.9; g.add(b);
    const l = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9 + R() * 0.5, 0), mat(0x6b9a3a, { flatShading: true }));
    l.position.set(Math.cos(a) * 2.2, h + 1.8, Math.sin(a) * 2.2); g.add(l);
  }
  return g;
}
function acacia(R) {
  const g = new THREE.Group();
  const h = 3 + R() * 2;
  g.add(cyl(0.12, h, mat(0x4d3a28), 0, h / 2, 0));
  const cap = new THREE.Mesh(new THREE.SphereGeometry(2.2, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x587a2d, { flatShading: true }));
  cap.scale.set(1.5, 0.45, 1.1); cap.position.y = h; g.add(cap);
  return g;
}
function mountain(R, col) {
  const w = 14 + R() * 16, h = 8 + R() * 12;
  const m = new THREE.Mesh(new THREE.ConeGeometry(w, h, 6), mat(col, { flatShading: true }));
  m.position.y = h / 2 - 1; return m;
}
function tuft(R, col) {
  const g = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const c = cone(0.06, 0.45 + R() * 0.3, mat(col, { flatShading: true }), (R() - 0.5) * 0.5, 0.25, (R() - 0.5) * 0.3);
    c.rotation.z = (R() - 0.5) * 0.6; c.castShadow = false; g.add(c);
  }
  return g;
}

// ------------------------------------------------------------------ construction du niveau
export function buildWorld(def, L, worldId, quality = 'high') {
  const th = THEMES[worldId];
  const scene = new THREE.Scene();
  scene.background = gradientTex(th.sky);
  scene.fog = new THREE.Fog(th.fog, th.fogNear, th.fogNear + (th.fogFar - th.fogNear));
  const R = rng(def.id * 977 + 13);
  const disposables = [];

  // lumières
  const hemi = new THREE.HemisphereLight(th.hemi[0], th.hemi[1], th.hemi[2]); scene.add(hemi);
  const sun = new THREE.DirectionalLight(th.sun[0], th.sun[1]);
  sun.castShadow = quality === 'high';
  const smap = quality === 'high' && !IS_MOBILE ? 1024 : 512;               // 4x moins de mémoire pour les ombres sur téléphone sun.shadow.mapSize.set(smap, smap);
  const sc = sun.shadow.camera; sc.left = -16; sc.right = 16; sc.top = 12; sc.bottom = -12; sc.near = 1; sc.far = 70;
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);

  // blocs du terrain (instanciés)
  const mats = blockMaterials(th, worldId);
  const isSolid = (c, y) => c >= 0 && c < L.cols && y >= 0 && y < L.rows && L.grid[y][c] === 1;
  const NVAR = mats.exV.length;
  const exByV = Array.from({ length: NVAR }, () => []), plByV = Array.from({ length: NVAR }, () => []), owCells = [];
  for (let y = 0; y < L.rows; y++) for (let c = 0; c < L.cols; c++) {
    const v = L.grid[y][c];
    if (v === 1) {
      (isSolid(c, y + 1) ? plByV : exByV)[vHash(c, y)].push([c, y]);
      if (y === 0) for (let dy = 1; dy <= 6; dy++) plByV[vHash(c, -dy)].push([c, -dy]);   // la rangée du bas descend loin sous le niveau
    }
    else if (v === 2) owCells.push([c, y]);
  }
  const mkInst = (cells, materials) => {
    if (!cells.length) return;
    const im = new THREE.InstancedMesh(boxGeo, materials, cells.length);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sv = new THREE.Vector3(), pv = new THREE.Vector3();
    cells.forEach(([c, y], i) => {
      sv.set(1, 1, DEPTH); pv.set(c + 0.5, y + 0.5, 0);
      m4.compose(pv, q, sv); im.setMatrixAt(i, m4);
    });
    im.castShadow = true; im.receiveShadow = true; scene.add(im);
  };
  exByV.forEach((cells, v) => mkInst(cells, mats.exV[v]));
  plByV.forEach((cells, v) => mkInst(cells, mats.plV[v]));
  const wormsUpd = buildWorms(scene, L, isSolid, DEPTH, quality);
  if (owCells.length) {
    const wood = new THREE.InstancedMesh(boxGeo, mat(0x8a5a30), owCells.length);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sv = new THREE.Vector3(1.02, 0.28, 1.6), pv = new THREE.Vector3();
    owCells.forEach(([c, y], i) => { pv.set(c + 0.5, y + 0.86, 0); m4.compose(pv, q, sv); wood.setMatrixAt(i, m4); });
    wood.castShadow = true; wood.receiveShadow = true; scene.add(wood);
  }

  // décors
  const deco = new THREE.Group(); scene.add(deco);
  const span = L.cols + 40;
  const mcol = th.mount;
  for (let x = -18; x < span; x += 9 + R() * 8) { const m = mountain(R, mcol); m.position.x = x; m.position.z = -90 - R() * 25; deco.add(m); }
  const spots = [];
  const gap = (worldId === 'forest' ? 2.6 : worldId === 'baobab' ? 4.8 : 3.2) * (quality === 'low' ? 1.7 : quality === 'mid' ? 1.25 : 1);   // forêt bien fournie
  for (let x = -16; x < span; x += gap * (0.8 + R() * 0.8)) spots.push({ x, y: -1.5, z: -7 - R() * 34 });
  deco.add(buildTrees(worldId, R, spots));
  if (th.sunDisc) {
    const sunDisc = new THREE.Mesh(new THREE.CircleGeometry(9, 32), new THREE.MeshBasicMaterial({ color: 0xffe2a0, fog: false }));
    sunDisc.position.set(L.cols * 0.5, 14, -120); sunDisc.name = 'sundisc'; deco.add(sunDisc);
  }
  const clouds = buildClouds(R, Math.ceil(span / (quality === 'low' ? 45 : 28)), -20, span + 20, th.cloud); clouds.userData.drift = 0.35; deco.add(clouds);
  // herbe dense au pied des arbres et sur les rives, oiseaux, soleil rayonnant
  const cover = buildGroundCover(worldId, R, spots, L.cols, quality === 'low' ? 28 : quality === 'mid' ? 50 : IS_MOBILE ? 70 : 110, quality === 'low' ? 3 : quality === 'mid' ? 5 : IS_MOBILE ? 7 : 11); scene.add(cover);
  // fond emblématique lié au titre du niveau (ex. Rova Manjakamiadana pour Antananarivo)
  const landmark = def.landmark ? buildLandmark(def.landmark, R, 0.5) : null;
  if (landmark) { landmark.position.set(L.cols / 2, -1.5, -48); scene.add(landmark); }
  const birds = buildBirds(R, quality === 'low' ? 3 : quality === 'mid' ? 6 : 9, -10, L.cols + 40); scene.add(birds.group);
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('255,214,150'), transparent: true, opacity: 0.85, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })); sunGlow.scale.set(85, 85, 1); scene.add(sunGlow);
  // herbe animée sur le dessus des blocs
  const grassCells = exByV.flat().filter(([c, y]) => !L.ents.some((e) => e.kind === 'spike' && Math.floor(e.x) === c && e.y === y + 1));
  const grassPer = quality === 'low' ? 14 : quality === 'mid' ? 32 : IS_MOBILE ? 50 : 90;
  const grass = buildGrass(grassCells, worldId, R, DEPTH, grassPer); scene.add(grass.mesh);
  // particules ambiantes (pollen / poussière / lucioles)
  const N = 90, pos = new Float32Array(N * 3), vel = [];
  for (let i = 0; i < N; i++) { pos[i * 3] = R() * L.cols; pos[i * 3 + 1] = 1 + R() * 9; pos[i * 3 + 2] = -3 + R() * 7; vel.push([(R() - 0.5) * 0.3, 0.1 + R() * 0.25, 0]); }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pm = new THREE.PointsMaterial({ size: 0.12, color: worldId === 'baobab' ? 0xffd08a : (worldId === 'tsingy' ? 0xf0e0c0 : 0xf4ffb0), transparent: true, opacity: 0.8, depthWrite: false, sizeAttenuation: true });
  const motes = new THREE.Points(pg, pm); motes.frustumCulled = false; scene.add(motes);

  // eau turquoise au fond des fosses
  const waterTex = canvasTex(128, 128, (ctx, w, h) => { ctx.fillStyle = th.water; ctx.fillRect(0, 0, w, h); const R = rng(9); for (let i = 0; i < 34; i++) { ctx.strokeStyle = th.lava ? (i % 2 ? 'rgba(255,205,40,.9)' : 'rgba(90,10,0,.6)') : (i % 2 ? 'rgba(255,255,255,.55)' : 'rgba(10,120,170,.35)'); ctx.lineWidth = 2; const x = R() * w, y = R() * h; ctx.beginPath(); ctx.ellipse(x, y, 10 + R() * 12, 3, 0, 0, 3.14); ctx.stroke(); } }, true);
  waterTex.repeat.set(L.cols / 3, 8);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(L.cols + 80, 9), th.lava ? new THREE.MeshBasicMaterial({ map: waterTex }) : toon({ map: waterTex, transparent: true, opacity: 0.94, color: 0xffffff }));
  water.rotation.x = -Math.PI / 2; water.position.set(L.cols / 2, -1.6, 0); scene.add(water);

  // écume et reflets animés autour des rives
  const foamTex = canvasTex(128, 128, (ctx, w, h) => {
    const R2 = rng(21); ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) { ctx.fillStyle = `rgba(255,255,255,${0.45 + R2() * 0.45})`; ctx.beginPath(); ctx.ellipse(R2() * w, R2() * h, 3 + R2() * 9, 2 + R2() * 5, R2() * 3, 0, 6.3); ctx.fill(); }
    ctx.globalCompositeOperation = 'destination-in'; const gr = ctx.createRadialGradient(w / 2, h / 2, w * 0.15, w / 2, h / 2, w * 0.5); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h);
  }, true);
  const foamCols = []; for (let c = 0; c < L.cols; c++) if (L.grid[0][c] === 1) foamCols.push(c);
  const foamMat = new THREE.MeshBasicMaterial({ map: foamTex, transparent: true, opacity: 0.8, depthWrite: false });
  let foam = null;
  if (foamCols.length && !th.lava) {
    foam = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), foamMat, foamCols.length);
    const m4 = new THREE.Matrix4(), qf = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)), sf = new THREE.Vector3(2.4, DEPTH + 2.2, 1), pf = new THREE.Vector3();
    foamCols.forEach((c, i) => { pf.set(c + 0.5, -1.57, 0); m4.compose(pf, qf, sf); foam.setMatrixAt(i, m4); });
    foam.frustumCulled = false; scene.add(foam);
  }
  const sparkTex = canvasTex(128, 128, (ctx, w, h) => { const R2 = rng(33); ctx.clearRect(0, 0, w, h); ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 2; for (let i = 0; i < 16; i++) { ctx.beginPath(); const x = R2() * w, y = R2() * h; ctx.ellipse(x, y, 8 + R2() * 10, 2.5, 0, 0, 3.14); ctx.stroke(); } }, true);
  sparkTex.repeat.set(L.cols / 4, 3);
  const spark = new THREE.Mesh(new THREE.PlaneGeometry(L.cols + 80, 9), new THREE.MeshBasicMaterial({ map: sparkTex, transparent: true, opacity: 0.55, depthWrite: false }));
  spark.rotation.x = -Math.PI / 2; spark.position.set(L.cols / 2, -1.55, 0); if (!th.lava) scene.add(spark);
  // rives : terre herbeuse devant et derrière la rivière (les arbres y sont plantés)
  for (const [z0, z1] of [[-4.5, -140], [4.5, 40]]) {
    const land = new THREE.Mesh(new THREE.PlaneGeometry(L.cols + 260, Math.abs(z1 - z0)), toon({ color: th.land }));
    land.rotation.x = -Math.PI / 2; land.position.set(L.cols / 2, -1.5, (z0 + z1) / 2); land.receiveShadow = true; scene.add(land);
  }

  // flaque et ondulations qui suivent la sirène (visibles seulement avec elle)
  const ripple = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.62, 28), new THREE.MeshBasicMaterial({ color: 0x9ff2ff, transparent: true, opacity: 0.7, depthWrite: false, side: THREE.DoubleSide }));
  const puddle = new THREE.Mesh(new THREE.CircleGeometry(0.62, 28), new THREE.MeshBasicMaterial({ color: 0x1ab6d8, transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide }));
  ripple.rotation.x = puddle.rotation.x = -Math.PI / 2; ripple.visible = puddle.visible = false; scene.add(ripple, puddle);

  // blob d'ombre du joueur
  const blob = new THREE.Mesh(new THREE.CircleGeometry(0.5, 20), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false }));
  blob.rotation.x = -Math.PI / 2; scene.add(blob);

  // ------------------------------------------------ entités dynamiques
  const views = [];
  const tileAt = (c, y) => L.ents.some((e) => (e.kind === 'fake' || e.kind === 'vanish' || e.kind === 'hspike' || e.kind === 'iblock') && e.x === c && e.y === y);
  const spikeCluster = (h = 0.62, col = 0xe9dcc0) => {
    const g = new THREE.Group();
    const m = mat(col, { flatShading: true });
    [[-0.24, 0.12], [0, -0.1], [0.24, 0.12], [-0.1, -0.3], [0.12, 0.3]].forEach(([x, z], i) => g.add(cone(0.11, h * (i === 1 ? 1.15 : 1), m, x, h / 2, z)));
    return g;
  };
  const fruitMesh = () => {
    const g = new THREE.Group();
    g.add(ell(0.34, 0.4, 0.34, mat(0xffa52a, { roughness: 0.5, emissive: 0xff7a00, emissiveIntensity: 0.25 })));
    g.add(ell(0.2, 0.1, 0.1, mat(0x3f9a3a), 0.06, 0.22, 0)).rotation.z = 0.5;
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('255,210,90'), transparent: true, opacity: 0.55, depthWrite: false }));
    halo.scale.set(1.3, 1.3, 1); g.add(halo);
    return g;
  };
  const doorMesh = (fake) => {
    const g = new THREE.Group();
    const wood = mat(0x6b4425, { flatShading: true });
    g.add(box(0.14, 1.55, 0.3, wood, -0.46, 0.78, 0), box(0.14, 1.55, 0.3, wood, 0.46, 0.78, 0), box(1.2, 0.18, 0.34, wood, 0, 1.58, 0));
    g.add(box(1.3, 0.1, 0.38, mat(0x8c5a2e), 0, 1.72, 0));
    const portal = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.45), new THREE.MeshBasicMaterial({ map: glowTex(fake ? '255,170,90' : '255,235,140'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    portal.position.set(0, 0.76, 0); portal.name = 'portal'; g.add(portal);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(fake ? '255,170,90' : '255,230,140'), transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending }));
    halo.scale.set(3, 3, 1); halo.position.y = 0.8; g.add(halo);
    return g;
  };

  for (const e of L.ents) {
    let obj = null;
    let upd = null;
    switch (e.kind) {
      case 'spike': obj = spikeCluster(); obj.position.set(e.x, e.y, 0); break;
      case 'fake': case 'vanish': {
        // piège invisible à l'œil : même bloc, même profondeur, même herbe que le sol voisin
        obj = new THREE.Group(); obj.position.set(e.x + 0.5, e.y + 0.5, 0);
        const tm = tileMesh(mats, false, e.x, e.y);
        if (e.y === 0) for (let dy = 1; dy <= 6; dy++) { const u = new THREE.Mesh(boxGeo, mats.plV[vHash(e.x, -dy)]); u.scale.set(1, 1, DEPTH); u.position.y = -dy; u.castShadow = true; u.receiveShadow = true; obj.add(u); }
        const covered = tileAt(e.x, e.y + 1) || isSolid(e.x, e.y + 1);
        if (covered) tm.material = mats.plV[vHash(e.x, e.y)];
        obj.add(tm);
        if (!covered) { obj.add(buildGrass([[-0.5, -0.5]], worldId, R, DEPTH, grassPer).mesh); }
        upd = (s) => { obj.position.y = s.y + 0.5; obj.visible = s.y > -9; obj.position.x = (s.t > 0 && s.solid) ? e.x + 0.5 + Math.sin(s.t * 90) * 0.03 : e.x + 0.5; };
        break;
      }
      case 'hspike': {
        obj = new THREE.Group();
        const t = tileMesh(mats, false, e.x, e.y); t.position.set(e.x + 0.5, e.y + 0.5, 0); const hcov = tileAt(e.x, e.y + 1) || isSolid(e.x, e.y + 1); if (hcov) t.material = mats.plV[vHash(e.x, e.y)]; obj.add(t);
        if (!hcov) { obj.add(buildGrass([[e.x, e.y]], worldId, R, DEPTH, grassPer).mesh); }
        const sp = spikeCluster(0.9, 0xf2e8cf); sp.position.set(e.x + 0.5, e.y + 1, 0); sp.scale.y = 0.001; sp.name = 'sp'; obj.add(sp);
        upd = (s) => { sp.scale.y = Math.max(0.001, s.up); };
        break;
      }
      case 'cspike': {
        obj = new THREE.Group();
        const c = cone(0.34, 1, mat(0x8d8579, { flatShading: true }), 0, 0.5, 0); c.rotation.z = Math.PI; obj.add(c);
        const c2 = cone(0.16, 0.6, mat(0xb9b0a0, { flatShading: true }), 0.3, 0.6, 0.2); c2.rotation.z = Math.PI; obj.add(c2);
        obj.position.set(e.x + 0.5, e.y, 0);
        upd = (s) => { obj.position.y = s.y; obj.rotation.z = s.falling && !s.rest ? Math.sin(s.vy * 3) * 0.05 : 0; };
        break;
      }
      case 'iblock': {
        obj = tileMesh(mats, false, e.x, e.y); obj.position.set(e.x + 0.5, e.y + 0.5, 0); obj.visible = false; obj.material = mats.plV[vHash(e.x, e.y)];
        upd = (s) => { obj.visible = !!s.shown; };
        break;
      }
      case 'boulder': {
        obj = new THREE.Group();
        const r = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 1), mat(0x7c6f60, { flatShading: true })); r.castShadow = true; obj.add(r);
        obj.position.set(e.x, e.y + 0.55, 0);
        upd = (s) => { obj.visible = s.active && !s.dead; obj.position.set(s.x, s.y + 0.55, 0); r.rotation.z = s.rot; };
        obj.visible = false;
        break;
      }
      case 'enemy': {
        const crab = buildCrab(); obj = crab.group; obj.position.set(e.x, e.y, 0);
        upd = (s) => {
          obj.position.set(s.x, s.y + Math.abs(Math.sin(s.ph)) * 0.05, 0); obj.rotation.y = s.dir > 0 ? 0 : Math.PI;
          crab.parts.legs.forEach((l, i) => { l.rotation.z = Math.sin(s.ph * 2 + i) * 0.5; });
          crab.parts.claws.forEach((c, i) => { c.rotation.z = Math.sin(s.ph + i * 2) * 0.3; });
        };
        break;
      }
      case 'spring': {
        obj = new THREE.Group();
        obj.add(cyl(0.12, 0.3, mat(0xf3ead2), 0, 0.15, 0));
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xd9382c, { roughness: 0.5 }));
        cap.position.y = 0.28; cap.name = 'cap'; cap.castShadow = true; obj.add(cap);
        for (const [x, z] of [[0.15, 0.1], [-0.18, -0.05], [0.0, -0.22]]) obj.add(ell(0.12, 0.05, 0.12, mat(0xffffff), x, 0.58 - Math.abs(x) * 0.3, z));
        obj.position.set(e.x, e.y, 0);
        upd = (s) => { obj.scale.set(1 + s.sq * 0.25, 1 - s.sq * 0.4, 1 + s.sq * 0.25); };
        break;
      }
      case 'fruit': {
        obj = fruitMesh(); obj.position.set(e.x, e.y + 0.5, 0);
        upd = (s, t) => { obj.visible = !s.got; obj.position.y = e.y + 0.5 + Math.sin(t * 3 + e.x) * 0.08; obj.rotation.y = t * 1.5; };
        break;
      }
      case 'door': case 'fakedoor': {
        obj = doorMesh(e.kind === 'fakedoor'); obj.position.set(e.x, e.y, 0);
        const portal = obj.getObjectByName('portal');
        upd = (s, t) => { if (s.kind === 'door') obj.position.set(s.x, s.y, 0); portal.material.opacity = 0.75 + Math.sin(t * 4 + e.x) * 0.2; };
        break;
      }
      default: break;
    }
    if (!obj) continue;
    scene.add(obj);
    views.push({ id: e.id, obj, upd });
  }

  // ------------------------------------------------ particules (explosions, poussière, confettis)
  const pool = [];
  const pGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
  for (let i = 0; i < 90; i++) {
    const m = new THREE.Mesh(pGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true }));
    m.visible = false; scene.add(m); pool.push({ m, v: new THREE.Vector3(), life: 0, max: 1, g: 12 });
  }
  let pi = 0;
  const spawn = (x, y, color, vx, vy, vz, life, g = 12, size = 1) => {
    const p = pool[pi++ % pool.length];
    p.m.visible = true; p.m.position.set(x, y, 0.3); p.m.material.color.setHex(color); p.m.material.opacity = 1; p.m.scale.setScalar(size);
    p.v.set(vx, vy, vz); p.life = life; p.max = life; p.g = g;
  };

  const api = {
    scene, sun, views, blob, ripple, puddle,
    burst(x, y, colors, n = 18, sp = 7) {
      for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = sp * (0.3 + Math.random()); spawn(x, y, colors[i % colors.length], Math.cos(a) * s, Math.sin(a) * s + 3, (Math.random() - 0.5) * 3, 0.7 + Math.random() * 0.5, 16, 0.8 + Math.random()); }
    },
    dust(x, y, dir = 0) { for (let i = 0; i < 4; i++) spawn(x + (Math.random() - 0.5) * 0.4, y + 0.05, 0xd9cfb8, -dir * (1 + Math.random() * 2) + (Math.random() - 0.5), 0.8 + Math.random() * 1.2, (Math.random() - 0.5), 0.35, 1, 0.7); },
    confetti(x, y) {
      const cols = [0xffd34d, 0xff6b6b, 0x6bd16b, 0x59b8ff, 0xff9f43, 0xe28cff];
      for (let i = 0; i < 70; i++) spawn(x + (Math.random() - 0.5) * 2, y + 1.5, cols[i % cols.length], (Math.random() - 0.5) * 9, 5 + Math.random() * 8, (Math.random() - 0.5) * 4, 1.6 + Math.random(), 9, 1 + Math.random());
    },
    update(S, t, dt, followX, followY) {
      waterTex.offset.x = t * 0.02; waterTex.offset.y = Math.sin(t * 0.6) * 0.02;
      sparkTex.offset.x = -t * 0.03; sparkTex.offset.y = t * 0.012; foamMat.opacity = 0.62 + Math.sin(t * 2.2) * 0.2; foamTex.offset.x = Math.sin(t * 0.7) * 0.05;
      for (const v of views) { const e = S.ents[v.id]; if (e && v.upd) v.upd(e, t); }   // les identifiants suivent l'ordre du tableau
      wind.value = t; wormsUpd(t);
      birds.update(t, dt);
      if (landmark) { landmark.position.x = followX * 0.88 + L.cols * 0.12; if (landmark.userData.update) landmark.userData.update(t); }
      sunGlow.position.set(followX + (th.sunPos[0] < 0 ? -26 : 30), 16 + followY * 0.25, -118);
      // particules
      for (const p of pool) {
        if (!p.m.visible) continue;
        p.life -= dt;
        if (p.life <= 0) { p.m.visible = false; continue; }
        p.v.y -= p.g * dt; p.m.position.addScaledVector(p.v, dt);
        p.m.material.opacity = Math.min(1, p.life / p.max * 1.6);
        p.m.rotation.x += dt * 6; p.m.rotation.y += dt * 4;
      }
      // pollen
      const a = pg.attributes.position;
      for (let i = 0; i < N; i++) {
        a.array[i * 3] += (vel[i][0] + Math.sin(t + i) * 0.1) * dt; a.array[i * 3 + 1] += vel[i][1] * dt;
        if (a.array[i * 3 + 1] > 11) a.array[i * 3 + 1] = 0.5;
        if (a.array[i * 3] > L.cols + 3) a.array[i * 3] = -3;
      }
      a.needsUpdate = true;
      for (const o of deco.children) if (o.userData.drift) { o.position.x += o.userData.drift * dt; if (o.position.x > span) o.position.x = -20; }
      const sd = deco.getObjectByName('sundisc'); if (sd) sd.position.x = followX * 0.92 + 20;
      // lumière qui suit le joueur
      sun.position.set(followX + th.sunPos[0], followY + th.sunPos[1], th.sunPos[2]);
      sun.target.position.set(followX, followY, 0); sun.target.updateMatrixWorld();
    },
    groundBelow(S, x, y) {
      let best = -20;
      const cx = Math.floor(x);
      for (let cy = Math.min(L.rows - 1, Math.floor(y + 0.05)); cy >= 0; cy--) { if (L.grid[cy][cx]) { best = cy + 1; break; } }
      for (const e of S.ents) if (e.solid && e.x <= x && e.x + 1 >= x && e.y + 1 <= y + 0.06 && e.y + 1 > best) best = e.y + 1;
      return best;
    },
    dispose() {
      scene.traverse((o) => { if (o.geometry && o.geometry !== boxGeo) o.geometry.dispose?.(); });
    },
  };
  void disposables;
  return api;
}

// ------------------------------------------------------------------ petit décor pour les menus
export function buildStage(themeKey = 'forest', quality = 'high') {
  const th = THEMES[themeKey];
  const scene = new THREE.Scene();
  scene.background = gradientTex(th.sky);
  scene.fog = new THREE.Fog(th.fog, 20, 90);
  scene.add(new THREE.HemisphereLight(th.hemi[0], th.hemi[1], th.hemi[2] * 1.1));
  const sun = new THREE.DirectionalLight(th.sun[0], th.sun[1]); sun.position.set(-6, 10, 8); sun.castShadow = quality === 'high';
  sun.shadow.mapSize.set(1024, 1024); const c = sun.shadow.camera; c.left = -14; c.right = 14; c.top = 14; c.bottom = -14; c.near = 1; c.far = 50;   // cadre d'ombre assez grand pour tout l'animal (sinon des zones claires à bords droits apparaissent)
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.04;
  scene.add(sun, sun.target);
  const R = rng(5);
  const q = quality === 'low' ? 0 : quality === 'mid' || IS_MOBILE ? 1 : 2;
  const mats = blockMaterials(th, themeKey);
  const base = new THREE.Group(); base.position.y = -0.3; scene.add(base);          // socle : groupe (la forme change selon le personnage)
  const shape0 = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.1, 0.6, 28), mats.exposed); shape0.receiveShadow = true; shape0.castShadow = true; base.add(shape0);
  // beaucoup d'herbe fine autour du socle : il disparaît presque entièrement (l'herbe suit le socle)
  base.add(buildRing(th.kind, R, [500, 1000, 2800][q], 1.55, 2.7, -0.3, 0.9, 2.1));
  const wcv = document.createElement('canvas'); wcv.width = wcv.height = 128; const wx = wcv.getContext('2d'); wx.fillStyle = '#19c3d8'; wx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 26; i++) { wx.strokeStyle = i % 2 ? 'rgba(255,255,255,.6)' : 'rgba(10,120,170,.35)'; wx.lineWidth = 2; wx.beginPath(); wx.ellipse(((i * 53) % 128), ((i * 37) % 128), 10 + (i % 5) * 3, 3, 0, 0, 3.14); wx.stroke(); }
  const wtex = new THREE.CanvasTexture(wcv); wtex.wrapS = wtex.wrapT = THREE.RepeatWrapping; wtex.colorSpace = THREE.SRGBColorSpace; wtex.repeat.set(2, 2);
  const water = new THREE.Mesh(new THREE.CircleGeometry(1.86, 40), toon({ map: wtex, transparent: true, opacity: 0.93 }));
  water.rotation.x = -Math.PI / 2; water.position.y = 0.31; water.visible = false; base.add(water);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(90, 24), toon({ color: th.land }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -1.4; ground.receiveShadow = true; scene.add(ground);
  // forêt dense en plusieurs rangées
  const sp = [];
  const n = [20, 32, 64][q];
  for (let i = 0; i < n; i++) { const a = -Math.PI * 0.98 + (i / (n - 1)) * Math.PI * 0.96, d = 9 + R() * 34; sp.push({ x: Math.cos(a) * d * 1.6, y: -1.4, z: -Math.abs(Math.sin(a)) * d - 3 - R() * 4 }); }
  scene.add(buildTrees(th.kind, R, sp));
  scene.add(buildClouds(R, 5, -50, 50, th.cloud));
  // herbe très fine : pied des arbres + prairie qui cache le bas du sol
  scene.add(buildGroundCover(th.kind, R, sp, 0, [40, 70, 100][q], 0));
  scene.add(buildMeadowArea(th.kind, R, -20, 20, -34, 7, [3000, 6500, 17000][q], -1.4, 0.9, 2.2));
  scene.add(buildMeadowArea(th.kind, R, -16, 16, -2, 9.6, [1800, 4500, 13000][q], -1.4, 0.5, 1.4));   // herbe très dense tout en bas de l'écran
  const lm = buildLandmark('rova', R, 0.9); if (lm) { lm.position.set(-8, -1.4, -78); scene.add(lm); }
  const birds = buildBirds(R, quality === 'low' ? 3 : 7, -40, 40); scene.add(birds.group);
  for (let i = 0; i < 6; i++) { const m = mountain(R, th.mount); m.position.set(-40 + i * 16, -1, -110); scene.add(m); }
  const pollen = new THREE.Points(
    (() => { const g = new THREE.BufferGeometry(); const p = new Float32Array(60 * 3); for (let i = 0; i < 60; i++) { p[i * 3] = (R() - 0.5) * 14; p[i * 3 + 1] = R() * 5; p[i * 3 + 2] = (R() - 0.5) * 8; } g.setAttribute('position', new THREE.BufferAttribute(p, 3)); return g; })(),
    new THREE.PointsMaterial({ size: 0.1, color: 0xfff2b0, transparent: true, opacity: 0.85, depthWrite: false }));
  scene.add(pollen);
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('255,214,150'), transparent: true, opacity: 0.8, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
  sunGlow.scale.set(60, 60, 1); sunGlow.position.set(-22, 12, -70); scene.add(sunGlow);
  return { scene, pollen, base, shape0, water, sun, update(t, dt) { wtex.offset.x = t * 0.05; wtex.offset.y = Math.sin(t) * 0.03; wind.value = t; birds.update(t, dt); if (lm && lm.userData.update) lm.userData.update(t); } };
}
