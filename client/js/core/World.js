
window.GameWorld = {
    entities: [],
    projectiles: [],
    effects: [],

    add(entity) {
        this.entities.push(entity);
    },

    spawnProjectile(config) {
        const proj = {
            from: config.from,
            to: config.to,
            pos: { ...config.from.position },
            speed: config.speed || 8,
            onHit: config.onHit,

            update(dt) {
                const dx = this.to.position.x - this.pos.x;
                const dy = this.to.position.y - this.pos.y;
                const dist = Math.hypot(dx, dy);
                if (dist < 0.2) {
                    if (this.onHit) this.onHit(this.to);
                    this.dead = true;
                    return;
                }
                this.pos.x += (dx / dist) * this.speed * dt;
                this.pos.y += (dy / dist) * this.speed * dt;
            }
        };
        this.projectiles.push(proj);
    },

    applyAreaEffect(cfg) {
        const eff = {
            position: cfg.position,
            radius: cfg.radius,
            duration: cfg.duration,
            time: 0,
            onEnter: cfg.onEnter,
            onExit: cfg.onExit,
            affected: new Set(),

            update(dt) {
                this.time += dt;
                if (this.time >= this.duration) {
                    this.affected.forEach(ent => this.onExit(ent));
                    this.dead = true;
                    return;
                }
                GameWorld.entities.forEach(ent => {
                    const d = Math.hypot(ent.position.x - this.position.x, ent.position.y - this.position.y);
                    if (d <= this.radius) {
                        if (!this.affected.has(ent)) {
                            this.affected.add(ent);
                            this.onEnter(ent);
                        }
                    } else {
                        if (this.affected.has(ent)) {
                            this.affected.delete(ent);
                            this.onExit(ent);
                        }
                    }
                });
            }
        };
        this.effects.push(eff);
    },

    update(dt) {
        this.entities.forEach(e => e.update?.(dt));
        this.projectiles.forEach(p => p.update(dt));
        this.projectiles = this.projectiles.filter(p => !p.dead);
        this.effects.forEach(e => e.update(dt));
        this.effects = this.effects.filter(e => !e.dead);
    }
};
