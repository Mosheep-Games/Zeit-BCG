// client/js/init_hero_system.js
// Simple initializer to demonstrate HeroFactory + AbilityFactory usage
import { HeroFactory } from './factories/HeroFactory.js';
import { AbilityFactory } from './factories/AbilityFactory.js';

window.HeroSystem = {
  ready: false,
  load: async function() {
    await HeroFactory.load();
    await AbilityFactory.load();
    this.ready = true;
    return true;
  },
  spawnHero: async function(id, opts) {
    if (!this.ready) await this.load();
    const hero = HeroFactory.create(id, opts);
    await HeroFactory.attachAbilities(hero, AbilityFactory);
    // register in global world if exists
    if (window.game && game.units) {
      if (!game.world) game.world = { entities: [] };
      game.world.entities.push(hero);
    }
    return hero;
  }
};

// auto-load on script include (optional)
HeroSystem.load().then(()=>console.log('HeroSystem ready'));
