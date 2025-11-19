// GameWorld.js - lightweight world manager
window.GameWorld = {
  entities: [],
  projectiles: [],
  effects: [],
  add(entity) { this.entities.push(entity); },
  spawnProjectile(cfg) {
    const p = {
      id: 'proj_' + Math.random().toString(36).slice(2,9),
      from: cfg.from,
      to: cfg.to,
      pos: { x: cfg.from.position.x, y: cfg.from.position.y },
      speed: cfg.speed || 8,
      onHit: cfg.onHit,
      dead: false,
      update(dt) {
        const dx = this.to.position.x - this.pos.x;
        const dy = this.to.position.y - this.pos.y;
        const dist = Math.hypot(dx,dy);
        if (dist < 0.4) {
          if (this.onHit) this.onHit(this.to);
          this.dead = true;
          return;
        }
        this.pos.x += (dx/dist) * this.speed * dt;
        this.pos.y += (dy/dist) * this.speed * dt;
      }
    };
    this.projectiles.push(p);
    return p;
  },
  applyAreaEffect(cfg) {
    const eff = {
      id: 'eff_' + Math.random().toString(36).slice(2,9),
      position: cfg.position,
      radius: cfg.radius,
      duration: cfg.duration,
      time: 0,
      onEnter: cfg.onEnter,
      onExit: cfg.onExit,
      affected: new Set(),
      dead: false,
      update(dt) {
        this.time += dt;
        if (this.time >= this.duration) {
          this.affected.forEach(ent => this.onExit && this.onExit(ent));
          this.dead = true;
          return;
        }
        GameWorld.entities.forEach(ent => {
          const d = Math.hypot(ent.position.x - this.position.x, ent.position.y - this.position.y);
          if (d <= this.radius) {
            if (!this.affected.has(ent)) {
              this.affected.add(ent);
              this.onEnter && this.onEnter(ent);
            }
          } else {
            if (this.affected.has(ent)) {
              this.affected.delete(ent);
              this.onExit && this.onExit(ent);
            }
          }
        });
      }
    };
    this.effects.push(eff);
    return eff;
  },
  removeDead() {
    this.entities = this.entities.filter(e => !e.dead);
    this.projectiles = this.projectiles.filter(p => !p.dead);
    this.effects = this.effects.filter(e => !e.dead);
  },
  update(dt) {
    this.entities.forEach(e => e.update && e.update(dt));
    this.projectiles.forEach(p => p.update && p.update(dt));
    this.effects.forEach(a => a.update && a.update(dt));
    this.removeDead();
  }
};