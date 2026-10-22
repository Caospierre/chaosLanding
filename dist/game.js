export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export function intersects(a, b) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}
export function distanceToRect(x, y, r) {
  return Math.hypot(
    Math.max(r.x - x, 0, x - r.x - r.w),
    Math.max(r.y - y, 0, y - r.y - r.h),
  );
}
export class Game {
  constructor(w, h, blocks = []) {
    this.w = w;
    this.h = h;
    this.blocks = blocks;
    this.floor = h - 70;
    this.ladders = [
      { x: w * 0.17, y: h * 0.14, bottom: this.floor },
      { x: w * 0.84, y: h * 0.22, bottom: this.floor },
      { x: w * 0.48, y: h * 0.47, bottom: this.floor },
    ];
    this.crates = [
      { x: w * 0.045, y: this.floor - 33, w: 33, h: 33 },
      { x: w * 0.25, y: this.floor - 30, w: 34, h: 30 },
      { x: w * 0.25 + 4, y: this.floor - 60, w: 28, h: 30 },
      { x: w * 0.72, y: this.floor - 32, w: 35, h: 32 },
    ];
    this.reset();
  }
  reset() {
    this.player = {
      x: this.w * 0.08,
      y: this.floor - 40,
      w: 23,
      h: 40,
      vx: 0,
      vy: 0,
      dir: 1,
      ground: true,
      climb: false,
      walkPhase: 0,
      climbPhase: 0,
      hit: 0,
      swing: 0,
      cooldown: 0,
    };
    this.enemies = [
      { x: this.w * 0.57, y: this.floor - 38, w: 22, h: 38, dir: -1, stun: 0 },
      { x: this.w * 0.85, y: this.floor - 38, w: 22, h: 38, dir: -1, stun: 0 },
      {
        x: this.w * 0.65,
        y: this.h * 0.52 - 38,
        w: 22,
        h: 38,
        dir: 1,
        stun: 0,
        platform: true,
      },
    ];
    this.hp = 3;
    this.score = 0;
    this.destroyed = 0;
    this.time = 0;
    this.state = "playing";
    this.particles = [];
    this.events = [];
    this.blocks.forEach((b) => (b.dead = false));
  }
  emit(type, data = {}) {
    this.events.push({ type, ...data });
  }
  burst(x, y, color = "#e5b95e", n = 18) {
    for (let i = 0; i < n; i++)
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 320,
        vy: -100 - Math.random() * 210,
        life: 0.5 + Math.random() * 0.6,
        color,
        size: 2 + Math.random() * 5,
      });
  }
  platforms() {
    return [
      { x: 0, y: this.floor, w: this.w, h: 70 },
      ...this.crates,
      ...this.blocks.filter((b) => !b.dead),
    ];
  }
  attack() {
    const p = this.player;
    if (this.state !== "playing" || p.cooldown > 0) return;
    p.cooldown = 0.34;
    p.swing = 0.23;
    const x = p.x + p.w / 2 + p.dir * 27,
      y = p.y + 17;
    let best = null,
      bestD = Infinity;
    for (const e of this.enemies) {
      if (e.stun > 0) continue;
      const d = distanceToRect(x, y, e);
      if (d < 47 && d < bestD) {
        best = { type: "enemy", item: e };
        bestD = d;
      }
    }
    for (const b of this.blocks) {
      if (b.dead) continue;
      const d = distanceToRect(x, y, b);
      const center = b.x + b.w / 2;
      if (d < 50 && d < bestD && (center - p.x) * p.dir > -b.w / 2) {
        best = { type: "block", item: b };
        bestD = d;
      }
    }
    this.emit("swing");
    if (!best) return;
    const t = best.item;
    if (best.type === "enemy") {
      t.stun = 3.6;
      t.x = clamp(t.x + p.dir * 35, 0, this.w - 25);
      this.score += 50;
      this.burst(t.x, t.y, "#83f7b0", 12);
      this.emit("enemy");
      return;
    }
    t.dead = true;
    this.destroyed++;
    this.score += 100;
    this.burst(clamp(x, t.x, t.x + t.w), clamp(y, t.y, t.y + t.h));
    this.emit("destroy", { id: t.id });
    if (t.critical) this.end("photo");
  }
  end(reason) {
    if (this.state !== "playing") return;
    this.state = "over";
    this.emit("over", { reason });
  }
  step(dt, keys = {}) {
    dt = Math.min(dt, 0.035);
    this.time += dt;
    for (const a of this.particles) {
      a.x += a.vx * dt;
      a.y += a.vy * dt;
      a.vy += 700 * dt;
      a.life -= dt;
    }
    this.particles = this.particles.filter((a) => a.life > 0);
    if (this.state !== "playing") return;
    const p = this.player;
    const oldX = p.x,
      oldY = p.y;
    for (const k of ["hit", "swing", "cooldown"]) p[k] = Math.max(0, p[k] - dt);
    const dx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    if (dx) p.dir = dx;
    p.vx = dx * 205;
    const ladder = this.ladders.find(
      (l) =>
        Math.abs(p.x + p.w / 2 - l.x) < 26 &&
        p.y + p.h >= l.y - 8 &&
        p.y < l.bottom + 3,
    );
    if ((keys.up || keys.down) && ladder) {
      p.climb = true;
      p.vy = 0;
      p.x += (ladder.x - p.w / 2 - p.x) * Math.min(1, dt * 12);
      p.y += ((keys.down ? 1 : 0) - (keys.up ? 1 : 0)) * 160 * dt;
      p.y = clamp(p.y, ladder.y - p.h, ladder.bottom - p.h);
      p.ground = false;
    } else if (!ladder || dx) p.climb = false;
    if (keys.jump && (p.ground || p.climb)) {
      p.vy = -490;
      p.climb = false;
      p.ground = false;
      this.emit("jump");
    }
    if (keys.attack) this.attack();
    p.x = clamp(p.x + p.vx * dt, 4, this.w - p.w - 4);
    const prev = p.y + p.h;
    if (!p.climb) {
      p.vy += 1280 * dt;
      p.y += p.vy * dt;
      p.ground = false;
      if (p.vy >= 0) {
        for (const s of this.platforms().sort((a, b) => a.y - b.y)) {
          if (
            p.x + p.w > s.x + 2 &&
            p.x < s.x + s.w - 2 &&
            prev <= s.y + 3 &&
            p.y + p.h >= s.y
          ) {
            p.y = s.y - p.h;
            p.vy = 0;
            p.ground = true;
            break;
          }
        }
      }
    }
    if (p.y > this.h + 100) {
      p.y = this.floor - p.h;
      p.vy = 0;
    }
    for (const e of this.enemies) {
      e.stun = Math.max(0, e.stun - dt);
      if (e.stun > 0) continue;
      if (e.platform) {
        const shelf = this.blocks
          .filter((b) => !b.dead && b.w > this.w * 0.2)
          .find((b) => b.x > this.w * 0.29);
        if (shelf) {
          e.y = shelf.y - e.h;
          const lo = shelf.x + 5,
            hi = shelf.x + shelf.w - e.w - 5;
          e.x = clamp(e.x, lo, hi);
          e.x += e.dir * 45 * dt;
          if (e.x <= lo || e.x >= hi) e.dir *= -1;
        } else {
          e.platform = false;
          e.y = this.floor - e.h;
        }
      } else {
        e.y = this.floor - e.h;
        if (Math.abs(p.y - e.y) < 65 && Math.abs(p.x - e.x) < 220)
          e.dir = p.x > e.x ? 1 : -1;
        e.x += e.dir * 56 * dt;
        if (e.x < 25) {
          e.x = 25;
          e.dir = 1;
        }
        if (e.x > this.w - 45) {
          e.x = this.w - 45;
          e.dir = -1;
        }
      }
      if (intersects(p, e) && p.hit === 0) {
        this.hp--;
        p.hit = 1.6;
        p.vy = -240;
        p.climb = false;
        p.x = clamp(p.x + (p.x < e.x ? -35 : 35), 4, this.w - p.w - 4);
        this.burst(p.x + 10, p.y + 15, "#e89975", 9);
        this.emit("hurt");
        if (this.hp <= 0) this.end("health");
      }
    }
    if (p.climb) {
      const distance = Math.abs(p.y - oldY);
      p.climbPhase += distance * 0.12;
      p.climbSoundDistance = (p.climbSoundDistance || 0) + distance;
      if (p.climbSoundDistance >= 18) {
        p.climbSoundDistance %= 18;
        p.climbSoundStep = (p.climbSoundStep || 0) + 1;
        this.emit("climb", { step: p.climbSoundStep });
      }
    } else if (p.ground && Math.abs(p.x - oldX) > 0.05) {
      p.walkPhase += Math.abs(p.x - oldX) * 0.12;
    } else if (p.ground) {
      p.walkPhase = 0;
    }
  }
}
