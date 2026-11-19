// Verifie que chaque niveau est faisable avec le personnage le plus faible (recherche en faisceau).
import { parseLevel, createSim, cloneSim, step, doorOf } from '../src/sim.js';

const WEAK = { speed: 6.4, jump: 14.5, extra: 0, glide: false, shield: 0 };
const CHUNK = 4;
const BEAM = Number(process.env.BEAM || 3000);
const ACTIONS = [];
for (const d of [1, 0, -1]) for (const j of [1, 0]) ACTIONS.push({ d, j });

function key(S, pj) {
  const p = S.p;
  let k = `${pj ? 1 : 0}|${Math.round(p.x * 6)},${Math.round(p.y * 6)},${Math.round(p.vy / 1.5)},${Math.round(p.vx)},${p.on ? 1 : 0}`;
  for (const e of S.ents) {
    switch (e.kind) {
      case 'fake': k += e.trig ? `f${Math.min(3, Math.round(e.t * 20))}` : 'f'; break;
      case 'vanish': k += e.t >= 0 ? `v${Math.round(e.t * 10)}` : 'v'; break;
      case 'hspike': k += e.trig ? 'H' : 'h'; break;
      case 'cspike': k += e.falling ? `S${Math.round(e.y)}` : 's'; break;
      case 'boulder': k += e.active ? `R${Math.round(e.x * 3)}${e.dead ? 'x' : ''}` : 'r'; break;
      case 'enemy': k += `e${Math.round(e.x * 3)}${e.dir}`; break;
      case 'door': k += e.dodged ? 'D1' : 'D0'; break;
      default: break;
    }
  }
  return k;
}

function score(S) {
  const d = doorOf(S);
  return Math.abs(d.x - S.p.x) + Math.abs(d.y - S.p.y) * 0.3;
}

export function solve(def) {
  const L = parseLevel(def);
  const root = createSim(L, WEAK);
  const seen = new Set();
  let frontier = [{ S: root, prevJ: 0 }];
  let bestX = 0;
  let depth = 0;
  while (frontier.length && depth < 1500) {
    const next = [];
    for (const node of frontier) {
      for (const a of ACTIONS) {
        const S = cloneSim(node.S);
        for (let i = 0; i < CHUNK; i++) {
          step(S, { dir: a.d, j: !!a.j, jp: a.j && !node.prevJ && i === 0 });
          S.ev.length = 0;
          if (S.state !== 'play') break;
        }
        if (S.state === 'won') return { ok: true, time: S.t };
        if (S.state !== 'play') continue;
        const k = key(S, a.j);
        if (seen.has(k)) continue;
        seen.add(k);
        if (S.p.x > bestX) bestX = S.p.x;
        next.push({ S, prevJ: a.j, s: score(S) });
      }
    }
    next.sort((a, b) => a.s - b.s);
    frontier = next.slice(0, BEAM);
    depth++;
    if (process.env.DBG && depth % 3 === 0 && depth<60) console.log('depth', depth, 'frontier', frontier.length, 'x', Math.min(...frontier.map(n=>n.S.p.x)).toFixed(1), Math.max(...frontier.map(n=>n.S.p.x)).toFixed(1), 'air', frontier.filter(n=>!n.S.p.on).length);
  }
  return { ok: false, bestX, cols: L.cols };
}

