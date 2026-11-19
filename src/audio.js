// Sons synthétisés (aucun fichier audio) : effets + petite musique d'ambiance pentatonique.
let ctx = null;
let master = null;
let musicGain = null;
let musicTimer = null;
const opts = { sound: true, music: true, volSfx: 0.8, volMusic: 0.5, volVoice: 0.9 };
let sfxGain = null;
let voiceGain = null;

function applyGains() {
  if (musicGain) musicGain.gain.value = opts.music ? opts.volMusic : 0;
  if (sfxGain) sfxGain.gain.value = opts.sound ? opts.volSfx : 0;
  if (voiceGain) voiceGain.gain.value = opts.sound ? opts.volVoice : 0;
}
export function setOptions(o) {
  Object.assign(opts, o);
  applyGains();
  if (!opts.music) stopMusic(); else if (ctx) startMusic();
}

export function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.35; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.connect(master);
    sfxGain = ctx.createGain(); sfxGain.connect(master);
    voiceGain = ctx.createGain(); voiceGain.connect(master);
    applyGains();
  }
  if (ctx.state === 'suspended') ctx.resume();
  if (opts.music) startMusic();
}

function tone(freq, dur, type = 'sine', vol = 0.4, slide = 0, when = 0, dest = null) {
  if (!ctx) return;
  const t = ctx.currentTime + when;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
  const atk = dest === musicGain ? 0.06 : Math.min(0.012, dur * 0.2);          // attaque douce : plus de « clic » au début des notes
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + atk);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(dest || sfxGain || master);
  o.start(t); o.stop(t + dur + 0.02);
}

function noise(dur, vol = 0.3, hp = 400, when = 0, dest = null) {
  if (!ctx) return;
  const n = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = ctx.createBufferSource(); s.buffer = buf;
  const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp;
  const g = ctx.createGain(); g.gain.value = vol;
  s.connect(f); f.connect(g); g.connect(dest || sfxGain || master); s.start(ctx.currentTime + when);
}

export function sfx(name) {
  if (!opts.sound || !ctx) return;
  switch (name) {
    case 'jump': tone(300, 0.16, 'square', 0.12, 380); break;
    case 'jump2': tone(460, 0.16, 'square', 0.12, 420); break;
    case 'land': noise(0.06, 0.12, 900); break;
    case 'fruit': tone(880, 0.09, 'triangle', 0.3); tone(1320, 0.14, 'triangle', 0.3, 0, 0.07); break;
    case 'die': tone(380, 0.45, 'sawtooth', 0.25, -330); noise(0.25, 0.25, 200); break;
    case 'win': [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.28, 'triangle', 0.3, 0, i * 0.11)); break;
    case 'rumble': noise(0.22, 0.2, 80); break;
    case 'spike': tone(1100, 0.08, 'square', 0.18, -700); break;
    case 'thud': noise(0.12, 0.3, 60); break;
    case 'spring': tone(220, 0.3, 'sine', 0.35, 700); break;
    case 'dodge': tone(700, 0.2, 'sawtooth', 0.12, 300); tone(500, 0.2, 'sawtooth', 0.12, -200, 0.12); break;
    case 'shield': tone(700, 0.3, 'triangle', 0.3, 500); break;
    case 'bonk': tone(150, 0.12, 'square', 0.25, -60); break;
    case 'click': tone(660, 0.05, 'triangle', 0.18); break;
    case 'hover': tone(1000, 0.03, 'triangle', 0.05); break;
    case 'star': tone(990, 0.2, 'triangle', 0.3); break;
    default: break;
  }
}

// ---- musique d'ambiance : arpège pentatonique doux
const SCALE = [0, 2, 4, 7, 9, 12, 14, 16];
function startMusic() {
  if (musicTimer || !ctx) return;
  let i = 0;
  const base = 196; // sol
  musicTimer = setInterval(() => {
    if (!opts.music || ctx.state !== 'running') return;
    const step = SCALE[(i * 3 + (i % 5)) % SCALE.length];
    const f = base * Math.pow(2, step / 12);
    tone(f, 1.4, 'sine', 0.14, 0, 0, musicGain);
    if (i % 4 === 0) tone(base / 2 * Math.pow(2, SCALE[(i / 4) % 5] / 12), 2.4, 'triangle', 0.1, 0, 0, musicGain);
    i++;
  }, 520);
}
function stopMusic() { if (musicTimer) { clearInterval(musicTimer); musicTimer = null; } }


// ---------------------------------------------------------------- voix des personnages
// note : [fréquence, glissando, durée, forme, volume, délai]   bruit : ['n', durée, volume, filtre, délai]
const VOICES = {
  kalanoro: { jump: [[820, 320, 0.14, 'triangle', 0.2], [1100, 200, 0.1, 'triangle', 0.14, 0.08]], die: [[900, -650, 0.5, 'triangle', 0.3], [480, -260, 0.4, 'sine', 0.2, 0.14]], win: [[700, 0, 0.12, 'triangle', 0.25], [900, 0, 0.12, 'triangle', 0.25, 0.12], [1200, 0, 0.3, 'triangle', 0.25, 0.24]] },
  maki: { jump: [[1300, 500, 0.07, 'triangle', 0.16], [1700, -300, 0.06, 'triangle', 0.12, 0.07]], die: [[1500, -1000, 0.45, 'triangle', 0.28], [1100, -700, 0.3, 'triangle', 0.18, 0.12]], win: [[1400, 0, 0.08, 'triangle', 0.2], [1700, 0, 0.08, 'triangle', 0.2, 0.1], [2000, 0, 0.2, 'triangle', 0.2, 0.2]] },
  fosa: { jump: [['n', 0.12, 0.2, 300], [180, -60, 0.14, 'sawtooth', 0.12]], die: [[220, -140, 0.6, 'sawtooth', 0.3], ['n', 0.4, 0.15, 150, 0.05], [160, -90, 0.5, 'sawtooth', 0.2, 0.2]], win: [[200, 40, 0.3, 'sawtooth', 0.22], [260, 60, 0.4, 'sawtooth', 0.22, 0.25]] },
  omby: { jump: [[130, 25, 0.22, 'sawtooth', 0.2], [136, 20, 0.22, 'sawtooth', 0.14]], die: [[120, -45, 0.9, 'sawtooth', 0.34], [127, -50, 0.9, 'sawtooth', 0.24], [60, 0, 0.8, 'sine', 0.3]], win: [[120, 30, 0.4, 'sawtooth', 0.26], [150, 20, 0.55, 'sawtooth', 0.26, 0.35]] },
  sahona: { jump: [[260, 280, 0.1, 'square', 0.12], [330, 200, 0.08, 'square', 0.1, 0.07]], die: [[240, -100, 0.14, 'square', 0.2], [220, -90, 0.14, 'square', 0.2, 0.16], [150, -80, 0.3, 'square', 0.2, 0.32]], win: [[260, 120, 0.1, 'square', 0.18], [340, 120, 0.1, 'square', 0.18, 0.14], [420, 120, 0.2, 'square', 0.18, 0.28]] },
  saka: { jump: [[620, 300, 0.12, 'triangle', 0.2], [900, -200, 0.1, 'triangle', 0.14, 0.1]], die: [[560, 380, 0.25, 'triangle', 0.3], [940, -520, 0.55, 'triangle', 0.3, 0.22]], win: [[600, 300, 0.2, 'triangle', 0.25], [900, -300, 0.3, 'triangle', 0.25, 0.22]] },
  alika: { jump: [['n', 0.07, 0.22, 700], [380, -170, 0.1, 'sawtooth', 0.16]], die: [[320, -180, 0.14, 'sawtooth', 0.28], ['n', 0.1, 0.2, 800], [300, -200, 0.14, 'sawtooth', 0.26, 0.18], [260, -150, 0.5, 'sine', 0.2, 0.36]], win: [[340, 0, 0.1, 'sawtooth', 0.24], [340, 0, 0.1, 'sawtooth', 0.24, 0.16], [420, 0, 0.22, 'sawtooth', 0.24, 0.32]] },
  sifaka: { jump: [[1500, -700, 0.09, 'triangle', 0.18], [1800, -900, 0.09, 'triangle', 0.14, 0.1]], die: [[1700, -1100, 0.4, 'triangle', 0.28], [1400, -900, 0.3, 'triangle', 0.2, 0.2]], win: [[1500, -400, 0.14, 'triangle', 0.22], [1800, -500, 0.14, 'triangle', 0.22, 0.17], [2100, -600, 0.2, 'triangle', 0.22, 0.34]] },
  ayeaye: { jump: [[420, -120, 0.16, 'sawtooth', 0.14], [415, -110, 0.16, 'square', 0.08]], die: [[500, -380, 0.7, 'sawtooth', 0.26], [510, -390, 0.7, 'square', 0.14]], win: [[400, 100, 0.2, 'sawtooth', 0.2], [520, 120, 0.3, 'sawtooth', 0.2, 0.2]] },
  tana: { jump: [['n', 0.1, 0.18, 2500], [1700, 0, 0.03, 'square', 0.1]], die: [['n', 0.6, 0.25, 1800], [900, -500, 0.4, 'sawtooth', 0.12, 0.1]], win: [[1000, 0, 0.04, 'square', 0.14], [1300, 0, 0.04, 'square', 0.14, 0.09], [1600, 0, 0.08, 'square', 0.14, 0.18]] },
  tenrec: { jump: [[1700, 300, 0.06, 'square', 0.12], [2000, 200, 0.05, 'square', 0.1, 0.06]], die: [[1800, -1200, 0.35, 'square', 0.2], [1500, -900, 0.25, 'square', 0.14, 0.1]], win: [[1700, 0, 0.06, 'square', 0.16], [2000, 0, 0.06, 'square', 0.16, 0.08], [2300, 0, 0.12, 'square', 0.16, 0.16]] },
};
VOICES.lolo = { jump: [[170, 70, 0.26, 'sawtooth', 0.18], [215, -40, 0.2, 'triangle', 0.12, 0.1]], die: [[210, -150, 0.85, 'sawtooth', 0.28], [120, -60, 0.7, 'sine', 0.24, 0.2]], win: [[170, 50, 0.3, 'sawtooth', 0.22], [230, 60, 0.45, 'sawtooth', 0.22, 0.28]] };
VOICES.vazimba = { jump: [[900, 400, 0.08, 'square', 0.13], [1250, -300, 0.07, 'square', 0.1, 0.07]], die: [[1000, -700, 0.4, 'square', 0.2], [600, -300, 0.3, 'triangle', 0.15, 0.15]], win: [[900, 0, 0.07, 'square', 0.16], [1200, 0, 0.07, 'square', 0.16, 0.09], [1500, 0, 0.14, 'square', 0.16, 0.18]] };
VOICES.angatra = { jump: [[500, 320, 0.38, 'sine', 0.2], [512, 330, 0.38, 'sine', 0.14]], die: [[620, -460, 1.0, 'sine', 0.28], [634, -470, 1.0, 'sine', 0.2], ['n', 0.6, 0.1, 2200, 0.1]], win: [[500, 200, 0.4, 'sine', 0.22], [700, 200, 0.55, 'sine', 0.22, 0.3]] };
VOICES.trimobe = { jump: [[90, 40, 0.3, 'sawtooth', 0.26], [95, 30, 0.3, 'square', 0.12]], die: [[110, -80, 1.0, 'sawtooth', 0.32], [60, -20, 0.9, 'sine', 0.3, 0.2]], win: [[90, 30, 0.4, 'sawtooth', 0.28], [120, 40, 0.5, 'sawtooth', 0.28, 0.35]] };
VOICES.tortue = { jump: [[220, 60, 0.12, 'triangle', 0.16], ['n', 0.1, 0.12, 900, 0.02]], die: [[260, -150, 0.5, 'triangle', 0.22], ['n', 0.3, 0.12, 700]], win: [[240, 40, 0.2, 'triangle', 0.2], [300, 60, 0.3, 'triangle', 0.2, 0.2]] };
VOICES.sorciere = { jump: [[700, 200, 0.07, 'square', 0.14], [900, -200, 0.07, 'square', 0.12, 0.09], [700, 200, 0.07, 'square', 0.12, 0.18]], die: [[800, -500, 0.5, 'square', 0.22], [500, -250, 0.5, 'sawtooth', 0.16, 0.2]], win: [[700, 200, 0.08, 'square', 0.18], [900, 0, 0.08, 'square', 0.18, 0.1], [700, 200, 0.08, 'square', 0.18, 0.2], [1000, 0, 0.2, 'square', 0.18, 0.3]] };
VOICES.darafify = { jump: [['n', 0.12, 0.2, 250], [140, -40, 0.2, 'sawtooth', 0.2]], die: [[170, -110, 0.8, 'sawtooth', 0.3], ['n', 0.5, 0.18, 150, 0.1]], win: [[150, 40, 0.3, 'sawtooth', 0.24], [210, 40, 0.4, 'sawtooth', 0.24, 0.3]] };
VOICES.rapeto = { jump: [[100, 50, 0.28, 'sawtooth', 0.24], [130, 30, 0.2, 'triangle', 0.14, 0.12]], die: [[140, -90, 0.9, 'sawtooth', 0.3], [70, -30, 0.8, 'sine', 0.26, 0.2]], win: [[100, 40, 0.35, 'sawtooth', 0.26], [140, 50, 0.5, 'sawtooth', 0.26, 0.32]] };
VOICES.ikotofetsy = { jump: [[1100, 500, 0.06, 'square', 0.12], [1500, -300, 0.06, 'square', 0.1, 0.06]], die: [[1300, -900, 0.35, 'square', 0.18], [900, -500, 0.25, 'triangle', 0.14, 0.12]], win: [[1100, 0, 0.06, 'square', 0.16], [1400, 0, 0.06, 'square', 0.16, 0.08], [1800, 0, 0.12, 'square', 0.16, 0.16]] };
VOICES.imahaka = { jump: [[240, 80, 0.16, 'sawtooth', 0.2], [250, 70, 0.16, 'square', 0.1]], die: [[260, -170, 0.7, 'sawtooth', 0.28], [140, -60, 0.6, 'square', 0.18, 0.15]], win: [[240, 60, 0.25, 'sawtooth', 0.22], [320, 60, 0.35, 'sawtooth', 0.22, 0.25]] };
VOICES.ibonia = { jump: [[420, 400, 0.14, 'triangle', 0.22], [700, -200, 0.1, 'triangle', 0.14, 0.12]], die: [[520, -340, 0.6, 'triangle', 0.28], [300, -120, 0.5, 'sine', 0.2, 0.15]], win: [[420, 200, 0.2, 'triangle', 0.26], [630, 200, 0.2, 'triangle', 0.26, 0.2], [840, 100, 0.4, 'triangle', 0.26, 0.4]] };
VOICES.ikotobekibo = { jump: [[200, 400, 0.14, 'sine', 0.26], [210, 380, 0.14, 'triangle', 0.14]], die: [[300, -200, 0.4, 'sine', 0.26], [200, -100, 0.4, 'triangle', 0.18, 0.15]], win: [[200, 300, 0.15, 'sine', 0.24], [300, 300, 0.15, 'sine', 0.24, 0.17], [420, 200, 0.3, 'sine', 0.24, 0.34]] };
VOICES.zazavavindrano = { jump: [[620, 380, 0.4, 'sine', 0.2], [640, 390, 0.4, 'sine', 0.14, 0.02]], die: [[760, -540, 1.0, 'sine', 0.26], [780, -550, 1.0, 'sine', 0.18], [380, -100, 0.8, 'triangle', 0.12, 0.2]], win: [[620, 260, 0.4, 'sine', 0.22], [820, 260, 0.4, 'sine', 0.22, 0.3], [1040, 200, 0.6, 'sine', 0.22, 0.6]] };
VOICES.kisoa = { jump: [[240, -50, 0.1, 'square', 0.2], [210, -40, 0.1, 'square', 0.16, 0.12]], die: [[320, -180, 0.2, 'square', 0.26], [280, -160, 0.2, 'square', 0.22, 0.2], [200, -100, 0.4, 'sawtooth', 0.18, 0.4]], win: [[240, 60, 0.12, 'square', 0.22], [220, 50, 0.12, 'square', 0.22, 0.16], [300, 80, 0.3, 'square', 0.22, 0.32]] };
const STEPS = {
  trimobe: () => { noise(0.07, 0.12, 200); tone(80, 0.1, 'square', 0.1); },
  tortue: () => noise(0.06, 0.07, 400),
  rapeto: () => { noise(0.06, 0.1, 250); },
  zazavavindrano: () => {},
  lolo: () => noise(0.05, 0.08, 300),
  vazimba: () => tone(520, 0.03, 'triangle', 0.06),
  angatra: () => {},
  omby: () => { noise(0.04, 0.1, 500); tone(140, 0.07, 'square', 0.09); },
  sahona: () => tone(180, 0.07, 'sine', 0.1, 160),
  kalanoro: () => tone(1500, 0.03, 'triangle', 0.05),
  tana: () => tone(900, 0.02, 'square', 0.04),
  tenrec: () => noise(0.04, 0.06, 3000),
  alika: () => noise(0.035, 0.06, 1200),
};
export function voice(id, kind) {
  if (!opts.sound || !ctx) return;
  const v = (VOICES[id] || VOICES.maki)[kind];
  if (!v) return;
  for (const n of v) { if (n[0] === 'n') noise(n[1], n[2], n[3], n[4] || 0, voiceGain); else tone(n[0], n[2], n[3], n[4], n[1], n[5] || 0, voiceGain); }
}
export function stepSound(id) {
  if (!opts.sound || !ctx) return;
  (STEPS[id] || (() => noise(0.035, 0.05, 1500)))();
}
export function vibrate(ms) {
  try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* non supporté */ }
}

// l'appli passe en arrière-plan (écran verrouillé, autre appli) : on coupe le son, ça économise la batterie et la mémoire
document.addEventListener('visibilitychange', () => {
  if (!ctx) return;
  if (document.hidden) ctx.suspend(); else if (opts.sound || opts.music) ctx.resume();
});
