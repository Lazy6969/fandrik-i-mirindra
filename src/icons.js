// Icônes vectorielles « jeu vidéo » (remplacent les emojis) : contour brun épais + aplats colorés.
const st = 'stroke="#3a1a08" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"';
const S = (inner) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>`;

export const ICONS = {
  star: S(`<path ${st} fill="#ffd23f" d="M12 2.4l2.9 6 6.6.9-4.8 4.6 1.2 6.6L12 17.3l-5.9 3.2 1.2-6.6L2.5 9.3l6.6-.9z"/><path fill="#fff" opacity=".55" d="M9.5 8.6l2.2-3.6-.7 4z"/>`),
  mango: S(`<path ${st} fill="#ffa52a" d="M12 5.5c5 0 8 3.8 8 7.8S17 20.6 12 20.6 4 17.3 4 13.3s3-7.8 8-7.8z"/><path ${st} fill="#4cc04a" d="M12 5.5c0-2.3 1.9-3.8 4.2-3.8-.2 2.2-1.9 3.8-4.2 3.8z"/><path fill="#fff" opacity=".55" d="M7.6 11c.5-1.6 1.6-2.6 3.2-3-1.7.5-2.8 1.5-3.2 3z"/>`),
  trophy: S(`<path ${st} fill="#ffd23f" d="M7 3h10v6a5 5 0 01-10 0z"/><path ${st} fill="none" d="M7 5H3.5c0 3 1.2 4.6 3.7 5M17 5h3.5c0 3-1.2 4.6-3.7 5"/><path ${st} fill="#e0a21c" d="M10.5 14h3v3.5h-3z"/><path ${st} fill="#ffd23f" d="M7.5 20.5h9l-1-3h-7z"/>`),
  skull: S(`<path ${st} fill="#f4f0e6" d="M12 3c4.6 0 7.5 2.9 7.5 7 0 2.4-1 4-2.5 5v3.5h-10V15c-1.500-1-2.500-2.600-2.500-5C4.500 5.900 7.400 3 12 3z"/><circle ${st} cx="8.8" cy="10.5" r="2" fill="#3a1a08"/><circle ${st} cx="15.2" cy="10.5" r="2" fill="#3a1a08"/><path ${st} fill="#3a1a08" d="M12 13l-1 2h2z"/>`),
  gear: S(`<path ${st} fill="#b9c4d2" d="M10 2.5h4l.6 2.600 1.900.8 2.300-1.400 2.800 2.800-1.400 2.300.8 1.900 2.600.6v4l-2.600.6-.8 1.900 1.400 2.300-2.800 2.800-2.300-1.400-1.900.8-.6 2.600h-4l-.6-2.600-1.900-.8-2.300 1.400-2.800-2.800 1.400-2.300-.8-1.900-2.600-.6v-4l2.600-.6.8-1.900-1.400-2.300 2.800-2.800 2.300 1.400 1.900-.8z"/><circle ${st} cx="12" cy="12" r="3.3" fill="#6f7c8c"/>`),
  map: S(`<path ${st} fill="#f6dfa0" d="M3 5.500l6-2.500 6 2.500 6-2.500v15.500l-6 2.500-6-2.500-6 2.500z"/><path ${st} fill="none" d="M9 3v15.500M15 5.500V21"/><path ${st} fill="#e0452f" d="M17.500 9l-2 3h4z"/>`),
  paw: S(`<ellipse ${st} cx="12" cy="16" rx="5.500" ry="4.500" fill="#b97a45"/><ellipse ${st} cx="5.500" cy="10" rx="2.200" ry="2.900" fill="#b97a45"/><ellipse ${st} cx="9.500" cy="5.500" rx="2.200" ry="2.900" fill="#b97a45"/><ellipse ${st} cx="14.500" cy="5.500" rx="2.200" ry="2.900" fill="#b97a45"/><ellipse ${st} cx="18.500" cy="10" rx="2.200" ry="2.900" fill="#b97a45"/>`),
  bag: S(`<path ${st} fill="#e8554a" d="M5 8h14l1.200 12.500H3.800z"/><path ${st} fill="none" d="M8.500 10V6.500a3.500 3.500 0 017 0V10"/><circle ${st} cx="12" cy="14" r="2.200" fill="#ffd23f"/>`),
  pause: S(`<rect ${st} x="5" y="4" width="5" height="16" rx="1.500" fill="#fff"/><rect ${st} x="14" y="4" width="5" height="16" rx="1.500" fill="#fff"/>`),
  play: S(`<path ${st} fill="#fff" d="M7 3.500l13 8.500-13 8.500z"/>`),
  left: S(`<path ${st} fill="#fff" d="M15.500 3.500L5.500 12l10 8.500v-5.500H20V9h-4.500z"/>`),
  right: S(`<path ${st} fill="#fff" d="M8.500 3.500l10 8.500-10 8.500v-5.500H4V9h4.500z"/>`),
  jump: S(`<path ${st} fill="#fff" d="M12 2.500l8 9h-5v9.500H9v-9.500H4z"/>`),
  lock: S(`<path ${st} fill="none" d="M7.500 11V7.500a4.500 4.500 0 019 0V11"/><rect ${st} x="4.500" y="10.500" width="15" height="10.500" rx="2.500" fill="#ffd23f"/><circle ${st} cx="12" cy="15.500" r="1.600" fill="#3a1a08"/>`),
  check: S(`<path ${st} fill="none" stroke-width="3.2" d="M4.500 12.500l5 5 10-11"/>`),
  retry: S(`<path ${st} fill="none" stroke-width="2.600" d="M19.500 12a7.500 7.500 0 11-2.400-5.500"/><path ${st} fill="#fff" d="M20.500 3v6h-6z"/>`),
  home: S(`<path ${st} fill="#fff" d="M3 12L12 3.500 21 12h-2.500v8h-4.500v-5.500h-4V20H5.500v-8z"/><path ${st} fill="#e8554a" d="M2.500 12.500L12 3.500l9.500 9z" opacity="0"/>`),
  back: S(`<path ${st} fill="#5a1a0a" d="M14.500 4L6 12l8.500 8v-5h4V9h-4z"/>`),
  hat: S(`<ellipse ${st} cx="12" cy="16" rx="10" ry="3.500" fill="#e9c46a"/><path ${st} fill="#e9c46a" d="M6.500 15.500C6.500 8 8.500 5 12 5s5.500 3 5.500 10.500z"/><path ${st} fill="#e8554a" d="M6.700 13h10.600v2.600H6.700z"/>`),
  glasses: S(`<circle ${st} cx="7" cy="13" r="4.200" fill="#9fe3f5" fill-opacity=".7"/><circle ${st} cx="17" cy="13" r="4.200" fill="#9fe3f5" fill-opacity=".7"/><path ${st} fill="none" d="M11.200 12.500h1.600M2.800 11.500L2 8M21.200 11.500L22 8"/>`),
  scarf: S(`<path ${st} fill="#e8554a" d="M4 8c4 3 12 3 16 0v4.500c-4 3-12 3-16 0z"/><path ${st} fill="#e8554a" d="M14 13.500h4.500l1.500 8h-5.500z"/><path fill="#fff" opacity=".4" d="M15.200 16h3.200v1.600h-3.200z"/>`),
  boot: S(`<path ${st} fill="#e9a23a" d="M7.500 3h7v9l6 2.500c1.100.5 1.500 1.300 1.500 2.500V20H4.500v-5z"/><path ${st} fill="#8a4a1a" d="M4.500 17h17.500V20H4.500z"/>`),
  sound: S(`<path ${st} fill="#fff" d="M3 9h4l5-4.500v15L7 15H3z"/><path ${st} fill="none" stroke-width="2" d="M15.500 8.500a5 5 0 010 7M18 6a8.500 8.500 0 010 12"/>`),
  music: S(`<path ${st} fill="#fff" d="M9 4.500l11-2v13.500a3.200 3.200 0 11-2-3V6.500L11 7.800V18a3.200 3.200 0 11-2-3z"/>`),
  vibrate: S(`<rect ${st} x="7.500" y="3" width="9" height="18" rx="2.200" fill="#fff"/><path ${st} fill="none" d="M3.500 8v8M20.500 8v8M1 10.500v3M23 10.500v3"/>`),
  quality: S(`<rect ${st} x="2.500" y="4.500" width="19" height="13.500" rx="2" fill="#7fd2f5"/><path ${st} fill="#4cc04a" d="M2.500 15l6-5 5 4 3-2.500 5 4v2.500H2.500z"/><path ${st} d="M8 21h8"/>`),
  camera: S(`<path ${st} fill="#fff" d="M3 8h4l1.5-2.5h7L17 8h4v11H3z"/><circle ${st} cx="12" cy="13.5" r="3.6" fill="#7fd2f5"/>`),
  globe: S(`<circle ${st} cx="12" cy="12" r="9" fill="#7fd2f5"/><path ${st} fill="#4cc04a" d="M6 8c2-2 4-2 5 0s-1 3 0 5-3 3-4 1-3-4-1-6zM14 5c2 0 5 2 5 4s-3 1-4 3-2-1-2-3 0-3 1-4z"/>`),
  warn: S(`<path ${st} fill="#ffd23f" d="M12 3l10 18H2z"/><path ${st} d="M12 10v5" stroke-width="2.4"/><circle cx="12" cy="18" r="1.2" fill="#3a1a08"/>`),
  cape: S(`<path ${st} fill="#d8362a" d="M7 3h10l4 18H3z"/><path ${st} fill="#ffd23f" d="M8 3c1.500 2 6.500 2 8 0"/>`),
  wings: S(`<path ${st} fill="#bfe8ff" d="M12 20C6 19 2 13 3 5c4 0 8 2 9 6 1-4 5-6 9-6 1 8-3 14-9 15z"/><path ${st} fill="none" d="M12 20V11"/>`),
  necklace: S(`<path ${st} fill="none" stroke-width="2.200" d="M4 5c1 9 4 12 8 12s7-3 8-12"/><circle ${st} cx="12" cy="18.500" r="2.800" fill="#e83a3a"/>`),
  mask: S(`<path ${st} fill="#f4e8d0" d="M3 6c6-3 12-3 18 0v5c0 5-4 9-9 9s-9-4-9-9z"/><ellipse ${st} cx="8.500" cy="10.500" rx="2" ry="1.500" fill="#3a1a08"/><ellipse ${st} cx="15.500" cy="10.500" rx="2" ry="1.500" fill="#3a1a08"/><path ${st} fill="none" d="M9 16c2 1.500 4 1.500 6 0"/>`),
  user: S(`<circle ${st} cx="12" cy="8" r="4.500" fill="#f2b98a"/><path ${st} fill="#e8554a" d="M3.500 21c0-5 3.500-7.500 8.500-7.500s8.500 2.500 8.500 7.500z"/>`),
};

export const ic = (name) => ICONS[name] || '';
/** Remplace chaque <i data-ic="nom"></i> par l'icône SVG correspondante. */
export function hydrateIcons(root = document) {
  root.querySelectorAll('[data-ic]').forEach((el) => { el.innerHTML = ic(el.dataset.ic); el.classList.add('ico-wrap'); });
}
