// Décor dessiné en SVG pour la page d'ouverture (utilisé quand l'illustration src/assets/splash.* est absente) :
// baobabs et ravinalas qui ondulent, plantes, et les personnages du jeu en dessin cartoon qui rebondissent / marchent.
const eye = (x, y, r = 2.6) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/><circle cx="${x + 0.5}" cy="${y + 0.2}" r="${r * 0.55}" fill="#1b1b1b"/>`;

const CH = {
  lemur: () => `
    <g class="tail"><path d="M70 70 C98 70 100 38 82 32" fill="none" stroke="#e9e9ec" stroke-width="9" stroke-linecap="round"/>
      <path d="M72 66 C94 66 96 44 84 36" fill="none" stroke="#2a2a2e" stroke-width="9" stroke-linecap="round" stroke-dasharray="4 5"/></g>
    <ellipse cx="50" cy="68" rx="24" ry="22" fill="#9aa0a8"/><ellipse cx="50" cy="73" rx="14" ry="15" fill="#f4f4f4"/>
    <rect x="34" y="82" width="10" height="14" rx="5" fill="#7f858d"/><rect x="56" y="82" width="10" height="14" rx="5" fill="#7f858d"/>
    <circle cx="50" cy="38" r="21" fill="#a9afb7"/><circle cx="35" cy="22" r="7" fill="#8b9199"/><circle cx="65" cy="22" r="7" fill="#8b9199"/>
    <ellipse cx="50" cy="44" rx="13" ry="11" fill="#f6f6f6"/><ellipse cx="39" cy="35" rx="7" ry="8" fill="#2a2a2e"/><ellipse cx="61" cy="35" rx="7" ry="8" fill="#2a2a2e"/>
    ${eye(39, 35, 3.4)}${eye(61, 35, 3.4)}<ellipse cx="50" cy="42" rx="4" ry="3" fill="#2a2a2e"/><path d="M44 48 Q50 53 56 48" fill="none" stroke="#2a2a2e" stroke-width="1.6" stroke-linecap="round"/>`,
  fosa: () => `
    <g class="tail"><path d="M24 66 C2 66 0 40 10 30" fill="none" stroke="#a5562a" stroke-width="8" stroke-linecap="round"/></g>
    <ellipse cx="50" cy="68" rx="28" ry="17" fill="#b9652f"/><rect x="30" y="76" width="9" height="19" rx="4.5" fill="#9b5226"/><rect x="60" y="76" width="9" height="19" rx="4.5" fill="#9b5226"/>
    <circle cx="74" cy="50" r="17" fill="#c97239"/><path d="M62 38 L66 22 L74 36Z M80 36 L88 24 L90 40Z" fill="#b9652f"/>
    <ellipse cx="84" cy="56" rx="9" ry="7" fill="#e7b78a"/><circle cx="91" cy="53" r="3" fill="#222"/>${eye(72, 46, 3.2)}<path d="M80 61 Q85 64 90 60" fill="none" stroke="#3a2012" stroke-width="1.5" stroke-linecap="round"/>`,
  omby: () => `
    <g class="tail"><path d="M18 62 C8 66 8 80 12 86" fill="none" stroke="#222" stroke-width="3.5" stroke-linecap="round"/></g>
    <ellipse cx="48" cy="64" rx="30" ry="19" fill="#fbfbfb"/><ellipse cx="38" cy="58" rx="9" ry="7" fill="#262626"/><ellipse cx="58" cy="70" rx="10" ry="6" fill="#262626"/>
    <rect x="26" y="74" width="9" height="20" rx="4" fill="#efefef"/><rect x="60" y="74" width="9" height="20" rx="4" fill="#efefef"/>
    <ellipse cx="80" cy="52" rx="16" ry="14" fill="#fbfbfb"/><ellipse cx="86" cy="60" rx="10" ry="7.5" fill="#f4b6b6"/><circle cx="83" cy="60" r="1.6" fill="#a2505a"/><circle cx="89" cy="60" r="1.6" fill="#a2505a"/>
    <path d="M70 41 Q66 30 72 28 M88 41 Q92 30 86 28" fill="none" stroke="#e7d9a8" stroke-width="3.5" stroke-linecap="round"/><ellipse cx="68" cy="48" rx="6" ry="3.4" fill="#262626"/>${eye(78, 49, 3)}`,
  kisoa: () => `
    <g class="tail"><path d="M20 62 q-9 -2 -5 -9 q5 3 3 -3" fill="none" stroke="#e8909a" stroke-width="3" stroke-linecap="round"/></g>
    <ellipse cx="48" cy="66" rx="29" ry="20" fill="#f4a0aa"/><rect x="28" y="78" width="9" height="16" rx="4" fill="#e8909a"/><rect x="58" y="78" width="9" height="16" rx="4" fill="#e8909a"/>
    <circle cx="76" cy="56" r="17" fill="#f6adb6"/><path d="M64 44 L66 30 L77 42Z M80 42 L90 32 L90 46Z" fill="#e8909a"/>
    <ellipse cx="86" cy="62" rx="9" ry="7" fill="#f08f9b"/><circle cx="83" cy="62" r="1.8" fill="#8a3342"/><circle cx="89" cy="62" r="1.8" fill="#8a3342"/>${eye(74, 52, 3.1)}`,
  tortue: () => `
    <ellipse cx="50" cy="78" rx="30" ry="8" fill="#7ea84a"/><path d="M18 76 Q20 36 52 34 Q84 36 84 76Z" fill="#a8742f"/><path d="M26 74 Q28 46 52 44 Q76 46 76 74Z" fill="#c4913d"/>
    <path d="M52 36 V74 M34 52 H70 M30 64 H74" stroke="#7a4f1c" stroke-width="2" fill="none"/>
    <rect x="26" y="78" width="12" height="12" rx="5" fill="#7ea84a"/><rect x="62" y="78" width="12" height="12" rx="5" fill="#7ea84a"/>
    <g class="neck"><circle cx="90" cy="66" r="9" fill="#8fbb55"/>${eye(93, 63, 2.6)}<path d="M92 70 Q96 72 98 69" fill="none" stroke="#3b5a1c" stroke-width="1.4" stroke-linecap="round"/></g>`,
  cameleon: () => `
    <g class="tail"><path d="M24 70 C4 70 4 46 20 48 C28 50 24 58 18 56" fill="none" stroke="#76b84a" stroke-width="8" stroke-linecap="round"/></g>
    <ellipse cx="50" cy="66" rx="26" ry="14" fill="#7cc04c"/><path d="M30 60 Q50 46 70 60" fill="none" stroke="#e9d34a" stroke-width="4" stroke-dasharray="3 5" stroke-linecap="round"/>
    <rect x="34" y="72" width="7" height="16" rx="3" fill="#62a53a"/><rect x="60" y="72" width="7" height="16" rx="3" fill="#62a53a"/>
    <path d="M66 54 Q76 38 90 50 Q92 64 74 68Z" fill="#8bce56"/><path d="M70 42 Q74 32 82 36" fill="#8bce56" stroke="#62a53a" stroke-width="2"/>
    <circle cx="80" cy="50" r="6.5" fill="#f6e46a"/><circle cx="80" cy="50" r="3.2" fill="#222"/><path d="M76 62 Q84 64 90 59" fill="none" stroke="#3b5a1c" stroke-width="1.5" stroke-linecap="round"/>`,
  sahona: () => `
    <ellipse cx="50" cy="72" rx="30" ry="16" fill="#6a8f3a"/><ellipse cx="50" cy="78" rx="20" ry="9" fill="#cfe08a"/>
    <circle cx="36" cy="52" r="11" fill="#78a043"/><circle cx="64" cy="52" r="11" fill="#78a043"/>${eye(36, 50, 5.4)}${eye(64, 50, 5.4)}
    <path d="M30 70 Q50 82 70 70" fill="none" stroke="#2f4a17" stroke-width="2.2" stroke-linecap="round"/><circle cx="26" cy="68" r="2.4" fill="#a9c85a"/><circle cx="74" cy="68" r="2.4" fill="#a9c85a"/>
    <rect x="22" y="80" width="14" height="9" rx="4.5" fill="#5a7d2e"/><rect x="64" y="80" width="14" height="9" rx="4.5" fill="#5a7d2e"/>`,
};

const baobab = (x, s, delay) => `<g class="sway" style="animation-delay:${delay}s" transform="translate(${x} 70) scale(${s})">
  <path d="M-9 0 C-13 -20 -7 -34 -4 -48 L4 -48 C8 -34 14 -20 10 0Z" fill="#9a6b3c"/><path d="M-3 0 C-6 -20 -3 -34 0 -48 L4 -48 C8 -34 11 -20 8 0Z" fill="#b07d49" opacity=".6"/>
  <g class="crown"><circle cx="-13" cy="-54" r="9" fill="#4d9a3c"/><circle cx="0" cy="-60" r="12" fill="#5aae45"/><circle cx="14" cy="-53" r="9" fill="#4d9a3c"/><circle cx="-4" cy="-52" r="9" fill="#67bb4f"/></g></g>`;
const ravinala = (x, s, delay) => `<g class="sway" style="animation-delay:${delay}s" transform="translate(${x} 72) scale(${s})">
  <path d="M-2 0 L-1 -40 L2 -40 L3 0Z" fill="#8a5f33"/><g class="crown" transform="translate(0 -40)">${[-80, -52, -26, 0, 26, 52, 80].map((a) => `<path transform="rotate(${a})" d="M0 0 C-4 -14 -4 -26 0 -34 C4 -26 4 -14 0 0Z" fill="${Math.abs(a) > 60 ? '#3f8f3a' : '#52a947'}"/>`).join('')}</g></g>`;
const bush = (x, y, s, d) => `<g class="sway" style="animation-delay:${d}s" transform="translate(${x} ${y}) scale(${s})"><path d="M-8 0 Q-6 -14 -3 -18 Q-2 -8 0 0Z M-2 0 Q0 -18 4 -22 Q4 -10 6 0Z M4 0 Q8 -12 12 -14 Q9 -6 10 0Z" fill="#3f9a3a"/></g>`;

const cloud = (x, y, s, d) => `<g class="drift" style="animation-delay:${d}s" transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="14" ry="5" fill="#fff" opacity=".9"/><ellipse cx="-7" cy="-4" rx="8" ry="5" fill="#fff" opacity=".9"/><ellipse cx="6" cy="-5" rx="9" ry="6" fill="#fff" opacity=".9"/></g>`;

export function buildSplashScene() {
  const order = ['kisoa', 'fosa', 'omby', 'sahona', 'cameleon', 'tortue'];
  const hero = (x) => `<g class="walk hero" transform="translate(${x} 36) scale(.82)">${CH.lemur()}</g>`;
  const row = order.map((id, i) => {
    const left = i < 3;
    const x = left ? 20 + i * 24 : 96 + (i - 3) * 24;
    const flip = left ? '' : ` translate(${24 * .5} 0)`;
    return `<g class="bounce" style="animation-delay:${(i * 0.23).toFixed(2)}s" transform="translate(${x} 52) scale(.4)"><g transform="${left ? '' : 'translate(100 0) scale(-1 1)'}">${CH[id]()}</g></g>`;
  }).join('');
  return `<svg class="sp-scene" viewBox="0 0 160 90" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <defs><linearGradient id="spSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5bb4f0"/><stop offset=".6" stop-color="#bfe6fb"/><stop offset="1" stop-color="#ffe9b0"/></linearGradient>
    <linearGradient id="spGr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd151"/><stop offset="1" stop-color="#4c9a3a"/></linearGradient></defs>
    <rect width="160" height="90" fill="url(#spSky)"/>
    <circle cx="80" cy="46" r="26" fill="#fff6c8" opacity=".55"/>
    ${cloud(30, 14, 1, 0)}${cloud(118, 20, 1.2, -4)}${cloud(80, 9, .7, -8)}
    <path d="M0 62 Q30 48 60 60 T120 56 T160 60 V90 H0Z" fill="#6fb04a"/>
    <path d="M0 68 Q40 60 80 68 T160 66 V90 H0Z" fill="url(#spGr)"/>
    ${baobab(18, 1.25, 0)}${ravinala(40, .95, -1.3)}${baobab(142, 1.25, -2)}${ravinala(120, .95, -.7)}${baobab(64, .55, -.5)}${baobab(98, .55, -1.6)}
    ${row}${hero(52)}
    ${[8, 26, 46, 114, 134, 152].map((x, i) => bush(x, 84 + (i % 2) * 3, 1.2, -i * 0.4)).join('')}
  </svg>`;
}
