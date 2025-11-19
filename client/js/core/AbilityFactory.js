
window.AbilityFactory = {
    create(id, overrides = {}) {
        const base = SKILL_DATABASE[id];
        if (!base) throw new Error("Skill not found: " + id);

        const skill = {
            id,
            name: base.name,
            description: base.description,
            type: base.type,
            icon: base.icon || null,

            cooldown: base.cooldown,
            manaCost: base.manaCost || 0,
            castRange: base.castRange || 2,
            scaling: base.scaling || {},

            lastCast: 0,

            canCast(hero) {
                const now = performance.now();
                if (now - this.lastCast < this.cooldown * 1000) return false;
                if (hero.stats.mp < this.manaCost) return false;
                return true;
            },

            cast(hero, target, world) {
                if (!this.canCast(hero)) return false;

                hero.stats.mp -= this.manaCost;
                this.lastCast = performance.now();

                if (base.animation)
                    base.animation(hero);

                if (base.effect)
                    base.effect(hero, target, world);

                if (base.visual)
                    base.visual(hero, target, world);

                return true;
            },

            ...overrides
        };

        return skill;
    }
};
