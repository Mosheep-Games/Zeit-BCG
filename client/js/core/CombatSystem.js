// CombatSystem.js - handles dmg, crits, armor, status effects
window.CombatSystem = {
  applyDamage(source, target, dmg, type="physical") {
    if (!target || target.dead) return;
    let final = dmg;
    // crit
    const critChance = source.stats.critChance || 0;
    const critMult = source.stats.critMultiplier || 1.5;
    if (Math.random() < critChance) final *= critMult;
    // defenses
    if (type === "physical") {
      const armor = target.stats.armor || 0;
      const red = armor / (armor + 100);
      final *= (1 - red);
    } else if (type === "magic") {
      const res = target.stats.resistance || 0;
      final *= (1 - res);
    }
    // shield
    target.shield = target.shield || 0;
    if (target.shield > 0) {
      const absorb = Math.min(target.shield, final);
      target.shield -= absorb;
      final -= absorb;
    }
    final = Math.max(0, final);
    target.stats.hp -= final;
    if (window.RenderFX && RenderFX.floatText) RenderFX.floatText('-'+Math.round(final), target.position, '#f55');
    if (target.stats.hp <= 0) {
      target.dead = true;
      if (target.onDeath) target.onDeath(source);
    }
  },

  applyStatus(target, effect) {
    if (!target) return;
    target.statusEffects = target.statusEffects || [];
    // status resist
    const resist = target.stats.statusResist || 0;
    if (Math.random() < resist) {
      if (window.RenderFX && RenderFX.floatText) RenderFX.floatText('RESIST', target.position, '#6cf');
      return;
    }
    // clone effect
    const e = Object.assign({}, effect);
    e.time = 0;
    e._acc = 0;
    e.initial = {};
    // store original stats we will modify
    if (e.onStart) e.onStart(target);
    target.statusEffects.push(e);
  },

  updateStatus(target, dt) {
    if (!target || !target.statusEffects) return;
    const out = [];
    for (const eff of target.statusEffects) {
      eff.time += dt;
      if (eff.interval) {
        eff._acc += dt;
        if (eff._acc >= eff.interval) {
          eff._acc = 0;
          eff.tick && eff.tick(target);
        }
      }
      if (eff.time >= eff.duration) {
        eff.onEnd && eff.onEnd(target);
      } else {
        out.push(eff);
      }
    }
    target.statusEffects = out;
  }
};