// Moteur de jeu pur (sans rendu) : déterministe, clonable, testable en Node.
// Unité = 1 case. x vers la droite, y vers le haut. Le joueur est positionné par (x centre, y pieds).

export const DT = 1 / 60;
export const GRAV = 40;
const PW = 0.62;
const PH = 0.92;
export const PLAYER = { w: PW, h: PH };

export function parseLevel(def) {
  const rows = def.map.length;
  const cols = Math.max(...def.map.map((r) => r.length));
  const L = { def, cols, rows, grid: [], ents: [], start: { x: 2.5, y: 2 }, doorDest: null, fruits: 0 };
  for (let y = 0; y < rows; y++) L.grid.push(new Array(cols).fill(0));
  let id = 0;
  for (let r = 0; r < rows; r++) {
    const row = def.map[r].padEnd(cols, '.');
    const y = rows - 1 - r;
    for (let c = 0; c < cols; c++) {
      const ch = row[c];
      const add = (o) => L.ents.push({ id: id++, ...o });
      switch (ch) {
        case '#': L.grid[y][c] = 1; break;
        case '=': L.grid[y][c] = 2; break;
        case 'P': L.start = { x: c + 0.5, y }; break;
        case 'D': add({ kind: 'door', x: c + 0.5, y, tx: c + 0.5, ty: y, moving: false, dodged: false }); break;
        case 'd': L.doorDest = { x: c + 0.5, y }; break;
        case 'X': add({ kind: 'fakedoor', x: c + 0.5, y }); break;
        case '^': add({ kind: 'spike', x: c + 0.5, y }); break;
        case 'f': add({ kind: 'fake', x: c, y, solid: true, trig: false, t: 0, vy: 0 }); break;
        case 'v': add({ kind: 'vanish', x: c, y, solid: true, t: -1, vy: 0 }); break;
        case 'h': add({ kind: 'hspike', x: c, y, solid: true, up: 0, trig: false }); break;
        case 's': add({ kind: 'cspike', x: c, y, falling: false, vy: 0, rest: false }); break;
        case 'b': add({ kind: 'iblock', x: c, y, solid: true, shown: false }); break;
        case 'R': add({ kind: 'boulder', x: c + 0.5, y, active: false, vy: 0, rot: 0, dead: false }); break;
        case 'e': add({ kind: 'enemy', x: c + 0.5, y, dir: -1, ph: 0 }); break;
        case 'u': add({ kind: 'spring', x: c + 0.5, y, sq: 0 }); break;
        case 'o': add({ kind: 'fruit', x: c + 0.5, y, got: false }); L.fruits++; break;
        default: break;
      }
    }
  }
  return L;
}

export function createSim(L, ch) {
  return {
    L, t: 0, state: 'play', cause: '', fruits: 0, ev: [],
    ents: L.ents.map((e) => ({ ...e })),
    p: {
      x: L.start.x, y: L.start.y, vx: 0, vy: 0, on: false, coy: 0, buf: 0, face: 1,
      speed: ch.speed, jump: ch.jump, extra: ch.extra || 0, xj: 0, glide: !!ch.glide,
      shield: ch.shield || 0, inv: 0, standing: -1, run: 0, air: 0,
    },
  };
}

export function cloneSim(S) {
  return { ...S, ev: [], ents: S.ents.map((e) => ({ ...e })), p: { ...S.p } };
}

function cellAt(L, cx, cy) {
  if (cy < 0 || cy >= L.rows || cx < 0 || cx >= L.cols) return 0;
  return L.grid[cy][cx];
}

function gather(S, x0, y0, x1, y1) {
  const out = [];
  const L = S.L;
  const cx0 = Math.max(0, Math.floor(x0));
  const cx1 = Math.min(L.cols - 1, Math.floor(x1 - 1e-6));
  const cy0 = Math.max(0, Math.floor(y0));
  const cy1 = Math.min(L.rows - 1, Math.floor(y1 - 1e-6));
  for (let cy = cy0; cy <= cy1; cy++) {
    for (let cx = cx0; cx <= cx1; cx++) {
      const v = L.grid[cy][cx];
      if (v) out.push({ x: cx, y: cy, ow: v === 2, e: null });
    }
  }
  for (const e of S.ents) {
    if (e.solid && e.x < x1 && e.x + 1 > x0 && e.y < y1 && e.y + 1 > y0) out.push({ x: e.x, y: e.y, ow: false, e });
  }
  return out;
}

const hit = (b, x0, y0, x1, y1) => b.x0 < x1 && b.x1 > x0 && b.y0 < y1 && b.y1 > y0;

export function step(S, inp) {
  if (S.state !== 'play') return;
  const L = S.L;
  const P = S.p;
  const dt = DT;
  S.t += dt;
  if (P.inv > 0) P.inv -= dt;

  // ---------- contrôles
  const dir = inp.dir || 0;
  const tgt = dir * P.speed;
  if (dir === 0 && P.on) {
    const d = 90 * dt;
    P.vx = Math.abs(P.vx) <= d ? 0 : P.vx - Math.sign(P.vx) * d;
  } else {
    const acc = (P.on ? 70 : 46) * dt;
    P.vx += Math.max(-acc, Math.min(acc, tgt - P.vx));
  }
  if (dir) P.face = dir;
  if (inp.jp) P.buf = 0.12; else P.buf -= dt;
  if (P.on) { P.coy = 0.1; P.xj = P.extra; P.air = 0; } else { P.coy -= dt; P.air += dt; }
  if (P.buf > 0) {
    if (P.coy > 0) { P.vy = P.jump; P.coy = 0; P.buf = 0; P.on = false; S.ev.push('jump'); }
    else if (P.xj > 0) { P.vy = P.jump * 0.95; P.xj--; P.buf = 0; S.ev.push('jump2'); }
  }
  let g = GRAV;
  if (P.vy > 0 && !inp.j) g *= 2.4;
  P.vy -= g * dt;
  if (P.glide && inp.j && P.vy < -3.4 && P.air > 0.15) P.vy = -3.4;
  if (P.vy < -30) P.vy = -30;

  // ---------- déplacement X
  const dx = P.vx * dt;
  P.x += dx;
  if (P.x < PW / 2) { P.x = PW / 2; P.vx = 0; }
  if (P.x > L.cols - PW / 2) { P.x = L.cols - PW / 2; P.vx = 0; }
  if (dx !== 0) {
    for (const r of gather(S, P.x - PW / 2, P.y + 0.03, P.x + PW / 2, P.y + PH - 0.03)) {
      if (r.ow) continue;
      if (r.e && r.e.kind === 'iblock') r.e.shown = true;
      if (dx > 0) P.x = r.x - PW / 2 - 1e-4; else P.x = r.x + 1 + PW / 2 + 1e-4;
      P.vx = 0;
    }
  }

  // ---------- déplacement Y
  const prevY = P.y;
  P.y += P.vy * dt;
  const wasOn = P.on;
  P.on = false;
  P.standing = -1;
  for (const r of gather(S, P.x - PW / 2 + 0.01, P.y, P.x + PW / 2 - 0.01, P.y + PH)) {
    const top = r.y + 1;
    if (P.vy <= 0) {
      if (r.ow && prevY < top - 0.03) continue;
      if (prevY < top - 0.5) continue;
      P.y = top; P.vy = 0; P.on = true;
      if (r.e) P.standing = r.e.id;
    } else if (!r.ow) {
      P.y = r.y - PH; P.vy = 0;
      if (r.e && r.e.kind === 'iblock') { r.e.shown = true; S.ev.push('bonk'); }
    }
  }
  if (P.on && !wasOn) S.ev.push('land');
  if (P.on) P.run += Math.abs(P.vx) * dt;

  // ---------- entités
  const pb = { x0: P.x - PW / 2 + 0.07, x1: P.x + PW / 2 - 0.07, y0: P.y + 0.05, y1: P.y + PH - 0.08 };
  let dead = '';
  for (const e of S.ents) {
    switch (e.kind) {
      case 'fake':
        if (!e.trig && Math.abs(P.x - (e.x + 0.5)) < 0.95 && P.y >= e.y + 0.9 && P.y < e.y + 4) { e.trig = true; S.ev.push('rumble'); }
        if (e.trig) {
          e.t += dt;
          if (e.t > 0.14) { e.solid = false; e.vy -= 30 * dt; e.y += e.vy * dt; }
        }
        break;
      case 'vanish':
        if (e.t < 0 && P.standing === e.id) { e.t = 0; S.ev.push('rumble'); }
        if (e.t >= 0) {
          e.t += dt;
          if (e.t > 0.35) { e.solid = false; e.vy -= 25 * dt; e.y += e.vy * dt; }
        }
        break;
      case 'hspike':
        if (!e.trig && Math.abs(P.x - (e.x + 0.5)) < 1.0 && P.y < e.y + 2.2) { e.trig = true; S.ev.push('spike'); }
        if (e.trig && e.up < 1) e.up = Math.min(1, e.up + dt * 14);
        if (e.up > 0.4 && hit(pb, e.x + 0.18, e.y + 1, e.x + 0.82, e.y + 1 + 0.85 * e.up)) dead = 'spike';
        break;
      case 'cspike':
        if (!e.falling && Math.abs(P.x - (e.x + 0.5)) < 0.9 && P.y < e.y) { e.falling = true; S.ev.push('rumble'); }
        if (e.falling && !e.rest) {
          e.vy -= 35 * dt; e.y += e.vy * dt;
          const gy = Math.floor(e.y);
          if (cellAt(L, Math.floor(e.x + 0.5), gy) !== 0) { e.rest = true; e.y = gy + 1; e.vy = 0; S.ev.push('thud'); }
          else if (e.y < -8) e.rest = true;
        }
        if (hit(pb, e.x + 0.2, e.y + 0.25, e.x + 0.8, e.y + 1)) dead = 'spike';
        break;
      case 'spike':
        if (hit(pb, e.x - 0.3, e.y, e.x + 0.3, e.y + 0.5)) dead = 'spike';
        break;
      case 'boulder': {
        if (e.dead) break;
        if (!e.active && P.x > e.x - 11) { e.active = true; S.ev.push('rumble'); }
        if (e.active) {
          e.x -= 7.5 * dt; e.rot += 7.5 * dt / 0.55;
          const cx = Math.floor(e.x);
          const gy = Math.floor(e.y - 0.05);
          if (cellAt(L, cx, gy) === 0) { e.vy -= 35 * dt; e.y += e.vy * dt; }
          else if (e.vy < 0) { e.vy = 0; e.y = gy + 1; }
          if (cellAt(L, Math.floor(e.x - 0.55), Math.floor(e.y + 0.5)) === 1 || e.x < -3 || e.y < -8) e.dead = true;
          else if (hit(pb, e.x - 0.5, e.y + 0.1, e.x + 0.5, e.y + 1.0)) dead = 'boulder';
        }
        break;
      }
      case 'enemy': {
        e.x += e.dir * 2.2 * dt; e.ph += dt * 6;
        const ax = Math.floor(e.x + e.dir * 0.45);
        if (cellAt(L, ax, Math.floor(e.y + 0.3)) === 1 || cellAt(L, ax, Math.floor(e.y - 0.3)) === 0) e.dir *= -1;
        if (hit(pb, e.x - 0.32, e.y, e.x + 0.32, e.y + 0.7)) dead = 'enemy';
        break;
      }
      case 'spring':
        if (e.sq > 0) e.sq = Math.max(0, e.sq - dt * 4);
        if (P.vy <= 0 && pb.x1 > e.x - 0.4 && pb.x0 < e.x + 0.4 && P.y <= e.y + 0.5 && P.y >= e.y - 0.1) {
          P.vy = 25; P.on = false; e.sq = 1; S.ev.push('spring');
        }
        break;
      case 'fruit':
        if (!e.got && hit(pb, e.x - 0.32, e.y + 0.15, e.x + 0.32, e.y + 0.85)) { e.got = true; S.fruits++; S.ev.push('fruit'); }
        break;
      case 'door':
        if (L.doorDest && !e.dodged && Math.abs(P.x - e.x) < 3.2 && Math.abs(P.y - e.y) < 3) {
          e.dodged = true; e.moving = true; e.tx = L.doorDest.x; e.ty = L.doorDest.y; S.ev.push('dodge');
        }
        if (e.moving) {
          const sp = 18 * dt;
          const ddx = e.tx - e.x;
          if (Math.abs(ddx) <= sp) { e.x = e.tx; e.y = e.ty; e.moving = false; }
          else e.x += Math.sign(ddx) * sp;
        } else if (hit(pb, e.x - 0.4, e.y, e.x + 0.4, e.y + 1.3)) {
          S.state = 'won'; S.ev.push('win');
        }
        break;
      case 'fakedoor':
        if (hit(pb, e.x - 0.4, e.y, e.x + 0.4, e.y + 1.3)) dead = 'fakedoor';
        break;
      default: break;
    }
  }
  if (P.y < -3) dead = 'void';
  if (S.state === 'won') return;
  if (dead && dead !== 'void' && P.inv > 0) dead = '';
  if (dead && dead !== 'void' && P.shield > 0) {
    P.shield--; P.inv = 1.4; P.vy = 11; S.ev.push('shield'); dead = '';
  }
  if (dead) { S.state = 'dead'; S.cause = dead; S.ev.push('die'); }
}

export const doorOf = (S) => S.ents.find((e) => e.kind === 'door');
