// Personnages humanoïdes et mythes de Madagascar : Lolo, Vazimba, Trimobe, Tortue, Sorcière,
// Darafify, Rapeto, Ikotofetsy, Imahaka, Ibonia, Ikotobekibo, Zazavavindrano.
// Les poils sont de très fins brins (instanciés) qui couvrent entièrement le corps.
import * as THREE from 'three';
import { mat, fur, ell, cone, cyl, box, eyes } from './chars.js';

// ---------------------------------------------------------------- outils
const rand = (seed) => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
const STRAND = new THREE.CylinderGeometry(0.0022, 0.0075, 1, 3); STRAND.translate(0, 0.5, 0); STRAND.userData.keep = true;
const strandMat = new THREE.MeshStandardMaterial({ roughness: 0.95, metalness: 0 }); strandMat.userData.keep = true;
const _q = new THREE.Quaternion(), _up = new THREE.Vector3(0, 1, 0), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _d = new THREE.Vector3(), _m = new THREE.Matrix4(), _c = new THREE.Color();

/** Brins très fins : pts = [{ p:[x,y,z], d:[dx,dy,dz] }] (racine + direction), len = longueur moyenne. */
function strands(parent, R, pts, colA, colB, len) {
  const im = new THREE.InstancedMesh(STRAND, strandMat, pts.length);
  pts.forEach((o, i) => {
    _d.set(o.d[0], o.d[1], o.d[2]).normalize(); _q.setFromUnitVectors(_up, _d);
    _m.compose(_p.set(o.p[0], o.p[1], o.p[2]), _q, _s.set(1, len * (0.7 + R() * 0.6), 1));
    im.setMatrixAt(i, _m); im.setColorAt(i, _c.set(R() > 0.5 ? colA : colB).multiplyScalar(0.75 + R() * 0.4));
  });
  im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true; im.frustumCulled = false;
  parent.add(im); return im;
}
function ellipsoidPts(R, n, cx, cy, cz, rx, ry, rz, droop, filter, bx = 0) {
  const out = []; let guard = 0;
  while (out.length < n && guard++ < n * 25) {
    const u = R() * 2 - 1, a = R() * 6.2832, s = Math.sqrt(1 - u * u), v = [s * Math.cos(a), u, s * Math.sin(a)];
    if (filter && !filter(v)) continue;
    out.push({ p: [cx + v[0] * rx * 0.97, cy + v[1] * ry * 0.97, cz + v[2] * rz * 0.97], d: [v[0] * 0.45 + bx, v[1] * 0.3 - droop, v[2] * 0.45] });
  }
  return out;
}
function tubePts(R, n, y0, y1, radius, droop = 0.9) {
  const out = [];
  for (let i = 0; i < n; i++) { const a = R() * 6.2832, y = y1 + (y0 - y1) * R(); out.push({ p: [Math.cos(a) * radius, y, Math.sin(a) * radius], d: [Math.cos(a) * 0.8, -droop, Math.sin(a) * 0.8] }); }
  return out;
}
const wrap = (g, rig, scale = 1) => { if (scale !== 1) g.scale.setScalar(scale); g.traverse((x) => { if (x.isMesh) x.castShadow = true; }); const root = new THREE.Group(); root.add(g); return { group: root, rig }; };
const dk = () => mat(0x2a1510, { roughness: 0.5 });

/** Tête humaine (crâne, mâchoire, nez, bouche, oreilles, sourcils, yeux). */
function humanHead(r, skin, iris) {
  const h = new THREE.Group(), d = dk();
  h.add(ell(r * 2.0, r * 2.1, r * 1.85, skin), ell(r * 1.15, r * 0.95, r * 1.3, skin, r * 0.08, -r * 0.72, 0), ell(r * 0.34, r * 0.5, r * 0.32, skin, r * 1.0, -r * 0.12, 0), ell(r * 0.1, r * 0.07, r * 0.55, d, r * 0.86, -r * 0.62, 0));
  for (const z of [1, -1]) h.add(ell(r * 0.3, r * 0.5, r * 0.2, skin, -r * 0.05, -r * 0.05, r * 0.98 * z), ell(r * 0.4, r * 0.09, r * 0.22, d, r * 0.78, r * 0.36, r * 0.42 * z));
  eyes(h, r * 0.76, r * 0.1, r * 0.4, r * 0.2, iris, 0xffffff);
  return h;
}

/** Fabrique de personnage bipède (humain / géant / nain…). */
function humanoid(o) {
  const g = new THREE.Group(), R = rand(o.seed || 7);
  const rig = { legs: [], arms: [], tail: null, head: null, body: null, ears: [], by: o.legLen, legH: o.legLen, legR: o.legR };
  const body = new THREE.Group(); body.position.y = o.legLen; g.add(body); rig.body = body;
  const [tx, ty, tz] = o.torso;
  body.add(ell(tx, ty, tz, o.torsoMat, 0, ty * 0.5, 0));
  if (o.belly) { const [bx, by, bz, ox, oy] = o.belly; body.add(ell(bx, by, bz, o.bellyMat || o.torsoMat, ox, oy, 0)); }
  const hx = o.headX ?? 0.03;
  const lift = o.headLift || 0;
  body.add(cyl(o.headR * 0.5, o.headR * 1.1 + lift, o.skin, hx, ty + o.headR * 0.1 + lift * 0.5, 0));                      // cou
  const head = humanHead(o.headR, o.skin, o.iris || 0x2a1a08); head.position.set(hx, ty + o.headR * 0.7 + lift, 0); body.add(head); rig.head = head;
  for (const z of [1, -1]) {
    const pv = new THREE.Group(); pv.position.set(0, ty * 0.92, (Math.max(tz * 0.5, o.belly ? o.belly[2] * 0.5 : 0) + o.armR * 0.7) * z); body.add(pv);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(o.armR, o.armR * 0.75, o.armLen, 10), o.armMat || o.torsoMat); arm.position.y = -o.armLen / 2; pv.add(arm);
    pv.add(ell(o.armR * 2.4, o.armR * 2.6, o.armR * 2.1, o.skin, 0.01, -o.armLen - o.armR * 0.4, 0));
    rig.arms.push({ pv, side: z, len: o.armLen });
  }
  for (const z of [1, -1]) {
    const pv = new THREE.Group(); pv.position.set(0, o.legLen, o.legZ * z); g.add(pv);
    const lg = new THREE.Mesh(new THREE.CylinderGeometry(o.legR, o.legR * 0.72, o.legLen, 10), o.legMat || o.torsoMat); lg.position.y = -o.legLen / 2; pv.add(lg);
    pv.add(ell(o.legR * 2.2, o.legR * 2.2, o.legR * 2.2, o.legMat || o.torsoMat, 0, 0, 0));
    pv.add(ell(o.legR * 3.6, o.legR * 1.5, o.legR * 2.4, o.shoeMat || mat(0x2a1a10), o.legR * 0.9, -o.legLen + o.legR * 0.35, 0));
    rig.legs.push({ pv, front: z > 0, len: o.legLen });
  }
  Object.assign(rig, { hr: o.headR, faceX: o.headR * 0.98, hz: o.headR * 0.8, hatY: o.headR * 0.95, neck: { x: hx, y: ty + o.headR * 0.1 + lift }, back: { flat: false, x: -tx * 0.5, y: ty * 0.6, w: tz, h: ty * 0.9 } });
  if (o.extras) o.extras({ g, body, head, rig, R, o });
  return wrap(g, rig, o.scale);
}
const scalp = (head, R, r, n, a, b, len) => strands(head, R, ellipsoidPts(R, n, 0, 0, 0, r, r * 1.05, r * 0.93, 1.0, (v) => (v[1] > 0.3 || v[0] < -0.35) && !(v[0] > 0.3 && v[1] < 0.75), -0.45), a, b, len);   // le visage reste dégagé
const beard = (head, R, r, n, a, b, len) => strands(head, R, ellipsoidPts(R, n, r * 0.1, -r * 0.3, 0, r * 1.05, r * 0.9, r * 0.95, 1.2, (v) => v[1] < -0.5 && v[0] > -0.3), a, b, len);

// ---------------------------------------------------------------- les personnages
const BUILDERS = {
  /** Lolo : grand, mince, entièrement couvert de poils très fins ; tête humaine, yeux rouges. */
  lolo: () => humanoid({
    legLen: 0.5, legR: 0.045, legZ: 0.085, torso: [0.3, 0.66, 0.2], torsoMat: fur(0x4a382a), skin: mat(0x8d5bd0), headR: 0.12, headX: 0.04, iris: 0xd01010,
    armR: 0.035, armLen: 0.66, armMat: fur(0x4a382a), legMat: fur(0x4a382a), shoeMat: mat(0x8d5bd0), scale: 1.05, seed: 11,
    extras: ({ body, head, rig, R }) => {
      const A = 0x3a2a1e, B = 0x6a5038;
      strands(body, R, ellipsoidPts(R, 1900, 0, 0.33, 0, 0.15, 0.33, 0.1, 0.9), A, B, 0.13);
      rig.arms.forEach((a) => strands(a.pv, R, tubePts(R, 460, 0, -a.len, 0.037), A, B, 0.1));
      rig.legs.forEach((l) => strands(l.pv, R, tubePts(R, 500, 0, -l.len, 0.042), A, B, 0.11));
      scalp(head, R, 0.12, 1100, 0x1a1030, 0x3a2a60, 0.24);                                                  // cheveux
      for (const z of [1, -1]) head.add(ell(0.02, 0.026, 0.02, mat(0xff2020, { emissive: 0xff2020, emissiveIntensity: 1.4 }), 0.118, 0.012, 0.048 * z));   // yeux rouges lumineux
    },
  }),

  /** Vazimba : petit, couvert de poils fins ; tête humaine ; les mains et les orteils sortent des poils. */
  vazimba: () => humanoid({
    legLen: 0.12, legR: 0.05, legZ: 0.1, torso: [0.46, 0.4, 0.42], torsoMat: fur(0x6a4a2c), skin: mat(0xe0a47a), headR: 0.14, headX: 0.06, iris: 0x3a2208,
    armR: 0.05, armLen: 0.2, armMat: mat(0xe0a47a), legMat: fur(0x6a4a2c), shoeMat: mat(0xe0a47a), seed: 23,
    extras: ({ body, head, rig, R }) => {
      const A = 0x5a3c22, B = 0x8e6a42;
      strands(body, R, ellipsoidPts(R, 2000, 0, 0.2, 0, 0.23, 0.2, 0.21, 0.9), A, B, 0.13);
      rig.arms.forEach((a) => { for (let k = -1; k <= 1; k++) a.pv.add(cone(0.014, 0.1, mat(0xe0a47a), 0.03, -a.len - 0.12, k * 0.035)); });   // doigts
      rig.legs.forEach((l) => { strands(l.pv, R, tubePts(R, 260, 0, -l.len, 0.055), A, B, 0.07); for (let k = -1.5; k <= 1.5; k++) l.pv.add(ell(0.04, 0.036, 0.032, mat(0xe0a47a), 0.145, -l.len + 0.018, k * 0.04)); });   // orteils
      scalp(head, R, 0.14, 600, 0x4a301a, 0x7a5434, 0.14);
      beard(head, R, 0.14, 650, 0x4a301a, 0x7a5434, 0.17);                                                  // barbe
    },
  }),

  /** Trimobe : ogre géant au gros ventre, aux défenses et à la massue. */
  trimobe: () => humanoid({
    legLen: 0.34, legR: 0.085, legZ: 0.13, torso: [0.58, 0.5, 0.5], torsoMat: mat(0x7a8a5c), belly: [0.6, 0.44, 0.52, 0.06, 0.14], skin: mat(0x7a8a5c), headR: 0.15, iris: 0xffd23f,
    armR: 0.075, armLen: 0.42, legMat: mat(0x6a7a50), shoeMat: mat(0x3a2a1a), scale: 1.3, seed: 31,
    extras: ({ body, head, rig }) => {
      const ivory = mat(0xf3ead2, { roughness: 0.4 });
      for (const z of [1, -1]) { const t = cone(0.028, 0.14, ivory, 0.12, -0.04, 0.05 * z); t.rotation.z = -0.25; t.rotation.x = 0.25 * z; head.add(t); }             // défenses
      body.add(box(0.5, 0.16, 0.46, mat(0x6a4a2a), 0.02, 0.0, 0));                                                                                                  // pagne
      for (let i = 0; i < 4; i++) head.add(cone(0.02, 0.07, mat(0x3a2a1a), 0.0, 0.17, (i - 1.5) * 0.045));
      const club = new THREE.Group(); club.add(cyl(0.03, 0.55, mat(0x6a4a2a), 0, -0.1, 0), ell(0.18, 0.2, 0.18, mat(0x5a3a1e), 0, -0.4, 0));
      rig.arms[0].pv.add(club); club.position.set(0.02, -0.5, 0);
    },
  }),

  /** Mpamosavy / sorcière : robe noire, chapeau pointu, long nez crochu, cheveux gris. */
  sorciere: () => humanoid({
    legLen: 0.3, legR: 0.04, legZ: 0.06, torso: [0.3, 0.42, 0.22], torsoMat: mat(0x2a2038), skin: mat(0x8fb070), headR: 0.13, iris: 0xfff060,
    armR: 0.035, armLen: 0.4, armMat: mat(0x2a2038), shoeMat: mat(0x1a1020), seed: 41,
    extras: ({ body, head, rig, R }) => {
      const cloth = new THREE.MeshStandardMaterial({ color: 0x2a2038, roughness: 0.85, side: THREE.DoubleSide });
      const robe = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.74, 24, 1, true), cloth); robe.position.set(0, 0.05, 0); body.add(robe);   // robe jusqu'au sol
      const hat = new THREE.Group(); hat.add(cyl(0.23, 0.02, cloth, 0, 0, 0), cone(0.15, 0.4, cloth, 0, 0.2, 0), cyl(0.155, 0.04, mat(0xb8402a), 0, 0.03, 0));
      hat.position.set(0, 0.12, 0); hat.rotation.z = -0.12; head.add(hat);
      const nose = cone(0.03, 0.12, mat(0x8fb070), 0.17, -0.1, 0); nose.rotation.z = -1.9; head.add(nose);
      head.add(ell(0.02, 0.02, 0.02, mat(0x5a7a3a), 0.2, -0.11, 0.01));
      strands(head, R, ellipsoidPts(R, 700, -0.02, -0.02, 0, 0.13, 0.14, 0.12, 1.3, (v) => v[0] < -0.2 && v[1] > -0.6, -0.45), 0x9a9a9a, 0xd0d0d0, 0.3);
      const staff = new THREE.Group(); staff.add(cyl(0.015, 0.95, mat(0x5a3a1e), 0, 0.12, 0), ell(0.07, 0.07, 0.07, mat(0x7fe3ff, { emissive: 0x4fc0ff, emissiveIntensity: 0.8 }), 0, 0.62, 0));
      rig.arms[0].pv.add(staff); staff.position.set(0.05, -0.38, 0);
    },
  }),

  /** Darafify : grosse tête, cornes, grandes oreilles pointues, grande bouche et barbe de poils fins. */
  darafify: () => humanoid({
    legLen: 0.3, legR: 0.065, legZ: 0.09, torso: [0.34, 0.4, 0.3], torsoMat: mat(0x8a4a3a), skin: mat(0xa05a44), headR: 0.22, iris: 0xffe040,
    armR: 0.05, armLen: 0.34, legMat: mat(0x8a4a3a), shoeMat: mat(0x3a1a10), seed: 53,
    extras: ({ head, R }) => {
      const horn = mat(0xe8dcc0, { roughness: 0.4 });
      for (const z of [1, -1]) {
        const h = cone(0.05, 0.3, horn, -0.02, 0.28, 0.12 * z); h.rotation.x = -0.45 * z; h.rotation.z = 0.15; head.add(h);
        const e = cone(0.06, 0.26, mat(0xa05a44), -0.04, 0.02, 0.3 * z); e.rotation.x = -1.45 * z; head.add(e);                       // grandes oreilles pointues
      }
      for (let i = 0; i < 7; i++) { const t = cone(0.014, 0.05, mat(0xffffff), 0.17, -0.13, (i - 3) * 0.04); t.rotation.x = Math.PI; head.add(t); }   // dents
      beard(head, R, 0.22, 600, 0x2a1810, 0x5a3a28, 0.2);
    },
  }),

  /** Rapeto : géant grand et barbu, pagne et gourdin. */
  rapeto: () => humanoid({
    legLen: 0.5, legR: 0.075, legZ: 0.12, torso: [0.5, 0.62, 0.34], torsoMat: mat(0xc89870), skin: mat(0xc89870), headR: 0.14, iris: 0x3a2208,
    armR: 0.07, armLen: 0.55, legMat: mat(0xc89870), shoeMat: mat(0x4a3220), scale: 1.15, seed: 61,
    extras: ({ body, head, rig, R }) => {
      body.add(box(0.46, 0.22, 0.36, mat(0x7a4a2a), 0.02, 0.0, 0));
      beard(head, R, 0.14, 700, 0x1a1210, 0x3a2a1e, 0.2); scalp(head, R, 0.14, 500, 0x1a1210, 0x3a2a1e, 0.12);
      const club = new THREE.Group(); club.add(cyl(0.035, 0.8, mat(0x6a4a2a), 0, -0.15, 0), ell(0.16, 0.34, 0.16, mat(0x5a3a1e), 0, -0.55, 0));
      rig.arms[0].pv.add(club); club.position.set(0.02, -0.62, 0);
    },
  }),

  /** Ikotofetsy : petit homme malin, bonnet rouge pointu et longue barbe blanche. */
  ikotofetsy: () => humanoid({
    legLen: 0.16, legR: 0.035, legZ: 0.05, torso: [0.22, 0.22, 0.18], torsoMat: mat(0xe8c040), skin: mat(0xe8b08c), headR: 0.13, iris: 0x2a5fd0,
    armR: 0.028, armLen: 0.2, shoeMat: mat(0xb8402a), seed: 71,
    extras: ({ head, R }) => {
      const cap = cone(0.13, 0.3, mat(0xd8362a), -0.01, 0.26, 0); cap.rotation.z = 0.2; head.add(cap, cyl(0.14, 0.04, mat(0xffffff), 0, 0.12, 0));
      head.add(ell(0.07, 0.08, 0.06, mat(0xe8b08c), 0.16, -0.08, 0));                               // gros nez
      beard(head, R, 0.13, 600, 0xf0f0f0, 0xc8c8c8, 0.11);
    },
  }),

  /** Imahaka : corps rond et énorme bouche pleine de dents. */
  imahaka: () => humanoid({
    legLen: 0.22, legR: 0.07, legZ: 0.1, torso: [0.5, 0.4, 0.46], torsoMat: mat(0x6a88a8), belly: [0.56, 0.46, 0.5, 0.05, 0.2], skin: mat(0x6a88a8), headR: 0.19, iris: 0x101010,
    armR: 0.06, armLen: 0.3, legMat: mat(0x5a7898), shoeMat: mat(0x2a3a4a), seed: 83,
    extras: ({ head }) => {
      head.add(ell(0.06, 0.2, 0.34, dk(), 0.17, -0.1, 0));                                           // énorme bouche
    },
  }),

  /** Ibonia : le héros, bandeau rouge, lamba en écharpe, sagaie et bouclier. */
  ibonia: () => humanoid({
    legLen: 0.38, legR: 0.05, legZ: 0.09, torso: [0.34, 0.5, 0.24], torsoMat: mat(0xc89870), skin: mat(0xc89870), headR: 0.13, iris: 0x2a1a08,
    armR: 0.045, armLen: 0.42, legMat: mat(0xc89870), shoeMat: mat(0x6a4a2a), seed: 91,
    extras: ({ body, head, rig, R }) => {
      const sash = box(0.5, 0.1, 0.27, mat(0xd8362a), 0, 0.28, 0); sash.rotation.z = 0.7; body.add(sash);
      body.add(box(0.36, 0.2, 0.28, mat(0xffffff), 0, 0.0, 0), box(0.37, 0.07, 0.29, mat(0xd8362a), 0, -0.08, 0));       // lamba / pagne
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.018, 8, 20), mat(0xd8362a)); band.rotation.x = Math.PI / 2; band.position.y = 0.06; head.add(band);
      scalp(head, R, 0.13, 500, 0x15100c, 0x2a1e16, 0.09);
      const spear = new THREE.Group(); spear.add(cyl(0.014, 1.1, mat(0x6a4a2a), 0, 0.2, 0), cone(0.04, 0.16, mat(0xc8c8d0, { metalness: 0.6, roughness: 0.3 }), 0, 0.82, 0));
      rig.arms[0].pv.add(spear); spear.position.set(0.04, -0.42, 0);
      const shield = cyl(0.16, 0.03, mat(0x7a4a2a), 0.02, -0.36, 0.06); shield.rotation.x = Math.PI / 2; rig.arms[1].pv.add(shield);
    },
  }),

  /** Ikotobekibo : petit bonhomme à l'énorme ventre rond, large sourire. */
  ikotobekibo: () => humanoid({
    legLen: 0.18, legR: 0.05, legZ: 0.08, torso: [0.3, 0.28, 0.26], torsoMat: mat(0xe8a070), belly: [0.6, 0.48, 0.56, 0.05, 0.1], headLift: 0.1, skin: mat(0xe8a070), headR: 0.15, iris: 0x2a1a08,
    armR: 0.045, armLen: 0.3, legMat: mat(0xe8a070), shoeMat: mat(0x6a4a2a), seed: 97,
    extras: ({ body, head, R }) => {
      body.add(ell(0.62, 0.26, 0.58, mat(0x2a5fd0), 0.05, 0.0, 0));                                   // short bleu sous le ventre
      head.add(ell(0.05, 0.05, 0.5, dk(), 0.15, -0.1, 0));
      scalp(head, R, 0.15, 260, 0x2a1810, 0x5a3a28, 0.06);
      for (const z of [1, -1]) head.add(ell(0.05, 0.04, 0.03, mat(0xff8a7a), 0.14, -0.05, 0.1 * z));   // joues
    },
  }),

  /** Tortue rayonnée : carapace bombée à étoiles jaunes, pattes courtes. */
  tortue: () => {
    const g = new THREE.Group(), R = rand(5);
    const rig = { legs: [], arms: [], tail: null, head: null, body: null, ears: [], by: 0.24, legH: 0.2, legR: 0.07 };
    const cv = document.createElement('canvas'); cv.width = cv.height = 256; const x = cv.getContext('2d');
    x.fillStyle = '#3a2a14'; x.fillRect(0, 0, 256, 256); x.strokeStyle = '#f2c230'; x.lineWidth = 3;
    for (const [cx, cy] of [[64, 64], [192, 64], [64, 192], [192, 192], [128, 128]]) for (let k = 0; k < 10; k++) { const a = (k / 10) * 6.2832; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * 52, cy + Math.sin(a) * 52); x.stroke(); }
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    const shell = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 18, 0, 6.2832, 0, 1.5), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55 }));
    const skin = mat(0x9aa86a), belly = mat(0xe8d8a8);
    const body = new THREE.Group(); body.position.y = 0.24; g.add(body); rig.body = body;
    shell.scale.set(0.66, 0.46, 0.52); body.add(shell, ell(0.82, 0.14, 0.62, belly, 0, 0.0, 0));
    const head = new THREE.Group(); head.position.set(0.48, 0.1, 0); body.add(head); rig.head = head;
    body.add(ell(0.26, 0.2, 0.2, skin, 0.36, 0.06, 0));                                              // cou
    head.add(ell(0.3, 0.24, 0.22, skin), ell(0.1, 0.03, 0.14, dk(), 0.13, -0.06, 0));
    eyes(head, 0.08, 0.05, 0.08, 0.034, 0x2a1a08, 0xfff0d0);
    const tail = new THREE.Group(); tail.position.set(-0.42, 0.0, 0); body.add(tail); rig.tail = tail; tail.add(cone(0.04, 0.14, skin, -0.05, 0, 0)).rotation.z = Math.PI / 2;
    for (const [lx, lz, front] of [[0.22, 0.2, true], [0.22, -0.2, true], [-0.22, 0.2, false], [-0.22, -0.2, false]]) {
      const pv = new THREE.Group(); pv.position.set(lx, 0.22, lz); g.add(pv);
      pv.add(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.2, 10), skin)); pv.children[0].position.y = -0.1;
      pv.add(ell(0.17, 0.07, 0.13, skin, 0.03, -0.2, 0));
      rig.legs.push({ pv, front, len: 0.2 });
    }
    Object.assign(rig, { hr: 0.14, faceX: 0.13, hz: 0.12, hatY: 0.16, neck: { x: 0.4, y: 0.12 }, back: { flat: true, x: 0, y: 0.26, len: 0.6, w: 0.5, h: 0.3 } });
    void R;
    return wrap(g, rig);
  },

  /** Zazavavindrano : sirène à la Ariel — cheveux roux, soutien-gorge coquillage, queue verte en S et grande nageoire fourchue. */
  zazavavindrano: () => {
    const g = new THREE.Group(), R = rand(13);
    const rig = { legs: [], arms: [], tail: null, head: null, body: null, ears: [], by: 0.8, legH: 0.5, floaty: true };
    const skin = mat(0xf2cfae), scale = new THREE.MeshStandardMaterial({ color: 0x1fa86a, roughness: 0.28, metalness: 0.3, emissive: 0x0a5a34, emissiveIntensity: 0.4 });
    const finM = new THREE.MeshStandardMaterial({ color: 0x7ce8b8, roughness: 0.3, transparent: true, opacity: 0.82, side: THREE.DoubleSide, emissive: 0x2a9a6a, emissiveIntensity: 0.4 });
    const shell = mat(0x9a5ac8, { roughness: 0.35, metalness: 0.2 });
    const body = new THREE.Group(); body.position.y = 0.8; g.add(body); rig.body = body;
    body.add(ell(0.26, 0.36, 0.2, skin, 0, 0.17, 0));
    for (const z of [1, -1]) body.add(ell(0.13, 0.1, 0.11, shell, 0.09, 0.25, 0.065 * z), ell(0.05, 0.05, 0.03, mat(0xd8a8f0), 0.15, 0.25, 0.065 * z));     // soutien-gorge coquillage
    const head = humanHead(0.12, skin, 0x2a6fd0); head.position.set(0.03, 0.49, 0); body.add(head); rig.head = head;
    strands(head, R, ellipsoidPts(R, 1500, -0.01, -0.02, 0, 0.12, 0.13, 0.11, 1.2, (v) => (v[1] > 0.2 || v[0] < -0.2) && !(v[0] > 0.3 && v[1] < 0.75), -0.5), 0xc8321a, 0xff7a2a, 0.5);   // longs cheveux roux
    for (const z of [1, -1]) {
      const pv = new THREE.Group(); pv.position.set(0, 0.32, 0.16 * z); body.add(pv);
      pv.add(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.028, 0.34, 10), skin)); pv.children[0].position.y = -0.17;
      pv.add(ell(0.08, 0.1, 0.06, skin, 0.01, -0.37, 0));
      rig.arms.push({ pv, side: z, len: 0.34 });
    }
    const tail = new THREE.Group(); tail.position.set(0, 0.0, 0); body.add(tail); rig.tail = tail;
    for (let i = 0; i < 7; i++) {                                                                  // queue en S, segments écailleux
      const t = i / 6, y = -0.1 - t * 0.78, x = -0.02 - t * 0.1 + Math.sin(t * 3.2) * 0.06;
      const seg = ell(0.24 * (1 - t * 0.72) + 0.05, 0.22, 0.2 * (1 - t * 0.72) + 0.04, scale, x, y, 0); seg.rotation.z = Math.cos(t * 3.2) * 0.25; tail.add(seg);
    }
    for (const z of [1, -1]) {                                                                     // nageoires pelviennes + nageoire caudale fourchue
      const fp = ell(0.05, 0.18, 0.12, finM, -0.05, -0.16, 0.18 * z); fp.rotation.x = 0.7 * z; tail.add(fp);
      const lobe = ell(0.045, 0.4, 0.2, finM, -0.19, -1.0, 0.13 * z); lobe.rotation.x = -0.5 * z; lobe.rotation.z = 0.35; tail.add(lobe);
    }
    tail.add(ell(0.04, 0.22, 0.12, finM, -0.15, -0.88, 0));
    Object.assign(rig, { hr: 0.12, faceX: 0.12, hz: 0.1, hatY: 0.13, neck: { x: 0.03, y: 0.4 }, back: { flat: false, x: -0.12, y: 0.2, w: 0.22, h: 0.4 } });
    return wrap(g, rig, 0.85);
  },
};

export { BUILDERS };
