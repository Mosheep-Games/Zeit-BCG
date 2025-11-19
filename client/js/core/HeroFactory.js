
window.HeroFactory = {
    create(name, overrides = {}) {
        const base = HERO_DATABASE[name];
        if (!base) throw new Error("Hero not found: " + name);

        const hero = {
            id: crypto.randomUUID(),
            name: base.name,
            class: base.class,
            level: 1,
            xp: 0,

            stats: JSON.parse(JSON.stringify(base.stats)),
            growth: base.growth,
            skills: base.skills.map(id => AbilityFactory.create(id)),
            triggers: base.triggers || {},
            position: { x: 0, y: 0 },

            addXP(amount) {
                this.xp += amount;
                while (this.xp >= this.reqXP()) {
                    this.xp -= this.reqXP();
                    this.levelUp();
                }
            },

            reqXP() { return 50 + this.level * 25; },

            levelUp() {
                this.level++;
                for (const key in this.growth) {
                    this.stats[key] += this.growth[key];
                }
                if (this.triggers.onLevelUp)
                    this.triggers.onLevelUp(this);
            },

            takeDamage(dmg, source) {
                let final = dmg - this.stats.armor;
                if (final < 1) final = 1;
                this.stats.hp -= final;

                if (this.triggers.onGetHit)
                    this.triggers.onGetHit(this, final, source);

                if (this.stats.hp <= 0) this.die();
            },

            attack(target) {
                if (this.triggers.onAttack)
                    this.triggers.onAttack(this, target);

                target.takeDamage(this.stats.atk, this);
            },

            die() {
                if (this.triggers.onDeath)
                    this.triggers.onDeath(this);
                this.dead = true;
            },

            ...overrides
        };

        return hero;
    }
};
