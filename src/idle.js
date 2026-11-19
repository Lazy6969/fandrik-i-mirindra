// Animations d'attente : après 10 s sans geste (menu) ou sans mouvement (jeu), chaque personnage joue son petit scénario.
// Dès que le joueur touche l'écran ou bouge, le personnage se réveille (petit saut, moins de 2 s).
import * as THREE from 'three';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const sm = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const TAU = Math.PI * 2;

// ------------------------------------------------------------------ textes / émojis en bulles
const txCache = new Map();
function textTexture(text) {
  if (txCache.has(text)) return txCache.get(text);
  const emoji = text.length <= 2 && /[^\x00-\x7f]/.test(text);
  const c = document.createElement('canvas'); c.width = emoji ? 64 : 192; c.height = 64; const x = c.getContext('2d');
  x.textAlign = 'center'; x.textBaseline = 'middle';
  if (text === 'GRIN') {                                                        // sourire inquiétant : bouche rouge, dents irrégulières
    c.width = 128; x.fillStyle = '#5a0a14'; x.beginPath(); x.moveTo(8, 22); x.quadraticCurveTo(64, 70, 120, 22); x.quadraticCurveTo(64, 46, 8, 22); x.fill();
    x.fillStyle = '#f2f0dc'; x.strokeStyle = '#3a2a1a'; x.lineWidth = 1.5;
    for (let i = 0; i < 11; i++) { const px = 14 + i * 9.4, h = 9 + (i * 7 % 6), top = 24 + Math.sin(i / 10 * 3.14) * 13 - 2; x.beginPath(); x.moveTo(px - 4, top); x.lineTo(px + (i % 2 ? 1 : -1), top + h); x.lineTo(px + 4, top); x.closePath(); x.fill(); x.stroke(); }
  } else if (emoji) { x.font = '46px "Segoe UI Emoji","Noto Color Emoji","Apple Color Emoji",sans-serif'; x.fillText(text, 32, 36); }
  else { x.font = 'bold 34px "Lilita One",sans-serif'; x.lineWidth = 8; x.strokeStyle = '#3a1a10'; x.strokeText(text, 96, 34); x.fillStyle = '#fff6c8'; x.fillText(text, 96, 34); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.keep = true; t.userData.aspect = c.width / c.height;
  txCache.set(text, t); return t;
}

// ------------------------------------------------------------------ scénarios (T = secondes dans le cycle)
// canaux : hy tête gauche/droite, hp tête haut(+)/bas(-), hr tête penchée, by/br/bs corps (hauteur, penche, étire),
// gx/gy/gry/grz déplacement et rotation du personnage entier, sc échelle, hs gonflement de la tête, hpull tête rentrée,
// arm[0..1] bras/pattes avant (négatif = levé vers l'avant), leg[0..3] pattes, tw battement de queue, ear oreilles,
// eye paupières (0 ouvert, 1 fermé), gaze regard divergent, vis transparence, hide disparition, tint [r,g,b,quantité],
// fxb intensité des effets au sol, shake secousse, tongue langue (0..1), spr bulles, liana corde.
const SCRIPTS = {
  kalanoro: [9, (T, c, h) => {                                                  // regarde autour, entend un bruit, se cache derrière le bras, sourit
    c.hy = Math.sin(T * 2.2) * 0.9 * h.env(0, 3, 0.3);
    const n = h.env(3, 3.8, 0.15); c.gy = 0.12 * n; c.hp = 0.3 * n; if (h.win(3, 3.8)) h.say('q', '❓', 0.1, h.top + 0.3, 0.36);
    const hd = h.env(3.8, 6.2, 0.45); c.arm[0] = -2.5 * hd; c.hp += -0.3 * hd; c.hy += 0.5 * hd; c.br = -0.1 * hd;
    if (h.win(6.2, 9)) { h.say('s', '😊', 0.1, h.top + 0.3, 0.36); c.gy = Math.abs(Math.sin(T * 5)) * 0.04; }
  }],
  maki: [11, (T, c, h) => {                                                     // se gratte la tête, regarde le joueur, petit saut, saute sur des lianes
    const g = h.env(0, 2.6, 0.4); c.arm[0] = (-1.7 + Math.sin(T * 9) * 0.25) * g; c.hp = -0.12 * g; c.hr = 0.2 * g;
    const l = h.env(2.6, 4.4, 0.5); c.gry = -0.75 * l; c.hp += 0.1 * l;
    if (h.win(4.4, 5.2)) c.gy = Math.abs(Math.sin((T - 4.4) / 0.8 * 3.14)) * 0.3;
    if (T >= 5.2 && T < 10.4) {                                                 // liane : saut, balancement, retour
      const up = sm((T - 5.2) / 0.8), down = sm((T - 9.6) / 0.8), hang = up * (1 - down);
      c.gy = 0.8 * hang; c.gx = Math.sin((T - 6) * 2.4) * 0.5 * hang * sm((T - 6) / 0.4); c.grz = 1.3 * hang - c.gx * 0.15; c.arm[0] = -2.6 * hang; c.arm[1] = -2.6 * hang;
      c.liana = { vis: clamp(up * 3) * (1 - clamp((T - 10) / 0.4)) };
    }
  }],
  fosa: [12, (T, c, h) => {                                                     // renifle l'air, regarde à gauche puis à droite, mange une viande
    const s = h.env(0, 3, 0.3); c.hp = (0.18 + Math.sin(T * 14) * 0.08) * s; c.br = -0.05 * s;
    c.hy = Math.sin((T - 3) * 1.9) * 0.95 * h.env(3, 6.5, 0.3);
    const e = h.env(6.5, 11, 0.4); c.hp += (-0.22 + Math.sin(T * 8) * 0.12) * e; if (h.win(6.6, 10.8)) h.say('m', '🍖', h.wid * 0.55, h.top * 0.55, 0.34);
  }],
  omby: [9, (T, c, h) => {                                                      // secoue la tête, souffle fort, gratte le sol du sabot
    c.hy = Math.sin(T * 12) * 0.5 * h.env(0, 2, 0.2); c.hr = Math.sin(T * 12) * 0.2 * h.env(0, 2, 0.2);
    const sn = h.env(2, 3.5, 0.2); c.bs = 0.05 * sn; c.hp = 0.25 * sn; if (h.win(2.1, 3.4)) h.say('f', '💨', h.wid * 0.55, h.top * 0.45, 0.4);
    const p = h.env(3.5, 9, 0.4), k = Math.abs(Math.sin(T * 5)); c.arm[0] = -(0.5 + 0.7 * k) * p; c.hp += -0.15 * p; c.fxb = 0.9 * p; if (p > 0.5 && k > 0.9) h.say('d', '💨', h.wid * 0.35, 0.18, 0.3);
  }],
  kisoa: [10, (T, c, h) => {                                                    // renifle le sol puis joue dans la boue
    const s = h.env(0, 3, 0.4); c.hp = (-0.4 + Math.sin(T * 12) * 0.08) * s; c.br = -0.12 * s;
    const m = h.env(3, 10, 0.5); c.grz = Math.sin(T * 6) * 0.14 * m; c.gy = Math.abs(Math.sin(T * 6)) * 0.1 * m; c.bs = Math.sin(T * 9) * 0.05 * m; c.hp += (-0.1 + Math.sin(T * 5) * 0.25) * m; c.fxb = 1.2 * m; c.tint = [0.42, 0.27, 0.12, 0.4 * sm((T - 3) / 2) * (T < 10 ? 1 : 0)];
  }],
  sahona: [8, (T, c, h) => {                                                    // gonfle ses joues, regarde le joueur, petit saut
    const g = h.env(0.1, 3, 0.5); c.hs = 0.32 * g + Math.sin(T * 6) * 0.03 * g; c.hp = 0.1 * g;
    c.gry = -0.8 * h.env(3, 5.2, 0.4);
    if (h.win(5.2, 6.4)) c.gy = Math.abs(Math.sin((T - 5.2) / 1.2 * 3.14)) * 0.32;
  }],
  saka: [9, (T, c, h) => {                                                      // mange un poisson
    const e = h.env(1.2, 7.8, 0.5);
    if (T > 0.3 && T < 8) h.say('fish', '🐟', h.wid * 0.7, h.top * 0.32, 0.4 * (0.4 + 0.6 * (1 - clamp((T - 2) / 5.8))));
    c.hp = (-0.24 + Math.sin(T * 8) * 0.1) * e; c.arm[0] = -0.7 * e; c.br = -0.05 * e;
    if (h.win(8, 9)) { c.hp = 0.1; h.say('yum', '😋', 0.1, h.top + 0.3, 0.36); }
  }],
  alika: [9, (T, c, h) => {                                                     // ronge un os, la queue bat
    const e = h.env(1.2, 7.6, 0.5);
    if (T > 0.3 && T < 8) h.say('bone', '🦴', h.wid * 0.68, h.top * 0.3, 0.36);
    c.tw = 0.8 * h.env(0, 9, 0.4); c.hp = (-0.26 + Math.sin(T * 10) * 0.08) * e; c.arm[0] = -0.6 * e;
    if (h.win(8, 8.9)) { c.hp = 0.2; h.say('w', 'Wouf !', h.wid * 0.5, h.top + 0.1, 0.55); }
  }],
  sifaka: [10, (T, c, h) => {                                                   // regarde ses mains puis danse sur place
    const m = h.env(0, 3, 0.4); c.hp = -0.3 * m; c.arm[0] = -1.0 * m; c.arm[1] = -1.0 * m;
    const d = h.env(3, 10, 0.4); c.gy = Math.abs(Math.sin(T * 4)) * 0.2 * d; c.gx = Math.sin(T * 2) * 0.35 * d; c.grz = Math.sin(T * 4) * 0.14 * d;
    c.arm[0] += (-1.7 + Math.sin(T * 4) * 0.5) * d; c.arm[1] += (-1.7 - Math.sin(T * 4) * 0.5) * d;
  }],
  ayeaye: [10, (T, c, h) => {                                                   // regarde dans le noir, tapote le sol, écoute
    c.hy = Math.sin(T * 1.8) * 0.9 * h.env(0, 3.5, 0.3); c.hp = 0.08 * h.env(0, 3.5, 0.3); c.gaze = 0.5 * h.env(0, 3.5, 0.3);
    const t = h.env(3.5, 6.5, 0.3); c.arm[0] = -(0.5 + 0.35 * Math.sin(T * 7)) * t; c.hp += -0.15 * t;
    const l = h.env(6.5, 10, 0.4); c.hp += 0.12 * l; c.hy += 0.55 * l; c.hr = 0.18 * l; c.ear = Math.sin(T * 6) * 0.3 * l;
  }],
  tana: [11, (T, c, h) => {                                                     // yeux dans deux directions, change de couleur, attrape des mouches
    const g = h.env(0, 3, 0.3); c.gaze = Math.sin(T * 3) * 0.9 * g; c.hy = Math.sin(T * 1.2) * 0.2 * g;
    c.tint = [1, 0.5, 0.15, 0.55 * h.env(3, 6.5, 0.8)];
    if (T >= 6.5) {
      const ph = (T - 6.5) % 2.4, fx0 = h.wid * 1.15, fy0 = h.top * 0.7, flit = ph < 0.9 ? 1 : 0;
      const strike = ph > 1.0 && ph < 1.55 ? Math.sin((ph - 1.0) / 0.55 * Math.PI) : 0;   // 1 = la langue touche la mouche
      c.tongue = strike; c.tongueTo = { x: fx0, y: fy0 }; c.hp = 0.12 * (strike > 0 ? 1 : 0);
      if (ph < 1.3) h.say('fly', '🪰', fx0 + Math.sin(ph * 5) * 0.12 * flit, fy0 + Math.sin(ph * 7) * 0.08 * flit, 0.24);   // avalée au moment du contact
    }
  }],
  tenrec: [9, (T, c, h) => {                                                    // se met en boule puis ressort doucement
    const curl = T < 1.5 ? sm(T / 1.5) : T < 5 ? 1 : 1 - sm((T - 5) / 2.5);
    c.sc = -0.3 * curl; c.grz = -1.25 * curl; c.eye = curl; c.by = -0.05 * curl; if (curl > 0.9) c.gy = Math.sin(T * 18) * 0.012;
  }],
  lolo: [9, (T, c, h) => {                                                      // corps transparent, regarde le joueur avec un sourire effrayant
    c.vis = 1 - 0.55 * h.env(0, 9, 1.0); c.gry = -0.9 * h.env(0.5, 8, 0.6); c.gy = Math.sin(T * 2) * 0.05 * h.env(0, 9, 1);
    if (h.win(2, 8)) { h.say('GRIN', 'GRIN', h.wid * 0.5, h.top * 0.8, 0.52, clamp(Math.min(T - 2, 8 - T) / 0.6)); c.tint = [0.7, 0.1, 0.1, 0.0]; }
  }],
  vazimba: [10, (T, c, h) => {                                                  // ferme les yeux, écoute la forêt, rouvre lentement les yeux
    c.eye = T < 1 ? sm(T) : T < 7 ? 1 : 1 - sm((T - 7) / 2); c.hp = 0.06 * clamp(c.eye); c.hr = 0.1 * clamp(c.eye);
    if (T > 1.5 && T < 7) { h.say('l1', '🍃', Math.sin(T * 1.5) * h.wid * 0.7, h.top * 0.9 + Math.sin(T * 2) * 0.15, 0.25); h.say('l2', '🍃', Math.cos(T * 1.2) * h.wid * 0.7, h.top * 0.6 + Math.cos(T * 1.7) * 0.15, 0.22); }
  }],
  angatra: [8, (T, c, h) => {                                                   // tourne la tête vers le joueur, disparaît une seconde, réapparaît
    c.gry = -0.8 * h.env(0, 3.2, 0.5); c.hy = 0.2 * h.env(0, 3, 0.4);
    if (T >= 3.2 && T < 4.4) { c.hide = 1; if (T < 3.4) h.say('p', '💨', 0, h.top * 0.5, 0.5); }
    if (T >= 4.4 && T < 5.2) { c.sc = 0.14 * Math.sin((T - 4.4) / 0.8 * 3.14); h.say('p2', '✨', 0, h.top * 0.5, 0.4); }
    c.gy = Math.sin(T * 2) * 0.05;
  }],
  trimobe: [10, (T, c, h) => {                                                  // se frappe le ventre, bâille, grogne
    const b = h.env(0, 4, 0.3), k = Math.abs(Math.sin(T * 5)); c.arm[0] = (-0.5 - k * 0.7) * b; c.arm[1] = (-0.5 - (1 - k) * 0.7) * b; c.bs = -k * 0.03 * b;
    if (b > 0.5 && k > 0.93) h.say('b', 'Poum !', h.wid * 0.5, h.top * 0.5, 0.5);
    const y = h.env(4, 7, 0.6); c.hp = 0.45 * y; c.eye = y; c.bs += 0.05 * y; if (h.win(4.5, 7)) h.say('y', 'Hâaa…', h.wid * 0.5, h.top + 0.15, 0.55);
    if (h.win(7.1, 9)) { c.gy = Math.sin(T * 25) * 0.015; c.hp = -0.1; h.say('g', 'Grrr !', h.wid * 0.5, h.top + 0.1, 0.55); }
  }],
  tortue: [9, (T, c, h) => {                                                    // rentre la tête, le cou et les pattes dans la carapace, puis ressort lentement
    const p = T < 1.5 ? sm(T / 1.5) : T < 5.5 ? 1 : 1 - sm((T - 5.5) / 3);
    c.hpull = p; c.legpull = p; c.by = -h.legH * 0.9 * p; c.eye = p;
  }],
  sorciere: [9, (T, c, h) => {                                                  // sort son bâton, fait apparaître une étincelle, la fait disparaître
    c.wand = h.env(0.2, 7.2, 0.5); const r = h.env(0.6, 6.6, 0.5); c.arm[1] = -1.55 * r + Math.sin(T * 5) * 0.12 * r; c.hy = -0.2 * r;
    if (T > 2.4 && T < 5) { const p = (T - 2.4) / 2.6; h.say('sp', '✨', h.wid * 0.95, h.top * 0.75 + Math.sin(T * 6) * 0.05, 0.26 + 0.2 * Math.sin(p * 3.14)); c.fxb = 1; }
  }],
  darafify: [10, (T, c, h) => {                                                 // regarde le ciel, déploie ses ailes puis les referme
    c.hp = 0.5 * h.env(0, 3.2, 0.5);
    const w = h.env(3, 6.8, 0.6); c.arm[0] = (-1.7 + Math.sin(T * 7) * 0.35) * w; c.arm[1] = (-1.7 + Math.sin(T * 7 + 0.6) * 0.35) * w; c.gy = 0.06 * w * Math.abs(Math.sin(T * 7)); c.fxb = 1.4 * w; c.bs = 0.04 * w;
  }],
  rapeto: [9, (T, c, h) => {                                                    // regarde ses mains, tape du pied, fait trembler le sol
    const m = h.env(0, 3, 0.4); c.hp = -0.35 * m; c.arm[0] = -0.9 * m; c.arm[1] = -0.9 * m;
    const s = h.env(3, 9, 0.4), k = Math.sin(T * 3.2); c.leg[0] = -0.8 * Math.max(0, k) * s; c.gy = Math.max(0, -k) * 0.04 * s;
    if (s > 0.5 && k < -0.93) { c.shake = 1; h.say('st', 'BOUM !', h.wid * 0.3, 0.25, 0.5); } c.fxb = 0.8 * s;
  }],
  ikotofetsy: [10, (T, c, h) => {                                               // regarde autour discrètement, vole une pièce et la cache
    c.hy = Math.sin(T * 2.3) * 0.9 * h.env(0, 3, 0.3);
    const s = h.env(3, 6.2, 0.4); c.bs = -0.07 * s; c.arm[1] = -1.2 * s;
    if (T > 3.4 && T < 6) { const p = clamp((T - 4.6) / 1.2); h.say('c', '🪙', h.wid * 0.55 * (1 - p), h.top * 0.55 * (1 - 0.4 * p), 0.3 * (1 - 0.5 * p), 1 - p * 0.9); }
    c.hy += Math.sin(T * 9) * 0.5 * h.env(6.2, 8, 0.2);
  }],
  imahaka: [9, (T, c, h) => {                                                   // immobile comme un prédateur puis ouvre brusquement les yeux
    if (T < 5.5) { c.eye = 0.65; c.br = -0.04; c.hp = -0.05; c.by = -0.03 + Math.sin(T * 1.5) * 0.008; }
    else if (T < 6.4) { c.gx = 0.28 * Math.sin((T - 5.5) / 0.9 * 3.14); c.hp = 0.2; c.br = -0.1; h.say('!', '❗', 0.1, h.top + 0.3, 0.4); }
  }],
  ibonia: [10, (T, c, h) => {                                                   // main sur son arme, regarde au loin, pose héroïque
    const k = h.env(0, 10, 0.8); c.arm[1] = -0.55 * k; c.hp = 0.15 * k; c.hy = -0.3 * k; c.bs = 0.05 * k; c.br = 0.08 * k; c.gry = -0.45 * k + Math.sin(T * 0.8) * 0.03;
    if (T > 3 && T < 9) h.say('g', '✨', h.wid * 0.5 + Math.sin(T) * 0.1, h.top + 0.1, 0.26 + 0.1 * Math.sin(T * 4), 0.5 + 0.5 * Math.sin(T * 3));
  }],
  ikotobekibo: [10, (T, c, h) => {                                              // se tient le ventre, regarde autour, cherche à manger
    const l = h.env(0, 4, 0.4); c.arm[0] = -0.7 * l; c.arm[1] = -0.7 * l; c.bs = Math.sin(T * 9) * 0.04 * l; c.gy = Math.abs(Math.sin(T * 9)) * 0.05 * l; if (h.win(0.3, 4)) h.say('l', '😂', 0.1, h.top + 0.3, 0.38);
    c.hy = Math.sin((T - 4) * 2) * 0.9 * h.env(4, 7, 0.3);
    const s = h.env(7, 10, 0.4); c.hp = (-0.2 + Math.sin(T * 10) * 0.1) * s; if (h.win(8.8, 10)) h.say('a', '🍎', h.wid * 0.55, h.top * 0.5, 0.3);
  }],
  zazavavindrano: [12, (T, c, h) => {                                           // nage, puis sa queue devient deux jambes avec une jupe
    const swim = h.env(0, 4.4, 0.8);
    c.br = -1.15 * swim; c.by = -0.12 * swim; c.arm[0] = (Math.sin(T * 4.5) * 1.3 - 0.3) * swim; c.arm[1] = (-Math.sin(T * 4.5) * 1.3 - 0.3) * swim; c.gy = Math.sin(T * 2) * 0.04 * swim; c.fxb = 1.4 * swim;
    c.human = T < 4.4 ? 0 : T < 6.4 ? sm((T - 4.4) / 2) : T < 9.8 ? 1 : T < 11.8 ? 1 - sm((T - 9.8) / 2) : 0;
    if ((T > 4.6 && T < 6.4) || (T > 10 && T < 11.8)) h.say('sp', '✨', 0, h.top * 0.35, 0.4 + 0.1 * Math.sin(T * 8));
    if (T > 6.4 && T < 9.8) { c.arm[0] += Math.sin(T * 3) * 0.35; c.arm[1] -= Math.sin(T * 3) * 0.35; c.grz = Math.sin(T * 1.6) * 0.04; h.say('s', '😊', 0.1, h.top + 0.3, 0.36); }
  }],
};
const DEFAULT = [8, (T, c, h) => { c.hy = Math.sin(T * 1.4) * 0.8 * h.env(0, 8, 0.5); }];

// ------------------------------------------------------------------ postures de saut (A.t = temps en l'air, A.sp = vitesse horizontale 0..1, A.up = montée)
const JDEF = (A, c) => { c.tuck = 0.3; };
const JUMPS = {
  kalanoro: (A, c) => { c.grz = -0.05 - 0.16 * A.sp; c.arm = [-1.5, -1.5]; c.tuck = 0.55; c.hp = -0.05; c.curls = 1; },           // cheveux qui se défont en boucles
  maki: (A, c) => { c.arm = [-2.1, -2.1]; c.tuck = 0.5; c.grz = 0.95; c.hp = 0.1; c.tail = 0.4; },                                  // bras en haut, accroché à une liane
  fosa: (A, c) => { c.sx = 0.12; c.fleg = -1.0; c.bleg = 0.9; c.grz = -0.1; c.tail = 0.3; },                                       // corps allongé, pattes avant tendues
  omby: (A, c, h) => { const p = clamp(1 - A.t / 0.22); c.bleg = 1.3 * p + 0.3; c.fleg = -0.3; c.tuck = 0.35 * (1 - p); c.bs = 0.05 * p; c.grz = 0.06; if (A.t < 0.3) h.say('d', '💨', -h.wid * 0.5, 0.15, 0.45, 1 - A.t / 0.3); },   // impulsion des pattes arrière
  kisoa: (A, c) => { c.bs = -0.04; c.tuck = 0.5; c.ear = Math.sin(A.t * 22) * 0.5; c.grz = Math.sin(A.t * 9) * 0.1; c.hp = 0.1; },   // petit saut maladroit, oreilles qui bougent
  sahona: (A, c) => { const u = sm((A.t - 0.22) / 0.25); c.bleg = A.t < 0.22 ? 1.4 * sm(A.t / 0.22) : 1.4 * (1 - u) + 0.9 * u; c.tuck = 0.5 * (1 - sm((A.t - 0.22) / 0.3)); c.fleg = -0.7; c.bs = 0.08 * sm((A.t - 0.2) / 0.2); c.grz = 0.3; },   // charge puis grand bond de grenouille
  saka: (A, c) => { c.fleg = -0.9; c.bleg = 0.5; c.gry = 0.5 * Math.sin(clamp(A.t / 0.8) * Math.PI); c.tail = 0.6; c.bs = 0.03; },   // saut souple avec légère rotation
  alika: (A, c) => { c.fleg = -1.1; c.bleg = 0.6; c.ear = Math.sin(A.t * 26) * 0.45; c.tw = 0.9; c.tail = 0.35; c.grz = -0.05; },   // oreilles et queue dans le vent
  sifaka: (A, c) => { c.grz = 1.05; c.arm = [-1.8, -1.8]; c.gry = Math.sin(A.t * 10) * 0.3; c.tuck = 0.3; },                       // corps vertical, bras écartés, mouvement de danse
  ayeaye: (A, c) => { c.tuck = 0.55; c.bs = -0.05; c.hp = -0.2; c.arm = [-2.0, -2.0]; c.grz = 0.9; },                              // recroquevillé, longs doigts ouverts, accroché à une branche
  tana: (A, c) => { c.fleg = -0.8; c.bleg = 0.8; c.tail = 1.2; c.grz = A.t < 0.45 ? 0.5 : -0.15; },                                // attrape une branche avec la queue puis se lance
  tenrec: (A, c) => { c.tuck = 0.8; c.sc = -0.1; c.grz = -0.12; },                                                                  // corps compact
  lolo: (A, c) => { c.vis = 0.55; c.arm = [-0.8 + Math.sin(A.t * 6) * 0.3, -0.8 - Math.sin(A.t * 6) * 0.3]; c.gy = 0.22 + Math.sin(A.t * 8) * 0.04; c.grz = -0.1; },   // il lévite, translucide
  vazimba: (A, c, h) => { c.tuck = 0.7; c.arm = [-1.5, -1.5]; c.bs = -0.04; if (A.t < 0.8) h.say('mist', '☁️', -h.wid * 0.4, 0.25, 0.7, 1 - A.t / 0.8); },   // accroupi, petite brume
  angatra: (A, c) => { c.gy = 0.15; c.grz = -0.08 * A.sp; c.vis = 0.85; c.hp = 0.05; },                                            // monte droit comme un fantôme
  trimobe: (A, c) => { c.tuck = 0.35; c.bs = -0.05; c.fleg = -0.2; if (A.t < 0.12) c.shake = 1; },                                  // genoux pliés, la caméra tremble
  tortue: (A, c) => { c.grz = -0.25; c.gry = Math.sin(A.t * 6) * 0.25; c.tuck = 0.6; },                                            // carapace inclinée qui tourne
  sorciere: (A, c, h) => { c.broom = 1; c.tuck = 0.5; c.fleg = -1.0; c.arm = [-1.2, 0]; c.gy = 0.12; c.grz = A.up ? 0.2 : -0.15;   // assise sur son balai, traînée magique
    for (let i = 0; i < 4; i++) h.say('tr' + i, '✨', -h.wid * (0.9 + i * 0.35), h.top * 0.22 + Math.sin(A.t * 9 + i * 1.7) * 0.07, 0.34 - i * 0.05, 0.95 - i * 0.2); },
  darafify: (A, c) => { c.arm = [-1.55 + Math.sin(A.t * 9) * 0.3, -1.55 - Math.sin(A.t * 9) * 0.3]; c.grz = -0.35; c.bleg = 0.5; c.fxb = 1.4; },   // ailes grandes ouvertes
  rapeto: (A, c) => { c.tuck = 0.5; c.arm = [-1.5, -1.5]; c.bs = 0.04; if (A.t < 0.12) c.shake = 0.6; },                           // énorme bond de géant
  ikotofetsy: (A, c) => { c.tuck = 0.6; c.bs = -0.05; c.hp = -0.2; c.arm = [-2.0, -2.0]; c.grz = 0.9; },                           // accroupi, se balance à une corde
  imahaka: (A, c, h) => { c.grz = -0.6; c.fleg = -0.8; c.bleg = 0.8; if (A.t < 0.5) h.say('sp', '💦', -h.wid * 0.3, 0.2, 0.55, 1 - A.t / 0.5); },   // bond de crocodile
  ibonia: (A, c) => { c.leg = [-0.9, 0.5, 0, 0]; c.arm = [0, -2.4]; c.hp = 0.1; c.bs = 0.03; },                                    // une jambe en avant, arme levée
  ikotobekibo: (A, c) => { c.br = -0.1; c.arm = [Math.sin(A.t * 14) * 1.6, Math.cos(A.t * 14) * 1.6]; c.bs = 0.04; },              // bras qui moulinent
  zazavavindrano: (A, c, h) => { c.grz = A.up ? 0.25 : -0.9; c.arm = [-1.5, -1.5]; c.fxb = 1.8; if (A.t < 0.5) h.say('wv', '🌊', 0, 0.25, 0.7, 1 - A.t / 0.5); },   // plonge dans une vague
};
export const HANG = { maki: 'hands', ayeaye: 'hands', ikotofetsy: 'hands', tana: 'tail' };   // personnages qui s'accrochent à une liane / branche en sautant

/** point (monde) où se trouvent les mains (ou la queue) : la liane s'y attache pour que les mains la touchent vraiment */
export function handPoint(a, kind = 'hands') {
  const rig = a.rig, out = new THREE.Vector3(), v = new THREE.Vector3(); let n = 0;
  a.group.updateWorldMatrix(true, true);
  if (kind === 'tail' && rig.tail) { v.set(-0.25, 0.1, 0); rig.tail.localToWorld(v); return out.copy(v); }
  const arms = rig.arms && rig.arms.length >= 2 ? rig.arms : (rig.legs || []).filter((l) => l.front);
  for (const am of arms) { v.set(0, -(am.len || 0.4), 0); am.pv.localToWorld(v); out.add(v); n++; }
  return n ? out.multiplyScalar(1 / n) : a.group.getWorldPosition(out);
}

// ------------------------------------------------------------------ moteur
const blank = () => ({ hy: 0, hp: 0, hr: 0, by: 0, br: 0, bs: 0, gx: 0, gy: 0, gry: 0, grz: 0, sc: 0, hs: 0, hpull: 0, legpull: 0, fleg: 0, bleg: 0, tuck: 0, tail: 0, sx: 0, broom: 0, curls: 0, human: 0, tongueTo: null, tw: 0, ear: 0, eye: 0, gaze: 0, vis: 1, hide: 0, tint: null, fxb: 0, shake: 0, tongue: 0, tongueLen: 0, wand: 0, liana: null, arm: [0, 0], leg: [0, 0, 0, 0], spr: [] });
const tmp = new THREE.Vector3();

function setup(a) {
  const g = a.group, rig = a.rig;
  g.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(g), ws = g.getWorldScale(new THREE.Vector3());
  const top = g.worldToLocal(box.max.clone()).y;
  const S = a.idle = {
    jw: 0, jt: 0, w: 0, it: 0, wake: 0, on: false, prev: { x: 0, y: 0, ry: 0, rz: 0 }, top, wid: Math.max(0.5, Math.max(box.max.x - box.min.x, box.max.z - box.min.z) / ws.x * 0.45),
    hy0: rig.head ? rig.head.rotation.y : 0, hx0: rig.head ? rig.head.rotation.x : 0, hpx0: rig.head ? rig.head.position.x : 0, hpy0: rig.head ? rig.head.position.y : 0, hs0: rig.head ? rig.head.scale.x : 1,
    eyes: [], mats: null, spr: {}, hidden: false, fxb: 0, shake: 0, extras: {},
  };
  g.traverse((o) => { if (o.userData && o.userData.eye) S.eyes.push({ o, y0: o.scale.y, z0: o.position.z, kind: o.userData.eye, side: Math.sign(o.position.z) || 1 }); });
  return S;
}
function ensureMats(a, S) {
  if (S.mats) return S.mats; S.mats = [];
  a.group.traverse((o) => {
    if (!o.isMesh || o.userData.noIdle) return;
    const cl = (m) => { const n = m.clone(); n.userData.keep = false; S.mats.push({ m: n, c0: n.color ? n.color.clone() : null }); return n; };
    o.material = Array.isArray(o.material) ? o.material.map(cl) : cl(o.material);
  });
  return S.mats;
}
const tintTarget = new THREE.Color();

export function idleAnim(a, id, st) {
  const rig = a.rig, g = a.group;
  if (!rig || !rig.body) return;
  const S = a.idle || setup(a);
  const dt = st.dt || 0.016;
  const jh = typeof window !== 'undefined' && window.__jumpTime !== undefined;                // outil de test : fige la posture de saut
  const air = st.on === false || jh;                                                    // le personnage est en l'air : posture de saut
  S.jw += ((air ? 1 : 0) - S.jw) * Math.min(1, dt * (air ? 16 : 9)); if (jh) { S.jt = window.__jumpTime; S.jw = 1; } else if (air) S.jt += dt; else if (S.jw < 0.02) S.jt = 0;
  const want = !air && ((st.idleFor || 0) > 10 || (typeof window !== 'undefined' && window.__idleTime !== undefined)) ? 1 : 0;
  if (typeof window !== 'undefined' && window.__idleTime !== undefined) { S.it = window.__idleTime; S.w = 1; S.on = true; }   // outil de test : fige le scénario à l'instant demandé
  if (S.on && !want && S.w > 0.4) S.wake = 1;
  S.on = !!want;
  S.w += (want - S.w) * Math.min(1, dt * (want ? 2.2 : 1.3));
  if (!want && S.w < 0.01) { S.w = 0; S.it = 0; }
  if (want) S.it += dt;
  S.wake = Math.max(0, S.wake - dt * 1.3);
  const w = S.w, [period, fn] = SCRIPTS[id] || DEFAULT, T = S.it % period;
  const c = blank(); let k = w;
  const hl = (cc) => ({
    top: S.top, wid: S.wid, legH: rig.legH || 0.3,
    win: (x, y) => T >= x && T < y,
    env: (x, y, ramp = 0.4) => (T < x || T >= y) ? 0 : sm(Math.min((T - x) / ramp, (y - T) / ramp)),
    say: (key, text, x, y, size, op = 1) => cc.spr.push({ k: key, text, x, y, size, op }),
  });
  if (S.jw > 0.03) {                                                              // posture de saut propre au personnage
    const A = { t: S.jt, vy: st.vy || 0, vx: st.vx || 0, sp: clamp(Math.abs(st.vx || 0) / 7), up: (st.vy || 0) > 0 };
    (JUMPS[id] || JDEF)(A, c, hl(c)); k = S.jw; S.mode = 'jump';
  } else {
    if (w > 0.002 || S.wasActive) fn(T, c, hl(c));
    S.wasActive = w > 0.002; S.mode = 'idle';
  }
  // --- tête
  if (rig.head) {
    rig.head.rotation.z += c.hp * k; rig.head.rotation.y = S.hy0 + c.hy * k; rig.head.rotation.x = S.hx0 + c.hr * k;
    const sc = S.hs0 * (1 + c.hs * k) * (1 - 0.9 * c.hpull * k);
    rig.head.scale.setScalar(sc); rig.head.position.x = S.hpx0 * (1 - 0.95 * c.hpull * k); rig.head.position.y = S.hpy0 * (1 - 0.45 * c.hpull * k);
  }
  rig.body.position.y += c.by * k; rig.body.rotation.z += c.br * k;
  g.scale.y *= 1 + c.bs * k; if (c.sx) g.scale.x *= 1 + c.sx * k; if (c.sc) g.scale.multiplyScalar(1 + c.sc * k);
  // --- membres
  const arms = rig.arms && rig.arms.length >= 2 ? rig.arms : (rig.legs || []).filter((l) => l.front);
  for (let i = 0; i < 2; i++) if (arms[i] && c.arm[i]) arms[i].pv.rotation.z += c.arm[i] * k;
  for (let i = 0; i < 4; i++) if (rig.legs && rig.legs[i] && c.leg[i]) rig.legs[i].pv.rotation.z += c.leg[i] * k;
  if (rig.legs && (c.fleg || c.bleg)) rig.legs.forEach((l) => { l.pv.rotation.z += (l.front ? c.fleg : c.bleg) * k; });
  if (rig.legs && (c.legpull || c.tuck || S.legsPulled)) { const f = clamp(1 - 0.9 * c.legpull * k - 0.55 * c.tuck * k, 0.08, 1); rig.legs.forEach((l) => l.pv.scale.set(1, f, 1)); S.legsPulled = f < 0.999; }
  if (rig.tail && c.tail) rig.tail.rotation.z += c.tail * k;
  if (rig.tail && c.tw) rig.tail.rotation.z += Math.sin(S.it * 15) * c.tw * k;
  if (rig.ears && c.ear) rig.ears.forEach((e) => { e.rotation.z += c.ear * k; });
  // --- yeux : paupières et regard
  if (S.eyes.length) for (const e of S.eyes) {
    e.o.scale.y = e.y0 * (1 - 0.93 * clamp(c.eye * k));
    if (e.kind === 'iris') e.o.position.z = e.z0 + e.side * c.gaze * k * Math.abs(e.z0) * 0.3;
  }
  // --- transparence / couleur / disparition
  if (c.vis < 1 || c.tint || S.mats) {
    const mats = ensureMats(a, S), op = 1 - (1 - c.vis) * k;
    for (const e of mats) {
      e.m.transparent = op < 0.99; e.m.opacity = op; e.m.depthWrite = op > 0.95;
      if (e.c0) { if (c.tint && c.tint[3] > 0) { tintTarget.setRGB(c.tint[0], c.tint[1], c.tint[2]); e.m.color.copy(e.c0).lerp(tintTarget, c.tint[3] * k); } else e.m.color.copy(e.c0); }
    }
  }
  if (c.hide * k > 0.5) { g.visible = false; S.hidden = true; } else if (S.hidden) { g.visible = true; S.hidden = false; }
  // --- déplacement et rotation du personnage entier (le menu ne réinitialise pas le groupe : on retire l'effet précédent)
  let gy = c.gy * k + (S.wake > 0 ? Math.sin(S.wake * Math.PI) * 0.2 : 0), gx = c.gx * k, gry = c.gry * k, grz = c.grz * k;
  const P = S.prev;
  if (!st.reset) { g.position.y -= P.y; g.position.x -= P.x; g.rotation.y -= P.ry; }
  if (!st.reset) g.rotation.z -= P.rz;
  g.rotation.z += grz;
  g.position.y += gy; g.position.x += gx; g.rotation.y += gry;
  P.x = gx; P.y = gy; P.ry = gry; P.rz = grz;
  S.fxb = c.fxb * k; S.shake = c.shake * k;
  // --- bulles, émojis, langue, bâton, liane
  updateSprites(g, S, c, k);
  updateExtras(g, rig, S, c, k, a);
}

function updateSprites(g, S, c, k) {
  const seen = new Set();
  for (const s of c.spr) {
    seen.add(s.k);
    let sp = S.spr[s.k];
    if (!sp || sp.userData.text !== s.text) {
      if (sp) { g.remove(sp); sp.material.dispose(); }
      sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: textTexture(s.text), transparent: true, depthWrite: false, depthTest: false, fog: false }));
      sp.userData.text = s.text; sp.renderOrder = 20; g.add(sp); S.spr[s.k] = sp;
    }
    const asp = sp.material.map.userData.aspect || 1;
    sp.visible = true; sp.position.set(s.x, s.y, 0.05); sp.scale.set(s.size * asp, s.size, 1); sp.material.opacity = clamp(s.op * k * 1.5);
  }
  for (const key in S.spr) if (!seen.has(key)) S.spr[key].visible = false;
}

function updateExtras(g, rig, S, c, k, a) {
  const E = S.extras;
  if (c.tongue > 0.01 && rig.head && c.tongueTo) {                              // langue du caméléon : elle va jusqu'à la mouche
    if (!E.tongue) { E.tongue = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.026, 1, 6), new THREE.MeshBasicMaterial({ color: 0xe0506a })); g.add(E.tongue); }
    rig.head.getWorldPosition(tmp); g.worldToLocal(tmp);
    const sx = tmp.x + (rig.hr || 0.1) * 0.9, sy = tmp.y - (rig.hr || 0.1) * 0.15, dx = c.tongueTo.x - sx, dy = c.tongueTo.y - sy, dist = Math.hypot(dx, dy), len = Math.max(0.02, dist * c.tongue);
    E.tongue.visible = true; E.tongue.scale.set(1, len, 1); E.tongue.rotation.z = Math.atan2(-dx, dy);
    E.tongue.position.set(sx + (dx / dist) * len / 2, sy + (dy / dist) * len / 2, 0);
  } else if (E.tongue) E.tongue.visible = false;
  if (rig.tail && rig.body && (c.human > 0.01 || E.human)) {                   // sirène : la queue devient deux jambes humaines et une jupe
    if (!E.human && c.human > 0.01) {
      const hg = new THREE.Group(), skin = new THREE.MeshStandardMaterial({ color: 0xf2cfae, roughness: 0.6 }), cloth = new THREE.MeshStandardMaterial({ color: 0x2fb8a8, roughness: 0.55, side: THREE.DoubleSide });
      E.legs = [];
      for (const z of [1, -1]) {
        const pv = new THREE.Group(); pv.position.set(0, -0.06, 0.075 * z);
        const th = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.032, 0.7, 10), skin); th.position.y = -0.35; pv.add(th);
        const ft = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), skin); ft.scale.set(1.5, 0.6, 1); ft.position.set(0.05, -0.72, 0); pv.add(ft);
        hg.add(pv); E.legs.push(pv);
      }
      const sk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.33, 0.36, 18, 1, true), cloth); sk.position.y = -0.14; hg.add(sk);
      const hem = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.018, 6, 24), new THREE.MeshStandardMaterial({ color: 0xff8fb1 })); hem.rotation.x = Math.PI / 2; hem.position.y = -0.32; hg.add(hem);
      rig.body.add(hg); E.human = hg;
    }
    if (E.human) {
      const hm = clamp(c.human * k);
      E.human.visible = hm > 0.01; E.human.scale.set(1, Math.max(0.01, hm), 1); E.human.position.y = 0;
      rig.tail.scale.setScalar(Math.max(0.001, 1 - hm)); rig.tail.visible = hm < 0.98;
      const w = Math.sin(S.it * 3) * 0.35 * hm; E.legs[0].rotation.z = w; E.legs[1].rotation.z = -w;
    }
  }
  if (c.broom * k > 0.05) {                                                     // balai de la sorcière en vol
    if (!E.broom) {
      const b = new THREE.Group(), wd = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.3, 7), new THREE.MeshStandardMaterial({ color: 0x6a3a1a }));
      const br = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.4, 9), new THREE.MeshStandardMaterial({ color: 0xc8a24a })); br.rotation.z = Math.PI / 2; br.position.x = -0.78;
      b.add(wd, br); wd.rotation.z = Math.PI / 2; b.position.set(0, S.top * 0.3, 0); E.broom = b; g.add(b);
    }
    E.broom.visible = true; E.broom.scale.setScalar(clamp(c.broom * k * 1.5));
  } else if (E.broom) E.broom.visible = false;
  if (rig.head && (c.curls * k > 0.05 || E.curls)) {                            // Kalanoro : ses cheveux se défont en boucles
    if (!E.curls && c.curls * k > 0.05) {
      const cg = new THREE.Group(), cm = new THREE.MeshStandardMaterial({ color: 0x5a3320, roughness: 0.7 });
      for (let i = 0; i < 9; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.016, 6, 14, 4.8), cm); const an = (i / 9) * 6.28; t.position.set(Math.cos(an) * 0.2, 0.04 + Math.sin(i * 2.3) * 0.12, Math.sin(an) * 0.2); t.rotation.set(an, i, 0); cg.add(t); }
      rig.head.add(cg); E.curls = cg;
    }
    if (E.curls) { const cv = clamp(c.curls * k); E.curls.visible = cv > 0.02; E.curls.scale.setScalar(Math.max(0.01, cv * 1.1)); E.curls.rotation.y += 0.04; }
  }
  if (c.wand > 0.01 && rig.arms && rig.arms[1]) {                              // bâton de la sorcière (au bout du bras)
    if (!E.wand) { E.wand = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.025, 0.6, 6), new THREE.MeshStandardMaterial({ color: 0x6a3a1a })); E.wand.position.set(0, -(rig.arms[1].len || 0.5) - 0.18, 0); rig.arms[1].pv.add(E.wand); }
    E.wand.visible = true; E.wand.scale.setScalar(clamp(c.wand * k * 1.6));
  } else if (E.wand) E.wand.visible = false;
  if (c.liana && c.liana.vis > 0.01 && g.parent) {                             // liane courte, accrochée à une petite branche bien visible juste au-dessus
    if (!E.liana) E.liana = makeLiana();
    if (E.liana.parent !== g.parent) g.parent.add(E.liana);
    const hp = handPoint(a, 'hands'); g.parent.worldToLocal(hp);
    const baseX = g.position.x - S.prev.x;
    placeLiana(E.liana, baseX, hp.y + 1.0, hp.x, hp.y, clamp(c.liana.vis));
  } else if (E.liana) E.liana.visible = false;
}

/** liane (corde verte + petite branche feuillue au sommet) : le début de la liane est toujours visible */
export function makeLiana() {
  const grp = new THREE.Group(), mat = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 });
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.036, 1, 6), mat(0x4f8a32));
  const br = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.065, 0.9, 7), mat(0x6b4a2c)); br.rotation.z = Math.PI / 2;
  const l1 = new THREE.Mesh(new THREE.SphereGeometry(0.14, 7, 5), mat(0x3f9a3a)), l2 = l1.clone(); l1.scale.set(1.5, 0.45, 1); l2.scale.set(1.5, 0.45, 1);
  grp.add(rope, br, l1, l2); grp.userData = { rope, br, l1, l2 }; return grp;
}
export function placeLiana(grp, ax, ay, hx, hy, vis = 1) {
  const { rope, br, l1, l2 } = grp.userData, dx = hx - ax, dy = hy - ay, len = Math.max(0.05, Math.hypot(dx, dy));
  grp.visible = vis > 0.01;
  rope.scale.set(1, len, 1); rope.position.set(ax + dx / 2, ay + dy / 2, 0); rope.rotation.z = Math.atan2(-dx, dy);
  br.position.set(ax, ay + 0.03, 0); l1.position.set(ax + 0.36, ay + 0.08, 0); l1.rotation.z = 0.3; l2.position.set(ax - 0.34, ay + 0.06, 0); l2.rotation.z = -0.3;
  grp.scale.setScalar(clamp(vis * 1.6));
}
