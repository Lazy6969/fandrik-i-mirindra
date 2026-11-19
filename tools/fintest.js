import { FINALES, LEVELS } from '../src/levels.js';
import { solve } from './solvelib.js';
const ROWS = 13;
let bad = 0;
FINALES.forEach((fin, i) => {
  const cols = 8 + fin.w + 4;
  const g = Array.from({ length: ROWS }, () => Array(cols).fill('.'));
  for (let c = 0; c < cols; c++) { g[0][c] = '#'; g[1][c] = '#'; }
  const api = { set(c, y, ch) { if (c < cols) g[y][c] = ch; return api; } };
  api.set(2, 2, 'P'); fin.build(api, 8);
  const r = solve({ id: 0, name: 'fin' + i, map: g.slice().reverse().map((r) => r.join('')) });
  if (!r.ok) bad++;
  console.log(`${r.ok ? 'OK  ' : 'FAIL'} finale ${i} ${r.ok ? r.time.toFixed(1) + 's' : 'x=' + r.bestX.toFixed(1)}`);
});
// quelques niveaux générés complets (courts)
const picks = process.argv[2] ? process.argv[2].split(',').map(Number) : [];
for (const id of picks) { const r = solve(LEVELS[id - 1]); if (!r.ok) bad++; console.log(`${r.ok ? 'OK  ' : 'FAIL'} niveau ${id} (${LEVELS[id-1].name}, ${LEVELS[id-1].map[0].length} col) ${r.ok ? r.time.toFixed(1) + 's' : 'x=' + r.bestX.toFixed(1)}`); }
process.exit(bad ? 1 : 0);