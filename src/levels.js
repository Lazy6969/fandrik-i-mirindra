// 12 niveaux dans 3 mondes. Les pièges sont dans l'esprit de Level Devil : rien n'est ce qu'il semble être.
// Légende des cases :
//  # sol    = plateforme traversable par le bas   P départ   D porte   d destination de la porte (elle s'enfuit)
//  X fausse porte (mortelle)   ^ pointes   f faux sol qui s'effondre   v plateforme fragile
//  h pointes cachées dans le sol   s stalactite qui tombe   b bloc invisible
//  R rocher qui roule   e ennemi (tenrec) qui patrouille   u champignon-trampoline   o fruit (mangue)

export const WORLDS = [
  { id: 'forest', name: 'world.forest', sub: 'world.forest.sub' },
  { id: 'tsingy', name: 'world.tsingy', sub: 'world.tsingy.sub' },
  { id: 'baobab', name: 'world.baobab', sub: 'world.baobab.sub' },
  { id: 'places', name: 'world.places', sub: 'world.places.sub' },
];

const ROWS = 13;

function lv(cols) {
  const g = Array.from({ length: ROWS }, () => Array(cols).fill('.'));
  const api = {
    set(c, y, ch) { if (c >= 0 && c < cols && y >= 0 && y < ROWS) g[y][c] = ch; return api; },
    ground(c0, c1, h = 2) { for (let c = c0; c <= c1; c++) for (let y = 0; y < h; y++) g[y][c] = '#'; return api; },
    pit(c0, c1) { for (let c = c0; c <= c1; c++) for (let y = 0; y < ROWS; y++) g[y][c] = '.'; return api; },
    block(c0, c1, y0, y1, ch = '#') { for (let c = c0; c <= c1; c++) for (let y = y0; y <= y1; y++) g[y][c] = ch; return api; },
    plat(c0, c1, y, ch = '#') { for (let c = c0; c <= c1; c++) g[y][c] = ch; return api; },
    ow(c0, c1, y) { for (let c = c0; c <= c1; c++) g[y][c] = '='; return api; },
    fake(c0, c1, h = 2) { for (let c = c0; c <= c1; c++) for (let y = 0; y < h; y++) g[y][c] = 'f'; return api; },
    fruit(...xy) { for (let i = 0; i < xy.length; i += 2) g[xy[i + 1]][xy[i]] = 'o'; return api; },
    map() { return g.slice().reverse().map((r) => r.join('')); },
  };
  return api;
}

function L1() {
  const l = lv(44).ground(0, 43).set(2, 2, 'P');
  l.fruit(5, 3, 6, 3, 24, 5, 38, 3);
  l.fake(13, 13);
  l.set(18, 1, 'h');
  l.pit(23, 25);
  l.block(29, 30, 2, 2);
  l.set(34, 6, 's');
  l.set(36, 2, 'X');
  l.set(41, 2, 'D');
  return l.map();
}

function L2() {
  const l = lv(60).ground(0, 59).set(2, 2, 'P');
  l.pit(9, 21);
  for (const c of [10, 13, 16, 19]) l.set(c, 1, 'v');
  l.fruit(11, 4, 17, 4, 31, 3, 46, 3);
  l.set(28, 2, 'e');
  l.set(36, 1, 'h');
  l.set(44, 6, 's');
  l.set(49, 2, '^');
  l.set(55, 2, 'D');
  l.set(58, 2, 'R');
  return l.map();
}

function L3() {
  const l = lv(58).ground(0, 57).set(2, 2, 'P');
  l.block(8, 9, 2, 2).block(12, 13, 2, 3);
  l.plat(17, 19, 4);
  l.plat(23, 27, 4).set(25, 4, 'h');
  l.fruit(18, 5, 26, 6, 12, 5, 40, 3);
  l.pit(33, 35);
  l.set(32, 5, 'b');
  l.set(40, 7, 's').set(41, 7, 's');
  l.set(46, 2, 'e');
  l.set(50, 2, 'X');
  l.set(54, 2, 'D');
  return l.map();
}

function L4() {
  const l = lv(66).ground(0, 65).set(2, 2, 'P');
  l.fake(10, 10);
  l.pit(13, 15);
  l.set(19, 1, 'h').set(21, 1, 'h');
  l.fruit(14, 5, 20, 4, 32, 3, 46, 3);
  l.set(30, 2, 'e');
  l.set(36, 7, 's').set(37, 7, 's').set(38, 7, 's');
  l.block(43, 44, 2, 3);
  l.set(48, 2, '^').set(49, 2, '^');
  l.set(52, 2, 'X');
  l.set(56, 2, 'D').set(62, 2, 'd');
  l.set(64, 2, 'R');
  return l.map();
}

function L5() {
  const l = lv(62).ground(0, 61).set(2, 2, 'P');
  l.set(9, 2, '^').set(10, 2, '^');
  l.block(15, 16, 2, 3);
  l.set(19, 2, '^').set(20, 2, '^').set(21, 2, '^');
  l.fruit(10, 4, 20, 5, 26, 6, 42, 4);
  l.ow(25, 27, 5);
  l.set(30, 1, 'h').set(32, 1, 'h');
  l.set(36, 7, 's').set(37, 7, 's');
  l.pit(40, 44).set(42, 1, 'v');
  l.set(51, 2, 'e');
  l.set(58, 2, 'D');
  return l.map();
}

function L6() {
  const l = lv(68).ground(0, 67).set(2, 2, 'P');
  l.block(7, 9, 2, 2).block(11, 13, 2, 3).block(15, 17, 2, 4);
  l.set(16, 4, 'h');
  l.pit(20, 22);
  l.fruit(9, 4, 16, 6, 21, 4, 40, 3);
  l.ow(26, 29, 5);
  l.set(32, 7, 's').set(33, 7, 's');
  l.set(36, 5, 'b');
  l.pit(37, 39);
  l.set(44, 2, 'e');
  l.set(49, 2, '^').set(50, 2, '^');
  l.set(53, 2, 'X');
  l.set(58, 2, 'D').set(64, 2, 'd');
  return l.map();
}

function L7() {
  const l = lv(70).ground(0, 69).set(2, 2, 'P');
  l.pit(8, 12).set(10, 1, 'v');
  l.pit(16, 19);
  l.fake(21, 22);
  l.pit(26, 29);
  l.set(27, 1, 'v').set(28, 1, 'v');
  l.fruit(10, 3, 27, 3, 38, 3, 55, 3);
  l.set(33, 2, 'e').block(37, 37, 2, 2);
  l.set(42, 1, 'h').set(43, 1, 'h');
  l.set(47, 6, 's').set(48, 6, 's');
  l.block(50, 51, 2, 3);
  l.set(55, 2, '^');
  l.set(60, 2, 'D');
  l.set(68, 2, 'R');
  return l.map();
}

function L8() {
  const l = lv(74).ground(0, 73).set(2, 2, 'P');
  l.set(8, 2, '^').set(9, 2, '^').set(10, 2, '^');
  l.block(18, 19, 2, 7);
  l.set(15, 2, 'u');
  l.fruit(18, 10, 19, 10, 26, 3, 50, 3);
  l.pit(26, 28);
  l.set(33, 1, 'h').set(35, 1, 'h');
  l.set(40, 2, 'e');
  l.set(44, 7, 's').set(45, 7, 's').set(46, 7, 's');
  l.set(51, 2, 'X');
  l.fake(54, 55);
  l.pit(58, 61);
  l.set(59, 1, 'v').set(60, 1, 'v');
  l.set(66, 2, 'D').set(71, 2, 'd');
  return l.map();
}

function L9() {
  const l = lv(72).ground(0, 71).set(2, 2, 'P');
  l.fake(9, 10);
  l.set(15, 1, 'h').set(16, 1, 'h');
  l.block(20, 21, 2, 3);
  l.set(24, 6, 's').set(25, 6, 's');
  l.fruit(21, 5, 30, 4, 44, 4, 60, 3);
  l.pit(29, 32).set(30, 1, 'v').set(31, 1, 'v');
  l.set(38, 2, 'e');
  l.set(42, 2, '^');
  l.set(48, 5, 'b');
  l.pit(49, 51);
  l.set(56, 2, 'X');
  l.set(60, 2, 'D').set(66, 2, 'd');
  l.set(70, 2, 'R');
  return l.map();
}

function L10() {
  const l = lv(78).ground(0, 77).set(2, 2, 'P');
  l.set(8, 2, 'e');
  l.pit(13, 16).set(14, 1, 'v').set(15, 1, 'v');
  l.block(20, 22, 2, 3);
  l.set(21, 3, 'h');
  l.fruit(21, 6, 30, 3, 44, 3, 64, 3);
  l.set(26, 7, 's').set(27, 7, 's');
  l.set(30, 2, 'u');
  l.ow(31, 35, 7);
  l.pit(40, 43);
  l.fake(46, 46);
  l.set(50, 1, 'h').set(52, 1, 'h');
  l.set(56, 2, 'e');
  l.set(60, 6, 's');
  l.set(64, 2, 'X');
  l.set(68, 2, 'D').set(74, 2, 'd');
  l.set(76, 2, 'R');
  return l.map();
}

function L11() {
  const l = lv(84).ground(0, 83).set(2, 2, 'P');
  l.set(7, 2, '^').set(8, 2, '^');
  l.pit(12, 15).set(13, 1, 'v').set(14, 1, 'v');
  l.fake(18, 19);
  l.set(24, 1, 'h').set(25, 1, 'h').set(27, 1, 'h');
  l.block(31, 32, 2, 4);
  l.set(36, 2, 'e').set(41, 2, 'e');
  l.set(45, 7, 's').set(46, 7, 's').set(47, 7, 's');
  l.fruit(14, 4, 32, 6, 55, 4, 70, 3);
  l.pit(52, 55).set(53, 1, 'v');
  l.set(60, 5, 'b');
  l.set(62, 2, '^').set(63, 2, '^');
  l.set(67, 2, 'X');
  l.set(72, 2, 'D').set(78, 2, 'd');
  l.set(82, 2, 'R');
  return l.map();
}

function L12() {
  const l = lv(92).ground(0, 91).set(2, 2, 'P');
  l.fake(8, 8);
  l.set(12, 1, 'h').set(14, 1, 'h');
  l.pit(18, 21).set(19, 1, 'v').set(20, 1, 'v');
  l.block(25, 26, 2, 3);
  l.set(30, 2, 'e');
  l.set(33, 7, 's').set(34, 7, 's').set(35, 7, 's');
  l.set(39, 2, 'u');
  l.ow(40, 44, 7);
  l.fruit(41, 8, 26, 5, 58, 4, 80, 3);
  l.pit(48, 52).set(49, 1, 'v').set(51, 1, 'v');
  l.fake(56, 57);
  l.set(62, 2, '^').set(63, 2, '^');
  l.set(66, 5, 'b');
  l.set(68, 2, 'e').set(73, 2, 'e');
  l.set(77, 2, 'X');
  l.set(82, 2, 'D').set(88, 2, 'd');
  l.set(90, 2, 'R');
  return l.map();
}

// =====================================================================================
//  GÉNÉRATEUR : niveaux assemblés à partir de motifs (segments) déjà validés par le bot.
//  Chaque segment est séparé du suivant par au moins 4 cases de sol plat : le joueur peut
//  y reprendre son élan, ce qui garantit que chaque motif reste faisable.
// =====================================================================================
function mulberry(a) { let s = a >>> 0; return () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export const SEGMENTS = {
  plain: { w: () => 6, build: (l, c) => { l.fruit(c + 2, 3, c + 4, 3); } },
  gap2: { w: () => 8, build: (l, c) => { l.pit(c + 2, c + 3); l.fruit(c + 2, 4); } },
  gap3: { w: () => 9, build: (l, c) => { l.pit(c + 2, c + 4); l.fruit(c + 3, 5); } },
  spikes1: { w: () => 10, build: (l, c) => { l.set(c + 5, 2, '^'); } },
  spikes2: { w: () => 11, build: (l, c) => { l.set(c + 5, 2, '^').set(c + 6, 2, '^'); l.fruit(c + 5, 5); } },
  spikes3: { w: () => 12, build: (l, c) => { l.set(c + 5, 2, '^').set(c + 6, 2, '^').set(c + 7, 2, '^'); l.fruit(c + 6, 5); } },
  hidden1: { w: () => 11, build: (l, c) => { l.set(c + 5, 1, 'h'); } },
  hidden2: { w: () => 13, build: (l, c) => { l.set(c + 5, 1, 'h').set(c + 7, 1, 'h'); l.fruit(c + 6, 5); } },
  fake1: { w: () => 11, build: (l, c) => { l.fake(c + 5, c + 5); l.fruit(c + 3, 3); } },
  falling1: { w: () => 11, build: (l, c) => { l.set(c + 5, 6, 's'); l.fruit(c + 8, 3); } },
  falling3: { w: () => 13, build: (l, c) => { l.set(c + 5, 7, 's').set(c + 6, 7, 's').set(c + 7, 7, 's'); } },
  step1: { w: () => 10, build: (l, c) => { l.block(c + 3, c + 5, 2, 2); l.fruit(c + 4, 4); } },
  stairs: { w: () => 13, build: (l, c) => { l.block(c + 3, c + 9, 2, 2).block(c + 5, c + 7, 3, 3); l.fruit(c + 6, 5); } },
  bridge2: { w: () => 14, build: (l, c) => { l.pit(c + 1, c + 7); l.set(c + 2, 1, 'v').set(c + 5, 1, 'v'); l.fruit(c + 3, 4); } },
  bridge3: { w: () => 17, build: (l, c) => { l.pit(c + 1, c + 10); for (const j of [0, 1, 2]) l.set(c + 2 + 3 * j, 1, 'v'); l.fruit(c + 6, 4); } },
  bridge4: { w: () => 20, build: (l, c) => { l.pit(c + 1, c + 13); for (const j of [0, 1, 2, 3]) l.set(c + 2 + 3 * j, 1, 'v'); l.fruit(c + 6, 4, c + 12, 4); } },
  hiddenblock: { w: () => 12, build: (l, c) => { l.pit(c + 2, c + 4); l.set(c + 1, 5, 'b'); l.fruit(c + 3, 5); } },
  crab: { w: () => 20, build: (l, c) => { l.block(c + 1, c + 1, 2, 2).block(c + 15, c + 15, 2, 2); l.set(c + 8, 2, 'e'); l.fruit(c + 8, 5); } },
};
// du plus simple au plus corsé
const EASY = ['plain', 'gap2', 'spikes1', 'hidden1', 'fake1', 'falling1'];
const MID = ['gap3', 'spikes2', 'hidden2', 'step1', 'bridge2', 'falling3', 'hiddenblock'];
const HARD = ['stairs', 'bridge3', 'crab', 'spikes3'];
const EXPERT = ['bridge4'];

function pickSegments(R, d, n) {
  const pool = [...EASY];
  if (d > 0.18) pool.push(...MID);
  if (d > 0.4) pool.push(...HARD);
  if (d > 0.65) pool.push(...EXPERT);
  const out = []; let last = '';
  for (let i = 0; i < n; i++) {
    let k; let guard = 0;
    do { k = pool[Math.floor(R() * pool.length)]; guard++; } while (k === last && guard < 8);
    // les motifs durs sont plus fréquents quand la difficulté monte
    if (d > 0.5 && R() < 0.35) { const hp = HARD.concat(MID); k = hp[Math.floor(R() * hp.length)]; }
    out.push(k); last = k;
  }
  return out;
}
export const FINALES = [
  { w: 10, build: (l, c) => { l.set(c + 4, 2, 'D'); } },
  { w: 16, build: (l, c) => { l.set(c + 3, 2, 'X'); l.set(c + 9, 2, 'D'); } },
  { w: 12, build: (l, c) => { l.set(c + 4, 2, 'D'); l.set(c + 7, 2, 'R'); } },
  { w: 22, build: (l, c) => { l.set(c + 2, 2, 'X'); l.set(c + 8, 2, 'D').set(c + 14, 2, 'd'); l.set(c + 16, 2, 'R'); } },
];

/** Construit une carte. seed : graine, d : difficulté 0..1. */
export function generateMap(seed, d, extra = 0) {
  const R = mulberry(seed * 7919 + 17);
  const n = 3 + Math.round(d * 7) + extra;
  const segs = pickSegments(R, d, n);
  const fin = FINALES[d < 0.15 ? 0 : d < 0.4 ? (R() < 0.5 ? 0 : 1) : d < 0.7 ? 1 + Math.floor(R() * 2) : 1 + Math.floor(R() * 3)];
  const lead = (fin === FINALES[2] || fin === FINALES[3]) ? 8 : 0;      // le rocher se déclenche 11 cases avant lui : on laisse du terrain plat
  let total = 8;
  for (const k of segs) total += SEGMENTS[k].w();
  total += lead + fin.w + 4;
  const l = lv(total).ground(0, total - 1).set(2, 2, 'P');
  l.fruit(5, 3, 6, 3);
  let c = 8;
  for (const k of segs) { SEGMENTS[k].build(l, c, R); c += SEGMENTS[k].w(); }
  c += lead;
  fin.build(l, c, R);
  return l.map();
}

const difficultyName = (d) => (d < 0.25 ? 'diff.easy' : d < 0.55 ? 'diff.mid' : d < 0.8 ? 'diff.hard' : 'diff.vhard');

const raw = [
  ['forest', 'forest', 'Mandrosoa', 'sub.mandroso', L1, 90, 4],
  ['forest', 'forest', 'Ala Be', 'sub.alabe', L2, 100, 6],
  ['forest', 'forest', 'Ravinala', 'sub.ravinala', L3, 110, 8],
  ['forest', 'forest', 'Fandrika', 'sub.fandrika', L4, 120, 10],
  ['tsingy', 'tsingy', 'Vato', 'sub.vato', L5, 110, 8],
  ['tsingy', 'tsingy', 'Tendrombohitra', 'sub.tendro', L6, 120, 10],
  ['tsingy', 'tsingy', 'Lavaka', 'sub.lavaka', L7, 130, 12],
  ['tsingy', 'tsingy', 'Tsingy', 'sub.tsingy', L8, 140, 14],
  ['baobab', 'baobab', 'Reniala', 'sub.reniala', L9, 130, 12],
  ['baobab', 'baobab', 'Morondava', 'sub.morondava', L10, 150, 14],
  ['baobab', 'baobab', 'Andavadoaka', 'sub.andavadoaka', L11, 160, 16],
  ['baobab', 'baobab', 'Zanahary', 'sub.zanahary', L12, 180, 18],
];

// niveaux 5..20 de chaque monde : générés
const baseNames = { forest: 'Ala', tsingy: 'Tsingy', baobab: 'Reniala' };
const handmade = { forest: 4, tsingy: 4, baobab: 4 };
let seed = 1;
for (const w of ['forest', 'tsingy', 'baobab']) {
  for (let j = handmade[w]; j < 20; j++) {
    const d = Math.min(1, 0.1 + (j / 19) * 0.9 + (w === 'tsingy' ? 0.05 : w === 'baobab' ? 0.1 : 0));
    const dd = Math.min(1, d);
    const map = generateMap(seed++ + (w === 'tsingy' ? 100 : w === 'baobab' ? 200 : 0), dd);
    raw.push([w, w, `${baseNames[w]} ${j + 1}`, difficultyName(dd), () => map, Math.round(map[0].length * 1.0 + 25), Math.round(4 + dd * 16)]);
  }
}
// 10 lieux populaires de Madagascar (1 niveau chacun)
export const PLACES = [
  ['rova', 'Rova Manjakamiadana', 'Antananarivo'],
  ['nosybe', 'Nosy Be', 'Nosy Be'],
  ['boraha', 'Nosy Boraha', 'Sainte-Marie'],
  ['isalo', 'Isalo', 'Ranohira'],
  ['andasibe', 'Andasibe', 'sub.andasibe'],
  ['bemaraha', 'Tsingy Bemaraha', 'Morondava'],
  ['ranomafana', 'Ranomafana', 'Fianarantsoa'],
  ['antsirabe', 'Antsirabe', 'sub.antsirabe'],
  ['antsiranana', 'Antsiranana', 'Diego Suarez'],
  ['toliara', 'Toliara', 'Ifaty'],
  ['ambohimanga', 'Ambohimanga', 'sub.ambohimanga'],
  ['tritriva', 'Lac Tritriva', 'sub.tritriva'],
  ['ambre', 'Montagne d’Ambre', 'sub.ambre'],
  ['ankarafantsika', 'Ankarafantsika', 'sub.ankarafantsika'],
  ['komba', 'Nosy Komba', 'sub.komba'],
  ['iranja', 'Nosy Iranja', 'sub.iranja'],
  ['kirindy', 'Kirindy', 'sub.kirindy'],
  ['ankaratra', 'Ankaratra', 'sub.ankaratra'],
  ['tsaratanana', 'Tsaratanana', 'sub.tsaratanana'],
  ['tsiafajavona', 'Tsiafajavona', 'sub.tsiafajavona'],
];
PLACES.forEach(([theme, name, sub], i) => {
  const dd = i < 10 ? 0.3 + i * 0.07 : Math.min(1, 0.55 + (i - 10) * 0.05);   // les 10 derniers lieux sont les plus durs
  const map = generateMap(500 + i, dd);
  raw.push(['places', theme, name, sub, () => map, Math.round(map[0].length * 1.0 + 25), Math.round(4 + dd * 16)]);
});

// fond emblématique de chaque niveau (voir landmarks.js) : un décor lié au titre / au lieu
const LM_HAND = ['giantTrees', 'waterfall', 'ravinala', 'mountains', 'boulders', 'mountains', 'ravine', 'tsingyBig', 'baobabAlley', 'sunHalo', 'huts', 'sunHalo'];
const LM_CYCLE = { forest: ['giantTrees', 'waterfall', 'ravinala'], tsingy: ['tsingyBig', 'isalo', 'mountains', 'ravine', 'boulders'], baobab: ['baobabAlley', 'sunHalo', 'huts', 'baobabAlley'] };
const LM_PLACE = { bemaraha: 'tsingyBig', ranomafana: 'waterfall', ambre: 'waterfall', ankarafantsika: 'ravine', kirindy: 'baobabAlley', ankaratra: 'volcano', tsaratanana: 'peaks', tsiafajavona: 'volcanoBig', komba: 'lemurIsland', iranja: 'turtleIsland' };
let prevId = {};
const counters = {};
export const LEVELS = raw.map(([world, theme, name, sub, fn, par, parDeaths], i) => {
  const k = counters[world] = (counters[world] || 0) + 1;
  const landmark = i < 12 ? LM_HAND[i] : world === 'places' ? (LM_PLACE[theme] || theme) : LM_CYCLE[world][(k - 1) % LM_CYCLE[world].length];
  const lvl = { id: i + 1, world, theme, name, sub, par, parDeaths, map: fn(), prev: prevId[world] || 0, landmark };
  prevId[world] = lvl.id;
  return lvl;
});
// couleur d'accent de chaque monde (page « Dingana »)
export const WORLD_COLORS = { forest: '#43a047', tsingy: '#e0703a', baobab: '#a84ab0', places: '#1e9bd8' };