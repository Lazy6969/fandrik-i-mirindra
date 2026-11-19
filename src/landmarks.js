// Paysages emblématiques en arrière-plan (un par lieu / par titre de niveau) + herbe supplémentaire.
import * as THREE from 'three';
import { bladeMesh, mx, frondTexture } from './decor.js';

// ---------------------------------------------------------------- herbe fine supplémentaire
/** Anneau d'herbe autour d'un point (cache le socle des personnages). Coordonnées relatives au centre. */
export function buildRing(kind, R, count, rMin, rMax, y0, sMin, sMax) {
  const { im, pal, col } = bladeMesh(count, kind);
  for (let i = 0; i < count; i++) {
    const a = R() * 6.28, r = rMin + R() * (rMax - rMin), sy = sMin + R() * (sMax - sMin), sx = 0.7 + R() * 0.7;
    im.setMatrixAt(i, mx(Math.cos(a) * r, y0 + 0.25 * sy, Math.sin(a) * r, (R() - 0.5) * 0.35, R() * 3, (R() - 0.5) * 0.35, sx, sy, sx));
    im.setColorAt(i, col.set(pal[Math.floor(R() * pal.length)]));
  }
  im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true; im.frustumCulled = false;
  return im;
}
/** Prairie fine sur un rectangle du sol (accueil : cache le bas des arbres et du terrain). */
export function buildMeadowArea(kind, R, x0, x1, z0, z1, count, y, sMin = 0.6, sMax = 1.6) {
  const { im, pal, col } = bladeMesh(count, kind);
  for (let i = 0; i < count; i++) {
    const sy = sMin + R() * (sMax - sMin), sx = 0.7 + R() * 0.7;
    im.setMatrixAt(i, mx(x0 + (x1 - x0) * R(), y + 0.25 * sy, z0 + (z1 - z0) * R(), (R() - 0.5) * 0.3, R() * 3, (R() - 0.5) * 0.3, sx, sy, sx));
    im.setColorAt(i, col.set(pal[Math.floor(R() * pal.length)]));
  }
  im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true; im.frustumCulled = false;
  return im;
}
/** Frange d'herbe qui retombe devant le bord avant du terrain : masque la face avant du sol. */
export function buildFrontFringe(cells, kind, R, depth, perCell = 10) {
  const { im, pal, col } = bladeMesh(cells.length * perCell, kind);
  let i = 0;
  for (const [c, y] of cells) {
    for (let k = 0; k < perCell; k++, i++) {
      const sy = 0.8 + R() * 0.9, sx = 0.8 + R() * 0.8;
      im.setMatrixAt(i, mx(c + R(), y + 1 + 0.1 * sy, depth / 2 - 0.05 + R() * 0.25, 0.5 + R() * 0.4, R() * 3, (R() - 0.5) * 0.3, sx, sy, sx));
      im.setColorAt(i, col.set(pal[Math.floor(R() * pal.length)]));
    }
  }
  im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true; im.frustumCulled = false;
  return im;
}

// ---------------------------------------------------------------- outils de construction
const lmCache = new Map();
const LM = (hex, o = {}) => {
  const k = hex + JSON.stringify(o);
  if (!lmCache.has(k)) { const m = new THREE.MeshStandardMaterial({ color: hex, roughness: 1, metalness: 0, flatShading: true, ...o }); m.userData.keep = true; lmCache.set(k, m); }
  return lmCache.get(k);
};
const part = (geo, m, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); return o; };
const bx = (w, h, d, m, x, y, z) => part(new THREE.BoxGeometry(w, h, d), m, x, y, z);
const cy = (r0, r1, h, m, x, y, z, seg = 10) => part(new THREE.CylinderGeometry(r0, r1, h, seg), m, x, y, z);
const cn = (r, h, m, x, y, z, seg = 8) => part(new THREE.ConeGeometry(r, h, seg), m, x, y, z);
const sp = (r, m, x, y, z, sx = 1, sy = 1, sz = 1) => part(new THREE.SphereGeometry(r, 12, 9), m, x, y, z, sx, sy, sz);
/** Toit à deux pans : base à yBase, longueur len (axe x), hauteur h, largeur w. */
function roof(len, h, w, m, x, yBase, z) {
  const g = new THREE.CylinderGeometry(0.5, 0.5, 1, 3); g.rotateZ(Math.PI / 2); g.rotateX(-Math.PI / 2);
  return part(g, m, x, yBase + 0.25 * (h / 0.75), z, len, h / 0.75, w / 0.866);
}
function lighthouse(g, x, z, s = 1) {
  g.add(cy(1.6 * s, 2.4 * s, 16 * s, LM(0xf6f1e6), x, 8 * s, z), cy(1.65 * s, 2.0 * s, 3 * s, LM(0xc8352a), x, 10 * s, z), cn(2 * s, 3 * s, LM(0xa02a20), x, 17.5 * s, z),
    cy(1.2 * s, 1.2 * s, 2 * s, LM(0xfff0a0, { emissive: 0xffe080, emissiveIntensity: 0.6 }), x, 15.5 * s, z));
}
function palmFar(g, x, z, h, lean = 0) {
  const t = cy(0.5, 0.8, h, LM(0x6a4a2e), x, h / 2, z); t.rotation.z = lean; g.add(t);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * 6.28;
    const f = cn(0.9, 7, LM(0x2f8f3a), x - Math.sin(lean) * h * 0.5 + Math.cos(a) * 2.6, h + 0.2, z + Math.sin(a) * 2.6, 4);
    f.rotation.z = Math.cos(a) * 1.25; f.rotation.x = -Math.sin(a) * 1.25; g.add(f);
  }
}
function baobabFar(g, x, z, h, r) {
  const pts = []; for (let i = 0; i <= 12; i++) { const y = i / 12; pts.push(new THREE.Vector2(r * (1 + 0.45 * Math.sin(y * 2.4) - 0.45 * y * y), y * h)); }
  g.add(part(new THREE.LatheGeometry(pts, 10), LM(0x9a6a46), x, 0, z));
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * 6.28;
    const b = cy(0.5, 0.8, 7, LM(0x7a5232), x + Math.cos(a) * r * 0.5, h + 2.2, z + Math.sin(a) * r * 0.5, 6); b.rotation.z = Math.cos(a) * 0.9; b.rotation.x = Math.sin(a) * 0.9;
    g.add(b, sp(2.6, LM(0x5f8f30), x + Math.cos(a) * 5, h + 6, z + Math.sin(a) * 5, 1.2, 0.8, 1.2));
  }
}
function house(g, x, y, z, R) {
  const cols = [0xf6e3c0, 0xf0c8a0, 0xe8d8b0, 0xf2b8a0];
  g.add(bx(2.4, 1.8, 2.2, LM(cols[Math.floor(R() * cols.length)]), x, y + 0.9, z), cn(2.1, 1.4, LM(0xb8402a), x, y + 2.5, z, 4));
}

// ---------------------------------------------------------------- les paysages
/** Volcan avec lave et fumée animée (k = taille). */
function buildVolcano(g, R, k) {
  const rock = LM(0x3a3036), rock2 = LM(0x4a3e44), lava = new THREE.MeshBasicMaterial({ color: 0xff6a1a }), glow = new THREE.MeshBasicMaterial({ color: 0xffc040 });
  g.add(cn(30 * k, 30 * k, rock, 0, 14 * k, 0, 18), cn(16 * k, 12 * k, rock2, -26 * k, 4 * k, -4, 12), cn(14 * k, 10 * k, rock2, 28 * k, 3 * k, -2, 12));
  g.add(cy(5.6 * k, 6.4 * k, 1.5, lava, 0, 29.6 * k, 0, 18), cy(3.4 * k, 4 * k, 1.6, glow, 0, 29.9 * k, 0, 18));              // cratère incandescent
  for (let i = 0; i < 7; i++) {                                                                                                // coulées de lave le long des pentes
    const a = (i / 7) * 6.28 + R() * 0.4, len = (14 + R() * 10) * k;
    const s = bx(1.1 * k, len, 0.5, lava, 0, 0, 0);
    s.position.set(Math.cos(a) * 9 * k, 26 * k - len * 0.42, Math.sin(a) * 6 * k + 3); s.rotation.z = -Math.cos(a) * 0.55; s.rotation.x = Math.sin(a) * 0.3; g.add(s);
  }
  const puffs = [];
  for (let i = 0; i < 9; i++) { const p = sp(3 + R() * 2, new THREE.MeshBasicMaterial({ color: 0x5a4a50, transparent: true, opacity: 0.5, fog: false }), 0, 32 * k, 0); g.add(p); puffs.push({ p, ph: R() * 6.28 }); }
  const sparks = [];
  if (k > 1.2) for (let i = 0; i < 14; i++) { const p = sp(0.8, glow, 0, 30 * k, 0); g.add(p); sparks.push({ p, ph: R() * 6.28, vx: (R() - 0.5) * 14, vz: (R() - 0.5) * 6 }); }
  g.userData.update = (t) => {
    puffs.forEach(({ p, ph }, i) => { const u = ((t * 0.12 + ph / 6.28 + i * 0.11) % 1); p.position.set(Math.sin(ph + t * 0.3) * 3 * k + u * 8, 32 * k + u * 26 * k, 0); p.scale.setScalar(0.6 + u * 1.8); p.material.opacity = 0.55 * (1 - u); });
    sparks.forEach(({ p, ph, vx, vz }) => { const u = ((t * 0.5 + ph) % 3) / 3; p.position.set(vx * u, 30 * k + (u * 30 - u * u * 30) * k, vz * u); p.scale.setScalar(1 - u * 0.8); });
  };
}

const LANDMARKS = {
  /** Rova Manjakamiadana (Antananarivo) : palais sur sa colline, tours d'angle, maisons en gradins. */
  rova(g, R) {
    g.add(sp(1, LM(0x78b04e), 0, -6, 0, 40, 13, 18));
    const wall = LM(0xf3e6c8), rf = LM(0x7a3a2a), white = LM(0xffffff);
    g.add(bx(24, 7, 8, wall, 0, 10.5, 0), roof(26, 10, 9.5, rf, 0, 14, 0), bx(10, 9, 9, wall, 0, 11.5, 2), roof(10.5, 8, 10.2, rf, 0, 16, 2));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(cy(1.2, 1.4, 6, wall, sx * 13, 10, sz * 4.2), cn(1.8, 3.4, rf, sx * 13, 15.2, sz * 4.2));
    for (let i = -5; i <= 5; i++) g.add(cy(0.28, 0.28, 4.4, white, i * 1.9, 9.4, 4.8, 6));
    g.add(bx(24, 0.6, 1.4, white, 0, 7.2, 5));
    for (let i = 0; i < 26; i++) { const x = (R() - 0.5) * 66; const yy = -6 + 13 * Math.sqrt(Math.max(0.02, 1 - (x / 40) ** 2)) - 0.8; if (Math.abs(x) > 15 || R() > 0.5) house(g, x, yy, 6 + R() * 8, R); }
  },
  isalo(g, R) {
    const s = LM(0xc8703a), s2 = LM(0xa85a2c), s3 = LM(0xd88a50);
    g.add(bx(34, 16, 14, s, 0, 8, 0), bx(28, 5, 12, s3, 0, 18.5, 0), bx(18, 4, 10, s2, 2, 23, 0));
    g.add(bx(8, 14, 12, s2, -24, 7, 2), bx(7, 10, 11, s3, -33, 5, 2), bx(9, 18, 12, s, 25, 9, 2), bx(6, 12, 10, s2, 34, 6, 0));
    g.add(bx(4, 13, 8, s2, -5, 6.5, 8), bx(4, 13, 8, s2, 5, 6.5, 8), bx(14, 4, 8, s3, 0, 14.5, 8));       // « fenêtre de l'Isalo »
    for (let i = 0; i < 14; i++) g.add(part(new THREE.IcosahedronGeometry(1, 0), LM(0x9a5028), (R() - 0.5) * 80, 0.6, 12 + R() * 8, 1.5 + R() * 2, 1 + R(), 1.5 + R() * 2));
  },
  tsingyBig(g, R) {
    for (let i = 0; i < 46; i++) { const h = 10 + R() * 26, r = 1.2 + R() * 2.6; const c = cn(r, h, LM(R() > 0.5 ? 0x8f8a82 : 0x77736c), (R() - 0.5) * 70, h / 2 - 1, (R() - 0.5) * 12, 6); c.rotation.z = (R() - 0.5) * 0.12; g.add(c); }
  },
  nosybe(g, R) {
    g.add(sp(1, LM(0x4f9f4a), 0, -4, 0, 30, 14, 15), sp(1, LM(0xf0dca8), 8, -2.4, 14, 26, 3.4, 8));
    lighthouse(g, -10, 2, 0.8);
    for (let i = 0; i < 9; i++) palmFar(g, -24 + i * 6 + R() * 3, 8 + R() * 7, 11 + R() * 5, (R() - 0.5) * 0.3);
    for (let i = 0; i < 3; i++) g.add(bx(3.2, 2.2, 3, LM(0xe8d2a0), 14 + i * 5, 1.1, 6), cn(3, 2, LM(0xa8742c), 14 + i * 5, 3.2, 6, 4));
  },
  boraha(g, R) {
    g.add(sp(1, LM(0x5aa84e), 0, -4, 0, 26, 10, 12), sp(1, LM(0xf0d8a0), -4, -2.2, 12, 30, 3, 8));
    lighthouse(g, 9, 2, 1);
    for (let i = 0; i < 10; i++) palmFar(g, -30 + i * 6 + R() * 3, 7 + R() * 8, 10 + R() * 6, (R() - 0.5) * 0.35);
    for (let i = 0; i < 6; i++) g.add(bx(0.6, 3.4, 0.6, LM(0x6a4a2e), -14 + i * 2.6, 1.7, 14), bx(2.4, 0.6, 0.6, LM(0x6a4a2e), -14 + i * 2.6, 2.6, 14));
  },
  andasibe(g, R) {
    const bark = LM(0x5a3d26), black = LM(0x1c1c20), white = LM(0xeeeeee);
    g.add(cy(3, 4.2, 44, bark, -8, 20, 0));
    const br = cy(0.9, 1.4, 16, bark, 4, 26, 0); br.rotation.z = 1.35; g.add(br);
    // un indri assis sur la branche
    g.add(sp(2.6, black, 8, 29, 1, 1, 1.5, 1), sp(2.2, white, 8, 28.6, 2.4, 0.9, 1.4, 0.6), sp(1.5, black, 8.4, 33.5, 1.4), sp(0.9, white, 7.0, 34.6, 1.4, 1, 1, 0.6), sp(0.9, white, 9.8, 34.6, 1.4, 1, 1, 0.6));
    for (let i = 0; i < 9; i++) { const x = -40 + i * 10 + R() * 4; if (Math.abs(x + 8) > 6) { const z = -6 - R() * 8; g.add(cy(1.6, 2.4, 40, bark, x, 18, z), sp(8 + R() * 4, LM(0x2f7d35), x, 40, z, 1.3, 0.8, 1.2)); } }
  },
  waterfall(g, R) {
    g.add(bx(30, 34, 10, LM(0x4f6a48), 0, 15, -2), bx(14, 10, 12, LM(0x5a7852), -20, 4, 0), bx(16, 14, 12, LM(0x46623f), 22, 6, 0), sp(8, LM(0x3f7f3a), -10, 33, -1, 1.5, 0.7, 1), sp(9, LM(0x3a7a36), 12, 34, -1, 1.5, 0.7, 1));
    const cv = document.createElement('canvas'); cv.width = 64; cv.height = 256;
    const ctx = cv.getContext('2d'); for (let i = 0; i < 34; i++) { ctx.fillStyle = `rgba(255,255,255,${0.35 + R() * 0.5})`; ctx.fillRect(R() * 60, R() * 256, 2 + R() * 4, 30 + R() * 90); }
    const wt = new THREE.CanvasTexture(cv); wt.wrapS = wt.wrapT = THREE.RepeatWrapping; wt.colorSpace = THREE.SRGBColorSpace;
    g.add(part(new THREE.PlaneGeometry(7, 31), new THREE.MeshBasicMaterial({ map: wt, transparent: true, opacity: 0.95, depthWrite: false }), 0, 14, 3.2));
    const pool = part(new THREE.CircleGeometry(1, 20), new THREE.MeshBasicMaterial({ color: 0xdff4ff, transparent: true, opacity: 0.7 }), 0, 0.4, 8, 9, 3.4, 1); pool.rotation.x = -Math.PI / 2; g.add(pool);
    g.userData.update = (t) => { wt.offset.y = -t * 0.9; };
  },
  giantTrees(g, R) {
    const bark = LM(0x5a3d26);
    for (let i = 0; i < 8; i++) { const x = -38 + i * 11 + R() * 4, z = -4 - R() * 10, h = 36 + R() * 14; g.add(cy(1.7, 2.8, h, bark, x, h / 2 - 1, z), sp(8 + R() * 4, LM(0x2f7d35), x, h, z, 1.3, 0.8, 1.2), sp(5 + R() * 3, LM(0x3c9140), x + 3, h - 5, z + 2)); }
  },
  ravinala(g, R) {
    const frond = new THREE.MeshStandardMaterial({ map: frondTexture(), alphaTest: 0.4, side: THREE.DoubleSide, roughness: 1 }); frond.userData.keep = true;
    const fg = new THREE.PlaneGeometry(1, 1); fg.translate(0, 0.5, 0);
    for (let i = 0; i < 5; i++) {
      const x = -30 + i * 15 + R() * 4, h = 20 + R() * 8;
      g.add(cy(0.8, 1.2, h, LM(0x7a5a35), x, h / 2, -2 - R() * 3, 8));
      for (let k = 0; k < 11; k++) { const f = part(fg, frond, x, h, -2, 5, 17, 1); f.rotation.z = -1.4 + (k / 10) * 2.8; g.add(f); }
    }
  },
  mountains(g, R) {
    const cols = [0x7f95b0, 0x8fa3bc, 0x6f86a6];
    for (let i = 0; i < 7; i++) g.add(cn(18 + R() * 12, 22 + R() * 22, LM(cols[i % 3]), -48 + i * 16 + R() * 5, 10 + (i % 2) * 3, -R() * 14, 6));
  },
  boulders(g, R) {
    for (let i = 0; i < 12; i++) { const s = 4 + R() * 7; g.add(part(new THREE.IcosahedronGeometry(1, 0), LM(R() > 0.5 ? 0x9a8f80 : 0x7f7568), -42 + i * 8 + R() * 4, s * 0.4, -R() * 10, s * 1.2, s * 0.8, s)); }
  },
  ravine(g) {
    const a = LM(0xb85a30), b = LM(0x8f3f22);
    g.add(bx(26, 30, 14, a, -22, 14, 0), bx(24, 26, 14, b, 24, 12, 0), bx(9, 22, 12, LM(0xc86a3a), -6, 10, -2), bx(7, 16, 12, LM(0xa44c28), 7, 7, -2));
    for (const [x, y] of [[-22, 10], [-22, 18], [24, 8], [24, 16]]) g.add(bx(26, 1.2, 14.4, LM(0x6f2f18), x, y, 0));
  },
  baobabAlley(g, R) {
    for (let i = 0; i < 9; i++) baobabFar(g, -44 + i * 11, -6 - (i % 2) * 5, 20 + R() * 8, 3.6 + R());
  },
  sunHalo(g) {
    g.add(part(new THREE.TorusGeometry(15, 0.7, 8, 48), new THREE.MeshBasicMaterial({ color: 0xffd36a, fog: false }), 0, 30, -4),
      part(new THREE.CircleGeometry(11, 36), new THREE.MeshBasicMaterial({ color: 0xffb060, fog: false, transparent: true, opacity: 0.55 }), 0, 30, -5));
    for (let i = 0; i < 5; i++) baobabFar(g, -30 + i * 15, 0, 16 + (i % 2) * 5, 3 + (i % 3) * 0.4);
  },
  huts(g, R) {
    g.add(sp(1, LM(0xf0dca8), 0, -2.6, 8, 44, 3.4, 12));
    for (let i = 0; i < 7; i++) { const x = -32 + i * 10 + R() * 3, z = 2 + R() * 6; g.add(cy(2.2, 2.4, 2.8, LM(0xd8c090), x, 1.4, z), cn(3.4, 3.2, LM(0x9a7a30), x, 4.4, z, 9)); }
    for (let i = 0; i < 3; i++) { const x = -20 + i * 18, z = 12 + i * 2; g.add(bx(7, 1.4, 2, LM(0x8a5a30), x, 0.8, z), cy(0.18, 0.18, 9, LM(0x5a3a20), x, 5.5, z, 5), part(new THREE.ConeGeometry(3, 8, 3), LM(0xf4ead0), x + 1.4, 5.5, z, 0.2, 1, 1)); }
  },
  antsirabe(g, R) {
    const white = LM(0xf6f1e6), red = LM(0xb8402a);
    g.add(bx(26, 9, 9, white, 0, 6, 0), roof(28, 7, 10.4, red, 0, 10.5, 0), bx(4, 16, 4, white, -16, 9.5, 0), cn(3.4, 5, red, -16, 20, 0, 4), cy(1, 1, 0.3, LM(0x222222), -16, 15, 2.1));
    for (let i = -5; i <= 5; i++) g.add(bx(1.2, 3.4, 0.4, LM(0x7a9ab8), i * 2.2, 6.2, 4.6));
    for (let i = 0; i < 6; i++) { const x = 20 + i * 5; g.add(sp(5 + R() * 2, LM(0x3a8a3a), x, 5, -4 - R() * 6, 1, 1.2, 1), cy(0.6, 0.8, 5, LM(0x5a3d26), x, 2, -4)); }
    // pousse-pousse (au premier plan de ce fond)
    const pp = new THREE.Group();
    for (const z of [-1.3, 1.3]) {
      pp.add(part(new THREE.TorusGeometry(1.1, 0.14, 6, 18), LM(0x222222), 0, 1.15, z));
      for (let k = 0; k < 6; k++) { const s2 = cy(0.04, 0.04, 2.2, LM(0xdddddd), 0, 1.15, z, 4); s2.rotation.z = (k / 6) * Math.PI; pp.add(s2); }
    }
    pp.add(bx(2.6, 1.1, 2.0, LM(0xd8362a), 0, 1.9, 0), part(new THREE.SphereGeometry(1.5, 10, 6, 0, 6.3, 0, 1.57), LM(0x2a2a8a), 0, 2.5, 0, 1, 0.8, 1));
    for (const z of [-0.9, 0.9]) { const sh = cy(0.07, 0.07, 3.8, LM(0x6a4a2e), 2.6, 1.3, z, 5); sh.rotation.z = Math.PI / 2 - 0.2; pp.add(sh); }
    pp.scale.setScalar(2.6); pp.position.set(-30, 0, 48);
    g.add(pp);
  },
  antsiranana(g, R) {
    const pts = []; for (let i = 0; i <= 18; i++) { const y = i / 18; pts.push(new THREE.Vector2(Math.max(0.05, 12 * Math.pow(1 - y, 0.55) + 0.5 * Math.sin(y * 9)), y * 36)); }
    g.add(part(new THREE.LatheGeometry(pts, 14), LM(0x9a8f7c), 0, -1, 0), part(new THREE.LatheGeometry(pts, 12), LM(0x8a806e), 26, -1, -6, 0.55, 0.5, 0.55), sp(1, LM(0x5f9f4a), -26, -3, 2, 14, 7, 8), sp(1, LM(0xe8d49a), 8, -2.6, 14, 40, 3, 8));
    for (let i = 0; i < 7; i++) palmFar(g, -34 + i * 9 + R() * 3, 9 + R() * 6, 9 + R() * 5, (R() - 0.5) * 0.3);
  },
  toliara(g, R) {
    const gr = LM(0x6f8f4a);
    for (let i = 0; i < 20; i++) {
      const x = -44 + i * 4.6 + R() * 2, h = 9 + R() * 14, z = -R() * 12, c = cy(0.35, 0.9, h, gr, x, h / 2 - 0.5, z, 6); c.rotation.z = (R() - 0.5) * 0.3; g.add(c);
      for (let k = 0; k < 6; k++) g.add(cn(0.18, 1, LM(0x4a6a30), x + (R() - 0.5) * 1.6, 1 + R() * h * 0.8, z + (R() - 0.5) * 1.6, 4));
    }
    baobabFar(g, -12, 8, 18, 4.2); baobabFar(g, 20, 6, 22, 4.8);
  },
  /** Ambohimanga : colline sacrée, palissade de bois, porte de pierre, maisons de chaume, grand figuier. */
  ambohimanga(g, R) {
    g.add(sp(1, LM(0x6fae48), 0, -6, 0, 38, 13, 18));
    for (let i = -12; i <= 12; i++) g.add(cy(0.45, 0.5, 5, LM(0x7a5232), i * 1.6, 8.5, 6, 6), cn(0.45, 1, LM(0x6a4426), i * 1.6, 11.5, 6, 6));   // palissade
    g.add(bx(4, 9, 3, LM(0x9a9288), -4, 11, 6.5), bx(4, 9, 3, LM(0x9a9288), 4, 11, 6.5), bx(13, 3, 3.4, LM(0x8a8278), 0, 15, 6.5));                  // porte de pierre
    for (let i = 0; i < 7; i++) { const x = -26 + i * 8.5 + R() * 2; g.add(cy(2.4, 2.6, 3, LM(0xd8c090), x, 8.5, 1 + R() * 4), cn(3.6, 3.6, LM(0x9a7a30), x, 11.8, 1 + R() * 4, 9)); }
    baobabFar(g, 24, -3, 14, 3);
    g.add(cy(1.6, 2.4, 18, LM(0x5a3d26), -22, 14, -2), sp(9, LM(0x2f7d35), -22, 26, -2, 1.3, 0.7, 1.1));
  },
  /** Lac Tritriva : lac de cratère entouré d'une crête boisée de pins. */
  tritriva(g, R) {
    const pts = []; for (let i = 0; i <= 16; i++) { const a = i / 16; pts.push(new THREE.Vector2(14 + Math.sin(a * 3.14) * 10 + a * 14, a * 16 - 2)); }
    pts.reverse();
    g.add(part(new THREE.LatheGeometry([new THREE.Vector2(10, 7), new THREE.Vector2(18, 8), new THREE.Vector2(30, 1), new THREE.Vector2(38, -3)], 28), LM(0x5f8a48), 0, 0, 0));
    const lake = part(new THREE.CircleGeometry(12.5, 36), new THREE.MeshBasicMaterial({ color: 0x1ab6a0 }), 0, 6.6, 0); lake.rotation.x = -Math.PI / 2; g.add(lake);
    for (let i = 0; i < 26; i++) { const a = (i / 26) * 6.28, r = 14 + R() * 12; g.add(cn(1.6, 6 + R() * 3, LM(0x2a6a3a), Math.cos(a) * r, 8 + (r - 14) * -0.3 + 3, Math.sin(a) * r * 0.5, 7)); }
  },
  /** Nosy Komba : île verte, palmiers et lémuriens assis. */
  lemurIsland(g, R) {
    g.add(sp(1, LM(0x4f9f4a), 0, -4, 0, 32, 12, 14), sp(1, LM(0xf0dca8), 4, -2.4, 14, 34, 3.2, 8));
    for (let i = 0; i < 9; i++) palmFar(g, -26 + i * 6.5 + R() * 3, 6 + R() * 6, 10 + R() * 5, (R() - 0.5) * 0.3);
    for (let i = 0; i < 6; i++) {
      const x = -16 + i * 6.5, z = 11 + (i % 2) * 2.5;
      g.add(sp(0.9, LM(0x8a8a90), x, 2.4, z, 1, 1.3, 0.9), sp(0.6, LM(0x8a8a90), x + 0.4, 3.7, z), sp(0.35, LM(0xf2f2f2), x + 0.7, 3.6, z));      // lémurien assis
      for (let k = 0; k < 6; k++) g.add(sp(0.34, LM(k % 2 ? 0x222222 : 0xf2f2f2), x - 0.7 - k * 0.45, 1.2 + k * 0.4, z));                             // queue annelée
    }
  },
  /** Nosy Iranja : banc de sable, palmiers et une grande tortue marine. */
  turtleIsland(g, R) {
    g.add(sp(1, LM(0xf2e0b0), 0, -2.8, 6, 46, 4, 12), sp(1, LM(0x5aa84e), -20, -3, 0, 12, 6, 8));
    for (let i = 0; i < 6; i++) palmFar(g, -30 + i * 8 + R() * 3, 4 + R() * 6, 9 + R() * 4, (R() - 0.5) * 0.3);
    const sh = LM(0x6a7a3a), sk = LM(0x8a9a5a);
    g.add(sp(1, sh, 12, 3, 8, 8, 3.4, 6), sp(1, LM(0xe8d8a8), 12, 1.2, 8, 7, 1.2, 5.4), sp(1, sk, 19, 2.6, 8, 2.2, 1.4, 1.6), sp(0.4, LM(0x111111), 20.4, 3.2, 8.8));
    for (const z of [-1, 1]) g.add(sp(1, sk, 14, 1.4, 8 + z * 6, 3.4, 0.5, 1.2), sp(1, sk, 8, 1.4, 8 + z * 5, 2.6, 0.5, 1));
  },
  /** Volcan : cône sombre, cratère incandescent, coulées de lave et panache de fumée. */
  volcano(g, R) { buildVolcano(g, R, 1); },
  volcanoBig(g, R) { buildVolcano(g, R, 1.5); },
  peaks(g, R) {
    for (let i = 0; i < 6; i++) {
      const h = 30 + R() * 22, w = 14 + R() * 8, x = -44 + i * 17 + R() * 4;
      g.add(cn(w, h, LM(0x6a6a7a), x, h / 2 - 1, -R() * 10, 5), cn(w * 0.33, h * 0.3, LM(0xf4f6fa), x, h - h * 0.15 - 1, -R() * 0.0, 5));
    }
    for (let i = 0; i < 5; i++) g.add(bx(6 + R() * 5, 0.8, 1.2, new THREE.MeshBasicMaterial({ color: 0xff7a1a }), -36 + i * 18, 5 + R() * 6, 8));      // rubans de lave
  },
};

/** Fond emblématique d'un niveau (null si la clé est inconnue). group.userData.update(t) anime la cascade. */
export function buildLandmark(key, R, scale = 1) {
  const fn = LANDMARKS[key];
  if (!fn) return null;
  const g = new THREE.Group();
  fn(g, R);
  g.scale.setScalar(scale);
  g.traverse((o) => { o.frustumCulled = false; });
  return g;
}
