// Décors : arbres animés par le vent, herbe, oiseaux, nuages.
// Tout est instancié (peu d'appels de dessin) et les textures / matériaux sont mis en cache
// pour économiser mémoire et temps de compilation d'un niveau à l'autre.
import * as THREE from 'three';
import { toonGradient } from './chars.js';

/** Temps partagé par tous les shaders de vent. */
export const wind = { value: 0 };

function mulberry(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const cache = new Map();
const cached = (key, fn) => { if (!cache.has(key)) { const v = fn(); v.userData = { ...(v.userData || {}), keep: true }; cache.set(key, v); } return cache.get(key); };

function tex(w, h, draw, repeat = false) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 2;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// ---------------------------------------------------------------- textures (mises en cache)
const barkTexture = (base, dark, light) => cached('bark' + base, () => {
  const R = mulberry(5);
  const t = tex(128, 256, (ctx, w, h) => {
    ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) {
      const x = R() * w, wd = 2 + R() * 6;
      ctx.fillStyle = R() > 0.45 ? dark : light; ctx.globalAlpha = 0.25 + R() * 0.35;
      ctx.beginPath(); ctx.moveTo(x, 0);
      for (let y = 0; y <= h; y += 32) ctx.lineTo(x + Math.sin(y * 0.05 + i) * 4, y);
      for (let y = h; y >= 0; y -= 32) ctx.lineTo(x + wd + Math.sin(y * 0.05 + i) * 4, y);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }, true);
  return t;
});
const leafTexture = (key, palette, dense = 230) => cached('leaf' + key, () => {
  const R = mulberry(9);
  return tex(256, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    for (let pass = 0; pass < 3; pass++) {
      for (let i = 0; i < dense / 3; i++) {
        const a = R() * 6.28, r = Math.sqrt(R()) * 112, x = 128 + Math.cos(a) * r, y = 128 + Math.sin(a) * r * 0.9;
        const col = palette[Math.min(palette.length - 1, Math.floor(R() * palette.length * 0.6) + pass)];
        ctx.save(); ctx.translate(x, y); ctx.rotate(R() * 6.28);
        ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 0, 12 + R() * 9, 5 + R() * 4, 0, 0, 6.3); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.stroke();
        ctx.restore();
      }
    }
  });
});
export const frondTexture = () => cached('frond', () => tex(128, 256, (ctx, w, h) => {
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = '#4b7a2a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(64, h); ctx.lineTo(64, 8); ctx.stroke();
  for (let y = 235; y > 14; y -= 9) {
    const len = 52 * Math.sin(Math.min(1, (h - y) / 180) * 2.2 + 0.25) + 8;
    for (const s of [-1, 1]) {
      ctx.fillStyle = y % 18 < 9 ? '#2f9a3e' : '#3fb24c';
      ctx.beginPath(); ctx.moveTo(64, y); ctx.quadraticCurveTo(64 + s * len * 0.6, y - 14, 64 + s * len, y + 12); ctx.quadraticCurveTo(64 + s * len * 0.5, y + 2, 64, y + 6); ctx.fill();
    }
  }
}));
const rockTexture = () => cached('rock', () => {
  const R = mulberry(2);
  return tex(128, 256, (ctx, w, h) => {
    ctx.fillStyle = '#8d877d'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { ctx.fillStyle = R() > 0.5 ? 'rgba(40,36,30,.35)' : 'rgba(255,255,255,.16)'; ctx.fillRect(R() * w, 0, 2 + R() * 6, h); }
    ctx.strokeStyle = 'rgba(30,26,22,.55)'; ctx.lineWidth = 1.6;
    for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.moveTo(R() * w, R() * h); ctx.lineTo(R() * w, R() * h); ctx.stroke(); }
  }, true);
});

// ---------------------------------------------------------------- vent : les arbres ondulent
function addTreeWind(material, flutter) {
  material.onBeforeCompile = (sh) => {
    sh.uniforms.uWind = wind;
    sh.vertexShader = 'uniform float uWind;\n' + sh.vertexShader.replace('#include <project_vertex>', `
      vec4 mvPosition = vec4( transformed, 1.0 );
      #ifdef USE_INSTANCING
        mvPosition = instanceMatrix * mvPosition;
      #endif
      float kk = clamp((mvPosition.y + 1.5) / 13.0, 0.0, 1.0);
      kk = kk * kk;
      mvPosition.x += sin(uWind * 1.1 + mvPosition.x * 0.13 + mvPosition.z * 0.07) * 0.5 * kk;
      mvPosition.z += cos(uWind * 0.9 + mvPosition.x * 0.11) * 0.22 * kk;
      ${flutter ? 'mvPosition.y += sin(uWind * 3.3 + mvPosition.x * 1.7 + mvPosition.z) * 0.07 * (0.3 + kk);' : ''}
      mvPosition = modelViewMatrix * mvPosition;
      gl_Position = projectionMatrix * mvPosition;`);
  };
  material.customProgramCacheKey = () => 'treewind' + (flutter ? 'F' : 'S');
  return material;
}
function grassMaterial() {
  const material = new THREE.MeshToonMaterial({ gradientMap: toonGradient, side: THREE.DoubleSide });
  material.onBeforeCompile = (sh) => {
    sh.uniforms.uWind = wind;
    sh.vertexShader = 'uniform float uWind;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      float hg = clamp((position.y + 0.25) / 0.5, 0.0, 1.0);
      float ph = instanceMatrix[3].x * 1.3 + instanceMatrix[3].z * 0.9;
      transformed.x += sin(uWind * 2.2 + ph) * 0.2 * hg * hg;
      transformed.z += cos(uWind * 1.7 + ph) * 0.1 * hg * hg;`);
  };
  material.customProgramCacheKey = () => 'grasswind';
  return material;
}

// ---------------------------------------------------------------- outils d'instanciation
const _e = new THREE.Euler(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
export const mx = (px, py, pz, rx, ry, rz, sx, sy, sz) => new THREE.Matrix4().compose(_p.set(px, py, pz), _q.setFromEuler(_e.set(rx, ry, rz)), _s.set(sx, sy, sz));
const mdir = (px, py, pz, dir, sx, sy, sz) => new THREE.Matrix4().compose(_p.set(px, py, pz), _q.setFromUnitVectors(_up, dir.clone().normalize()), _s.set(sx, sy, sz));

class Bag {
  constructor(geo, material) { this.geo = geo; this.material = material; this.m = []; this.c = []; }
  add(m, col = 0xffffff) { this.m.push(m); this.c.push(col); }
  build() {
    if (!this.m.length) return null;
    const im = new THREE.InstancedMesh(this.geo, this.material, this.m.length);
    const c = new THREE.Color();
    this.m.forEach((m, i) => { im.setMatrixAt(i, m); im.setColorAt(i, c.set(this.c[i])); });
    im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true; im.frustumCulled = false;
    return im;
  }
}
function lathe(fn, n = 10) { const pts = []; for (let i = 0; i <= n; i++) { const y = i / n; pts.push(new THREE.Vector2(Math.max(0.02, fn(y)), y)); } return new THREE.LatheGeometry(pts, 8); }

// géométries partagées (créées une fois)
const G = {};
function geos() {
  if (G.plane) return G;
  G.plane = new THREE.PlaneGeometry(1, 1);
  G.fan = new THREE.PlaneGeometry(1, 1); G.fan.translate(0, 0.5, 0);
  G.cyl = new THREE.CylinderGeometry(1, 0.7, 1, 5); G.cyl.translate(0, 0.5, 0);
  G.needle = new THREE.ConeGeometry(1, 1, 6); G.needle.translate(0, 0.5, 0);
  G.broad = [lathe((y) => 0.3 - 0.1 * y + 0.62 * Math.exp(-y * 9)), lathe((y) => 0.34 - 0.13 * y + 0.5 * Math.exp(-y * 7))];
  G.palm = lathe((y) => 0.16 - 0.04 * y + 0.12 * Math.exp(-y * 10));
  G.bao = lathe((y) => 1.05 + 0.55 * Math.sin(y * 2.4) - 0.5 * y * y, 12);
  G.blade = new THREE.ConeGeometry(0.011, 0.5, 3, 1, true);   // brins fins comme des fils
  for (const k of Object.keys(G)) { const v = G[k]; (Array.isArray(v) ? v : [v]).forEach((g) => { g.userData.keep = true; }); }
  return G;
}

// ---------------------------------------------------------------- matériaux des arbres (cache)
function treeMaterials(kind) {
  return cached('treemats' + kind, () => {
    const std = (o) => new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0, ...o });
    const m = {};
    m.bark = addTreeWind(std({ map: barkTexture('#6a4a2e', '#3c2716', '#8c6a46') }), false);
    m.bao = addTreeWind(std({ map: barkTexture('#a37750', '#6f4a2c', '#c79a6a') }), false);
    const pal = (kind === 'forest' || kind === 'beach') ? ['#1f6f2e', '#2e8b3a', '#3fa346', '#58b84c', '#86d36a'] : kind === 'baobab' ? ['#4f7320', '#6b8f2a', '#86a935', '#a3c04a'] : ['#6b7d2a', '#8a9a35', '#a9b44a'];
    m.leaf = addTreeWind(std({ map: leafTexture(kind, pal), alphaTest: 0.42, side: THREE.DoubleSide }), true);
    m.aca = addTreeWind(std({ map: leafTexture('aca', ['#4f7320', '#6b8f2a', '#86a935', '#9fbd44'], 260), alphaTest: 0.42, side: THREE.DoubleSide }), true);
    m.frond = addTreeWind(std({ map: frondTexture(), alphaTest: 0.4, side: THREE.DoubleSide }), true);
    m.rock = std({ map: rockTexture() });
    for (const v of Object.values(m)) v.userData.keep = true;
    return Object.assign(new THREE.Object3D(), { mats: m });
  }).mats;
}

// ---------------------------------------------------------------- arbres
export function buildTrees(kind, R, spots) {
  const group = new THREE.Group();
  const g = geos();
  const M = treeMaterials(kind);
  const B = {
    broad: [new Bag(g.broad[0], M.bark), new Bag(g.broad[1], M.bark)], palm: new Bag(g.palm, M.bark), bao: new Bag(g.bao, M.bao),
    branch: new Bag(g.cyl, M.bark), branchBao: new Bag(g.cyl, M.bao),
    leaf: new Bag(g.plane, M.leaf), aca: new Bag(g.plane, M.aca), frond: new Bag(g.fan, M.frond), needle: new Bag(g.needle, M.rock),
  };
  const tint = () => new THREE.Color(0xffffff).multiplyScalar(0.8 + R() * 0.3).getHex();
  const cluster = (bag, c, size) => {
    for (let k = 0; k < 3; k++) bag.add(mx(c[0], c[1], c[2], (R() - 0.5) * 0.5, k * 1.05 + R() * 0.4, 0, size, size * 0.9, 1), tint());
    bag.add(mx(c[0], c[1] + size * 0.1, c[2], -Math.PI / 2 + (R() - 0.5) * 0.3, R() * 3, 0, size * 0.95, size * 0.95, 1), tint());
  };
  const branch = (bag, base, dir, len, th) => bag.add(mdir(base[0], base[1], base[2], dir, th, len, th));
  const palm = (x, y, z) => {
    const h = 6 + R() * 4, s = 0.9 + R() * 0.3, lean = (R() - 0.5) * 0.08;
    B.palm.add(mx(x, y, z, 0, R() * 6, lean, s, h, s));
    for (let i = 0; i < 12; i++) { const a = -1.45 + (i / 11) * 2.9; B.frond.add(mx(x, y + h, z + (R() - 0.5) * 0.4, 0, (R() - 0.5) * 0.6, a, 2.0, 5.2 + R() * 1.2, 1), tint()); }
  };
  const broad = (x, y, z) => {
    const s = 0.85 + R() * 0.5, h = (8 + R() * 5) * s, ry = R() * 6.28;
    B.broad[Math.floor(R() * 2)].add(mx(x, y, z, 0, ry, 0, s, h, s));
    const n = 4 + Math.floor(R() * 2);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 6.28 + R(), ty = h * (0.6 + R() * 0.25), len = 2.4 + R() * 1.6;
      const d = new THREE.Vector3(Math.cos(a) * len, len * 0.95, Math.sin(a) * len * 0.6);
      branch(B.branch, [x, y + ty, z], d, d.length(), 0.17 * s);
      cluster(B.leaf, [x + d.x, y + ty + d.y, z + d.z], (4.2 + R() * 1.4) * s);
    }
    cluster(B.leaf, [x, y + h + 0.9 * s, z], 5.6 * s);
  };
  const baobab = (x, y, z) => {
    const h = 7 + R() * 5, s = 1 + R() * 0.4;
    B.bao.add(mx(x, y, z, 0, R() * 6, 0, s, h, s));
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * 6.28 + R() * 0.5, len = 2.6 + R() * 1.6;
      const d = new THREE.Vector3(Math.cos(a) * len, len * 0.9, Math.sin(a) * len * 0.7);
      branch(B.branchBao, [x + Math.cos(a) * 0.7, y + h * 0.96, z + Math.sin(a) * 0.5], d, d.length(), 0.22 * s);
      if (R() > 0.35) cluster(B.leaf, [x + d.x, y + h + d.y, z + d.z], 2.6 + R() * 1.2);
    }
  };
  const acacia = (x, y, z) => {
    const h = 3.4 + R() * 2.2;
    B.branch.add(mx(x, y, z, 0, 0, 0.04, 0.16, h, 0.16));
    for (let k = 0; k < 6; k++) B.aca.add(mx(x + (R() - 0.5) * 2.4, y + h + R() * 0.7, z + (R() - 0.5) * 2, -Math.PI / 2 + (R() - 0.5) * 0.25, R() * 3, 0, 6 + R() * 3, 6 + R() * 3, 1), tint());
  };
  const needles = (x, y, z, col) => {
    const n = 2 + Math.floor(R() * 4);
    for (let i = 0; i < n; i++) { const h = 3 + R() * 12, r = 0.5 + R() * 1.1; B.needle.add(mx(x + (R() - 0.5) * 4, y - 0.5, z + (R() - 0.5) * 3, 0, R() * 6, (R() - 0.5) * 0.14, r, h, r), new THREE.Color(col).multiplyScalar(0.7 + R() * 0.4).getHex()); }
  };

  for (const sp of spots) {
    const { x, y, z } = sp, pick = R();
    if (kind === 'forest') { if (pick < 0.68) broad(x, y, z); else palm(x, y, z); }
    else if (kind === 'beach') { if (pick < 0.8) palm(x, y, z); else broad(x, y, z); }
    else if (kind === 'baobab') { if (pick < 0.7) baobab(x, y, z); else acacia(x, y, z); }
    else if (kind === 'canyon') { needles(x, y, z, 0xd68a62); if (pick > 0.75) acacia(x + 2, y, z); }
    else { needles(x, y, z, 0xffffff); if (pick > 0.7) { const h = 1.4 + R(); B.branch.add(mx(x + 2, y, z, 0, 0, 0, 0.08, h, 0.08)); cluster(B.aca, [x + 2, y + h, z], 2.4); } }
  }
  for (const b of [...B.broad, B.palm, B.bao, B.branch, B.branchBao, B.leaf, B.aca, B.frond, B.needle]) { const im = b.build(); if (im) group.add(im); }
  return group;
}

// ---------------------------------------------------------------- herbe
const PALS = {
  forest: ['#3f9a2c', '#58b83a', '#7fd04a', '#2f8a3a', '#9be05a', '#b6e86a'],
  beach: ['#4fae3a', '#6cc24a', '#8fd85a', '#3f9a2c'],
  tsingy: ['#6fa83a', '#8cc24a', '#a8c24a', '#5a9a3a', '#c8b84a'],
  canyon: ['#9aa83a', '#c8b84a', '#b8a040', '#7a9a30'],
  baobab: ['#9aa83a', '#c8b84a', '#b8a040', '#7a9a30', '#d8c25a'],
};
export function bladeMesh(count, kind) {
  const g = geos();
  const material = cached('grassmat', grassMaterial);
  const im = new THREE.InstancedMesh(g.blade, material, count);
  return { im, pal: PALS[kind] || PALS.forest, col: new THREE.Color() };
}
/** Herbe sur le dessus des blocs. */
export function buildGrass(cells, kind, R, depth, perCell = 16) {
  const { im, pal, col } = bladeMesh(cells.length * perCell, kind);
  let i = 0;
  for (const [c, y] of cells) {
    for (let k = 0; k < perCell; k++, i++) {
      const edge = R() < 0.65;
      const z = edge ? (R() < 0.5 ? -1 : 1) * (0.5 + R() * (depth / 2 - 0.55)) : (R() - 0.5) * depth;
      const sy = 0.6 + R() * 1.0, sx = 0.8 + R() * 0.8;
      im.setMatrixAt(i, mx(c + R(), y + 1 + 0.25 * sy, z, (R() - 0.5) * 0.3, R() * 3, (R() - 0.5) * 0.3, sx, sy, sx));
      im.setColorAt(i, col.set(pal[Math.floor(R() * pal.length)]));
    }
  }
  im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true; im.frustumCulled = false;
  return { mesh: im };
}
/** Touffes denses au pied des arbres (cachent le bas des troncs) + prairie sur les rives. */
export function buildGroundCover(kind, R, spots, cols, perTree = 38, perUnit = 3) {
  const banks = [[-3.6, -13], [3.6, 9]];
  let meadow = 0; for (const [z0, z1] of banks) meadow += Math.floor((cols + 8) * Math.abs(z1 - z0) * perUnit);
  const total = spots.length * perTree + meadow;
  const { im, pal, col } = bladeMesh(total, kind);
  let i = 0;
  for (const sp of spots) {
    for (let k = 0; k < perTree; k++, i++) {
      const a = R() * 6.28, r = Math.sqrt(R()) * 2.4, sy = 1.0 + R() * 1.7, sx = 1.0 + R() * 0.8;
      im.setMatrixAt(i, mx(sp.x + Math.cos(a) * r, sp.y + 0.25 * sy, sp.z + Math.sin(a) * r * 0.8, (R() - 0.5) * 0.3, R() * 3, (R() - 0.5) * 0.3, sx, sy, sx));
      im.setColorAt(i, col.set(pal[Math.floor(R() * pal.length)]));
    }
  }
  for (const [z0, z1] of banks) {
    const n = Math.floor((cols + 8) * Math.abs(z1 - z0) * perUnit);
    for (let k = 0; k < n; k++, i++) {
      const sy = 0.5 + R() * 0.9, sx = 0.8 + R() * 0.7;
      im.setMatrixAt(i, mx(-4 + R() * (cols + 8), -1.5 + 0.25 * sy, z0 + (z1 - z0) * R(), (R() - 0.5) * 0.3, R() * 3, (R() - 0.5) * 0.3, sx, sy, sx));
      im.setColorAt(i, col.set(pal[Math.floor(R() * pal.length)]));
    }
  }
  im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true; im.frustumCulled = false;
  return im;
}

// ---------------------------------------------------------------- nuages bouffants
export function buildClouds(R, n, x0, x1, tintHex = 0xffffff) {
  const geo = cached('cloudgeo', () => new THREE.IcosahedronGeometry(1, 1));
  const material = cached('cloudmat' + tintHex, () => new THREE.MeshToonMaterial({ color: tintHex, emissive: 0xffd9b0, emissiveIntensity: 0.4, gradientMap: toonGradient, fog: false }));
  const sizes = [3.2, 4.4, 5.2, 4.6, 3.6, 2.8, 2.4];
  const im = new THREE.InstancedMesh(geo, material, n * sizes.length);
  let i = 0;
  for (let k = 0; k < n; k++) {
    const cx = x0 + (x1 - x0) * (k + R() * 0.8) / n, cy = 20 + R() * 16, cz = -50 - R() * 60, sc = 0.8 + R() * 0.8;
    sizes.forEach((s, j) => {
      const off = (j - 3) * 3.2 * sc;
      im.setMatrixAt(i++, mx(cx + off, cy + Math.sin(j * 1.7) * 1.2 * sc, cz + (R() - 0.5) * 2, 0, 0, 0, s * 1.35 * sc, s * 0.85 * sc, s * sc));
    });
  }
  im.instanceMatrix.needsUpdate = true; im.frustumCulled = false;
  return im;
}

// ---------------------------------------------------------------- oiseaux qui volent
export function buildBirds(R, n = 8, x0 = -10, x1 = 120) {
  const group = new THREE.Group();
  const body = cached('birdbody', () => new THREE.ConeGeometry(0.16, 0.7, 5));
  const wing = cached('birdwing', () => { const g = new THREE.PlaneGeometry(0.85, 0.3); g.translate(0.42, 0, 0); return g; });
  const mat = cached('birdmat', () => new THREE.MeshBasicMaterial({ color: 0x2b1b14, side: THREE.DoubleSide, fog: false }));
  const birds = [];
  for (let i = 0; i < n; i++) {
    const g = new THREE.Group();
    const b = new THREE.Mesh(body, mat); b.rotation.z = -Math.PI / 2; g.add(b);
    const wl = new THREE.Mesh(wing, mat), wr = new THREE.Mesh(wing, mat); wl.rotation.y = -Math.PI / 2; wr.rotation.y = Math.PI / 2;
    g.add(wl, wr);
    g.scale.setScalar(0.9 + R() * 0.8);
    group.add(g);
    birds.push({ g, wl, wr, ox: x0 + R() * (x1 - x0), oy: 5.5 + R() * 4.5, z: -9 - R() * 24, sp: 2.2 + R() * 2.2, ph: R() * 6.28, fl: 7 + R() * 4, dir: R() > 0.25 ? 1 : -1 });
  }
  return {
    group,
    update(t, dt) {                       // les oiseaux ont leur propre trajectoire : ils ne suivent plus la caméra
      for (const b of birds) {
        b.ox += b.sp * b.dir * dt;
        if (b.ox > x1) b.ox = x0; else if (b.ox < x0) b.ox = x1;
        b.g.position.set(b.ox, b.oy + Math.sin(t * 0.7 + b.ph) * 1.1, b.z);
        b.g.rotation.y = b.dir > 0 ? 0 : Math.PI;
        b.g.rotation.z = Math.cos(t * 0.7 + b.ph) * 0.12;
        const f = Math.sin(t * b.fl + b.ph) * 0.75;
        b.wl.rotation.x = -f; b.wr.rotation.x = f;
      }
    },
  };
}
