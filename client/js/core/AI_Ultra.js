// AI_Ultra.js - advanced tactical AI (compact, functional)
window.AI_Ultra = {
  scanEnemies(hero) {
    const vision = hero.visionRange || 8;
    return GameWorld.entities.filter(e => e !== hero && !e.dead && Math.hypot(e.position.x-hero.position.x,e.position.y-hero.position.y) <= vision);
  },

  calculateThreats(hero,enemies) {
    return enemies.map(e => {
      const dist = Math.hypot(e.position.x-hero.position.x, e.position.y-hero.position.y);
      const hpWeight = 1 - ((e.stats.hp||0)/(e.stats.maxHp|| (e.stats.hp||100)));
      const dpsWeight = (e.stats.atk||1);
      const distWeight = 1/(dist+0.01);
      const threat = hpWeight*0.4 + dpsWeight*0.4 + distWeight*0.2;
      return { enemy: e, threat };
    }).sort((a,b)=>b.threat-a.threat);
  },

  chooseGoal(hero, threats) {
    if (hero.stats.hp < (hero.stats.maxHp||100)*0.25) return 'FLEE';
    if (!threats.length) return 'ROAM';
    const top = threats[0].enemy;
    const dist = Math.hypot(top.position.x-hero.position.x, top.position.y-hero.position.y);
    if (dist > (hero.stats.attackRange||1.5)) return 'CHASE';
    return 'ENGAGE';
  },

  process(hero, dt) {
    if (hero.dead) return;
    const enemies = this.scanEnemies(hero);
    const threats = this.calculateThreats(hero,enemies);
    const goal = this.chooseGoal(hero, threats);

    // FSM
    switch(goal) {
      case 'FLEE': this.flee(hero, dt); break;
      case 'ROAM': this.roam(hero, dt); break;
      case 'CHASE': this.chase(hero, threats[0].enemy, dt); break;
      case 'ENGAGE': this.engage(hero, threats[0].enemy, dt); break;
    }

    // evade projectiles
    this.evade(hero, dt);
    // auto skills
    this.autoUseSkills(hero, enemies, threats);
  },

  flee(hero, dt) {
    const threats = this.scanEnemies(hero);
    if (!threats.length) return;
    const avg = threats.reduce((a,e)=>({x:a.x+e.position.x,y:a.y+e.position.y}),{x:0,y:0});
    avg.x/=threats.length; avg.y/=threats.length;
    const dx = hero.position.x - avg.x, dy = hero.position.y - avg.y;
    const dist = Math.hypot(dx,dy);
    if (dist>0.01) { hero.position.x += (dx/dist)*hero.stats.speed*dt; hero.position.y += (dy/dist)*hero.stats.speed*dt; }
  },

  roam(hero, dt) {
    // simple wandering: tiny random offset
    hero.position.x += (Math.random()-0.5)*0.2*dt;
    hero.position.y += (Math.random()-0.5)*0.2*dt;
  },

  chase(hero, target, dt) {
    if (!target) return;
    const dx = target.position.x - hero.position.x, dy = target.position.y - hero.position.y;
    const dist = Math.hypot(dx,dy);
    if (dist>0.01) {
      hero.position.x += (dx/dist)*hero.stats.speed*dt;
      hero.position.y += (dy/dist)*hero.stats.speed*dt;
    }
  },

  engage(hero, target, dt) {
    if (!target) return;
    // try use skill first
    if (hero.skills && hero.skills.length) {
      for (const s of hero.skills) {
        if (s.canCast(hero)) { s.cast(hero,target,GameWorld); return; }
      }
    }
    // else attack
    hero.attack(target);
  },

  evade(hero, dt) {
    GameWorld.projectiles.forEach(p=>{
      const dx=p.pos.x - hero.position.x, dy=p.pos.y - hero.position.y;
      const dist=Math.hypot(dx,dy);
      if (dist < 1.2) { hero.position.x -= dx*0.3*dt; hero.position.y -= dy*0.3*dt; }
    });
  },

  autoUseSkills(hero,enemies,threats) {
    if (!hero.skills) return;
    for (const s of hero.skills) {
      if (!s.canCast(hero)) continue;
      // AOE if >1 enemy nearby
      const count = enemies.filter(e=>Math.hypot(e.position.x-hero.position.x,e.position.y-hero.position.y) < (s.areaRadius||2)).length;
      if (s.areaRadius && count >= 2) { s.cast(hero,enemies[0],GameWorld); return; }
      // else cast on top threat
      if (threats[0]) { s.cast(hero, threats[0].enemy, GameWorld); return; }
    }
  }
};