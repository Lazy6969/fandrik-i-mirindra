import '@fontsource/lilita-one/latin-400.css';
import './style.css';
import * as THREE from 'three';
import { CHARS, ITEMS, CATS, buildAnimal, animateAnimal } from './chars.js';
import { LEVELS, WORLDS, WORLD_COLORS } from './levels.js';
import { parseLevel, createSim, step, DT } from './sim.js';
import { buildWorld, buildStage } from './world.js';
import * as Save from './save.js';
import * as Sound from './audio.js';
import { App } from '@capacitor/app';
import { ic, hydrateIcons } from './icons.js';
import { createSplash, hasSplashImage } from './splash.js';
import { makeFx } from './surface.js';
import { STORIES } from './stories.js';
import { IS_MOBILE } from './device.js';
import { makeLiana, placeLiana, handPoint, HANG } from './idle.js';
import { buildPedestal, tex } from './pedestal.js';
import { buildSplashScene } from './splash-scene.js';
import { t, setLang, getLang, LANGS, applyStatic, cName, cReal, cAbility, cDesc, itemName } from './i18n.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

Save.load();
const settings = () => Save.get().settings;
setLang(settings().lang || 'mg');
Sound.setOptions({ sound: settings().sound, music: settings().music, volSfx: settings().volSfx, volMusic: settings().volMusic, volVoice: settings().volVoice });

// ====================================================================== rendu
const canvas = $('#gl');
let renderer;
try {
  // précision « highp » obligatoire : en « mediump » la profondeur est imprécise et le flou de profondeur (qualité Avo) rendait TOUT l'écran flou
  renderer = new THREE.WebGLRenderer({ canvas, antialias: !IS_MOBILE, alpha: false, stencil: false, precision: 'highp', powerPreference: 'high-performance' });   // pas d'anti-crénelage sur téléphone : gros gain de fluidité
} catch (e) {
  $('#loading').innerHTML = '<p style="padding:24px;text-align:center">WebGL indisponible sur cet appareil.</p>';
  throw e;
}
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.NoToneMapping;       // couleurs franches et saturées (style cartoon)

let qcap = null; try { qcap = localStorage.getItem('mirindra.qcap'); } catch (e) { /* pas de stockage */ }
/** qualité effective : le réglage du joueur, ou (en « auto ») la qualité de l'appareil abaissée si le jeu a détecté des saccades */
function qualityLevel() {
  const r = baseQuality();
  if (settings().quality !== 'auto' || !qcap) return r;
  if (qcap === 'low') return 'low';
  return qcap === 'mid' && r === 'high' ? 'mid' : r;
}
function baseQuality() {
  const q = settings().quality;
  if (q === 'low') return 'low';
  if (q === 'high') return 'high';
  const mobile = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints || 0) > 1;
  const weak = (navigator.hardwareConcurrency || 4) <= 4 || (navigator.deviceMemory || 4) <= 3;
  if (mobile && weak) return 'low';
  return mobile || weak ? 'mid' : 'high';      // téléphone : jamais « haute » par défaut (fluidité)
}
function applyQuality() {
  const q = qualityLevel();
  const dpr = window.devicePixelRatio || 1;
  renderer.setPixelRatio(q === 'low' ? Math.min(dpr, 0.85) : Math.min(dpr, q === 'mid' ? 1 : IS_MOBILE ? 1.5 : 1.75));   // les écrans 3x ruineraient la fluidité
  renderer.shadowMap.enabled = q === 'high';
  document.body.classList.toggle('lowfx', q !== 'high' || IS_MOBILE);       // téléphone : jamais de flou CSS par-dessus le jeu (le flou de profondeur 3D suffit)
  renderer.shadowMap.autoUpdate = q === 'high';   // sinon : ombres recalculées une image sur deux (voir la boucle)
  G.quality = q; G.dirty = true;
  if (comp) comp.c.setPixelRatio(renderer.getPixelRatio());
  resize();
}

const cam = new THREE.PerspectiveCamera(42, 2, 0.1, 400);
let splash = null;   // scène de la page d'ouverture (null une fois le jeu lancé)
let comp = null;   // flou de profondeur (qualité « Avo ») : le fond lointain est très flou, le terrain de jeu reste net
function getComposer() {
  if (!comp) {
    const c = new EffectComposer(renderer);
    const rp = new RenderPass(new THREE.Scene(), cam);
    const bp = new BokehPass(rp.scene, cam, { focus: 10, aperture: 0.0005, maxblur: 0.008 });
    c.addPass(rp); c.addPass(bp); c.addPass(new OutputPass());
    c.setPixelRatio(renderer.getPixelRatio()); c.setSize(window.innerWidth, window.innerHeight);
    comp = { c, rp, bp };
  }
  return comp;
}
function drawScene(scene, focus) {
  if (G.quality === 'high') {
    try { const k = getComposer(); k.rp.scene = scene; k.bp.scene = scene; k.bp.uniforms.focus.value = focus; k.c.render(); return; } catch (e) { G.quality = 'mid'; }
  }
  renderer.render(scene, cam);
}
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  cam.aspect = window.innerWidth / window.innerHeight;
  cam.updateProjectionMatrix();
  if (comp) comp.c.setSize(window.innerWidth, window.innerHeight);
  if (splash) splash.resize(cam.aspect);
}
window.addEventListener('resize', resize);

function disposeScene(scene) {
  scene.traverse((o) => {
    if (o.geometry && !(o.geometry.userData && o.geometry.userData.keep)) o.geometry.dispose();
    const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    ms.forEach((m) => { if (m.userData && m.userData.keep) return; if (m.map && !(m.map.userData && m.map.userData.keep)) m.map.dispose(); m.dispose(); });   // le cache est conservé
  });
}

// ====================================================================== état
const G = {
  mode: 'menu',            // menu | play | won
  screen: 'menu',
  lvlId: 1, L: null, sim: null, world: null, pv: null,
  acc: 0, t: 0, deaths: 0, levelTime: 0, deadTimer: 0, winTimer: 0, shake: 0, paused: false, stepAcc: 0,
  cam: { x: 0, y: 4 }, ang: -0.35, lastDeath: -1, hudKey: '', dirty: true, quality: 'mid', frame: 0,
};
window.__game = G;
window.__renderer = () => renderer;
const input = { left: false, right: false, jump: false, jp: false };
const ICON = new URLSearchParams(location.search).has('icon');
hydrateIcons();
applyStatic();

// ====================================================================== scène des menus (aperçu 3D)
let stage = null;   // créé pendant le chargement (voir initGame)
let preview = null;
const VIEWS_3D = ['menu', 'chars', 'shop'];
window.__preview = () => preview;

const PREVIEW_SCALE = { lolo: 2.5, vazimba: 4.1, angatra: 3.3, kisoa: 3.6, trimobe: 2.4, tortue: 3.6, sorciere: 3.2, darafify: 3.4, rapeto: 2.4, ikotofetsy: 5.2, imahaka: 3.5, ibonia: 3.1, ikotobekibo: 4.4, zazavavindrano: 3.0 };   // tailles d'aperçu adaptées à chaque morphologie
let lastInput = 0;                                                          // dernier geste du joueur (pour les animations d'attente)
['pointerdown', 'keydown', 'touchstart'].forEach((ev) => window.addEventListener(ev, () => { lastInput = G.t; }, { capture: true, passive: true }));
/** sol du socle + objets autour + animations sous les pieds, selon le personnage */
function applySurface(id) {
  const P = buildPedestal(id), mw = stage.water.material;
  stage.shape0.visible = false;
  if (stage.ped) stage.base.remove(stage.ped);
  stage.ped = P.shape; stage.base.add(P.shape); stage.waterMesh = null; P.shape.traverse((o) => { if (o.userData.waterMesh) stage.waterMesh = o.userData.waterMesh; });
  if (P.disc) {                                                              // dessus du support : sol propre au personnage
    const tx = tex(P.disc.tex); mw.map = tx; mw.opacity = P.disc.tex === 'water' ? 0.93 : 1; mw.transparent = mw.opacity < 1; mw.needsUpdate = true;
    stage.water.visible = true; stage.water.scale.setScalar(P.disc.r / 1.86); stage.discTex = P.disc.tex;
  } else { stage.water.visible = false; stage.discTex = ''; }
  stage.surfKind = P.fx;
  if (stage.props) stage.base.remove(stage.props);
  stage.props = P.props; stage.base.add(P.props); stage.flames = []; P.props.traverse((o) => { if (o.userData.flame !== undefined) stage.flames.push(o); });
  if (stage.fx) stage.base.remove(stage.fx.group);
  stage.fx = makeFx(P.fx, 1.25); stage.fx.group.position.y = 0.33; stage.base.add(stage.fx.group);
}
function setPreview(id, skinOverride) {
  const prev = preview;
  if (prev) stage.scene.remove(prev.holder);
  const owned = Save.get().unlocked.includes(id);
  const a = buildAnimal(id, skinOverride || (owned ? Save.skinOf(id) : {}));
  applySurface(id);                                                         // chaque personnage a son propre sol (boue, étang, foin…)
  const holder = new THREE.Group(); holder.scale.setScalar(PREVIEW_SCALE[id] || 3.4); holder.add(a.group);
  stage.scene.add(holder);
  preview = { a, holder, id, hop: 0, hv: 0, spin: prev ? prev.spin : 0, spinV: 0, run: 0, anim: '', animT: 0, intro: false, x: prev ? prev.x : 2.7, targetX: 2.7 };
}
/** Abscisse 3D qui place l'animal à une fraction donnée de la largeur de l'écran. */
function previewTargetX(screen) {
  const asp = cam.aspect, W = window.innerWidth, H = window.innerHeight;
  const dist = 10.2 * Math.max(1, 1.9 / asp);
  const halfW = dist * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * asp;
  const frac = (screen === 'chars' || screen === 'shop') ? (0.22 * W + 0.04 * H) / W : 0.73;   // chars : pile entre les deux flèches
  return (frac * 2 - 1) * halfW;
}
function playAnim(a) {
  if (!preview) return;
  const p = preview;
  p.anim = a; p.animT = a === 'run' ? 2.4 : a === 'spin' ? 1.2 : 0.01;
  if (a === 'jump') { p.hv = 9; Sound.voice(p.id, 'jump'); }
  if (a === 'spin') p.spinV = 15;
  playSfx('click');
}
$$('.abtn').forEach((b) => b.addEventListener('click', () => playAnim(b.dataset.a)));

// faire tourner l'animal avec le doigt / la souris ; un simple toucher le fait sauter et crier
let dragging = false, lastDragX = 0, dragMoved = 0;
window.addEventListener('pointerdown', (e) => { if (!VIEWS_3D.includes(G.screen) || e.target !== canvas) return; dragging = true; lastDragX = e.clientX; dragMoved = 0; });
window.addEventListener('pointermove', (e) => { if (dragging && preview) { const dx = e.clientX - lastDragX; lastDragX = e.clientX; dragMoved += Math.abs(dx); preview.spin += dx * 0.013; } });
window.addEventListener('pointerup', () => {
  if (dragging && dragMoved < 8 && preview && preview.hop === 0) { preview.hv = 8; Sound.voice(preview.id, 'jump'); }
  dragging = false;
});

// ====================================================================== navigation d'écrans
function show(name) {
  $$('.screen').forEach((s) => s.classList.remove('active'));
  const el = $('#screen-' + name);
  if (el) el.classList.add('active');
  G.screen = name;
  $('#hud').classList.toggle('hidden', name !== 'hud');
  G.dirty = true;
  const is3d = VIEWS_3D.includes(name);
  document.body.dataset.view = is3d ? 'menu' : name === 'hud' ? 'play' : 'blur';
  canvas.classList.toggle('blurred', name === 'levels' || name === 'settings' || name === 'win' || name === 'story');
  document.documentElement.style.setProperty('--mx', (name === 'chars' || name === 'shop' ? 24 : 73) + '%');
  if (preview) preview.holder.visible = is3d;
  if (name === 'menu') { refreshMenu(); animateTitle(); }
}
function playSfx(n) { Sound.sfx(n); }
/** Titre : les lettres tombent en rebondissant, puis un reflet balaie le logo (à l'ouverture et à chaque retour sur l'accueil). */
function animateTitle(root = document) {
  const h1 = root.querySelector('.logo h1'); if (!h1) return;
  if (!h1.dataset.split) {
    h1.querySelectorAll(':scope > span').forEach((line, li) => {
      const txt = line.textContent;
      line.innerHTML = [...txt].map((ch, i) => `<b class="lt" style="--d:${(li * 9 + i) * 55}ms">${ch === ' ' ? '&nbsp;' : ch}</b>`).join('');
    });
    h1.dataset.split = '1';
  }
  const logo = h1.closest('.logo');
  logo.classList.remove('intro'); void logo.offsetWidth; logo.classList.add('intro');
}
document.addEventListener('pointerdown', () => Sound.unlock(), { once: false, passive: true });
$$('[data-back]').forEach((b) => b.addEventListener('click', () => { playSfx('click'); show('menu'); }));
// petit « tic » sonore au survol des boutons (souris)
document.addEventListener('pointerover', (e) => { if (e.pointerType === 'mouse' && e.target.closest && e.target.closest('button') && !e.target.closest('.pad')) Sound.sfx('hover'); }, { passive: true });

const idxIn = (l) => LEVELS.filter((x) => x.world === l.world).indexOf(l) + 1;
const nextInWorld = (id) => { const n = LEVELS.find((x) => x.prev === id); return n ? n.id : 0; };
const isUnlocked = (l) => l.prev === 0 || !!Save.get().levels[l.prev];
const nextLevelId = () => {
  const d = Save.get();
  for (const l of LEVELS) if (!d.levels[l.id] && isUnlocked(l)) return l.id;
  return 1;
};
const chip = (icon, v) => `<div class="chip">${ic(icon)}<b>${v}</b></div>`;

function refreshMenu() {
  const d = Save.get();
  const nid = nextLevelId();
  const done = Object.keys(d.levels).length;
  $('#play-label').textContent = t(done === 0 ? 'menu.play' : (done >= LEVELS.length ? 'menu.again' : 'menu.continue'));
  $('#play-sub').textContent = `${t('level')} ${idxIn(LEVELS[nid - 1])} · ${LEVELS[nid - 1].name}`;
  $('#menu-chips').innerHTML = `<button class="chip chip-btn" id="btn-profile">${d.profile.photo ? `<img class="chip-av" src="${d.profile.photo}" alt="" />` : ic('user')}<b>${d.profile.name}</b></button>` + chip('star', `${Save.totalStars()}/${LEVELS.length * 3}`) + chip('mango', d.fruits) + chip('trophy', Save.totalScore());
  if (!preview || preview.id !== d.char || preview.dirtySkin) setPreview(d.char);
}
$('#btn-play').addEventListener('click', () => { playSfx('click'); startLevel(nextLevelId()); });
$('#btn-levels').addEventListener('click', () => { playSfx('click'); renderLevels(); show('levels'); });
$('#btn-chars').addEventListener('click', () => { playSfx('click'); chIdx = Math.max(0, CHARS.findIndex((c) => c.id === Save.get().char)); renderChars(); show('chars'); });
$('#btn-shop').addEventListener('click', () => { playSfx('click'); openShop(); });
$('#btn-settings').addEventListener('click', () => { playSfx('click'); renderSettings(); show('settings'); });
$('#menu-chips').addEventListener('click', (e) => { if (e.target.closest('#btn-profile')) { playSfx('click'); renderProfile(); show('profile'); } });

// ====================================================================== personnages
let chIdx = 0;
function renderChars() {
  const d = Save.get();
  const c = CHARS[chIdx];
  const owned = d.unlocked.includes(c.id);
  $('#chars-fruits').innerHTML = `${ic('mango')}<b>${d.fruits}</b>`;
  $('#ch-name').textContent = cName(c);
  $('#ch-real').textContent = cReal(c);
  $('#ch-ability').textContent = cAbility(c) + (c.shield ? ` ×${c.shield}` : '');
  $('#ch-desc').textContent = cDesc(c);
  $('#bar-speed').style.width = clamp(((c.speed - 6) / 2.4) * 100, 12, 100) + '%';
  $('#bar-jump').style.width = clamp(((c.jump - 14) / 4) * 100, 12, 100) + '%';
  const btn = $('#ch-action');
  btn.classList.remove('off');
  if (owned && d.char === c.id) { btn.innerHTML = `${ic('check')}${t('btn.selected')}`; btn.classList.add('off'); }
  else if (owned) btn.textContent = t('btn.choose');
  else if (d.fruits >= c.cost) btn.innerHTML = `${t('btn.unlock')} · ${ic('mango')}${c.cost}`;
  else { btn.innerHTML = `${ic('lock')}${t('need')} ${ic('mango')}${c.cost}`; btn.classList.add('off'); }
  $('#ch-strip').innerHTML = CHARS.map((x, i) => {
    const o = d.unlocked.includes(x.id);
    return `<button class="${i === chIdx ? 'sel' : ''} ${o ? '' : 'lock'}" data-i="${i}">${cName(x)}<small>${o ? (d.char === x.id ? ic('check') + t('chosen') : cAbility(x)) : ic('lock') + x.cost}</small></button>`;
  }).join('');
  $$('#ch-strip button').forEach((b) => b.addEventListener('click', () => { chIdx = Number(b.dataset.i); renderChars(); sayHello(); }));
  const sel = $('#ch-strip .sel'); if (sel) sel.scrollIntoView({ inline: 'center', block: 'nearest' });
  setPreview(c.id);
  preview.holder.visible = true; preview.x = previewTargetX('chars');
}
const sayHello = () => { playSfx('click'); Sound.voice(CHARS[chIdx].id, 'jump'); if (preview) preview.hv = 7; };
$('#ch-prev').addEventListener('click', () => { chIdx = (chIdx + CHARS.length - 1) % CHARS.length; renderChars(); sayHello(); });
$('#ch-next').addEventListener('click', () => { chIdx = (chIdx + 1) % CHARS.length; renderChars(); sayHello(); });
$('#ch-action').addEventListener('click', () => {
  const d = Save.get(); const c = CHARS[chIdx];
  if (d.unlocked.includes(c.id)) { d.char = c.id; playSfx('star'); Sound.voice(c.id, 'win'); }
  else if (d.fruits >= c.cost) { d.fruits -= c.cost; d.unlocked.push(c.id); d.char = c.id; playSfx('win'); Sound.voice(c.id, 'win'); Sound.vibrate(30); }
  else return;
  Save.save(); renderChars();
});
// ====================================================================== histoire du personnage
const portraitCache = new Map();
/** portrait du personnage (fond transparent) vu sous un angle donné, rendu dans une texture puis mis en cache */
function portraitFor(id, skin, ry, size) {
  const key = id + JSON.stringify(skin) + ry + size;
  if (portraitCache.has(key)) return portraitCache.get(key);
  let url = '';
  try {
    const rt = new THREE.WebGLRenderTarget(size, size); rt.texture.colorSpace = THREE.SRGBColorSpace;
    const sc = new THREE.Scene();
    sc.add(new THREE.HemisphereLight(0xfff1d6, 0x8a6a38, 1.6));
    const dl = new THREE.DirectionalLight(0xffd9a0, 2.6); dl.position.set(-3, 5, 6); sc.add(dl);
    const a = buildAnimal(id, skin); a.group.rotation.y = ry; a.group.scale.setScalar((PREVIEW_SCALE[id] || 3.4) / 3.4); sc.add(a.group);
    const cm = new THREE.PerspectiveCamera(30, 1, 0.1, 50); cm.position.set(0.2, 0.85, 3.4); cm.lookAt(0, 0.6, 0);
    const prev = renderer.getRenderTarget(), pc = renderer.getClearColor(new THREE.Color()), pa = renderer.getClearAlpha();
    renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(sc, cm);
    const buf = new Uint8Array(size * size * 4); renderer.readRenderTargetPixels(rt, 0, 0, size, size, buf);
    renderer.setRenderTarget(prev); renderer.setClearColor(pc, pa);
    const cv = document.createElement('canvas'); cv.width = cv.height = size;
    const ctx = cv.getContext('2d'), img = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) img.data.set(buf.subarray((size - 1 - y) * size * 4, (size - y) * size * 4), y * size * 4);
    ctx.putImageData(img, 0, 0); url = cv.toDataURL('image/png');
    rt.dispose();
  } catch (e) { url = ''; }
  portraitCache.set(key, url);
  return url;
}
const lg = () => LANGS.indexOf(getLang());
function renderStory() {
  const c = CHARS[chIdx], S = STORIES[c.id], d = Save.get(), i = lg();
  const skin = d.unlocked.includes(c.id) ? Save.skinOf(c.id) : {};
  $('#st-wrap').dataset.k = S ? S.k : 'animal';
  $('#st-name').textContent = cName(c); $('#st-real').textContent = cReal(c);
  $('#st-count').textContent = (chIdx + 1) + ' / ' + CHARS.length;
  $('#st-cat').textContent = S ? S.cat[i] : '';
  $('#st-hist').textContent = S ? S.h[i] : cDesc(c);
  $('#st-desc').textContent = S ? S.d[i] : cDesc(c);
  $('#st-perk').textContent = (S ? S.p[i] : cAbility(c)) + (c.shield ? ` (${cAbility(c)} ×${c.shield})` : '');
  $('#st-bar-speed').style.width = clamp(((c.speed - 6) / 2.4) * 100, 12, 100) + '%';
  $('#st-bar-jump').style.width = clamp(((c.jump - 14) / 4) * 100, 12, 100) + '%';
  $('#st-img1').src = portraitFor(c.id, skin, -0.95, 384);
  $('#st-img2').src = portraitFor(c.id, skin, -1.55, 192);
  $('#st-img3').src = portraitFor(c.id, skin, 0.1, 192);
  const sc = $('.story-scroll'); if (sc) sc.scrollTop = 0;
  const card = $('.story-card'); card.classList.remove('flip'); void card.offsetWidth; card.classList.add('flip');
}
$('#ch-story').addEventListener('click', () => { playSfx('click'); Sound.voice(CHARS[chIdx].id, 'win'); renderStory(); show('story'); });
$('#st-back').addEventListener('click', () => { playSfx('click'); renderChars(); show('chars'); });
$('#st-prev').addEventListener('click', () => { playSfx('click'); chIdx = (chIdx + CHARS.length - 1) % CHARS.length; renderStory(); });
$('#st-next').addEventListener('click', () => { playSfx('click'); chIdx = (chIdx + 1) % CHARS.length; renderStory(); });
$('#ch-shop').addEventListener('click', () => {
  const d = Save.get(); const c = CHARS[chIdx];
  if (d.unlocked.includes(c.id)) { d.char = c.id; Save.save(); }     // la boutique habille l'animal choisi
  playSfx('click'); openShop();
});

// ====================================================================== boutique d'accessoires
let shopCat = 'hat', shopSel = null;
function openShop() { shopSel = null; renderShop(); show('shop'); }
function renderShop() {
  const d = Save.get();
  const c = CHARS.find((x) => x.id === d.char) || CHARS[0];
  const skin = Save.skinOf(c.id);
  $('#shop-char').textContent = cName(c);
  $('#shop-fruits').innerHTML = `${ic('mango')}<b>${d.fruits}</b>`;
  $('#shop-cats').innerHTML = CATS.map((x) => `<button class="${x.id === shopCat ? 'sel' : ''}" data-c="${x.id}">${ic(x.ic)}<span>${t('cat.' + x.id)}</span></button>`).join('');
  $$('#shop-cats button').forEach((b) => b.addEventListener('click', () => { playSfx('click'); shopCat = b.dataset.c; shopSel = null; renderShop(); }));
  const items = [{ id: '', name: t('shop.none'), cost: 0 }, ...ITEMS[shopCat]];
  $('#shop-items').innerHTML = items.map((it) => {
    const own = it.id === '' || d.items.includes(shopCat + ':' + it.id);
    const eq = (skin[shopCat] || '') === it.id;
    const price = eq ? ic('check') : own ? (it.id ? t('shop.owned') : '') : `${ic('mango')}${it.cost}`;
    return `<button class="item ${shopSel === it.id ? 'sel' : ''} ${eq ? 'eq' : ''} ${own ? '' : 'unowned'}" data-id="${it.id}"><span class="nm">${it.id ? itemName(shopCat, it.id) : it.name}</span><span class="pr">${price}</span></button>`;
  }).join('');
  $$('#shop-items .item').forEach((b) => b.addEventListener('click', () => { playSfx('click'); shopSel = b.dataset.id; renderShop(); }));
  // essayage : on voit l'objet sélectionné sur l'animal avant de l'acheter
  const ps = { ...skin };
  if (shopSel !== null) { if (shopSel === '') delete ps[shopCat]; else ps[shopCat] = shopSel; }
  setPreview(c.id, ps);
  preview.holder.visible = true; preview.x = previewTargetX('shop');
  const btn = $('#shop-action'); btn.classList.remove('off');
  if (shopSel === null) { btn.textContent = t('shop.pick'); btn.classList.add('off'); }
  else if (shopSel === '') { btn.textContent = skin[shopCat] ? t('shop.remove') : t('shop.noneeq'); if (!skin[shopCat]) btn.classList.add('off'); }
  else {
    const it = ITEMS[shopCat].find((i) => i.id === shopSel);
    const own = d.items.includes(shopCat + ':' + shopSel);
    if (own) btn.textContent = skin[shopCat] === shopSel ? t('shop.remove') : t('shop.equip');
    else if (d.fruits >= it.cost) btn.innerHTML = `${t('shop.buy')} · ${ic('mango')}${it.cost}`;
    else { btn.innerHTML = `${ic('lock')}${t('need')} ${ic('mango')}${it.cost}`; btn.classList.add('off'); }
  }
}
$('#shop-action').addEventListener('click', () => {
  if (shopSel === null) return;
  const d = Save.get();
  const c = CHARS.find((x) => x.id === d.char) || CHARS[0];
  const sk = (d.skins[c.id] = { ...(d.skins[c.id] || {}) });
  if (shopSel === '') { if (!sk[shopCat]) return; delete sk[shopCat]; playSfx('click'); }
  else {
    const it = ITEMS[shopCat].find((i) => i.id === shopSel);
    const key = shopCat + ':' + shopSel;
    if (!d.items.includes(key)) {
      if (d.fruits < it.cost) return;
      d.fruits -= it.cost; d.items.push(key); sk[shopCat] = shopSel; playSfx('win'); Sound.voice(c.id, 'win'); Sound.vibrate(25);
    } else if (sk[shopCat] === shopSel) { delete sk[shopCat]; playSfx('click'); }
    else { sk[shopCat] = shopSel; playSfx('star'); Sound.voice(c.id, 'jump'); }
  }
  Save.save(); shopSel = null; renderShop();
});

// ====================================================================== niveaux
let tabWorld = 0;
function renderLevels() {
  const d = Save.get();
  $('#levels-score').innerHTML = `${ic('trophy')}<b>${Save.totalScore()}</b>`;
  // chaque monde a sa couleur : la page entière prend la teinte du monde choisi
  const setCols = (el, hex) => { el.style.setProperty('--wc', hex); el.style.setProperty('--wc-l', shade(hex, 0.35)); el.style.setProperty('--wc-d', shade(hex, -0.38)); };
  setCols($('#screen-levels'), WORLD_COLORS[WORLDS[tabWorld].id]);
  $('#lv-tabs').innerHTML = WORLDS.map((w, i) => `<button class="${i === tabWorld ? 'sel' : ''}" data-w="${i}" data-wc="${WORLD_COLORS[w.id]}">${t(w.name)}<small>${t(w.sub)}</small></button>`).join('');
  $$('#lv-tabs button').forEach((b) => setCols(b, b.dataset.wc));
  $$('#lv-tabs button').forEach((b) => b.addEventListener('click', () => { playSfx('click'); tabWorld = Number(b.dataset.w); renderLevels(); }));
  $('#lv-grid').scrollTop = 0;
  const list = LEVELS.filter((l) => l.world === WORLDS[tabWorld].id);
  const doneN = list.filter((l) => d.levels[l.id]).length;
  $('#lv-grid').innerHTML = list.map((l) => {
    const r = d.levels[l.id];
    const stars = [0, 1, 2].map((i) => `<span class="${r && i < r.stars ? '' : 'off'}">${ic('star')}</span>`).join('');
    return `<button class="lcard ${isUnlocked(l) ? '' : 'locked'}" data-l="${l.id}">
      <span class="num">${idxIn(l)}</span><span class="nm">${l.name}</span><span class="sb">${t(l.sub)}</span>
      <span class="st">${stars}</span>${r ? `<span class="bs">${r.best}</span>` : ''}</button>`;
  }).join('');
  $$('#lv-grid .lcard').forEach((b) => b.addEventListener('click', () => { playSfx('click'); startLevel(Number(b.dataset.l)); }));
}

// ====================================================================== réglages
function renderSettings() {
  const s = settings();
  for (const [k, f, def] of [['sfx', 'volSfx', 0.8], ['music', 'volMusic', 0.5], ['voice', 'volVoice', 0.9]]) {
    const el = $('#vol-' + k), out = $('#vol-' + k + '-n');
    el.value = Math.round((s[f] ?? def) * 100); out.textContent = el.value;
    el.oninput = () => { s[f] = el.value / 100; out.textContent = el.value; Sound.setOptions({ volSfx: s.volSfx, volMusic: s.volMusic, volVoice: s.volVoice }); };
    el.onchange = () => { Save.save(); Sound.unlock(); playSfx('click'); if (k === 'voice') Sound.voice(Save.get().char, 'jump'); };
  }
  for (const k of ['sound', 'music', 'vibrate']) {
    const el = $('#set-' + k); el.checked = !!s[k];
    el.onchange = () => { s[k] = el.checked; Save.save(); Sound.setOptions({ sound: s.sound, music: s.music }); playSfx('click'); };
  }
  $$('#set-quality button').forEach((b) => {
    b.classList.toggle('sel', b.dataset.q === s.quality);
    b.onclick = () => { s.quality = b.dataset.q; Save.save(); renderSettings(); applyQuality(); playSfx('click'); };
  });
  $$('#set-lang button').forEach((b) => {
    b.classList.toggle('sel', b.dataset.lg === getLang());
    b.onclick = () => { s.lang = b.dataset.lg; Save.save(); setLang(s.lang); refreshLang(); playSfx('click'); };
  });
}
// petite fenêtre de confirmation
function askConfirm(titleKey, bodyKey, yesKey, noKey, onYes) {
  $('#cf-title').textContent = t(titleKey); $('#cf-body').textContent = t(bodyKey);
  $('#cf-yes').textContent = t(yesKey); $('#cf-no').textContent = t(noKey);
  const close = () => { $('#screen-confirm').classList.remove('active'); G.dirty = true; };
  $('#cf-no').onclick = () => { playSfx('click'); close(); };
  $('#cf-yes').onclick = () => { close(); onYes(); };
  $('#screen-confirm').classList.add('active'); playSfx('click');
}
$('#btn-reset').addEventListener('click', () => askConfirm('cf.title', 'cf.body', 'cf.yes', 'cf.no', () => {
  Save.reset(); Save.load(); setPreview(Save.get().char); renderSettings(); playSfx('die');
}));
function updateHudNames() {
  const def = LEVELS[G.lvlId - 1];
  $('#hud-level').textContent = `${t('level')} ${idxIn(def)}`;
  $('#hud-name').textContent = def.name;
}
/** Change la langue partout : textes fixes + écran affiché. */
function refreshLang() {
  applyStatic();
  switch (G.screen) {
    case 'menu': refreshMenu(); break;
    case 'chars': renderChars(); break;
    case 'shop': renderShop(); break;
    case 'levels': renderLevels(); break;
    case 'profile': renderProfile(); break;
    case 'settings': renderSettings(); break;
    default: break;
  }
  if (G.mode === 'play' || G.mode === 'won') updateHudNames();
  G.hudKey = '';
}
// ====================================================================== profil (pseudo, import / export, profils préréglés)
const PRESETS = [
  ['kalanoro', { scarf: 'red', hat: 'straw' }], ['maki', { hat: 'cap', boots: 'yellow' }], ['fosa', { scarf: 'gold', glasses: 'sun' }],
  ['omby', { hat: 'beanie', scarf: 'blue' }], ['sahona', { hat: 'crown' }], ['saka', { glasses: 'round', scarf: 'red' }],
  ['alika', { scarf: 'stripe', boots: 'red' }], ['sifaka', { glasses: 'star', hat: 'straw' }], ['ayeaye', { hat: 'pirate', glasses: 'sun' }],
  ['tana', { scarf: 'gold', boots: 'green' }], ['tenrec', { boots: 'gold', hat: 'cap' }],
  ['lolo', { hat: 'beanie', scarf: 'blue' }], ['vazimba', { scarf: 'gold' }], ['angatra', { hat: 'crown' }],
  ['kisoa', { scarf: 'blue' }], ['trimobe', { scarf: 'red' }], ['tortue', { hat: 'straw' }], ['sorciere', { glasses: 'round' }], ['darafify', { scarf: 'gold' }], ['rapeto', { boots: 'green' }],
  ['ikotofetsy', { glasses: 'sun' }], ['imahaka', { hat: 'cap' }], ['ibonia', { scarf: 'red', boots: 'gold' }], ['ikotobekibo', { hat: 'beanie' }], ['zazavavindrano', { hat: 'crown', glasses: 'star' }],
].map(([char, skin]) => ({ char, skin, name: CHARS.find((c) => c.id === char).name }));

function shade(hex, k) {            // éclaircit (k>0) ou assombrit (k<0) une couleur #rrggbb
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k))));
  return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, '0')).join('');
}
// vignettes des animaux (rendues une fois dans une petite texture, puis mises en cache)
const avatarCache = new Map();
function avatarFor(id, skin) {
  const key = id + JSON.stringify(skin);
  if (avatarCache.has(key)) return avatarCache.get(key);
  let url = '';
  try {
    const size = 112;
    const rt = new THREE.WebGLRenderTarget(size, size); rt.texture.colorSpace = THREE.SRGBColorSpace;
    const sc = new THREE.Scene();
    sc.add(new THREE.HemisphereLight(0xfff1d6, 0x8a6a38, 1.5));
    const dl = new THREE.DirectionalLight(0xffc079, 2.4); dl.position.set(-3, 5, 6); sc.add(dl);
    const a = buildAnimal(id, skin); a.group.rotation.y = -0.65; a.group.scale.setScalar((PREVIEW_SCALE[id] || 3.4) / 3.4); sc.add(a.group);
    const cm = new THREE.PerspectiveCamera(30, 1, 0.1, 50); cm.position.set(0.2, 0.8, 3.3); cm.lookAt(0, 0.58, 0);
    const prev = renderer.getRenderTarget();
    renderer.setRenderTarget(rt); renderer.setClearColor(0xffe2b0, 1); renderer.clear(); renderer.render(sc, cm);
    const buf = new Uint8Array(size * size * 4); renderer.readRenderTargetPixels(rt, 0, 0, size, size, buf);
    renderer.setRenderTarget(prev); renderer.setClearColor(0x000000, 1);
    const cv = document.createElement('canvas'); cv.width = cv.height = size;
    const ctx = cv.getContext('2d'), img = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) img.data.set(buf.subarray((size - 1 - y) * size * 4, (size - y) * size * 4), y * size * 4);
    ctx.putImageData(img, 0, 0); url = cv.toDataURL('image/png');
    rt.dispose();
  } catch (e) { url = ''; }
  avatarCache.set(key, url);
  return url;
}
function pfMsg(txt, bad) { const m = $('#pf-msg'); m.textContent = txt; m.classList.toggle('bad', !!bad); }
function renderProfile() {
  const d = Save.get();
  $('#pf-name').value = d.profile.name;
  $('#profile-score').innerHTML = `${ic('trophy')}<b>${Save.totalScore()}</b>`;
  const av = d.profile.photo || avatarFor(d.char, Save.skinOf(d.char));
  $('#pf-avatar').src = av; $('#pf-avatar').style.visibility = av ? 'visible' : 'hidden';
  $('#pf-photo-remove').style.display = d.profile.photo ? '' : 'none';
  $('#pf-presets').innerHTML = PRESETS.map((p, i) => {
    const owned = d.unlocked.includes(p.char);
    const items = Object.entries(p.skin).map(([cat, id]) => itemName(cat, id)).join(' · ');
    const img = avatarFor(p.char, p.skin);
    const nm = cName(CHARS.find((c) => c.id === p.char));
    return `<button class="preset ${owned ? '' : 'locked'} ${d.char === p.char ? 'sel' : ''}" data-i="${i}">${img ? `<img src="${img}" alt="" />` : ''}<span class="pt"><b>${nm}</b><small>${owned ? items : ic('lock') + t('pf.locked')}</small></span></button>`;
  }).join('');
  $$('#pf-presets .preset').forEach((b) => b.addEventListener('click', () => {
    const p = PRESETS[Number(b.dataset.i)];
    if (!Save.get().unlocked.includes(p.char)) { playSfx('click'); pfMsg(t('pf.needAnimal'), true); return; }
    Save.applyPreset({ char: p.char, skin: p.skin }); playSfx('win'); Sound.voice(p.char, 'win'); setPreview(p.char);   // le pseudo saisi est conservé
    pfMsg(t('pf.applied', cName(CHARS.find((c) => c.id === p.char)))); renderProfile();
  }));
}
$('#pf-save').addEventListener('click', () => { const n = Save.setName($('#pf-name').value); $('#pf-name').value = n; playSfx('star'); pfMsg(t('pf.saved', n)); });
$('#pf-name').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#pf-save').click(); });

// photo de profil : tous les formats d'image que l'appareil sait décoder, 20 Mo maximum
$('#pf-photo').addEventListener('click', () => { playSfx('click'); $('#pf-photo-file').click(); });
$('#pf-photo-file').addEventListener('change', async (e) => {
  const f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return;
  if (f.size > 20 * 1024 * 1024) { playSfx('die'); pfMsg(t('pf.photoBig'), true); return; }
  const url = URL.createObjectURL(f);
  try {
    const img = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = url; });
    const m = Math.min(img.naturalWidth, img.naturalHeight);
    if (!m) throw new Error('size');
    const size = 192, cv = document.createElement('canvas'); cv.width = cv.height = size;
    cv.getContext('2d').drawImage(img, (img.naturalWidth - m) / 2, (img.naturalHeight - m) / 2, m, m, 0, 0, size, size);
    Save.setPhoto(cv.toDataURL('image/jpeg', 0.85)); playSfx('star'); pfMsg(t('pf.photoOk')); renderProfile();
  } catch (err) { playSfx('die'); pfMsg(t('pf.photoBad'), true); }
  URL.revokeObjectURL(url);
});
$('#pf-photo-remove').addEventListener('click', () => { Save.setPhoto(''); playSfx('click'); renderProfile(); });


// ====================================================================== jeu
const TAUNTS = [0, 1, 2, 3, 4, 5, 6].map((i) => 'taunt.' + i);
let bannerTimer = 0, tauntTimer = 0;

function startLevel(id) {
  const t0 = performance.now();
  Sound.unlock();
  G.lvlId = id;
  const def = LEVELS[id - 1];
  const L = parseLevel(def);
  if (G.world) { disposeScene(G.world.scene); G.world = null; }
  applyQuality();
  G.L = L;
  G.world = buildWorld(def, L, def.theme || def.world, qualityLevel());
  const ch = CHARS.find((c) => c.id === Save.get().char) || CHARS[0];
  if (G.pv) G.pv = null;
  G.pv = buildAnimal(ch.id, Save.skinOf(ch.id));
  G.world.scene.add(G.pv.group);
  G.ch = ch;
  G.fx = null; govFrom = G.t + 4; lastInput = G.t; G.hangW = 0; G.hangPrev = false; G.liana = null;
  if (HANG[ch.id]) { G.liana = makeLiana(); G.liana.visible = false; G.world.scene.add(G.liana); }
  { const P = buildPedestal(ch.id); if (P.fx !== 'water') { G.fx = makeFx(P.fx, 0.55, P.disc ? tex(P.disc.tex) : null); G.world.scene.add(G.fx.group); } }
  G.deaths = 0; G.levelTime = 0; G.acc = 0; G.paused = false; G.mode = 'play'; G.winTimer = 0; G.deadTimer = 0; G.shake = 0; G.stepAcc = 0;
  G.sim = createSim(L, ch);
  G.cam.x = clamp(L.start.x + 2, 8, L.cols - 8); G.cam.y = 2.6;
  input.left = input.right = input.jump = input.jp = false;
  updateHudNames();
  show('hud');
  const b = $('#banner');
  b.innerHTML = `<b>${t('level')} ${idxIn(def)}</b><span>${def.name} — ${t(def.sub)}</span>`;
  b.classList.add('show'); clearTimeout(bannerTimer); bannerTimer = setTimeout(() => b.classList.remove('show'), 2200);
  if (id === 1 && !Save.get().levels[1]) showTaunt(t('hint.title'), t('hint.sub'), 3800, true);
  G.hudKey = '';
  G.buildMs = Math.round(performance.now() - t0);
}

function respawn() {
  G.sim = createSim(G.L, G.ch);
  G.acc = 0; G.deadTimer = 0;
  G.pv.group.visible = true;
  input.jp = false;
}

function showTaunt(main, sub, ms = 900, good = false) {
  const t = $('#taunt');
  t.innerHTML = `${main}<small>${sub}</small>`;
  t.style.color = good ? '#ffe27a' : '';
  t.classList.add('show'); clearTimeout(tauntTimer);
  tauntTimer = setTimeout(() => t.classList.remove('show'), ms);
}

const SKIN = { kalanoro: 0xf2b98a, maki: 0x9a948a, fosa: 0x8a5535, omby: 0xd9b88a, sahona: 0x5ea63f, saka: 0xd98b3c, alika: 0xb98a53, sifaka: 0xf4efe3, ayeaye: 0x30271f, tana: 0x7db046, tenrec: 0xa47c4d, lolo: 0x5b4636, vazimba: 0x6a4a2c, angatra: 0xbfe8ff, kisoa: 0xf0a8b0, trimobe: 0x7a8a5c, tortue: 0x9aa86a, sorciere: 0x8fb070, darafify: 0xa05a44, rapeto: 0xc89870, ikotofetsy: 0xe8c040, imahaka: 0x6a88a8, ibonia: 0xc89870, ikotobekibo: 0xe8a070, zazavavindrano: 0x1aa8a0 };

function handleEvents(S) {
  const P = S.p;
  const vib = settings().vibrate;
  for (const ev of S.ev) {
    switch (ev) {
      case 'jump': case 'jump2': playSfx(ev); Sound.voice(G.ch.id, 'jump'); G.world.dust(P.x, P.y, P.face); if (ev === 'jump2') G.world.burst(P.x, P.y + 0.2, [0xffffff], 6, 3); break;
      case 'land': playSfx('land'); G.world.dust(P.x, P.y); break;
      case 'fruit': playSfx('fruit'); G.world.burst(P.x, P.y + 0.6, [0xffd34d, 0xffa52a], 10, 5); if (vib) Sound.vibrate(12); break;
      case 'die': onDeath(S); break;
      case 'win': onWin(S); break;
      case 'shield': playSfx('shield'); G.world.burst(P.x, P.y + 0.5, [0x7fe3ff, 0xffffff], 14, 6); if (vib) Sound.vibrate(30); G.shake = 0.25; break;
      case 'bonk': case 'rumble': case 'spike': case 'thud': case 'spring': case 'dodge': playSfx(ev); if (ev === 'thud') G.shake = Math.max(G.shake, 0.18); break;
      default: break;
    }
  }
  S.ev.length = 0;
}

function onDeath(S) {
  G.deaths++;
  G.deadTimer = 0.95;
  playSfx('die'); Sound.voice(G.ch.id, 'die');
  if (settings().vibrate) Sound.vibrate(60);
  G.shake = 0.5;
  const P = S.p;
  G.world.burst(P.x, P.y + 0.5, [SKIN[G.ch.id], 0xffffff, 0xff5a4d], 26, 8);
  G.pv.group.visible = false;
  let i; do { i = Math.floor(Math.random() * TAUNTS.length); } while (i === G.lastDeath && TAUNTS.length > 1);
  G.lastDeath = i;
  showTaunt(t(TAUNTS[i]), t('cause.' + S.cause), 1000);
}

function onWin(S) {
  G.winTimer = 1.1;
  playSfx('win'); Sound.voice(G.ch.id, 'win');
  if (settings().vibrate) Sound.vibrate([20, 40, 20, 40, 60]);
  G.world.confetti(S.p.x, S.p.y);
  G.pv.group.visible = true;
}

function finishLevel() {
  const def = LEVELS[G.lvlId - 1];
  const S = G.sim;
  const time = G.levelTime;
  const deaths = G.deaths;
  const fr = S.fruits, tot = G.L.fruits;
  const bonusTime = Math.max(0, def.par - time) * 8;
  const score = Math.max(100, Math.round(1000 + fr * 150 + bonusTime - deaths * 40));
  const stars = 1 + (tot > 0 && fr >= tot ? 1 : 0) + (deaths <= def.parDeaths ? 1 : 0);
  const d = Save.get();
  const prev = d.levels[G.lvlId];
  const newBest = !prev || score > prev.best;
  d.levels[G.lvlId] = {
    best: Math.max(score, prev ? prev.best : 0), stars: Math.max(stars, prev ? prev.stars : 0),
    deaths: prev ? Math.min(prev.deaths, deaths) : deaths, time: prev ? Math.min(prev.time, time) : time, fruits: Math.max(fr, prev ? prev.fruits : 0),
  };
  d.fruits += fr;
  Save.save();
  G.mode = 'won';
  const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  $('#win-title').textContent = t('win.title', def.name);
  $('#win-time').textContent = fmt(time);
  $('#win-deaths').textContent = deaths;
  $('#win-fruits').textContent = `${fr}/${tot}`;
  $('#win-score').textContent = score;
  const notes = [];
  if (newBest && prev) notes.push(ic('trophy') + t('win.record'));
  if (fr > 0) notes.push('+' + fr + ic('mango'));
  const can = CHARS.find((c) => !d.unlocked.includes(c.id) && c.cost <= d.fruits);
  if (can) notes.push(ic('lock') + t('win.canbuy', cName(can)));
  const nxt = nextInWorld(G.lvlId);
  if (nxt && !prev) notes.push(t('win.nextunlocked'));
  $('#win-note').innerHTML = notes.join('<span class=sep>·</span>');
  $('#wi-next').style.display = nxt ? '' : 'none';
  const st = $$('#win-stars i'); st.forEach((s) => s.classList.remove('on'));
  show('win');
  st.forEach((s, i) => { if (i < stars) setTimeout(() => { s.classList.add('on'); playSfx('star'); }, 350 + i * 330); });
}
$('#wi-next').addEventListener('click', () => { playSfx('click'); const n = nextInWorld(G.lvlId); if (n) startLevel(n); });
$('#wi-retry').addEventListener('click', () => { playSfx('click'); startLevel(G.lvlId); });
$('#wi-menu').addEventListener('click', () => { playSfx('click'); G.mode = 'menu'; renderLevels(); show('levels'); });

// pause
function setPause(p) {
  if (G.mode !== 'play') return;
  G.paused = p;
  $('#screen-pause').classList.toggle('active', p);
  canvas.classList.toggle('blurred', p); G.dirty = true;
}
$('#btn-pause').addEventListener('click', () => { playSfx('click'); setPause(true); });
$('#pa-resume').addEventListener('click', () => { playSfx('click'); setPause(false); });
$('#pa-retry').addEventListener('click', () => { playSfx('click'); startLevel(G.lvlId); });
$('#pa-menu').addEventListener('click', () => { playSfx('click'); G.paused = false; G.mode = 'menu'; renderLevels(); show('levels'); });
document.addEventListener('visibilitychange', () => { if (document.hidden && G.mode === 'play') setPause(true); });

// ====================================================================== contrôles
const padL = $('.pad-left');
function padDir(e) {
  const r = padL.getBoundingClientRect();
  const x = e.clientX - r.left;
  const inside = e.clientY > r.top - 30 && e.clientY < r.bottom + 30 && x > -30 && x < r.width + 30;
  if (!inside) return 0;
  return x < r.width / 2 ? -1 : 1;
}
function setDir(d) {
  input.left = d < 0; input.right = d > 0;
  $('#pb-left').classList.toggle('down', d < 0); $('#pb-right').classList.toggle('down', d > 0);
}
padL.addEventListener('pointerdown', (e) => { e.preventDefault(); padL.setPointerCapture(e.pointerId); setDir(padDir(e)); });
padL.addEventListener('pointermove', (e) => { if (padL.hasPointerCapture(e.pointerId)) setDir(padDir(e)); });
['pointerup', 'pointercancel'].forEach((n) => padL.addEventListener(n, () => setDir(0)));
const jb = $('#pb-jump');
jb.addEventListener('pointerdown', (e) => { e.preventDefault(); jb.setPointerCapture(e.pointerId); input.jump = true; input.jp = true; jb.classList.add('down'); });
['pointerup', 'pointercancel'].forEach((n) => jb.addEventListener(n, () => { input.jump = false; jb.classList.remove('down'); }));

const KEYS = {
  ArrowLeft: 'left', KeyA: 'left', KeyQ: 'left', ArrowRight: 'right', KeyD: 'right',
  Space: 'jump', ArrowUp: 'jump', KeyW: 'jump', KeyZ: 'jump',
};
const typing = (e) => e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName);   // ne jamais voler les touches du clavier au champ de texte
window.addEventListener('keydown', (e) => {
  if (typing(e)) return;
  if (e.code === 'Escape' || e.code === 'KeyP') { if (G.mode === 'play') setPause(!G.paused); return; }
  const k = KEYS[e.code]; if (!k) return;
  e.preventDefault();
  if (k === 'jump') { if (!input.jump) input.jp = true; input.jump = true; } else input[k] = true;
});
window.addEventListener('keyup', (e) => {
  if (typing(e)) return;
  const k = KEYS[e.code]; if (!k) return;
  input[k === 'jump' ? 'jump' : k] = false;
});
document.addEventListener('contextmenu', (e) => { if (!typing(e)) e.preventDefault(); });

// bouton « retour » d'Android : pause en jeu, retour au menu ailleurs
App.addListener('backButton', () => {
  if ($('#screen-confirm').classList.contains('active')) { $('#screen-confirm').classList.remove('active'); G.dirty = true; return; }
  if (G.mode === 'play') { setPause(!G.paused); return; }
  if (G.screen === 'menu') { App.exitApp(); return; }
  playSfx('click'); G.mode = 'menu'; show('menu');
}).catch(() => {});

// ====================================================================== boucle
let last = performance.now();
let first = true;
const fmtT = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;

function updatePlay(dt) {
  const S = G.sim;
  if (S.state === 'play') {
    G.levelTime += dt;
    G.acc += dt;
    while (G.acc >= DT) {
      G.acc -= DT;
      step(S, { dir: (input.right ? 1 : 0) - (input.left ? 1 : 0), j: input.jump, jp: input.jp });
      input.jp = false;
      handleEvents(S);
      if (S.state !== 'play') break;
    }
  } else if (S.state === 'dead') {
    G.deadTimer -= dt;
    if (G.deadTimer <= 0) respawn();
  } else if (S.state === 'won') {
    G.winTimer -= dt;
    if (G.winTimer <= 0 && G.mode === 'play') finishLevel();
  }
  const P = S.p;
  // modèle du joueur
  const pv = G.pv;
  pv.group.position.set(P.x, P.y, 0);
  const target = P.face > 0 ? -0.35 : -Math.PI + 0.35;
  G.ang += (target - G.ang) * (1 - Math.exp(-14 * dt));
  pv.group.rotation.y = G.ang;
  if (S.state !== 'play' || Math.abs(P.vx) > 0.2 || !P.on || input.left || input.right || input.jump) lastInput = G.t;
  // les personnages qui s'accrochent (Maki, Aye-Aye, Ikotofetsy, Tanalahy) attrapent une liane / branche pendant le saut ; elle disparaît à l'atterrissage (effet visuel)
  const hk = HANG[G.ch.id];
  const hangNow = !!hk && S.state === 'play' && !P.on && Math.abs(P.vx) > 0.8;
  if (hangNow && !G.hangPrev) { G.hangAx = P.x + P.face * 0.5; G.hangAy = P.y + 2.7; }
  G.hangPrev = hangNow; G.hangW = (G.hangW || 0) + ((hangNow ? 1 : 0) - (G.hangW || 0)) * (1 - Math.exp(-14 * dt));
  pv.group.rotation.z = 0;
  animateAnimal(pv, G.ch.id, { vx: P.vx, on: P.on, vy: P.vy, t: G.t, run: P.run, dt, idleFor: G.t - lastInput, reset: true });
  if (G.liana) {
    G.liana.visible = G.hangW > 0.04;
    if (G.liana.visible) { const hp = handPoint(pv, hk); placeLiana(G.liana, G.hangAx, Math.max(G.hangAy, hp.y + 1.0), hp.x, hp.y, clamp(G.hangW * 2, 0, 1)); }
  }
  if (S.state === 'play' && P.on && Math.abs(P.vx) > 2) { G.stepAcc += Math.abs(P.vx) * dt; if (G.stepAcc > 1.2) { G.stepAcc = 0; Sound.stepSound(G.ch.id); } }
  if (S.state === 'play') pv.group.visible = !(P.inv > 0 && Math.floor(G.t * 18) % 2 === 0);
  // blob d'ombre
  const gy = G.world.groundBelow(S, P.x, P.y);
  const blob = G.world.blob;
  blob.visible = S.state !== 'dead' && gy > -10;
  blob.position.set(P.x, gy + 0.03, 0);
  const hgt = Math.max(0, P.y - gy);
  blob.scale.setScalar(Math.max(0.45, 1.5 - hgt * 0.18));
  blob.material.opacity = Math.max(0.1, 0.38 - hgt * 0.04);
  const mer = G.ch.id === 'zazavavindrano';                       // la sirène « marche » sur l'eau : flaque + ondulations sous elle
  G.world.ripple.visible = G.world.puddle.visible = mer && blob.visible;
  if (mer) {
    const k = 1 + Math.sin(G.t * 4) * 0.14, sc = (P.on ? 1 : 0.75) * k;
    G.world.ripple.position.set(P.x, gy + 0.04, 0); G.world.ripple.scale.set(sc, sc, 1);
    G.world.puddle.position.set(P.x, gy + 0.035, 0); G.world.puddle.scale.setScalar(P.on ? 1 : 0.8);
  }
  if (G.fx) {                                                      // animation sous les pieds : boue, poussière, feuilles… selon le personnage
    G.fx.group.visible = blob.visible; G.fx.group.position.set(P.x, gy + 0.04, 0); G.fx.group.scale.setScalar(P.on ? 1 : 0.8);
    G.fx.update(G.t, Math.max(Math.min(1, Math.abs(P.vx) / 6), pv.idle ? pv.idle.fxb : 0), P.on);
  }
  G.world.update(S, G.t, dt, P.x, P.y);
  // caméra
  const L = G.L;
  const aspect = cam.aspect;
  const dist = 9.8 * Math.max(1, 1.9 / aspect);
  G.focus = dist;
  const half = 6.5 * Math.min(1, aspect / 1.9) * Math.max(1, aspect / 1.9);
  const tx = clamp(P.x + P.face * 1.6, half + 0.5, L.cols - half - 0.5);
  const ty = Math.max(P.y + 0.6, 2.6);
  G.cam.x += (tx - G.cam.x) * (1 - Math.exp(-5 * dt));
  G.cam.y += (ty - G.cam.y) * (1 - Math.exp(-3.2 * dt));
  if (pv.idle && pv.idle.shake > 0.3) G.shake = Math.max(G.shake, 0.18);                  // Rapeto tape du pied : le sol tremble
  G.shake = Math.max(0, G.shake - dt);
  const sh = G.shake * 0.6;
  cam.position.set(G.cam.x + (Math.random() - 0.5) * sh, G.cam.y + 2.9 + (Math.random() - 0.5) * sh, dist);
  cam.lookAt(G.cam.x, G.cam.y + 0.5, 0);      // caméra moins plongeante : on voit l'horizon, les fonds emblématiques et le ciel
  // HUD
  const key = `${Math.floor(G.levelTime * 10)}|${S.fruits}|${G.deaths}`;
  if (key !== G.hudKey) {
    G.hudKey = key;
    $('#hud-time').textContent = fmtT(G.levelTime);
    $('#hud-fruits').innerHTML = ic('mango') + '<b>' + S.fruits + '/' + L.fruits + '</b>';
    $('#hud-deaths').innerHTML = ic('skull') + '<b>' + G.deaths + '</b>';
  }
}

function updateMenu(dt) {
  stage.pollen.rotation.y += dt * 0.05;
  stage.update(G.t, dt);
  if (!preview) return;
  const p = preview;
  const asp = cam.aspect;
  if (!ICON) p.targetX = previewTargetX(G.screen);
  // entrée en scène : l'animal arrive en courant depuis la gauche, puis salue d'un saut
  let vx = 0;
  if (p.intro) {
    p.x += 7 * dt; vx = 7;
    if (p.x >= p.targetX - 0.05) { p.x = p.targetX; p.intro = false; p.hv = 9; Sound.voice(p.id, 'jump'); }
  } else p.x += (p.targetX - p.x) * (1 - Math.exp(-6 * dt));
  if (p.animT > 0) { p.animT -= dt; if (p.anim === 'run') vx = 6.5; if (p.animT <= 0) { p.anim = ''; p.spinV = 0; } }
  p.run += vx * dt;
  p.hv -= 24 * dt; p.hop = Math.max(0, p.hop + p.hv * dt * 0.5); if (p.hop === 0 && p.hv < 0) p.hv = 0;
  if (p.spinV > 0) { p.spin += p.spinV * dt; p.spinV *= Math.exp(-1.6 * dt); }
  else if (!dragging) p.spin *= Math.exp(-0.9 * dt);              // reprend doucement sa pose de départ
  const g = p.holder;
  g.position.set(p.x, p.hop, 0);
  stage.sun.position.set(p.targetX - 6, 10, 8); stage.sun.target.position.set(p.targetX, 0, 0);   // le cadre d'ombre suit l'animal
  stage.base.position.x = p.targetX; stage.base.visible = g.visible;      // le socle en bois ne bouge pas : seul l'animal s'anime
  const idleSway = (p.intro || vx > 0) ? 0 : Math.sin(G.t * 0.6) * 0.18;
  g.rotation.y = (p.intro || p.anim === 'run' ? -0.2 : -0.55) + p.spin + idleSway;
  if (vx > 0 || p.intro || p.animT > 0 || dragging || p.hop > 0) lastInput = G.t;
  animateAnimal(p.a, p.id, { vx, on: p.hop === 0, vy: p.hv, t: G.t, run: p.run, dt, idleFor: G.t - lastInput, reset: false });
  const idl = p.a.idle;
  if (stage.fx) stage.fx.update(G.t, Math.max(Math.min(1, vx / 6), idl ? idl.fxb : 0), true);
  if (stage.flames) for (const f of stage.flames) f.scale.set(1, 1 + 0.3 * Math.sin(G.t * 11 + f.userData.flame * 2), 1);
  if (stage.discTex === 'water') { const sm = stage.water.material.map; sm.offset.x = G.t * 0.03; sm.offset.y = Math.sin(G.t * 0.6) * 0.02; }
  if (stage.waterMesh) { const sm = stage.waterMesh.material.map; sm.offset.x = G.t * 0.03; sm.offset.y = Math.sin(G.t * 0.6) * 0.02; }
  if (ICON) {                                   // mode « icône » : plan serré sur l'animal (outil de génération d'icônes)
    p.targetX = p.x = 0; g.rotation.y = -0.62; stage.base.visible = false;
    const far = new URLSearchParams(location.search).has('far');
    cam.position.set(0.3, far ? 2.2 : 1.8, far ? 12.5 : 7.8); cam.lookAt(0, far ? 1.35 : 1.45, 0);
    return;
  }
  const shk = idl && idl.shake > 0.3 ? 0.05 : 0;                          // le sol tremble (Rapeto)
  cam.position.set((Math.random() - 0.5) * shk, 2.2 + (Math.random() - 0.5) * shk, 10.2 * Math.max(1, 1.9 / asp));
  cam.lookAt(0, 1.45, 0);
}
// ---- réglage automatique : si le jeu saccade (moins de ~38 images/s) pendant 2 s, il baisse tout seul la qualité (et s'en souvient)
let govN = 0, govSlow = 0, govFrom = 0;
function downgradeQuality() {
  const cur = G.quality; if (cur === 'low') return;
  qcap = cur === 'high' ? 'mid' : 'low';
  try { localStorage.setItem('mirindra.qcap', qcap); } catch (e) { /* pas de stockage */ }
  applyQuality();
  for (const sc of [stage && stage.scene, G.world && G.world.scene]) if (sc) sc.traverse((o) => { if (o.material) [].concat(o.material).forEach((m) => { m.needsUpdate = true; }); });   // les ombres changent : on recompile les matériaux
}
function frame(now) {
  requestAnimationFrame(frame);
  if (G.quality === 'low' && now - last < 30) return;                          // 30 images/s max en mode éco (batterie, chauffe)
  const raw = now - last;
  const dt = Math.max(0, Math.min(0.05, raw / 1000)); last = now;   // jamais négatif (1re image)
  if ((G.mode === 'play' && !G.paused) || (G.mode === 'menu' && VIEWS_3D.includes(G.screen))) {
    if (G.t > govFrom && raw > 0 && !document.hidden) { govN++; if (raw > 26 && raw < 400) govSlow++; if (govN >= 120) { if (govSlow > 54 && G.quality !== 'low') downgradeQuality(); govN = govSlow = 0; } }
  } else { govN = govSlow = 0; govFrom = G.t + 3; }
  G.t += dt; G.frame++;
  if (G.mode === 'splash' && splash) {                                    // page d'ouverture : on charge un peu, on anime, on dessine
    splash.pump(); splash.update(G.t, dt); renderer.render(splash.scene, splash.camera);
    if (first) { first = false; $('#loading').classList.add('done'); setTimeout(() => $('#loading').remove(), 700); }
    return;
  }
  const playing = G.mode === 'play' && !G.paused;
  const menu3d = G.mode === 'menu' && VIEWS_3D.includes(G.screen);
  if (G.quality !== 'high') renderer.shadowMap.needsUpdate = (G.frame & 1) === 0;
  if (playing) updatePlay(dt); else if (menu3d) updateMenu(dt);
  // écrans statiques (niveaux, réglages, pause, victoire…) : une seule image suffit, le GPU se repose
  if (playing || menu3d || G.dirty) {
    drawScene(G.mode === 'menu' ? stage.scene : G.world.scene, G.mode === 'menu' ? 10.2 * Math.max(1, 1.9 / cam.aspect) : (G.focus || 9.8));
    G.dirty = false;
  }
  if (first) { first = false; $('#loading').classList.add('done'); setTimeout(() => $('#loading').remove(), 700); }
}

// ====================================================================== démarrage
applyQuality();
const qs = new URLSearchParams(location.search);
const SKIP_SPLASH = ICON || qs.has('level') || qs.has('screen') || qs.has('nosplash');

/** Construit le décor des menus. Pendant la page d'ouverture, c'est une tâche de la barre de progression. */
function initGame(showMenu) {
  stage = buildStage('forest', qualityLevel());
  setPreview(Save.get().char);
  if (showMenu) { show('menu'); if (!ICON) { preview.intro = true; preview.x = -16; } }
  else preview.holder.visible = false;
}
function runSplash() {
  G.mode = 'splash'; G.screen = 'splash';
  document.body.dataset.view = 'splash';
  const el = $('#splash'); el.classList.add('active'); el.classList.toggle('noimg', !hasSplashImage);
  if (!hasSplashImage) { el.insertAdjacentHTML('afterbegin', buildSplashScene()); animateTitle(el); }
  // le « chargement » est réel : on construit le décor des menus, on prépare chaque animal (textures, formes) et on compile les shaders
  const warm = CHARS.map((c) => ({ w: 1, fn: () => { buildAnimal(c.id); } }));
  splash = createSplash(renderer, {
    minMs: 5000,
    onLayout: (A, fill) => { el.style.setProperty('--ia', A); el.classList.toggle('fill', fill); },
    tasks: [{ w: 5, fn: () => initGame(false) }, ...warm, { w: 3, fn: () => renderer.compile(stage.scene, cam) }],
    onProgress: (p, done) => {
      const pc = Math.round(p * 100);
      $('#sp-fill').style.width = pc + '%'; $('#sp-pct').textContent = pc + '%';
      if (done && !el.classList.contains('ready')) { el.classList.add('ready'); armStart(); }
    },
  });
  splash.resize(cam.aspect);
  try { Sound.unlock(); } catch (e) { /* la musique démarrera au premier toucher */ }
  const wake = () => { try { Sound.unlock(); } catch (e) {} };
  window.addEventListener('pointerdown', wake, { once: true });
}
function armStart() {
  const go = () => { window.removeEventListener('pointerdown', go); window.removeEventListener('keydown', go); endSplash(); };
  setTimeout(() => { window.addEventListener('pointerdown', go); window.addEventListener('keydown', go); }, 300);
}
function endSplash() {
  Sound.unlock(); playSfx('star');
  const el = $('#splash'); el.classList.add('out');
  setTimeout(() => {
    el.classList.remove('active', 'out', 'ready');
    disposeScene(splash.scene); splash = null;
    G.mode = 'menu'; show('menu');
    if (!ICON) { preview.intro = true; preview.x = -16; }
    G.dirty = true;
  }, 600);
}
if (SKIP_SPLASH) initGame(true);
if (!SKIP_SPLASH) runSplash();
if (ICON) { document.body.classList.add('icon'); if (qs.get('c')) setPreview(qs.get('c')); }
if (qs.get('level')) startLevel(clamp(Number(qs.get('level')) || 1, 1, LEVELS.length));
else if (qs.get('screen') === 'chars') { chIdx = Number(qs.get('i') || 0); renderChars(); show('chars'); }
else if (qs.get('screen') === 'levels') { tabWorld = Number(qs.get('w') || 0); renderLevels(); show('levels'); }
requestAnimationFrame(frame);
