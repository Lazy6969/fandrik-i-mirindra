// Support de chaque personnage : le sol sur lequel il se tient dans le menu (boue pour Kisoa, étang pour Sahona…),
// les petits objets autour, et les animations sous ses pieds (dans le menu comme en jeu).
import * as THREE from 'three';

/** type de sol par personnage */
export const SURF = {
  kalanoro: 'moss', maki: 'leaves', fosa: 'rock', omby: 'hay', kisoa: 'mud', sahona: 'pond', saka: 'hay', alika: 'rock',
  sifaka: 'leaves', ayeaye: 'moss', tana: 'rock', tenrec: 'leaves', lolo: 'moss', vazimba: 'sand', angatra: 'mist', trimobe: 'rock',
  tortue: 'sand', sorciere: 'rune', darafify: 'sand', rapeto: 'rock', ikotofetsy: 'hay', imahaka: 'mud', ibonia: 'rune',
  ikotobekibo: 'mud', zazavavindrano: 'water',
};
export const surfKind = (id) => SURF[id] || 'moss';

function rnd(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; t.userData.keep = true; return t;
}
const ell = (ctx, x, y, rx, ry, rot, fill) => { ctx.fillStyle = fill; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, 6.3); ctx.fill(); };

const texCache = new Map();
export function surfaceTexture(kind) {
  if (texCache.has(kind)) return texCache.get(kind);
  const R = rnd(kind.length * 977 + kind.charCodeAt(0));
  const t = canvasTex(256, 256, (ctx, w, h) => {
    const base = { mud: '#6a4222', pond: '#1c8aa3', hay: '#c9a24a', leaves: '#4a3a22', rock: '#8b8579', sand: '#e1c78e', moss: '#3f7a2b', rune: '#2a1a3d', mist: '#46405c', water: '#19c3d8' }[kind] || '#555';
    ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
    if (kind === 'mud') {
      for (let i = 0; i < 26; i++) ell(ctx, R() * w, R() * h, 14 + R() * 30, 8 + R() * 16, R() * 3, R() < 0.55 ? 'rgba(50,28,10,.55)' : 'rgba(150,100,55,.4)');
      for (let i = 0; i < 18; i++) ell(ctx, R() * w, R() * h, 3 + R() * 7, 2 + R() * 4, R() * 3, 'rgba(255,230,190,.35)');
    } else if (kind === 'pond' || kind === 'water') {
      for (let i = 0; i < 26; i++) { ctx.strokeStyle = i % 2 ? 'rgba(255,255,255,.6)' : 'rgba(10,90,130,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse((i * 53) % w, (i * 37) % h, 14 + (i % 5) * 4, 4, 0, 0, 3.14); ctx.stroke(); }
      if (kind === 'pond') for (let i = 0; i < 6; i++) { const x = 30 + R() * 196, y = 30 + R() * 196, r = 14 + R() * 10; ctx.fillStyle = '#3f9a3a'; ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r, 0.4, 6.0); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#2b7a2b'; ctx.lineWidth = 1.5; ctx.stroke(); }
    } else if (kind === 'hay') {
      for (let i = 0; i < 520; i++) { const x = R() * w, y = R() * h, a = R() * 3.14, l = 14 + R() * 26; ctx.strokeStyle = ['#e8c75c', '#b8902f', '#d9b24a', '#8f6b22'][i % 4]; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke(); }
    } else if (kind === 'leaves') {
      for (let i = 0; i < 46; i++) ell(ctx, R() * w, R() * h, 10 + R() * 8, 5 + R() * 4, R() * 3.14, ['#c8641e', '#d9a21e', '#7aa02e', '#9c3d1a', '#e0b84a'][i % 5]);
    } else if (kind === 'rock') {
      for (let i = 0; i < 60; i++) { const x = R() * w, y = R() * h, r = 6 + R() * 14; ell(ctx, x + 2, y + 3, r, r * 0.8, 0, 'rgba(0,0,0,.3)'); ell(ctx, x, y, r, r * 0.8, R() * 3, ['#a39d90', '#7b766b', '#b8b2a4', '#6d685e'][i % 4]); ell(ctx, x - r * 0.3, y - r * 0.3, r * 0.4, r * 0.25, 0, 'rgba(255,255,255,.25)'); }
    } else if (kind === 'sand') {
      for (let k = 0; k < 14; k++) { ctx.strokeStyle = k % 2 ? 'rgba(255,240,200,.35)' : 'rgba(150,110,50,.22)'; ctx.lineWidth = 3; ctx.beginPath(); for (let x = 0; x <= w; x += 8) { const y = k * 19 + Math.sin(x * 0.05 + k) * 5; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
      for (let i = 0; i < 160; i++) ell(ctx, R() * w, R() * h, 1.2, 1, 0, 'rgba(120,80,30,.4)');
    } else if (kind === 'moss') {
      for (let i = 0; i < 60; i++) ell(ctx, R() * w, R() * h, 10 + R() * 18, 7 + R() * 12, R() * 3, ['#2f6a22', '#4f9a36', '#6cb043', '#3a7d2a'][i % 4]);
      for (let i = 0; i < 18; i++) ell(ctx, R() * w, R() * h, 3, 3, 0, ['#ffd23f', '#ffffff', '#ff7a9a'][i % 3]);
    } else if (kind === 'rune') {
      ctx.shadowColor = '#c58bff'; ctx.shadowBlur = 14; ctx.strokeStyle = '#d6a8ff'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(128, 128, 104, 0, 6.3); ctx.stroke(); ctx.beginPath(); ctx.arc(128, 128, 84, 0, 6.3); ctx.stroke();
      ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = -1.57 + i * 2.513; const x = 128 + Math.cos(a) * 84, y = 128 + Math.sin(a) * 84; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); ctx.stroke();
      for (let i = 0; i < 12; i++) { const a = i * 0.5236, x = 128 + Math.cos(a) * 94, y = 128 + Math.sin(a) * 94; ctx.beginPath(); ctx.moveTo(x - 4, y); ctx.lineTo(x + 4, y); ctx.moveTo(x, y - 4); ctx.lineTo(x, y + 4); ctx.stroke(); }
      ctx.shadowBlur = 0;
    } else if (kind === 'mist') {
      for (let i = 0; i < 12; i++) { ctx.strokeStyle = `rgba(190,180,230,${0.12 + R() * 0.18})`; ctx.lineWidth = 6 + R() * 8; ctx.beginPath(); ctx.arc(128 + (R() - 0.5) * 80, 128 + (R() - 0.5) * 80, 30 + R() * 80, R() * 6, R() * 6 + 2.5); ctx.stroke(); }
    }
  });
  texCache.set(kind, t); return t;
}

// ------------------------------------------------------------------ objets posés autour du personnage
const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, flatShading: true, ...o });
export function buildProps(kind) {
  const g = new THREE.Group(); const R = rnd(kind.length * 31 + 7);
  const ring = (n, r0, r1, make) => { for (let i = 0; i < n; i++) { const a = (i / n) * 6.28 + R() * 0.4 + 0.5, r = r0 + R() * (r1 - r0); const o = make(i); o.position.set(Math.cos(a) * r, o.position.y, Math.sin(a) * r * 0.8 + 0.2); g.add(o); } };
  if (kind === 'rock') ring(5, 1.0, 1.35, () => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1 + R() * 0.12, 0), M(0x8a857a)); m.scale.y = 0.65; m.position.y = 0.34; m.castShadow = true; return m; });
  else if (kind === 'moss') ring(5, 1.0, 1.35, () => { const s = new THREE.Group(); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.12, 6), M(0xf2ead0)); st.position.y = 0.06; const cap = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 5, 0, 6.3, 0, 1.57), M(R() < 0.5 ? 0xd9402f : 0xf2a23a)); cap.position.y = 0.12; s.add(st, cap); s.position.y = 0.33; return s; });
  else if (kind === 'pond') ring(5, 1.0, 1.4, (i) => { const s = new THREE.Group(); const h = 0.5 + R() * 0.4; const st = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, h, 5), M(0x4f8f3a)); st.position.y = h / 2; const top = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 6), M(0x6b4a2a)); top.position.y = h; s.add(st, top); s.position.y = 0.32; s.userData.sway = i; return s; });
  else if (kind === 'hay') ring(3, 1.0, 1.35, () => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.3, 12), M(0xd9b24a)); m.rotation.z = 1.57; m.position.y = 0.45; m.rotation.y = R() * 3; m.castShadow = true; return m; });
  else if (kind === 'sand') ring(5, 1.0, 1.4, () => { const m = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.12, 6), M(R() < 0.5 ? 0xf4e6d0 : 0xe99a8a)); m.rotation.z = R() * 0.8; m.position.y = 0.4; return m; });
  else if (kind === 'leaves') ring(6, 1.0, 1.4, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 4), M([0xc8641e, 0xd9a21e, 0x7aa02e][Math.floor(R() * 3)])); m.scale.y = 0.2; m.position.y = 0.33; return m; });
  else if (kind === 'mud') ring(4, 1.0, 1.4, () => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.09 + R() * 0.07, 0), M(0x5a3a1c)); m.scale.y = 0.6; m.position.y = 0.33; return m; });
  else if (kind === 'rune') ring(4, 1.15, 1.3, (i) => { const s = new THREE.Group(); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.22, 8), M(0xf4ecd8)); c.position.y = 0.11; const f = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd36b })); f.position.y = 0.26; f.userData.flame = i; s.add(c, f); s.position.y = 0.32; return s; });
  else if (kind === 'mist') ring(3, 1.1, 1.4, () => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.4, 0.06), M(0x6d6a78)); m.position.y = 0.5; m.rotation.z = (R() - 0.5) * 0.3; return m; });
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}

// ------------------------------------------------------------------ animations sous les pieds
let glowT = null;
function glowTex() {
  if (glowT) return glowT;
  glowT = canvasTex(64, 64, (ctx, w, h) => { const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,.4)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); });
  glowT.wrapS = glowT.wrapT = THREE.ClampToEdgeWrapping; return glowT;
}
const spriteMat = (color, opacity = 1, additive = false) => new THREE.SpriteMaterial({ map: glowTex(), color, transparent: true, opacity, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, fog: false });

/**
 * Effets animés d'un type de sol. r = rayon d'action (1.2 sur le socle, 0.5 sous le joueur en jeu).
 * update(t, move, onGround) : move 0..1 = vitesse (plus de poussière / d'éclaboussures quand ça bouge).
 */
export function makeFx(kind, r, patchTex = null) {
  const group = new THREE.Group(); const items = []; const R = rnd(kind.length * 17 + 3);
  const add = (obj, fn) => { group.add(obj); items.push({ obj, fn }); };
  if (patchTex) {                                                                   // petite flaque / tapis sous les pieds, en jeu
    const p = new THREE.Mesh(new THREE.CircleGeometry(r * 1.25, 28), new THREE.MeshBasicMaterial({ map: patchTex, transparent: true, opacity: 0.92, depthWrite: false }));
    p.rotation.x = -Math.PI / 2; p.position.y = -0.005; group.add(p);
  }
  const cyc = (t, sp, off) => ((t * sp + off) % 1 + 1) % 1;
  if (kind === 'pond' || kind === 'water') {
    for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 32), new THREE.MeshBasicMaterial({ color: 0xc8f4ff, transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.position.y = 0.02; add(m, (t, mv) => { const p = cyc(t, 0.45 + mv * 0.4, i / 3); m.scale.setScalar(r * (0.25 + p * 1.2)); m.material.opacity = (1 - p) * 0.6; }); }
  } else if (kind === 'mud') {
    for (let i = 0; i < 5; i++) { const x = (R() - 0.5) * r * 1.6, z = (R() - 0.5) * r * 1.2, m = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshStandardMaterial({ color: 0x9a6a3a, roughness: 0.3 })); m.position.set(x, 0.01, z); add(m, (t) => { const p = cyc(t, 0.3, i / 5); m.scale.setScalar(p < 0.85 ? 0.01 + p * 0.07 * r * 2 : 0.01); m.scale.y *= 0.8; m.position.y = 0.01 + (p < 0.85 ? p * 0.03 : 0); }); }
    for (let i = 0; i < 4; i++) { const s = new THREE.Sprite(spriteMat(0x7a4f28, 0.7)); add(s, (t, mv) => { const p = cyc(t, 0.7 + mv, i / 4); const a = i * 1.7; s.position.set(Math.cos(a) * r * 0.5 * p, 0.05 + Math.sin(p * 3.14) * r * 0.55 * (0.4 + mv), Math.sin(a) * r * 0.4 * p); s.scale.setScalar(0.06 + 0.04 * (1 - p)); s.material.opacity = (1 - p) * 0.8; }); }
  } else if (kind === 'hay') {
    for (let i = 0; i < 7; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.012, 0.012), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xe8c75c : 0xb8902f, transparent: true })); const a = R() * 6.28, d = R() * r; add(m, (t, mv) => { const p = cyc(t, 0.25 + mv * 0.3, i / 7); m.position.set(Math.cos(a) * d + Math.sin(t + i) * 0.1, p * r * 1.2, Math.sin(a) * d * 0.7); m.rotation.set(t * 1.3 + i, t + i, t * 0.7); m.scale.setScalar(r * 0.9); m.material.opacity = Math.sin(p * 3.14); }); }
  } else if (kind === 'glint') {
    for (let i = 0; i < 7; i++) { const s = new THREE.Sprite(spriteMat(0xffd84a, 1, true)); const a = R() * 6.28, d = R() * r; add(s, (t, mv) => { const p = cyc(t, 0.4 + mv * 0.3, i / 7); s.position.set(Math.cos(a) * d, 0.1 + p * r * 1.1, Math.sin(a) * d * 0.7); s.scale.setScalar((0.1 + 0.08 * Math.sin(t * 8 + i)) * r + 0.03); s.material.opacity = Math.sin(p * 3.14); }); }
  } else if (kind === 'fire') {
    for (let i = 0; i < 5; i++) { const s = new THREE.Sprite(spriteMat(0x3a3430, 0.5)); const a = R() * 6.28, d = R() * r * 0.8; add(s, (t, mv) => { const p = cyc(t, 0.22 + mv * 0.2, i / 5); s.position.set(Math.cos(a) * d + p * 0.2, 0.15 + p * r * 1.6, Math.sin(a) * d * 0.6); s.scale.setScalar(r * (0.2 + p * 0.5)); s.material.opacity = Math.sin(p * 3.14) * 0.45; }); }
    for (let i = 0; i < 6; i++) { const s = new THREE.Sprite(spriteMat(0xff8a2a, 1, true)); const a = R() * 6.28, d = R() * r; add(s, (t) => { const p = cyc(t, 0.6, i / 6); s.position.set(Math.cos(a) * d, 0.1 + p * r * 1.0, Math.sin(a) * d * 0.7); s.scale.setScalar(0.07 * r + 0.02); s.material.opacity = Math.sin(p * 3.14); }); }
  } else if (kind === 'leaves' || kind === 'feathers') {
    const lc = kind === 'feathers' ? [0xf5f5f5, 0xcf9b52, 0x8a6a4a] : [0xc8641e, 0xd9a21e, 0x7aa02e];
    for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.CircleGeometry(0.07, 6), new THREE.MeshBasicMaterial({ color: lc[i % 3], side: THREE.DoubleSide, transparent: true })); m.scale.set(1, 1.7, 1); const a = R() * 6.28; add(m, (t, mv) => { const p = cyc(t, 0.2 + mv * 0.2, i / 6); const ang = a + p * 3; m.position.set(Math.cos(ang) * r * (0.4 + 0.6 * p), r * 1.3 * (1 - p) + 0.02, Math.sin(ang) * r * 0.8 * p); m.rotation.set(t * 2 + i, t * 1.4, t); m.scale.setScalar(r * 1.1); m.material.opacity = Math.min(1, (1 - p) * 3); }); }
  } else if (kind === 'rock' || kind === 'sand') {
    for (let i = 0; i < 4; i++) { const s = new THREE.Sprite(spriteMat(kind === 'rock' ? 0xb7b0a2 : 0xe8d3a0, 0.5)); add(s, (t, mv) => { const p = cyc(t, 0.35 + mv * 0.7, i / 4); const a = i * 1.57 + 0.5; s.position.set(Math.cos(a) * r * (0.3 + p * 0.8), 0.04 + p * 0.2 * r, Math.sin(a) * r * 0.6 * (0.3 + p)); s.scale.setScalar(r * (0.2 + p * 0.5)); s.material.opacity = (1 - p) * (0.25 + mv * 0.45); }); }
  } else if (kind === 'moss') {
    for (let i = 0; i < 7; i++) { const s = new THREE.Sprite(spriteMat(0xd8ff7a, 1, true)); const a0 = R() * 6.28, sp = 0.4 + R() * 0.5; add(s, (t) => { const a = a0 + t * sp; s.position.set(Math.cos(a) * r * (0.6 + 0.4 * Math.sin(t + i)), r * (0.3 + 0.35 * Math.sin(t * 1.3 + i)) + 0.1, Math.sin(a) * r * 0.7); s.scale.setScalar(0.12 * r + 0.05 * Math.sin(t * 4 + i)); s.material.opacity = 0.5 + 0.5 * Math.sin(t * 3 + i * 2); }); }
  } else if (kind === 'mist') {
    for (let i = 0; i < 4; i++) { const s = new THREE.Sprite(spriteMat(0xbdb4e8, 0.35, true)); add(s, (t) => { const a = t * 0.5 + i * 1.57; s.position.set(Math.cos(a) * r * 0.7, 0.1 + 0.15 * Math.sin(t + i), Math.sin(a) * r * 0.5); s.scale.setScalar(r * (1.1 + 0.3 * Math.sin(t * 1.4 + i))); s.material.opacity = 0.22 + 0.12 * Math.sin(t * 1.7 + i); }); }
  } else if (kind === 'rune') {
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.88, 1, 40), new THREE.MeshBasicMaterial({ color: 0xc58bff, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.02; add(ring, (t) => { ring.scale.setScalar(r * (0.95 + 0.08 * Math.sin(t * 2))); ring.material.opacity = 0.35 + 0.25 * Math.sin(t * 2.4); });
    for (let i = 0; i < 6; i++) { const s = new THREE.Sprite(spriteMat(0xe3c4ff, 1, true)); const a = R() * 6.28, d = R() * r; add(s, (t, mv) => { const p = cyc(t, 0.3 + mv * 0.3, i / 6); s.position.set(Math.cos(a) * d, 0.05 + p * r * 1.4, Math.sin(a) * d * 0.7); s.scale.setScalar(0.08 * r + 0.04); s.material.opacity = Math.sin(p * 3.14); }); }
  }
  group.traverse((o) => { o.frustumCulled = false; });
  return { group, update(t, move = 0, onGround = true) { for (const it of items) it.fn(t, move, onGround); } };
}
