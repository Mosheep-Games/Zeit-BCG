// HeroFactory_Consolidated.js
window.HeroFactoryConsolidated = (function(){
  const registry = {};
  function clone(obj){ return JSON.parse(JSON.stringify(obj)); }
  function create(key, opts={}){
    const base = registry[key] || (window.HERO_DATABASE && window.HERO_DATABASE[key]);
    if (!base) throw new Error('HeroFactoryConsolidated: hero "'+key+'" not found');
    const start = clone(base);
    const hero = {
      key: key,
      id: 'h_'+Math.random().toString(36).slice(2,9),
      name: start.name || key,
      class: start.class || 'neutral',
      level: opts.level || 1,
      xp: opts.xp || 0,
      stats: Object.assign({}, start.stats),
      growth: Object.assign({}, start.growth || {}),
      maxLevel: start.maxLevel || 18,
      position: { x: (opts.x||0), y: (opts.y||0) },
      shield: 0,
      dead: false,
      statusEffects: [],
      passiveFlags: {},
      skillIds: Array.isArray(start.skills) ? start.skills.slice() : [],
      skills: [],
      passives: Array.isArray(start.passives) ? start.passives.slice() : [],
      description: start.description || '',
      reqXP() { return 50 + this.level * 25; },
      addXP(amount){
        this.xp += amount;
        while (this.level < this.maxLevel && this.xp >= this.reqXP()){
          this.xp -= this.reqXP();
          this.levelUp();
        }
      },
      levelUp(){
        this.level++;
        for (const key in this.growth){
          if (this.growth.hasOwnProperty(key)){
            this.stats[key] = (this.stats[key] || 0) + this.growth[key];
          }
        }
        if (this.onLevelUp) try { this.onLevelUp(this); } catch(e){ console.error(e); }
      },
      takeDamage(dmg, src){ CombatSystem.applyDamage(src, this, dmg); },
      attack(target){ if (target && !target.dead) CombatSystem.applyDamage(this, target, this.stats.atk || 1); },
      update(dt){
        CombatSystem.updateStatus(this, dt);
        if (this.passiveRegen) {
          const regen = this.passiveRegen * dt;
          this.stats.hp = Math.min((this.stats.maxHp || this.stats.hp), this.stats.hp + regen);
        }
      },
      isAlive(){ return !this.dead && (this.stats.hp > 0); },
      ...opts
    };
    if (typeof AbilityFactory !== 'undefined' && hero.skillIds.length){
      try {
        hero.skills = hero.skillIds.map(id => AbilityFactory.create(id, { owner: hero }));
      } catch(e){ console.warn('HeroFactory: failed to create skills', e); }
    }
    if (hero.passives && hero.passives.length){
      hero.passives.forEach(pid => { hero.passiveFlags[pid] = true; });
    }
    return hero;
  }
  function register(key, data){ registry[key] = data; }
  function loadFromJSON(json){
    if (typeof json === 'string') json = JSON.parse(json);
    for (const k in json){ register(k, json[k]); }
    return true;
  }
  return { create, register, loadFromJSON };
})();