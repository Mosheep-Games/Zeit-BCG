// AbilityFactory.js - creates skill objects from SKILL_DATABASE
window.AbilityFactory = {
  create(id, overrides={}) {
    if (!window.SKILL_DATABASE) throw new Error("SKILL_DATABASE not found");
    const base = window.SKILL_DATABASE[id];
    if (!base) throw new Error("Skill "+id+" not in SKILL_DATABASE");
    const skill = {
      id,
      name: base.name || id,
      type: base.type || 'generic',
      cooldown: base.cooldown || 1,
      manaCost: base.manaCost || 0,
      lastCast: 0,
      canCast(owner) {
        const now = performance.now();
        if (now - this.lastCast < this.cooldown*1000) return false;
        if (owner && owner.stats && owner.stats.mp < this.manaCost) return false;
        return true;
      },
      cast(owner, target, world) {
        if (!this.canCast(owner)) return false;
        owner.stats.mp = (owner.stats.mp||0) - this.manaCost;
        this.lastCast = performance.now();
        if (base.effect) base.effect(owner, target, world);
        if (base.visual && window.RenderFX) base.visual(owner, target, world);
        return true;
      },
      ...overrides
    };
    return skill;
  }
};