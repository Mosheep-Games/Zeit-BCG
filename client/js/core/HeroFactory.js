// HeroFactory.js - create hero instances from HERO_DATABASE
window.HeroFactory = {
  create(key, opts={}) {
    if (!window.HERO_DATABASE) throw new Error('HERO_DATABASE not found');
    const base = window.HERO_DATABASE[key];
    if (!base) throw new Error('Hero '+key+' not found');
    const hero = {
      key,
      id: 'h_'+Math.random().toString(36).slice(2,9),
      name: base.name || key,
      class: base.class || 'neutral',
      level: 1,
      xp: 0,
      stats: JSON.parse(JSON.stringify(base.stats || {})),
      growth: base.growth || {},
      position: { x: (opts.x||0), y: (opts.y||0) },
      shield: 0,
      dead: false,
      skills: [],
      statusEffects: [],
      addXP(n){ this.xp+=n; while(this.xp>=this.reqXP()){ this.xp-=this.reqXP(); this.levelUp(); } },
      reqXP(){ return 50 + this.level*25; },
      levelUp(){ this.level++; for(const k in this.growth) this.stats[k]=(this.stats[k]||0)+this.growth[k]; },
      takeDamage(dmg, src){ CombatSystem.applyDamage(src,this,dmg); },
      attack(target){ if(target && !target.dead) CombatSystem.applyDamage(this,target,this.stats.atk||5); },
      update(dt){ CombatSystem.updateStatus(this,dt); /* placeholder: AI will override or HeroSystem sets update */ }
    };
    // attach skills if defined
    if (base.skills && Array.isArray(base.skills)) {
      hero.skills = base.skills.map(id => AbilityFactory.create(id));
    }
    return hero;
  }
};