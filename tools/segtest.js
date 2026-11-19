// Teste chaque motif du générateur dans un mini-niveau : doit être faisable avec le personnage le plus faible.
import { SEGMENTS, generateMap } from '../src/levels.js';
import { solve } from './solvelib.js';

const ROWS = 13;
function mini(build, w) {
  const cols = 8 + w + 14;
  const g = Array.from({ length: ROWS }, () => Array(cols).fill('.'));
  const set = (c, y, ch) => { if (c >= 0 && c < cols) g[y][c] = ch; };
  for (let c = 0; c < cols; c++) { g[0][c] = '#'; g[1][c] = '#'; }
  set(2, 2, 'P'); set(8 + w + 6, 2, 'D');
  const api = {
    set(c, y, ch) { set(c, y, ch); return api; },
    pit(a, b) { for (let c = a; c <= b; c++) for (let y = 0; y < ROWS; y++) g[y][c] = '.'; return api; },
    block(a, b, y0, y1) { for (let c = a; c <= b; c++) for (let y = y0; y <= y1; y++) g[y][c] = '#'; return api; },
    fake(a, b) { for (let c = a; c <= b; c++) for (let y = 0; y < 2; y++) g[y][c] = 'f'; return api; },
    fruit(...xy) { for (let i = 0; i < xy.length; i += 2) set(xy[i], xy[i + 1], 'o'); return api; },
  };
  build(api, 8);
  return g.slice().reverse().map((r) => r.join(''));
}
const only = process.argv[2];
let bad = 0;
for (const [k, s] of Object.entries(SEGMENTS)) {
  if (only && k !== only) continue;
  const t0 = Date.now();
  const r = solve({ id: 0, name: k, map: mini(s.build, s.w()) });
  if (!r.ok) bad++;
  console.log(`${r.ok ? 'OK  ' : 'FAIL'} ${k.padEnd(12)} ${r.ok ? r.time.toFixed(1) + 's' : 'x=' + r.bestX.toFixed(1)} (${Date.now() - t0} ms)`);
}
process.exit(bad ? 1 : 0);