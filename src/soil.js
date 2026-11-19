// Face avant du sol : terre réaliste dessinée par cellule (grain, strates, pierres, fissures, trous, mousse, animaux qui dorment)
// + petits vers qui rampent. Le motif ne dépend JAMAIS du type de bloc : un piège a exactement la même face que le sol voisin.
import * as THREE from 'three';

const NV = 8;
const VTAB = [0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 4, 5, 5, 6, 7, 1];   // fréquence des variantes (les plus « riches » sont plus rares)

/** variante de face pour la cellule (c, y) — fonction pure, identique pour le sol et les pièges */
export function vHash(c, y) {
  let h = (Math.imul(c, 374761393) + Math.imul(y, 668265263) + 0x9e3779b9) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 2246822519) >>> 0; h = Math.imul(h ^ (h >>> 13), 3266489917) >>> 0; h ^= h >>> 16;
  return VTAB[(h >>> 0) % 16];
}

function rnd(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const S = 128;

function grain(ctx, R, base) {
  ctx.fillStyle = base; ctx.fillRect(0, 0, S, S);
  // grandes nuances de terre (se raccordent d'une cellule à l'autre : lignes périodiques)
  for (const [yy, a] of [[0.30, 0.10], [0.68, 0.13]]) {
    ctx.strokeStyle = `rgba(60,28,8,${a})`; ctx.lineWidth = 7; ctx.beginPath();
    for (let x = 0; x <= S; x += 4) { const y = yy * S + Math.sin((x / S) * Math.PI * 2 + yy * 9) * 4; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,215,160,.08)'; ctx.lineWidth = 3; ctx.beginPath();
    for (let x = 0; x <= S; x += 4) { const y = yy * S + 6 + Math.sin((x / S) * Math.PI * 2 + yy * 9) * 4; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
  }
  for (let i = 0; i < 170; i++) {                                  // grain : mottes claires et foncées
    const x = R() * S, y = R() * S, r = 0.8 + R() * 3.2;
    ctx.fillStyle = R() < 0.55 ? `rgba(40,18,4,${0.05 + R() * 0.12})` : `rgba(255,214,160,${0.04 + R() * 0.1})`;
    ctx.beginPath(); ctx.ellipse(x, y, r * 1.3, r, R() * 3, 0, 6.3); ctx.fill();
  }
  for (let i = 0; i < 7; i++) {                                    // petits cailloux
    const x = 6 + R() * (S - 12), y = 6 + R() * (S - 12), r = 1.2 + R() * 2;
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(x + 1, y + 1.4, r, r * 0.8, 0, 0, 6.3); ctx.fill();
    ctx.fillStyle = R() < 0.5 ? '#9b9486' : '#b6ae9b'; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.8, 0, 0, 6.3); ctx.fill();
  }
}

function stone(ctx, x, y, rx, ry, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = 'rgba(20,8,0,.42)'; ctx.beginPath(); ctx.ellipse(2.5, 3.5, rx * 1.05, ry * 1.02, 0, 0, 6.3); ctx.fill();
  const g = ctx.createRadialGradient(-rx * 0.35, -ry * 0.4, 1, 0, 0, rx * 1.1);
  g.addColorStop(0, '#d3ccbc'); g.addColorStop(0.55, '#a29a8a'); g.addColorStop(1, '#6a6458');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, 6.3); ctx.fill();
  ctx.strokeStyle = 'rgba(40,30,20,.45)'; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.strokeStyle = 'rgba(70,60,50,.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-rx * 0.2, -ry * 0.1); ctx.lineTo(rx * 0.25, ry * 0.2); ctx.stroke();
  ctx.restore();
}

function crack(ctx, R, x0, y0, len, w = 3) {
  const pts = [[x0, y0]]; let x = x0, y = y0, a = Math.PI / 2 + (R() - 0.5) * 0.9;
  for (let l = 0; l < len; l += 9) { a += (R() - 0.5) * 1.1; x += Math.cos(a) * 9; y += Math.sin(a) * 9; pts.push([x, y]); }
  const path = (dx, dy) => { ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px + dx, py + dy) : ctx.moveTo(px + dx, py + dy))); ctx.stroke(); };
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(255,225,180,.28)'; ctx.lineWidth = w; path(1.6, 1.8);
  ctx.strokeStyle = 'rgba(26,10,2,.85)'; ctx.lineWidth = w; path(0, 0);
  if (pts.length > 3) {                                            // branche
    const [bx, by] = pts[2]; ctx.strokeStyle = 'rgba(26,10,2,.75)'; ctx.lineWidth = w * 0.6; ctx.beginPath(); ctx.moveTo(bx, by);
    ctx.lineTo(bx + (R() < 0.5 ? -1 : 1) * (8 + R() * 8), by + 5 + R() * 8); ctx.stroke();
  }
}

function hole(ctx, x, y, rx, ry) {
  ctx.fillStyle = 'rgba(255,230,190,.22)'; ctx.beginPath(); ctx.ellipse(x, y - 1.5, rx + 5, ry + 4, 0, 0, 6.3); ctx.fill();
  ctx.fillStyle = 'rgba(20,8,0,.45)'; ctx.beginPath(); ctx.ellipse(x, y + 1, rx + 3, ry + 3, 0, 0, 6.3); ctx.fill();
  const g = ctx.createRadialGradient(x, y + ry * 0.3, 1, x, y, rx);
  g.addColorStop(0, '#050201'); g.addColorStop(0.65, '#1c0d05'); g.addColorStop(1, '#4a2a14');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 6.3); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(x, y - ry * 0.35, rx * 0.9, ry * 0.5, 0, 0, 6.3); ctx.fill();
  for (let i = 0; i < 5; i++) { const a = i * 1.26 + 0.3; ctx.fillStyle = '#a9a191'; ctx.beginPath(); ctx.arc(x + Math.cos(a) * (rx + 5), y + Math.sin(a) * (ry + 4) + 1, 1.8, 0, 6.3); ctx.fill(); }
}

/** animal qui dort dans un terrier : kind 0 = souris, 1 = taupe */
function sleeper(ctx, x, y, kind) {
  ctx.fillStyle = 'rgba(255,230,190,.2)'; ctx.beginPath(); ctx.ellipse(x, y - 1, 34, 25, 0, 0, 6.3); ctx.fill();
  const g = ctx.createRadialGradient(x, y + 4, 2, x, y, 32);
  g.addColorStop(0, '#120804'); g.addColorStop(0.75, '#2a1509'); g.addColorStop(1, '#4b2a14');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, 31, 22, 0, 0, 6.3); ctx.fill();
  const fur = kind ? '#4e4a57' : '#b08a64', belly = kind ? '#6d6878' : '#d9bd98';
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x + 1, y + 7, 21, 11, 0, 0, 6.3); ctx.fill();
  ctx.fillStyle = fur; ctx.beginPath(); ctx.ellipse(x + 2, y + 4, 20, 12, 0, 0, 6.3); ctx.fill();   // corps roulé
  ctx.fillStyle = belly; ctx.beginPath(); ctx.ellipse(x + 6, y + 8, 11, 5, 0, 0, 6.3); ctx.fill();
  ctx.fillStyle = fur; ctx.beginPath(); ctx.arc(x - 12, y + 3, 9.5, 0, 6.3); ctx.fill();            // tête
  ctx.fillStyle = kind ? '#3c3944' : '#9a744f'; ctx.beginPath(); ctx.arc(x - 15, y - 5, 4.5, 0, 6.3); ctx.fill();   // oreille
  ctx.fillStyle = '#e7a0a0'; ctx.beginPath(); ctx.arc(x - 15, y - 5, 2.2, 0, 6.3); ctx.fill();
  ctx.strokeStyle = '#201008'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x - 12, y + 2, 2.6, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();      // œil fermé
  ctx.fillStyle = '#e48a96'; ctx.beginPath(); ctx.arc(x - 19, y + 5, 1.8, 0, 6.3); ctx.fill();       // nez
  ctx.strokeStyle = fur; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 20, y + 6); ctx.quadraticCurveTo(x + 30, y + 4, x + 26, y - 4); ctx.stroke();   // queue
  ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.font = 'bold 13px sans-serif'; ctx.fillText('z', x + 6, y - 11);
  ctx.font = 'bold 9px sans-serif'; ctx.fillText('z', x + 17, y - 19);
}

function moss(ctx, R, topHeavy) {
  const blob = (x, y, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, r * 1.4, r, R() * 3, 0, 6.3); ctx.fill(); };
  const cols = ['rgba(52,104,34,.9)', 'rgba(82,142,46,.9)', 'rgba(116,170,58,.85)', 'rgba(38,84,28,.9)'];
  for (let i = 0; i < (topHeavy ? 34 : 14); i++) blob(R() * S, topHeavy ? R() * 24 : 30 + R() * 60, 3 + R() * 7, cols[Math.floor(R() * 4)]);
  ctx.lineCap = 'round';
  for (let i = 0; i < 40; i++) {                                    // brins d'herbe
    const x = R() * S, y = topHeavy ? 20 + R() * 16 : 60 + R() * 40, h = 6 + R() * 12;
    ctx.strokeStyle = ['#4f9a36', '#78b845', '#3a7a2a'][i % 3]; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + (R() - 0.5) * 6, y - h * 0.6, x + (R() - 0.5) * 9, y - h); ctx.stroke();
  }
}

function roots(ctx, R) {
  ctx.lineCap = 'round';
  for (let k = 0; k < 2; k++) {
    let x = R() * 40, y = 20 + R() * 80; ctx.beginPath(); ctx.moveTo(x, y);
    for (let i = 0; i < 6; i++) { x += 18 + R() * 8; y += (R() - 0.5) * 18; ctx.lineTo(x, y); }
    ctx.strokeStyle = 'rgba(30,14,4,.5)'; ctx.lineWidth = 6; ctx.stroke();
    ctx.strokeStyle = '#7c5632'; ctx.lineWidth = 4; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,220,170,.25)'; ctx.lineWidth = 1.2; ctx.stroke();
  }
}

/** les NV textures de face (une par variante) pour la couleur de terre de base */
export function soilFronts(base) {
  const out = [];
  for (let v = 0; v < NV; v++) {
    const c = document.createElement('canvas'); c.width = c.height = S;
    const ctx = c.getContext('2d'); const R = rnd(1000 + v * 97);
    grain(ctx, R, base);
    switch (v) {
      case 1: stone(ctx, 38, 80, 24, 17, 0.3); stone(ctx, 90, 48, 16, 12, -0.4); stone(ctx, 94, 98, 12, 9, 0.2); break;
      case 2: crack(ctx, R, 40 + R() * 40, 6, 120, 5); stone(ctx, 98, 100, 12, 9, 0.2); break;
      case 3: hole(ctx, 64, 66, 30, 21); break;
      case 4: ctx.save(); ctx.translate(64, 64); ctx.scale(1.45, 1.45); ctx.translate(-64, -64); sleeper(ctx, 64, 66, 0); ctx.restore(); break;
      case 5: moss(ctx, R, true); stone(ctx, 90, 94, 15, 11, 0.1); break;
      case 6: ctx.save(); ctx.translate(64, 70); ctx.scale(1.4, 1.4); ctx.translate(-64, -70); sleeper(ctx, 64, 72, 1); ctx.restore(); moss(ctx, R, true); break;
      case 7: roots(ctx, R); crack(ctx, R, 100, 20, 80, 3.5); stone(ctx, 30, 100, 16, 11, -0.2); break;
      default: break;
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.userData.keep = true;
    out.push(t);
  }
  return out;
}

/** petits vers qui rampent sur la face avant du sol (indépendants du type de bloc) */
export function buildWorms(scene, L, isSolid, depth, quality = 'high') {
  const R = rnd(L.cols * 131 + L.rows * 17 + 5);
  const spots = [];
  for (let y = 0; y < L.rows; y++) for (let c = 0; c < L.cols; c++) if (L.grid[y][c] === 1 && R() < 0.07) spots.push([c, y]);
  const max = quality === 'low' ? 10 : 36;
  while (spots.length > max) spots.splice(Math.floor(R() * spots.length), 1);
  if (!spots.length) return () => {};
  const SEG = 6;
  const geo = new THREE.SphereGeometry(1, 8, 6);
  const mt = new THREE.MeshStandardMaterial({ color: 0xd89080, roughness: 0.6 });
  const im = new THREE.InstancedMesh(geo, mt, spots.length * SEG);
  im.frustumCulled = false; im.castShadow = false; im.receiveShadow = false; scene.add(im);
  const W = spots.map(([c, y]) => ({ cx: c + 0.5, cy: y + 0.3 + R() * 0.45, ph: R() * 6.28, sp: 0.5 + R() * 0.5 }));
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), pv = new THREE.Vector3(), sv = new THREE.Vector3();
  const z = depth / 2 + 0.035;
  return (t) => {
    let k = 0;
    for (const w of W) {
      const u = t * 0.35 * w.sp + w.ph, head = w.cx + Math.sin(u) * 0.3, dir = Math.cos(u) >= 0 ? 1 : -1;
      const wave = 0.5 + 0.5 * Math.sin(t * 2.4 * w.sp + w.ph * 2);                          // la chenille se contracte puis s'allonge
      for (let i = 0; i < SEG; i++) {
        const s = i / (SEG - 1);
        const x = head - dir * s * (0.2 + 0.12 * (1 - wave));
        const y = w.cy + Math.sin(s * Math.PI) * 0.07 * wave;
        const r = 0.034 - s * 0.007 + (i === 0 ? 0.006 : 0);
        pv.set(x, y, z); sv.set(r, r, r * 0.8); m4.compose(pv, q, sv); im.setMatrixAt(k++, m4);
      }
    }
    im.instanceMatrix.needsUpdate = true;
  };
}
