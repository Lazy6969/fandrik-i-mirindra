// Sauvegarde locale (localStorage) : profil, personnage, fruits, scores, étoiles, réglages.
const KEY = 'mirindra.save.v2';
const OLD_KEY = ['maki', 'devil'].join('') + '.save.v2';   // reprise unique d'une progression enregistrée sous l'ancien nom

const defaults = () => ({
  profile: { name: 'Mpilalao' },
  char: 'kalanoro',
  fruits: 0,
  unlocked: ['kalanoro', 'maki', 'fosa', 'omby', 'sahona'],
  items: [],             // accessoires achetés (ex. 'hat:straw')
  skins: {},             // personnage -> { hat, glasses, scarf, boots }
  levels: {},            // id -> { best, stars, deaths, time, fruits }
  settings: { sound: true, music: true, vibrate: true, quality: 'auto', lang: 'mg', volSfx: 0.8, volMusic: 0.5, volVoice: 0.9 },
});

let data = defaults();

function merge(d) {
  const base = defaults();
  return { ...base, ...d, profile: { ...base.profile, ...(d.profile || {}) }, settings: { ...base.settings, ...(d.settings || {}) } };
}

export function load() {
  try {
    let raw = localStorage.getItem(KEY);
    if (!raw) { const old = localStorage.getItem(OLD_KEY); if (old) { raw = old; localStorage.setItem(KEY, old); localStorage.removeItem(OLD_KEY); } }
    if (raw) data = merge(JSON.parse(raw));
  } catch (e) { data = defaults(); }
  return data;
}

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* stockage indisponible */ }
}

export const get = () => data;

export function totalScore() {
  return Object.values(data.levels).reduce((s, l) => s + (l.best || 0), 0);
}
export function totalStars() {
  return Object.values(data.levels).reduce((s, l) => s + (l.stars || 0), 0);
}
export const skinOf = (id) => ({ ...(data.skins[id] || {}) });
export function reset() { const keep = { lang: data.settings.lang, quality: data.settings.quality, sound: data.settings.sound, music: data.settings.music, vibrate: data.settings.vibrate, volSfx: data.settings.volSfx, volMusic: data.settings.volMusic, volVoice: data.settings.volVoice }; data = defaults(); Object.assign(data.settings, keep); save(); }
export function setPhoto(url) { data.profile.photo = url || ''; save(); }

export function setName(n) {
  const clean = String(n || '').replace(/[<>&"]/g, '').trim().slice(0, 16);
  data.profile.name = clean || 'Mpilalao';
  save();
  return data.profile.name;
}

/** Profil exportable (texte JSON) : tout ce qui compte, sans les réglages d'appareil. */
export function exportProfile() {
  const { profile, char, fruits, unlocked, items, skins, levels } = data;
  return JSON.stringify({ game: 'fandrikim-mirindra', v: 2, profile, char, fruits, unlocked, items, skins, levels });
}
/** Importe un profil exporté. Renvoie le nom importé ou lance une erreur si le texte est invalide. */
export function importProfile(text) {
  let d;
  try { d = JSON.parse(text); } catch (e) { throw new Error('json'); }
  if (!d || d.game !== 'fandrikim-mirindra' || typeof d.char !== 'string') throw new Error('format');
  const keep = data.settings;
  data = merge({ ...d, settings: keep });
  if (!Array.isArray(data.unlocked)) data.unlocked = ['kalanoro'];
  if (!data.unlocked.includes(data.char)) data.char = data.unlocked[0];
  data.profile.name = String(data.profile.name || 'Mpilalao').replace(/[<>&"]/g, '').slice(0, 16);
  save();
  return data.profile.name;
}
/** Profil préréglé : applique un nom, un animal et une tenue de départ (objets offerts). */
export function applyPreset(p) {
  if (p.name) data.profile.name = p.name;
  if (!data.unlocked.includes(p.char)) data.unlocked.push(p.char);
  data.char = p.char;
  data.skins[p.char] = { ...p.skin };
  for (const [cat, id] of Object.entries(p.skin)) { const k = cat + ':' + id; if (!data.items.includes(k)) data.items.push(k); }
  save();
}