import * as THREE from 'three';
import { BUILDERS } from './chars2.js';

// ------------------------------------------------------------------ fiches personnages
// Tous les personnages sont au moins aussi capables que le plus faible (vitesse 6.4 / saut 14.5) :
// les niveaux sont donc faisables avec n'importe lequel d'entre eux.
export const CHARS = [
  { id: 'kalanoro', name: 'Kalanoro', real: 'Fanahin’ny ala', cost: 0, speed: 7.0, jump: 15.5, extra: 0, glide: true, shield: 0,
    ability: 'Volo manidina', desc: 'Mitsingevana amin’ny volony lava. Tazony ny bokotra fitsambikinana rehefa any amin’ny rivotra.' },
  { id: 'maki', name: 'Maky', real: 'Maky (varika mena-mavo)', cost: 0, speed: 7.0, jump: 15.5, extra: 0, glide: true, shield: 0,
    ability: 'Mitsingevana', desc: 'Mitsingevana amin’ny rambony misy peratra rehefa tazonina ny fitsambikinana.' },
  { id: 'fosa', name: 'Fosa', real: 'Fosa, mpihaza lehibe', cost: 0, speed: 8.2, jump: 15.0, extra: 0, glide: false, shield: 0,
    ability: 'Haingana', desc: 'Mpanjakan’ny ala: ny haingana indrindra amin’izy rehetra.' },
  { id: 'omby', name: 'Omby', real: 'Omby', cost: 0, speed: 6.4, jump: 14.5, extra: 0, glide: false, shield: 1,
    ability: 'Mafy vatana', desc: 'Tohanany ny fandrika iray isaky ny fiainana (avy eo dia tezitra izy !).' },
  { id: 'kisoa', name: 'Kisoa', real: 'Kisoa', cost: 25, speed: 7.0, jump: 14.8, extra: 0, glide: false, shield: 0,
    ability: 'Haingana', desc: 'Kisoa mavitrika: haingana ary faly foana.' },
  { id: 'sahona', name: 'Sahona', real: 'Sahona', cost: 0, speed: 6.6, jump: 17.5, extra: 0, glide: false, shield: 0,
    ability: 'Mitsambikina avo', desc: 'Mitsambikina avo lavitra noho ny hafa rehetra.' },
  { id: 'saka', name: 'Saka', real: 'Saka', cost: 10, speed: 6.9, jump: 14.8, extra: 1, glide: false, shield: 0,
    ability: 'Fitsambikinana indroa', desc: 'Mahay tahaka ny saka: afaka mitsambikina indroa any amin’ny rivotra.' },
  { id: 'alika', name: 'Alika', real: 'Alika', cost: 20, speed: 7.8, jump: 15.0, extra: 0, glide: false, shield: 0,
    ability: 'Mahatoky', desc: 'Haingana, mahatoky ary faly foana.' },
  { id: 'sifaka', name: 'Sifaka', real: 'Sifaka, gidro mandihy', cost: 30, speed: 7.2, jump: 16.2, extra: 1, glide: false, shield: 0,
    ability: 'Dihy any amin’ny habakabaka', desc: 'Fitsambikinana indroa sy lavitra: tompon-daka amin’ny fitsambikinana.' },
  { id: 'ayeaye', name: 'Aye-aye', real: 'Aye-aye, gidro alina', cost: 45, speed: 6.8, jump: 15.2, extra: 0, glide: true, shield: 0,
    ability: 'Mitsingevana', desc: 'Ny sofiny lehibe dia manampy azy hitsingevana ela.' },
  { id: 'tana', name: 'Tana', real: 'Tana', cost: 60, speed: 6.4, jump: 15.0, extra: 1, glide: false, shield: 0,
    ability: 'Fitsambikinana indroa', desc: 'Miadana nefa mahay: afaka mitsambikina indroa.' },
  { id: 'tenrec', name: 'Trandraka', real: 'Trandraka misy tsilo', cost: 80, speed: 6.4, jump: 14.5, extra: 0, glide: false, shield: 2,
    ability: 'Mafy fiarovana', desc: 'Miaro azy amin’ny fandrika roa isaky ny fiainana ny tsilony.' },
  { id: 'lolo', name: 'Lolo', real: 'Olona lava sy mahia misy volo', cost: 70, speed: 7.6, jump: 15.2, extra: 0, glide: false, shield: 0,
    ability: 'Tongotra lava', desc: 'Lava tongotra sy ranjony: mihazakazaka haingana kokoa.' },
  { id: 'vazimba', name: 'Vazimba', real: 'Olona kely miloko volo', cost: 90, speed: 6.8, jump: 15.5, extra: 0, glide: false, shield: 1,
    ability: 'Miaro azy ny volo', desc: 'Ny volony manarona azy: tohanany ny fandrika iray isaky ny fiainana.' },
  { id: 'angatra', name: 'Angatra', real: 'Matoatoa mitsingevana', cost: 120, speed: 7.0, jump: 15.0, extra: 0, glide: true, shield: 0,
    ability: 'Mitsingevana', desc: 'Mitsingevana ao amin’ny rivotra: tazony ny fitsambikinana mba ho ela kokoa.' },
  { id: 'trimobe', name: 'Trimobe', real: 'Ogra goavana (angano malagasy)', cost: 110, speed: 6.4, jump: 14.5, extra: 0, glide: false, shield: 2,
    ability: 'Matanjaka be', desc: 'Goavana mavesatra: tohanany ny fandrika roa isaky ny fiainana.' },
  { id: 'tortue', name: 'Sokake', real: 'Sokake', cost: 95, speed: 6.4, jump: 14.5, extra: 0, glide: false, shield: 2,
    ability: 'Mafy vatana', desc: 'Mafy ny vatany: tohanany ny fandrika roa isaky ny fiainana.' },
  { id: 'sorciere', name: 'Mpamosavy', real: 'Mpamosavy (angano)', cost: 130, speed: 7, jump: 15.5, extra: 0, glide: true, shield: 0,
    ability: 'Mitsingevana', desc: 'Mitsingevana ao amin’ny rivotra rehefa tazonina ny fitsambikinana.' },
  { id: 'darafify', name: 'Darafify', real: 'Biby foronina (angano)', cost: 140, speed: 7.2, jump: 16, extra: 0, glide: false, shield: 0,
    ability: 'Fitsambikinana avo', desc: 'Lehibe loha ary maranitra tandroka: mitsambikina avo.' },
  { id: 'rapeto', name: 'Rapeto', real: 'Goavana (angano malagasy)', cost: 150, speed: 7.4, jump: 15, extra: 0, glide: false, shield: 1,
    ability: 'Goavana mahery', desc: 'Lava sy mahery: tohanany ny fandrika iray isaky ny fiainana.' },
  { id: 'ikotofetsy', name: 'Ikotofetsy', real: 'Olona kely (angano)', cost: 100, speed: 7.8, jump: 16.5, extra: 0, glide: false, shield: 0,
    ability: 'Mahay mitsambikina', desc: 'Kely nefa mahay: haingana sy mitsambikina avo.' },
  { id: 'imahaka', name: 'Imahaka', real: 'Biby foronina (angano)', cost: 115, speed: 6.4, jump: 15, extra: 0, glide: false, shield: 1,
    ability: 'Vava lehibe', desc: 'Vava lehibe sy vatana boribory: tohanany ny fandrika iray.' },
  { id: 'ibonia', name: 'Ibonia', real: 'Maherifo (tantara Ibonia)', cost: 160, speed: 7.6, jump: 16, extra: 1, glide: false, shield: 0,
    ability: 'Maherifo', desc: 'Fitsambikinana indroa sy lavitra: maherifo marina.' },
  { id: 'ikotobekibo', name: 'Ikotobekibo', real: 'Olona kibo be (angano)', cost: 85, speed: 6.6, jump: 17, extra: 0, glide: false, shield: 0,
    ability: 'Kibo mitsambikina', desc: 'Kibo boribory: mitsambikina avo tsara.' },
  { id: 'zazavavindrano', name: 'Zazavavindrano', real: 'Zazavavy rano (angano)', cost: 170, speed: 7, jump: 15.5, extra: 0, glide: true, shield: 0,
    ability: 'Mitsingevana', desc: 'Mitsingevana tahaka ny milomano: tazony ny fitsambikinana.' },
];

// ------------------------------------------------------------------ outils 3D
// ---- rendu « dessin animé » : ombrage à 3 paliers + contours épais
const GN = 8, gc = new Uint8Array(GN * 4);
for (let i = 0; i < GN; i++) { const v = Math.round(255 * (0.42 + 0.58 * Math.pow(i / (GN - 1), 0.8))); gc.set([v, v, v, 255], i * 4); }
export const toonGradient = new THREE.DataTexture(gc, GN, 1, THREE.RGBAFormat);
toonGradient.minFilter = toonGradient.magFilter = THREE.LinearFilter;   // ombrage doux, style film d'animation
toonGradient.needsUpdate = true;

export function toon(o = {}) {
  const { roughness, metalness, flatShading, ...ok } = o;   // propriétés « standard » ignorées par le matériau toon
  return new THREE.MeshToonMaterial({ gradientMap: toonGradient, ...ok });
}
const matCache = new Map();
export function mat(hex, o = {}) {
  const k = hex + JSON.stringify(o);
  if (!matCache.has(k)) matCache.set(k, new THREE.MeshStandardMaterial({ color: hex, roughness: 0.8, metalness: 0, ...o }));   // rendu physique (réaliste)
  return matCache.get(k);
}
// robe de vache : blanc avec grandes taches noires
let cowM = null;
export function cow() {
  if (!cowM) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 256; const x = cv.getContext('2d');
    x.fillStyle = '#f6f6f2'; x.fillRect(0, 0, 256, 256);
    let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    x.fillStyle = '#17171a';
    for (let i = 0; i < 9; i++) { const px = rnd() * 256, py = rnd() * 256, r = 20 + rnd() * 34; for (const dx of [-256, 0, 256]) { x.beginPath(); for (let k = 0; k <= 12; k++) { const a = (k / 12) * 6.2832, rr = r * (0.7 + rnd() * 0.5); x.lineTo(px + dx + Math.cos(a) * rr * 1.3, py + Math.sin(a) * rr); } x.fill(); } }
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
    cowM = new THREE.MeshStandardMaterial({ map: t, roughness: 0.85, metalness: 0 });
  }
  return cowM;
}
// pelage : texture procédurale de poils courts, mise en cache par couleur
const furCache = new Map();
export function fur(hex) {
  if (!furCache.has(hex)) {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d');
    x.fillStyle = '#' + new THREE.Color(hex).getHexString(); x.fillRect(0, 0, 128, 128);
    let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 1100; i++) {
      x.strokeStyle = rnd() > 0.5 ? 'rgba(0,0,0,.11)' : 'rgba(255,255,255,.11)'; x.lineWidth = 1;
      const px = rnd() * 128, py = rnd() * 128; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (rnd() - 0.5) * 5, py + 3 + rnd() * 5); x.stroke();
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2); t.anisotropy = 2;
    furCache.set(hex, new THREE.MeshStandardMaterial({ map: t, roughness: 0.93, metalness: 0 }));
  }
  return furCache.get(hex);
}
const outlineMat = new THREE.MeshBasicMaterial({ color: 0x2a1408, side: THREE.BackSide });
/** Contour façon cartoon : copie agrandie des maillages, face arrière noire. */
export function addOutline(root, k = 1.07) {
  const list = [];
  root.traverse((o) => { if (o.isMesh && !o.userData.noOutline) list.push(o); });
  for (const m of list) {
    if (!m.parent) continue;
    const o = new THREE.Mesh(m.geometry, outlineMat);
    o.position.copy(m.position); o.quaternion.copy(m.quaternion);
    o.scale.copy(m.scale).multiplyScalar(k); o.userData.noOutline = true;
    m.parent.add(o);
  }
}
const sphereG = new THREE.SphereGeometry(0.5, 28, 20);
const coneG = new THREE.ConeGeometry(0.5, 1, 8);
const cylG = new THREE.CylinderGeometry(0.5, 0.5, 1, 10);
const boxG = new THREE.BoxGeometry(1, 1, 1);

const legCache = new Map();
function legG(len) {            // patte effilée : épaisse à la cuisse, fine à la cheville
  const k = len.toFixed(3);
  if (!legCache.has(k)) legCache.set(k, new THREE.CylinderGeometry(0.075, 0.045, len, 8));
  return legCache.get(k);
}

export function ell(l, h, w, m, x = 0, y = 0, z = 0) {
  const o = new THREE.Mesh(sphereG, m); o.scale.set(l, h, w); o.position.set(x, y, z); o.castShadow = true; return o;
}
export function cone(r, h, m, x = 0, y = 0, z = 0) {
  const o = new THREE.Mesh(coneG, m); o.scale.set(r * 2, h, r * 2); o.position.set(x, y, z); o.castShadow = true; return o;
}
export function cyl(r, h, m, x = 0, y = 0, z = 0) {
  const o = new THREE.Mesh(cylG, m); o.scale.set(r * 2, h, r * 2); o.position.set(x, y, z); o.castShadow = true; return o;
}
export function box(w, h, d, m, x = 0, y = 0, z = 0) {
  const o = new THREE.Mesh(boxG, m); o.scale.set(w, h, d); o.position.set(x, y, z); o.castShadow = true; return o;
}

export function eyes(head, x, y, z, r, iris = 0x1a1208, white = 0xffffff, glint = true) {
  for (const s of [1, -1]) {
    const w = ell(r * 2, r * 2, r * 1.6, mat(white, { roughness: 0.3 }), x, y, z * s);
    const p = ell(r * 1.35, r * 1.5, r * 1.1, mat(iris, { roughness: 0.2 }), x + r * 0.45, y, z * s * 1.06);
    head.add(w, p);
    if (glint) head.add(ell(r * 0.5, r * 0.5, r * 0.5, mat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.4 }), x + r * 0.85, y + r * 0.3, z * s * 1.1));
  }
}


// ------------------------------------------------------------------ accessoires (boutique)
export const ITEMS = {
  hat: [
    { id: 'straw', name: 'Satroka bozaka', cost: 15 }, { id: 'cap', name: 'Kaskety', cost: 12 }, { id: 'beanie', name: 'Bonetra misy pompôma', cost: 10 },
    { id: 'pirate', name: 'Satroka piraty', cost: 30 }, { id: 'crown', name: 'Satroboninahitra', cost: 40 },
  ],
  glasses: [
    { id: 'round', name: 'Solomaso boribory', cost: 10 }, { id: 'sun', name: 'Solomaso masoandro', cost: 15 }, { id: 'star', name: 'Solomaso kintana', cost: 25 },
  ],
  scarf: [
    { id: 'red', name: 'Lamba mena', cost: 8 }, { id: 'blue', name: 'Lamba manga', cost: 8 }, { id: 'stripe', name: 'Lamba tsipika', cost: 14 }, { id: 'gold', name: 'Lamba volamena', cost: 30 },
  ],
  boots: [
    { id: 'red', name: 'Kiraro mena', cost: 10 }, { id: 'yellow', name: 'Kiraro mavo', cost: 10 }, { id: 'green', name: 'Kiraro maitso', cost: 14 }, { id: 'gold', name: 'Kiraro volamena', cost: 35 },
  ],
  cape: [
    { id: 'red', name: 'Cape rouge', cost: 20 }, { id: 'blue', name: 'Cape bleue', cost: 20 }, { id: 'gold', name: 'Cape dorée', cost: 45 },
  ],
  wings: [
    { id: 'fairy', name: 'Ailes de fée', cost: 30 }, { id: 'bird', name: 'Ailes d’oiseau', cost: 30 }, { id: 'bat', name: 'Ailes de chauve-souris', cost: 35 },
  ],
  necklace: [
    { id: 'shell', name: 'Collier de coquillages', cost: 12 }, { id: 'pearl', name: 'Collier de perles', cost: 18 }, { id: 'gold', name: 'Collier doré', cost: 35 },
  ],
  mask: [
    { id: 'tribal', name: 'Masque tribal', cost: 25 }, { id: 'hero', name: 'Masque de héros', cost: 25 }, { id: 'ghost', name: 'Masque fantôme', cost: 25 },
  ],
};
export const CATS = [
  { id: 'hat', name: 'Satroka', ic: 'hat' }, { id: 'glasses', name: 'Solomaso', ic: 'glasses' },
  { id: 'scarf', name: 'Lamba', ic: 'scarf' }, { id: 'boots', name: 'Kiraro', ic: 'boot' },
  { id: 'cape', name: 'Akanjo', ic: 'cape' }, { id: 'wings', name: 'Elatra', ic: 'wings' },
  { id: 'necklace', name: 'Rojo', ic: 'necklace' }, { id: 'mask', name: 'Saron-doha', ic: 'mask' },
];

function accHat(kind, r) {
  const g = new THREE.Group();
  switch (kind) {
    case 'straw':
      g.add(cyl(r * 1.75, 0.035, mat(0xe9c46a), 0, 0, 0), ell(r * 1.5, r * 1.0, r * 1.5, mat(0xf2d680), 0, r * 0.34, 0), cyl(r * 0.8, 0.07, mat(0xd8452f), 0, r * 0.12, 0)); break;
    case 'cap':
      g.add(ell(r * 2.1, r * 1.25, r * 2.1, mat(0xd8362a), 0, r * 0.2, 0), ell(r * 1.3, 0.05, r * 1.5, mat(0x9a2218), r * 1.0, r * 0.0, 0), ell(r * 0.3, r * 0.3, r * 0.3, mat(0xffd23f), 0, r * 0.84, 0)); break;
    case 'beanie':
      g.add(ell(r * 2.2, r * 1.5, r * 2.2, mat(0x2a7be0), 0, r * 0.24, 0), cyl(r * 1.06, r * 0.3, mat(0xffffff), 0, r * 0.02, 0), ell(r * 0.55, r * 0.55, r * 0.55, mat(0xffffff), 0, r * 1.05, 0)); break;
    case 'pirate':
      g.add(ell(r * 2.5, r * 0.55, r * 2.9, mat(0x1d1d28), 0, r * 0.18, 0), ell(r * 1.9, r * 1.1, r * 1.9, mat(0x2a2a3a), 0, r * 0.5, 0), cyl(r * 0.95, r * 0.16, mat(0xd8362a), 0, r * 0.32, 0),
        ell(r * 0.5, r * 0.5, 0.05, mat(0xffffff), r * 0.95, r * 0.55, 0)); break;
    case 'crown': {
      g.add(cyl(r * 0.95, r * 0.32, mat(0xffd23f), 0, r * 0.1, 0));
      for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; g.add(cone(r * 0.2, r * 0.6, mat(0xffd23f), Math.cos(a) * r * 0.78, r * 0.5, Math.sin(a) * r * 0.78), ell(r * 0.14, r * 0.14, r * 0.14, mat(0xe8433a), Math.cos(a) * r * 0.78, r * 0.86, Math.sin(a) * r * 0.78)); }
      break;
    }
    default: break;
  }
  return g;
}
function accGlasses(kind, r, faceX, hz) {
  const g = new THREE.Group();
  const rimC = kind === 'sun' ? 0x15151c : kind === 'star' ? 0xff5aa0 : 0xffc933;
  const lens = new THREE.MeshToonMaterial({ color: kind === 'sun' ? 0x111118 : kind === 'star' ? 0xffe14d : 0xc4ecff, transparent: true, opacity: kind === 'sun' ? 0.95 : 0.6, gradientMap: toonGradient, side: THREE.DoubleSide });
  for (const z of [1, -1]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 0.3, r * 0.065, 8, 18), mat(rimC)); ring.rotation.y = Math.PI / 2; ring.position.set(faceX, r * 0.1, z * hz * 0.5); g.add(ring);
    const l = new THREE.Mesh(new THREE.CircleGeometry(r * 0.29, 16), lens); l.rotation.y = Math.PI / 2; l.position.set(faceX + 0.004, r * 0.1, z * hz * 0.5); l.userData.noOutline = true; g.add(l);
    const arm = cyl(r * 0.03, r * 0.9, mat(rimC), faceX - r * 0.4, r * 0.1, z * (hz * 0.5 + r * 0.28)); arm.rotation.z = Math.PI / 2; g.add(arm);
  }
  const bridge = cyl(r * 0.04, hz * 0.5, mat(rimC), faceX, r * 0.14, 0); bridge.rotation.x = Math.PI / 2; g.add(bridge);
  return g;
}
function accScarf(kind, r, neck) {
  const g = new THREE.Group(); g.position.set(neck.x, neck.y, 0);
  const c1 = { red: 0xe8433a, blue: 0x2a7be0, gold: 0xffd23f, stripe: 0xe8433a }[kind] || 0xe8433a;
  const c2 = kind === 'stripe' ? 0xffffff : c1;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 0.86, r * 0.22, 10, 22), mat(c1)); ring.rotation.x = Math.PI / 2; ring.scale.set(1, 1, 0.92); ring.castShadow = true; g.add(ring);
  if (kind === 'stripe') for (const a of [0.9, 2.3, 3.7, 5.1]) { const b = ell(r * 0.2, r * 0.3, r * 0.3, mat(c2), Math.cos(a) * r * 0.86, 0, Math.sin(a) * r * 0.8); g.add(b); }
  const tail = ell(r * 0.32, r * 1.1, r * 0.18, mat(c1), -r * 0.25, -r * 0.65, r * 0.78); tail.rotation.z = 0.25; g.add(tail);
  if (kind === 'stripe') g.add(ell(r * 0.34, r * 0.2, r * 0.2, mat(c2), -r * 0.25, -r * 0.7, r * 0.78));
  return g;
}
function accBoot(kind, len, k = 1) {
  const g = new THREE.Group();
  const col = { red: 0xd8362a, yellow: 0xffc933, green: 0x2fb457, gold: 0xffd23f }[kind] || 0xd8362a;
  const m = mat(col, { roughness: 0.45 });
  g.add(ell(0.22 * k, 0.16 * k, 0.17 * k, m, 0.04 * k, -len + 0.06 * k, 0), cyl(0.1 * k, 0.1 * k, m, 0, -len + 0.17 * k, 0), cyl(0.11 * k, 0.035 * k, mat(0xffffff), 0, -len + 0.23 * k, 0));
  return g;
}
function accCape(kind, rig) {
  const g = new THREE.Group(), b = rig.back;
  const m = new THREE.MeshStandardMaterial({ color: { red: 0xd8362a, blue: 0x2a5fd0, gold: 0xffd23f }[kind] || 0xd8362a, roughness: 0.55, side: THREE.DoubleSide });
  if (b.flat) {                                                    // quadrupède : la cape recouvre le dos et retombe sur les côtés
    g.add(ell(b.len * 1.1, 0.045, b.w * 1.25, m, 0, b.y + 0.03, 0));
    for (const z of [1, -1]) g.add(ell(b.len * 0.9, b.w * 0.45, 0.035, m, 0, b.y - b.w * 0.12, z * b.w * 0.58));
  } else {                                                         // bipède : cape qui pend dans le dos
    const cp = box(0.03, b.h, b.w * 1.25, m, b.x - 0.03, b.y - b.h * 0.1, 0); cp.rotation.z = 0.12; g.add(cp, ell(0.1, 0.1, b.w * 1.3, m, b.x, b.y + b.h * 0.42, 0));
  }
  return g;
}
function accWings(kind, rig) {
  const g = new THREE.Group(), b = rig.back;
  const fairy = kind === 'fairy';
  const m = new THREE.MeshStandardMaterial({ color: { fairy: 0xbfe8ff, bird: 0xf6f6f6, bat: 0x3a2a4a }[kind] || 0xffffff, roughness: 0.4, transparent: fairy, opacity: fairy ? 0.72 : 1, side: THREE.DoubleSide, emissive: fairy ? 0x6fb8ff : 0x000000, emissiveIntensity: 0.35 });
  for (const z of [1, -1]) {
    const w = new THREE.Group(); w.position.set(b.flat ? 0 : b.x - 0.04, b.flat ? b.y + 0.05 : b.y + b.h * 0.25, z * (b.flat ? b.w * 0.4 : b.w * 0.35));
    w.add(ell(0.3, 0.02, 0.38, m, 0, 0, z * 0.2), ell(0.2, 0.02, 0.24, m, -0.1, 0, z * 0.12)); w.rotation.x = z * 0.55; w.rotation.z = -0.25; g.add(w);
  }
  return g;
}
function accNecklace(kind, r, neck) {
  const g = new THREE.Group(); g.position.set(neck.x, neck.y - r * 0.15, 0);
  const col = { shell: 0xf4dcc8, pearl: 0xfafafa, gold: 0xffd23f }[kind] || 0xffffff;
  const m = mat(col, { roughness: kind === 'gold' ? 0.25 : 0.4, metalness: kind === 'gold' ? 0.6 : 0 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 0.8, r * 0.08, 8, 22), m); ring.rotation.x = Math.PI / 2; ring.scale.set(1, 1, 0.92); g.add(ring);
  g.add(ell(r * 0.26, r * 0.3, r * 0.2, kind === 'shell' ? mat(0xe8a0b0) : mat(0xe83a3a, { roughness: 0.3 }), r * 0.82, -r * 0.4, 0));
  return g;
}
function accMask(kind, r, faceX, hz) {
  const g = new THREE.Group();
  const m = mat({ tribal: 0x8a4a2a, hero: 0xe8e8f0, ghost: 0xf6fbff }[kind] || 0x8a4a2a, { roughness: 0.5 });
  g.add(ell(r * 0.2, r * 1.3, hz * 2.0, m, faceX * 0.93, -r * 0.05, 0));
  for (const z of [1, -1]) g.add(ell(r * 0.24, r * 0.22, r * 0.2, mat(0x111111), faceX * 1.01, r * 0.12, z * hz * 0.5));
  if (kind === 'tribal') for (const k of [-1, 0, 1]) g.add(ell(r * 0.22, r * 0.5, r * 0.05, mat(0xd8362a), faceX * 1.0, -r * 0.25, k * hz * 0.45));
  if (kind === 'hero') g.add(cone(r * 0.12, r * 0.5, mat(0xffd23f, { metalness: 0.5, roughness: 0.3 }), faceX * 0.9, r * 0.75, 0));
  if (kind === 'ghost') g.add(ell(r * 0.22, r * 0.3, r * 0.5, mat(0x111111), faceX * 1.0, -r * 0.5, 0));
  return g;
}
function applySkin(res, skin) {
  if (!skin) return;
  const { rig } = res;
  const put = (grp, parent) => { parent.add(grp); };
  if (skin.hat) { const h = accHat(skin.hat, rig.hr); h.position.set(0, rig.hatY, 0); h.rotation.z = -0.06; put(h, rig.head); }
  if (skin.glasses) put(accGlasses(skin.glasses, rig.hr, rig.faceX, rig.hz), rig.head, 1.1);
  if (skin.scarf) put(accScarf(skin.scarf, rig.hr, rig.neck), rig.body, 1.08);
  if (skin.cape && rig.back) put(accCape(skin.cape, rig), rig.body);
  if (skin.wings && rig.back) put(accWings(skin.wings, rig), rig.body);
  if (skin.necklace && rig.neck) put(accNecklace(skin.necklace, rig.hr, rig.neck), rig.body);
  if (skin.mask) put(accMask(skin.mask, rig.hr, rig.faceX, rig.hz), rig.head);
  if (skin.boots) for (const l of rig.legs) put(accBoot(skin.boots, l.len, Math.min(1, (rig.legR || 0.075) / 0.075)), l.pv);
}
// ------------------------------------------------------------------ construction des animaux
const SPEC = {
  maki:   { legH: 0.28, bl: 0.62, bh: 0.34, bw: 0.30, c1: 0x8f897f, c2: 0xf0ece2, hr: 0.17, hx: 0.40, hy: 0.20 },
  fosa:   { legH: 0.27, bl: 0.95, bh: 0.30, bw: 0.26, c1: 0x8a5535, c2: 0xc9a27c, hr: 0.17, hx: 0.55, hy: 0.14 },
  omby:   { legH: 0.30, bl: 0.86, bh: 0.50, bw: 0.44, c1: 0xd9b88a, c2: 0xf3e6cf, hr: 0.19, hx: 0.52, hy: 0.10 },
  sahona: { legH: 0.10, bl: 0.52, bh: 0.40, bw: 0.46, c1: 0x5ea63f, c2: 0xdbe8a4, hr: 0.20, hx: 0.22, hy: 0.10 },
  saka:   { legH: 0.27, bl: 0.60, bh: 0.30, bw: 0.28, c1: 0xd98b3c, c2: 0xf6e2c3, hr: 0.18, hx: 0.38, hy: 0.16 },
  alika:  { legH: 0.30, bl: 0.70, bh: 0.34, bw: 0.30, c1: 0xb98a53, c2: 0xf1e3c9, hr: 0.18, hx: 0.44, hy: 0.20 },
  sifaka: { legH: 0.36, bl: 0.50, bh: 0.36, bw: 0.30, c1: 0xf4efe3, c2: 0xffffff, hr: 0.17, hx: 0.34, hy: 0.24 },
  ayeaye: { legH: 0.25, bl: 0.60, bh: 0.34, bw: 0.30, c1: 0x30271f, c2: 0x5d4d41, hr: 0.18, hx: 0.38, hy: 0.15 },
  tana:   { legH: 0.20, bl: 0.62, bh: 0.34, bw: 0.17, c1: 0x7db046, c2: 0xd3e590, hr: 0.16, hx: 0.40, hy: 0.10 },
  kisoa:  { legH: 0.2, bl: 0.74, bh: 0.5, bw: 0.44, c1: 0xf0a8b0, c2: 0xf8c8cc, hr: 0.21, hx: 0.46, hy: 0.0 },
  tenrec: { legH: 0.12, bl: 0.62, bh: 0.38, bw: 0.36, c1: 0xa47c4d, c2: 0xe8d0a4, hr: 0.16, hx: 0.38, hy: 0.00 },
};

export function buildAnimal(id, skin = {}) {
  const special = { kalanoro: buildKalanoro, angatra: buildAngatra, ...BUILDERS }[id];
  if (special) { const k = special(); applySkin(k, skin); return k; }
  const s = SPEC[id];
  const g = new THREE.Group();          // orienté vers +x, pieds à y=0
  const rig = { legs: [], tail: null, head: null, body: null, ears: [], by: 0, legH: s.legH };
  const c1 = id === 'omby' ? cow() : fur(s.c1), c2 = id === 'omby' ? fur(0xf4f4f4) : fur(s.c2);
  const dark = mat(0x16100c, { roughness: 0.4 });
  const by = s.legH + s.bh * 0.42;
  rig.by = by;

  // corps
  const body = new THREE.Group(); body.position.y = by; g.add(body); rig.body = body;
  body.add(ell(s.bl, s.bh, s.bw, c1));
  body.add(ell(s.bl * 0.88, s.bh * 0.72, s.bw * 0.97, c2, 0.02, -s.bh * 0.2, 0));

  // tête
  body.add(ell(s.hr * 1.5, s.hr * 1.5, s.hr * 1.4, c1, s.hx * 0.62, s.hy * 0.45, 0));      // cou : la tête est raccordée au corps
  const head = new THREE.Group(); head.position.set(s.hx, s.hy, 0); body.add(head); rig.head = head;
  const headM = id === 'sifaka' ? mat(0x4a2f22) : c1;
  head.add(ell(s.hr * 2, s.hr * 1.85, s.hr * 1.8, headM));

  // pattes
  const legR = Math.min(0.075, s.bw * 0.2);
  rig.legR = legR;
  const mk = (x, z, front) => {
    const pv = new THREE.Group(); pv.position.set(x, by - s.bh * 0.1, z); g.add(pv);
    const len = s.legH + s.bh * 0.1;
    const col = (id === 'saka' || id === 'alika') && front ? c2 : c1;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(legR, legR * 0.62, len, 12), col); leg.position.y = -len / 2; leg.castShadow = true; pv.add(leg);
    pv.add(ell(legR * 2.1, legR * 2.1, legR * 2.1, col, 0, 0, 0));                                   // hanche arrondie, cachée dans le corps
    pv.add(ell(legR * 3.0, legR * 1.5, legR * 2.0, id === 'maki' ? dark : col, legR * 0.6, -len + legR * 0.4, 0));   // patte
    rig.legs.push({ pv, front, len });
  };
  const lx = s.bl * 0.3, lz = s.bw * 0.5 - legR * 1.15;       // les pattes restent à l'intérieur de la largeur du corps
  mk(lx, lz, true); mk(lx, -lz, true); mk(-lx, lz, false); mk(-lx, -lz, false);

  DECOR[id](s, g, body, head, rig, { c1, c2, dark });
  Object.assign(rig, { hr: s.hr, faceX: s.hr * 0.9, hz: s.hr * 0.9, hatY: s.hr * 0.82, neck: { x: s.hx - 0.05, y: s.hy - s.hr * 0.55 }, back: { flat: true, x: 0, y: s.bh * 0.5, len: s.bl * 0.7, w: s.bw, h: 0.3 } }, ANCHOR[id] || {});
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  const res = { group: g, rig };
  applySkin(res, skin);
  return res;
}
const ANCHOR = { sahona: { hatY: 0.13, faceX: 0.2, hz: 0.24, hr: 0.2 }, tenrec: { hatY: 0.12 }, tana: { hatY: 0.1, hz: 0.14 } };

// ------------------------------------------------------------------ nouveaux personnages : Lolo, Vazimba, Angatra
const hang = (parent, m, x, y, z, len, r = 0.035, tilt = 0) => {          // mèche de poils qui pend
  const c = cone(r, len, m, x, y - len / 2, z); c.rotation.x = Math.PI; c.rotation.z = tilt; parent.add(c); return c;
};
function biLeg(g, rig, m, foot, z, hipY, len, r) {
  const pv = new THREE.Group(); pv.position.set(0, hipY, z); g.add(pv);
  pv.add(new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.7, len, 12), m)); pv.children[0].position.y = -len / 2;
  pv.add(ell(r * 2.2, r * 2.2, r * 2.2, m, 0, 0, 0));
  pv.add(ell(r * 3.6, r * 1.5, r * 2.4, foot, r * 0.9, -len + r * 0.4, 0));
  rig.legs.push({ pv, front: z > 0, len });
  return pv;
}

/** Lolo : être grand, mince et couvert de poils, aux bras très longs. */
function buildLolo() {
  const g = new THREE.Group();
  const rig = { legs: [], arms: [], tail: null, head: null, body: null, ears: [], by: 0.5, legH: 0.5, legR: 0.055 };
  const f1 = fur(0x5b4636), f2 = fur(0x7e634b), skin = mat(0x3b2b23, { roughness: 0.9 }), dark = mat(0x140d09, { roughness: 0.5 });
  const body = new THREE.Group(); body.position.y = 0.5; g.add(body); rig.body = body;
  body.add(ell(0.26, 0.6, 0.22, f1, 0, 0.32, 0), ell(0.2, 0.44, 0.19, f2, 0.03, 0.27, 0));
  for (let i = 0; i < 18; i++) { const a = (i / 18) * 6.28; hang(body, f2, Math.cos(a) * 0.12, 0.36 - (i % 4) * 0.07, Math.sin(a) * 0.1, 0.3 + (i % 3) * 0.06, 0.035); }
  const head = new THREE.Group(); head.position.set(0.05, 0.9, 0); body.add(head); rig.head = head;
  head.add(ell(0.3, 0.33, 0.27, f1), ell(0.15, 0.22, 0.2, skin, 0.1, -0.02, 0), ell(0.07, 0.05, 0.06, dark, 0.19, -0.03, 0), ell(0.06, 0.02, 0.1, dark, 0.18, -0.1, 0));
  eyes(head, 0.15, 0.05, 0.075, 0.034, 0x2a1a08, 0xfff0d0);
  for (const z of [1, -1]) head.add(ell(0.07, 0.09, 0.05, f2, -0.02, 0.16, 0.14 * z));
  const mane = new THREE.Group(); mane.position.set(-0.1, 0.1, 0); head.add(mane); rig.tail = mane;
  for (let i = 0; i < 9; i++) hang(mane, f2, -0.04 - (i % 3) * 0.05, 0.1 - Math.floor(i / 3) * 0.08, (i % 3 - 1) * 0.1, 0.34 + (i % 2) * 0.1, 0.045);
  for (const z of [1, -1]) {
    const pv = new THREE.Group(); pv.position.set(0.02, 0.56, 0.19 * z); body.add(pv);         // bras très longs
    pv.add(new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.034, 0.66, 10), f1)); pv.children[0].position.y = -0.33;
    pv.add(ell(0.1, 0.13, 0.08, skin, 0.02, -0.7, 0));
    for (let k = 0; k < 4; k++) hang(pv, f2, 0.0, -0.1 - k * 0.12, (k % 2 ? 0.03 : -0.03), 0.16, 0.03);
    rig.arms.push({ pv, side: z });
  }
  for (const z of [1, -1]) biLeg(g, rig, f1, dark, 0.09 * z, 0.52, 0.5, 0.055);
  Object.assign(rig, { hr: 0.18, faceX: 0.17, hz: 0.14, hatY: 0.2, neck: { x: 0.05, y: 0.74 } });
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  g.scale.setScalar(0.78);                      // Lolo est grand : on le réduit pour rester proche de la zone de jeu
  const root = new THREE.Group(); root.add(g);
  return { group: root, rig };
}

/** Vazimba : petit être couvert de poils ; les mains et les orteils dépassent de la fourrure. */
function buildVazimba() {
  const g = new THREE.Group();
  const rig = { legs: [], arms: [], tail: null, head: null, body: null, ears: [], by: 0.22, legH: 0.18, legR: 0.05 };
  const f1 = fur(0x6a4a2c), f2 = fur(0x8e6a42), skin = mat(0xe0a47a, { roughness: 0.8 }), dark = mat(0x1a0f08, { roughness: 0.5 });
  const body = new THREE.Group(); body.position.y = 0.22; g.add(body); rig.body = body;
  body.add(ell(0.5, 0.5, 0.46, f1, 0, 0.18, 0));
  for (let i = 0; i < 44; i++) { const a = (i / 44) * 6.28 * 2.3, h = 0.28 - (i % 6) * 0.07; hang(body, i % 2 ? f2 : f1, Math.cos(a) * 0.2, h + 0.18, Math.sin(a) * 0.19, 0.22 + (i % 4) * 0.05, 0.045); }
  const head = new THREE.Group(); head.position.set(0.12, 0.42, 0); body.add(head); rig.head = head;
  head.add(ell(0.36, 0.34, 0.32, f2), ell(0.2, 0.2, 0.2, skin, 0.1, -0.04, 0), ell(0.05, 0.04, 0.05, dark, 0.19, -0.04, 0), ell(0.05, 0.02, 0.09, dark, 0.18, -0.11, 0));
  eyes(head, 0.14, 0.03, 0.07, 0.036, 0x3a2208, 0xffffff);
  for (let i = 0; i < 7; i++) hang(head, f2, 0.1, 0.12, (i - 3) * 0.045, 0.1, 0.035);                // frange
  const hair = new THREE.Group(); hair.position.set(-0.12, 0.06, 0); head.add(hair); rig.tail = hair;
  for (let i = 0; i < 6; i++) hang(hair, f1, -0.04, 0.08, (i - 2.5) * 0.07, 0.26, 0.05);
  for (const z of [1, -1]) {
    const pv = new THREE.Group(); pv.position.set(0.1, 0.18, 0.25 * z); body.add(pv);
    pv.add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.2, 10), f1)); pv.children[0].position.y = -0.1;
    pv.add(ell(0.11, 0.1, 0.09, skin, 0.01, -0.24, 0));                                                // la main sort de la fourrure
    for (let k = -1; k <= 1; k++) pv.add(cone(0.014, 0.1, skin, 0.03, -0.31, k * 0.03));              // doigts
    rig.arms.push({ pv, side: z });
  }
  for (const z of [1, -1]) {
    const pv = new THREE.Group(); pv.position.set(0, 0.16, 0.1 * z); g.add(pv);
    pv.add(new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.1, 10), f1)); pv.children[0].position.y = -0.05;
    pv.add(ell(0.2, 0.07, 0.12, skin, 0.06, -0.15, 0));                                                // le pied sort de la fourrure
    for (let k = -1.5; k <= 1.5; k++) pv.add(ell(0.045, 0.04, 0.035, skin, 0.17, -0.15, k * 0.04));    // orteils
    rig.legs.push({ pv, front: z > 0, len: 0.18 });
  }
  Object.assign(rig, { hr: 0.19, faceX: 0.17, hz: 0.15, hatY: 0.18, neck: { x: 0.1, y: 0.4 } });
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return { group: g, rig };
}

/** Angatra : fantôme qui flotte (corps translucide, yeux creux lumineux, bras qui ondulent). */
function buildAngatra() {
  const g = new THREE.Group();
  const rig = { legs: [], arms: [], tail: null, head: null, body: null, ears: [], by: 0.5, legH: 0.4, floaty: true };
  const ghost = new THREE.MeshStandardMaterial({ color: 0xeaf6ff, emissive: 0x9fd8ff, emissiveIntensity: 0.5, transparent: true, opacity: 0.86, roughness: 0.45, side: THREE.DoubleSide });
  const dark = mat(0x0b1018, { roughness: 0.3 }), glow = new THREE.MeshBasicMaterial({ color: 0x8ff6ff });
  const body = new THREE.Group(); body.position.y = 0.5; g.add(body); rig.body = body;
  const pts = [[0.001, -0.42], [0.1, -0.44], [0.22, -0.4], [0.27, -0.28], [0.22, -0.1], [0.14, 0.02], [0.13, 0.08], [0.19, 0.16], [0.21, 0.26], [0.16, 0.36], [0.07, 0.41], [0.001, 0.42]].map(([r, y]) => new THREE.Vector2(r, y));
  body.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 24), ghost));
  const tails = new THREE.Group(); tails.position.y = -0.4; body.add(tails); rig.tail = tails;            // pans de linceul qui ondulent
  for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.28; const c = cone(0.07, 0.22, ghost, Math.cos(a) * 0.17, -0.1, Math.sin(a) * 0.17); c.rotation.x = Math.PI; tails.add(c); }
  const head = new THREE.Group(); head.position.set(0, 0.2, 0); body.add(head); rig.head = head;
  for (const z of [1, -1]) {
    head.add(ell(0.075, 0.11, 0.06, dark, 0.17, 0.03, 0.075 * z), ell(0.03, 0.045, 0.03, glow, 0.2, 0.03, 0.075 * z));
  }
  head.add(ell(0.04, 0.08, 0.09, dark, 0.19, -0.1, 0));
  for (const z of [1, -1]) {
    const pv = new THREE.Group(); pv.position.set(0.0, -0.02, 0.2 * z); body.add(pv);
    const arm = cone(0.06, 0.34, ghost, 0.04, -0.15, 0); arm.rotation.z = 0.2; pv.add(arm);
    pv.add(ell(0.1, 0.07, 0.06, ghost, 0.06, -0.33, 0));
    rig.arms.push({ pv, side: z });
  }
  Object.assign(rig, { hr: 0.17, faceX: 0.16, hz: 0.13, hatY: 0.18, neck: { x: 0, y: 0.08 }, back: { flat: false, x: -0.2, y: 0.05, w: 0.3, h: 0.6 } });
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return { group: g, rig };
}

// ------------------------------------------------------------------ Kalanoro : petit esprit de la forêt (bipède)
function buildKalanoro() {
  const g = new THREE.Group();
  const rig = { legs: [], tail: null, head: null, body: null, ears: [], arms: [], by: 0.42, legH: 0.34 };
  const skin = mat(0xf2b98a), fur = mat(0x7a4426), hair = mat(0x6b3a1f), hair2 = mat(0x8a4f2b), teal = mat(0x2bb6b0), dark = mat(0x1a1008), white = mat(0xffffff);
  const body = new THREE.Group(); body.position.y = 0.42; g.add(body); rig.body = body;
  body.add(ell(0.36, 0.5, 0.34, fur, 0, 0.12, 0));                       // tunique de fourrure
  body.add(ell(0.4, 0.16, 0.37, hair2, 0, -0.1, 0));                      // bas effiloché
  body.add(box(0.06, 0.52, 0.06, mat(0xc9a15a), 0.02, 0.14, 0.17)).rotation.z = 0.5;   // bandoulière
  for (const z of [1, -1]) {                                               // bras articulés + gants turquoise (ils se balancent en courant)
    const pv = new THREE.Group(); pv.position.set(0.02, 0.25, 0.19 * z); body.add(pv);
    const arm = cyl(0.05, 0.3, skin, 0, -0.15, 0); pv.add(arm);
    pv.add(ell(0.13, 0.13, 0.13, teal, 0.02, -0.31, 0));
    rig.arms.push({ pv, side: z });
  }
  const head = new THREE.Group(); head.position.set(0.04, 0.56, 0); body.add(head); rig.head = head;
  head.add(ell(0.5, 0.46, 0.44, skin));
  for (const z of [1, -1]) {
    const ear = cone(0.06, 0.26, skin, -0.02, 0.1, 0.24 * z); ear.rotation.x = 0.9 * -z; ear.rotation.z = 0.2; head.add(ear);      // oreilles pointues
    head.add(ell(0.12, 0.14, 0.12, white, 0.21, 0.02, 0.12 * z));                                                                    // yeux
    head.add(ell(0.07, 0.09, 0.07, mat(0x2a5fd0), 0.255, 0.02, 0.12 * z));
    head.add(ell(0.04, 0.04, 0.04, dark, 0.285, 0.02, 0.12 * z));
    head.add(ell(0.07, 0.04, 0.03, mat(0xff8a7a), 0.2, -0.07, 0.19 * z));                                                          // joues roses
  }
  head.add(ell(0.05, 0.025, 0.07, mat(0xb24a3a), 0.22, -0.11, 0));         // bouche
  head.add(ell(0.4, 0.44, 0.5, hair, -0.17, 0.08, 0));                       // longue chevelure
  head.add(ell(0.34, 0.16, 0.44, hair2, 0.05, 0.25, 0));                     // frange
  const mane = new THREE.Group(); head.add(mane); rig.tail = mane;           // mèches qui flottent
  for (let i = 0; i < 5; i++) mane.add(ell(0.3, 0.14, 0.14, i % 2 ? hair : hair2, -0.26 - i * 0.1, 0.04 - i * 0.07, (i - 2) * 0.07));
  for (const z of [1, -1]) {
    const pv = new THREE.Group(); pv.position.set(0.02, 0.34, 0.1 * z); g.add(pv);
    pv.add(cyl(0.065, 0.3, skin, 0, -0.14, 0));
    pv.add(ell(0.2, 0.1, 0.13, mat(0x5a3a22), 0.04, -0.3, 0));
    rig.legs.push({ pv, front: z > 0, len: 0.3 });
  }
  Object.assign(rig, { hr: 0.25, faceX: 0.26, hz: 0.22, hatY: 0.3, neck: { x: 0.04, y: 0.4 }, back: { flat: false, x: -0.18, y: 0.15, w: 0.34, h: 0.5 } });
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return { group: g, rig };
}

const DECOR = {
  maki(s, g, body, head, rig, { c1, c2, dark }) {
    head.add(ell(0.2, 0.15, 0.2, c2, 0.1, -0.03, 0));                       // museau blanc
    head.add(ell(0.1, 0.08, 0.1, dark, 0.2, -0.02, 0));                     // truffe
    for (const z of [1, -1]) {
      head.add(ell(0.12, 0.2, 0.06, dark, 0.04, 0.02, 0.11 * z));            // masque noir
      head.add(ell(0.1, 0.1, 0.07, c1, -0.04, 0.16, 0.1 * z));               // oreilles
    }
    eyes(head, 0.1, 0.03, 0.1, 0.03, 0xe8a317, 0xfff3c4);
    rig.tail = new THREE.Group(); rig.tail.position.set(-s.bl * 0.45, 0.05, 0); body.add(rig.tail);
    for (let i = 0; i < 9; i++) {                                           // queue annelée
      const t = i / 8;
      const seg = ell(0.2, 0.15 - t * 0.04, 0.15 - t * 0.04, i % 2 ? dark : c2, -0.08 - t * 0.5, 0.05 + Math.sin(t * 2.2) * 0.3, 0);
      rig.tail.add(seg);
    }
  },
  fosa(s, g, body, head, rig, { c1, c2, dark }) {
    head.add(ell(0.16, 0.12, 0.14, c2, 0.12, -0.04, 0));
    head.add(ell(0.06, 0.05, 0.07, dark, 0.2, -0.01, 0));
    for (const z of [1, -1]) head.add(ell(0.1, 0.1, 0.05, c1, -0.04, 0.16, 0.1 * z));
    eyes(head, 0.1, 0.03, 0.09, 0.032, 0x2b1a08, 0xf2c14a);
    rig.tail = new THREE.Group(); rig.tail.position.set(-s.bl * 0.48, 0, 0); body.add(rig.tail);
    for (let i = 0; i < 6; i++) rig.tail.add(ell(0.26, 0.12 - i * 0.008, 0.12 - i * 0.008, c1, -0.1 - i * 0.14, 0.03 + i * 0.03, 0));
  },
  omby(s, g, body, head, rig, { c1, c2, dark }) {
    head.add(ell(0.34, 0.22, 0.2, c1, 0.12, -0.05, 0));
    head.add(ell(0.12, 0.1, 0.16, mat(0xe9b8a0), 0.28, -0.08, 0));
    for (const z of [1, -1]) {
      head.add(cone(0.035, 0.25, mat(0xf4efe0), -0.02, 0.2, 0.1 * z)).rotation.z = 0.25 * z;
      head.add(ell(0.05, 0.14, 0.07, c1, -0.07, 0.04, 0.2 * z));            // oreilles
    }
    eyes(head, 0.14, 0.04, 0.12, 0.028);
    rig.tail = new THREE.Group(); rig.tail.position.set(-s.bl * 0.46, 0.08, 0); body.add(rig.tail);
    rig.tail.add(cyl(0.02, 0.4, c1, -0.04, -0.18, 0)); rig.tail.add(ell(0.08, 0.14, 0.08, dark, -0.04, -0.4, 0));
  },
  sahona(s, g, body, head, rig, { c1, c2, dark }) {
    head.position.set(0.2, 0.1, 0);
    head.children[0].scale.set(0.45, 0.28, 0.5);
    for (const z of [1, -1]) {
      head.add(ell(0.16, 0.16, 0.16, c1, -0.02, 0.18, 0.15 * z));
      head.add(ell(0.11, 0.11, 0.11, mat(0xffd34d, { roughness: 0.2 }), 0.02, 0.2, 0.17 * z));
      head.add(ell(0.05, 0.1, 0.05, dark, 0.07, 0.2, 0.19 * z));
    }
    head.add(box(0.3, 0.012, 0.36, dark, 0.07, -0.04, 0));                  // bouche large
    for (const [x, z, r] of [[-0.1, 0.17, 0.05], [0.0, -0.2, 0.06], [-0.2, -0.1, 0.045], [-0.18, 0.12, 0.05]]) body.add(ell(r * 2, r, r * 2, mat(0x3e7d2a), x, s.bh * 0.42, z));
    rig.tail = new THREE.Group(); body.add(rig.tail);
  },
  saka(s, g, body, head, rig, { c1, c2, dark }) {
    head.add(ell(0.12, 0.09, 0.12, c2, 0.12, -0.05, 0));
    head.add(ell(0.045, 0.04, 0.05, mat(0xe58a9a), 0.2, -0.02, 0));
    for (const z of [1, -1]) {
      head.add(cone(0.06, 0.15, c1, -0.04, 0.17, 0.09 * z));
      head.add(cone(0.035, 0.1, mat(0xe9a3a8), -0.03, 0.17, 0.09 * z));
      for (const a of [-0.2, 0, 0.2]) { const w = cyl(0.004, 0.2, mat(0xffffff), 0.17, -0.03, 0.1 * z); w.rotation.x = Math.PI / 2; w.rotation.z = a; head.add(w); }
    }
    for (let i = 0; i < 3; i++) body.add(ell(0.05, s.bh * 1.02, s.bw * 1.0, mat(0x9a5a1e), -0.15 + i * 0.14, 0.01, 0));   // rayures
    eyes(head, 0.1, 0.03, 0.085, 0.034, 0x2c5a1e, 0xe9f2a0);
    rig.tail = new THREE.Group(); rig.tail.position.set(-s.bl * 0.46, 0.04, 0); body.add(rig.tail);
    for (let i = 0; i < 6; i++) rig.tail.add(ell(0.17, 0.09, 0.09, i % 2 ? mat(0x9a5a1e) : c1, -0.06 - i * 0.07, 0.04 + i * 0.07, 0));
  },
  alika(s, g, body, head, rig, { c1, c2, dark }) {
    head.add(ell(0.2, 0.12, 0.13, c2, 0.15, -0.05, 0));
    head.add(ell(0.07, 0.06, 0.08, dark, 0.26, -0.02, 0));
    for (const z of [1, -1]) head.add(ell(0.09, 0.2, 0.06, mat(0x6a4426), -0.05, -0.02, 0.13 * z));   // oreilles tombantes
    eyes(head, 0.1, 0.05, 0.09, 0.03);
    body.add(ell(0.08, s.bh * 1.05, s.bw * 1.05, mat(0xc0392b), s.bl * 0.3, s.bh * 0.05, 0));       // collier rouge
    rig.tail = new THREE.Group(); rig.tail.position.set(-s.bl * 0.46, 0.08, 0); body.add(rig.tail);
    rig.tail.add(ell(0.28, 0.08, 0.08, c1, -0.1, 0.07, 0));
  },
  sifaka(s, g, body, head, rig, { c1, c2, dark }) {
    head.add(ell(0.14, 0.12, 0.12, mat(0x2e1d15), 0.11, -0.03, 0));
    head.add(ell(0.05, 0.04, 0.06, dark, 0.19, -0.02, 0));
    for (const z of [1, -1]) head.add(ell(0.07, 0.08, 0.06, mat(0xfbf6ea), -0.02, 0.17, 0.1 * z));
    eyes(head, 0.1, 0.04, 0.09, 0.036, 0x2a1a08, 0xffb938);
    body.add(ell(0.5, 0.44, 0.38, mat(0xfffbf0, { roughness: 1 }), 0, 0.02, 0));                     // fourrure duveteuse
    rig.tail = new THREE.Group(); rig.tail.position.set(-s.bl * 0.46, 0.06, 0); body.add(rig.tail);
    for (let i = 0; i < 6; i++) rig.tail.add(ell(0.22, 0.12, 0.12, c1, -0.08 - i * 0.12, 0.06 + i * 0.05, 0));
  },
  ayeaye(s, g, body, head, rig, { c1, c2, dark }) {
    head.add(ell(0.13, 0.1, 0.12, c2, 0.12, -0.05, 0));
    head.add(ell(0.05, 0.04, 0.06, mat(0xe58a9a), 0.2, -0.04, 0));
    for (const z of [1, -1]) {
      const ear = ell(0.05, 0.26, 0.24, mat(0x6b5648), -0.03, 0.2, 0.12 * z); ear.rotation.x = 0.3 * z; head.add(ear);
      const doigt = cyl(0.012, 0.28, dark, 0.25, -0.2, 0.07 * z); doigt.rotation.z = -0.6; g.add(doigt);
    }
    eyes(head, 0.1, 0.03, 0.09, 0.044, 0x14110c, 0xffa31a);
    rig.tail = new THREE.Group(); rig.tail.position.set(-s.bl * 0.46, 0.03, 0); body.add(rig.tail);
    for (let i = 0; i < 5; i++) rig.tail.add(ell(0.3, 0.2 - i * 0.02, 0.2 - i * 0.02, c1, -0.15 - i * 0.12, 0.02 - i * 0.015, 0));
  },
  tana(s, g, body, head, rig, { c1, c2, dark }) {
    head.add(cone(0.12, 0.3, c1, -0.04, 0.2, 0)).rotation.z = 0.2;              // casque
    head.add(ell(0.2, 0.1, 0.1, c1, 0.12, -0.03, 0));
    for (const z of [1, -1]) {
      head.add(ell(0.13, 0.13, 0.13, c2, 0.05, 0.06, 0.1 * z));
      head.add(ell(0.05, 0.05, 0.05, dark, 0.1, 0.07, 0.15 * z));
    }
    for (const [x, y, col] of [[-0.12, 0.05, 0xf08a24], [0.0, 0.08, 0x2f8fd8], [0.14, 0.04, 0xf08a24], [-0.2, -0.05, 0x2f8fd8]]) body.add(ell(0.1, 0.1, 0.02, mat(col), x, y, s.bw * 0.5));
    rig.tail = new THREE.Group(); rig.tail.position.set(-s.bl * 0.46, 0, 0); body.add(rig.tail);
    for (let i = 0; i < 8; i++) {                                              // queue enroulée
      const a = i * 0.55; const r = 0.2 - i * 0.012;
      rig.tail.add(ell(r * 0.5, r * 0.5, r * 0.5, c1, -0.15 - Math.sin(a) * 0.16, -0.05 - Math.cos(a) * 0.16 + 0.1, 0));
    }
  },
  kisoa(s, g, body, head, rig, { c1, c2, dark }) {
    const snout = cyl(0.1, 0.12, mat(0xf29aa8, { roughness: 0.5 }), 0.2, -0.04, 0); snout.rotation.z = Math.PI / 2; head.add(snout);              // groin
    for (const z of [1, -1]) {
      head.add(ell(0.02, 0.035, 0.025, dark, 0.275, -0.04, 0.035 * z));                                                                              // narines
      const ear = ell(0.1, 0.14, 0.04, c1, -0.02, 0.16, 0.14 * z); ear.rotation.x = 0.7 * z; ear.rotation.z = 0.3; head.add(ear);                      // oreilles tombantes
    }
    eyes(head, 0.1, 0.06, 0.1, 0.03, 0x2a1a08, 0xffffff);
    rig.tail = new THREE.Group(); rig.tail.position.set(-s.bl * 0.47, 0.06, 0); body.add(rig.tail);
    const curl = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.014, 8, 16, 4.6), mat(0xf29aa8)); curl.rotation.y = Math.PI / 2; curl.position.set(-0.04, 0.02, 0); rig.tail.add(curl);   // queue en tire-bouchon
  },
  tenrec(s, g, body, head, rig, { c1, c2, dark }) {
    head.position.set(s.hx, -0.02, 0);
    for (const z of [1, -1]) head.add(ell(0.06, 0.06, 0.03, c1, -0.04, 0.12, 0.1 * z));
    eyes(head, 0.1, 0.04, 0.08, 0.026);
    const sp = mat(0x5a4027);
    for (let i = 0; i < 26; i++) {                                              // piquants
      const a = (i / 26) * Math.PI * 1.1 + 0.15;
      const px = -0.3 + (i % 9) * 0.07, pz = ((i * 37) % 7 - 3) * 0.045;
      const k = cone(0.03, 0.2, sp, px, 0.14 + Math.sin(a) * 0.08, pz);
      k.rotation.z = 0.4 - (i % 9) * 0.1; k.rotation.x = pz * 1.2; body.add(k);
    }
    rig.tail = new THREE.Group(); body.add(rig.tail);
  },
};

// ------------------------------------------------------------------ ennemi : crabe rouge
export function buildCrab() {
  const g = new THREE.Group();
  const red = mat(0xd63a22), dark = mat(0x7a1a10), light = mat(0xff7a4a), eye = mat(0x111111), white = mat(0xffffff);
  g.add(ell(0.66, 0.34, 0.5, red, 0, 0.3, 0));
  g.add(ell(0.5, 0.18, 0.4, light, 0.02, 0.4, 0));                       // reflet de la carapace
  for (const [x, z] of [[-0.15, 0.12], [0.08, -0.14], [-0.02, 0.0]]) g.add(ell(0.09, 0.05, 0.09, dark, x, 0.46, z));
  for (let i = 0; i < 5; i++) g.add(cone(0.04, 0.16, dark, -0.28 + i * 0.12, 0.5, (i % 2 ? 0.08 : -0.08)));   // piquants dorsaux
  g.add(ell(0.2, 0.05, 0.28, dark, 0.3, 0.22, 0));                        // bouche grimaçante
  g.add(ell(0.05, 0.05, 0.1, white, 0.38, 0.22, 0));
  const parts = { claws: [], legs: [] };
  for (const z of [1, -1]) {
    const arm = new THREE.Group(); arm.position.set(0.3, 0.32, 0.27 * z); g.add(arm);
    arm.add(cyl(0.035, 0.22, dark, 0.04, 0.06, 0));
    arm.add(ell(0.24, 0.17, 0.12, red, 0.1, 0.22, 0));
    const up = cone(0.07, 0.2, light, 0.24, 0.3, 0); up.rotation.z = -1.25; arm.add(up);           // pince haute
    const lo = cone(0.06, 0.18, dark, 0.24, 0.15, 0); lo.rotation.z = -1.9; arm.add(lo);            // pince basse
    parts.claws.push(arm);
    g.add(cyl(0.013, 0.16, eye, 0.2, 0.52, 0.1 * z));                                                // yeux sur tiges
    g.add(ell(0.09, 0.09, 0.09, white, 0.2, 0.62, 0.1 * z), ell(0.05, 0.065, 0.06, mat(0xe8161a), 0.25, 0.62, 0.1 * z), ell(0.12, 0.025, 0.05, dark, 0.2, 0.7, 0.1 * z)).children;
    for (let i = 0; i < 3; i++) {
      const lg = new THREE.Group(); lg.position.set(-0.17 + i * 0.16, 0.2, 0.3 * z); g.add(lg);
      const a = cyl(0.018, 0.2, dark, 0, -0.02, 0.07 * z); a.rotation.x = 0.7 * z; lg.add(a);
      const b = cyl(0.014, 0.18, dark, 0, -0.12, 0.17 * z); b.rotation.x = -0.4 * z; lg.add(b);
      parts.legs.push(lg);
    }
  }
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return { group: g, parts };
}
// ------------------------------------------------------------------ animation
// st : { vx, on, vy, t, run }
export function animateAnimal(a, id, st) {
  const { rig, group } = a;
  const sp = Math.min(1, Math.abs(st.vx) / 6);
  const ph = st.run * 3.2;
  const air = !st.on;
  const swing = air ? 0 : Math.sin(ph) * 0.9 * sp;
  rig.legs.forEach((l, i) => {
    const sign = (i === 0 || i === 3) ? 1 : -1;
    let r = swing * sign;
    if (air) r = (l.front ? -0.7 : 0.7) * (st.vy > 0 ? 1 : 0.6);
    l.pv.rotation.z = r;
  });
  const bob = air ? 0 : Math.abs(Math.sin(ph)) * 0.05 * sp;
  const idle = Math.sin(st.t * 2.2) * 0.012;
  rig.body.position.y = rig.by + bob + idle;
  rig.body.rotation.z = air ? THREE.MathUtils.clamp(st.vy * 0.018, -0.35, 0.35) : -sp * 0.05;
  if (rig.arms) rig.arms.forEach((a, i) => {
    a.pv.rotation.z = air ? -0.55 + Math.sin(st.t * 9 + i) * 0.12 : Math.sin(ph) * a.side * 0.95 * sp + Math.sin(st.t * 1.8 + i * 2) * 0.05;
  });
  if (rig.floaty) { rig.body.position.y = rig.by + Math.sin(st.t * 2.4) * 0.07 + (air ? 0.05 : 0); rig.body.rotation.z = -sp * 0.12 + Math.sin(st.t * 1.5) * 0.04; }
  if (rig.tail) rig.tail.rotation.z = Math.sin(st.t * 4 + ph * 0.5) * (0.06 + sp * 0.12) + (air ? -0.15 : 0);
  if (rig.head) rig.head.rotation.z = air ? THREE.MathUtils.clamp(st.vy * 0.012, -0.25, 0.25) : Math.sin(st.t * 1.7) * 0.03;
  const stretch = air ? THREE.MathUtils.clamp(1 + Math.abs(st.vy) * 0.008, 1, 1.12) : 1;
  group.scale.set(1 / Math.sqrt(stretch), stretch, 1 / Math.sqrt(stretch));
}
