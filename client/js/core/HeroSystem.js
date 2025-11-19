// HeroSystem.js - spawns heroes and hooks AI
window.HeroSystem = {
  spawnHero(key, pos) {
    const hero = HeroFactory.create(key, {x: pos.x, y: pos.y});
    // attach update that calls AI_Ultra
    hero.update = function(dt) {
      // update status effects
      CombatSystem.updateStatus(this, dt);
      // AI run
      AI_Ultra.process(this, dt);
    };
    GameWorld.add(hero);
    return hero;
  }
};