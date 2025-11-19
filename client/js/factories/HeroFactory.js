// client/js/factories/HeroFactory.js
// HeroFactory: loads hero definitions and instantiates hero objects
export const HeroFactory = (function(){
  let heroesData = null;

  async function load() {
    if (heroesData) return heroesData;
    const res = await fetch('/client/json/heroes.json');
    heroesData = await res.json();
    return heroesData;
  }

  function create(id, opts = {}) {
    if (!heroesData) throw new Error('HeroFactory: call load() before create()');
    const data = heroesData[id];
    if (!data) throw new Error('Unknown hero id: ' + id);
    const hero = {
      id: id,
      key: id,
      name: data.name || id,
      attribute: data.attribute || null,
      description: data.description || '',
      x: opts.x || 0,
      y: opts.y || 0,
      hp: opts.hp || (data.hp || 100),
      maxHp: opts.maxHp || (data.hp || 100),
      speed: opts.speed || (data.speed || 100),
      abilities: []
    };
    // attach ability placeholders (strings); real ability objects created by AbilityFactory
    if (data.abilities && Array.isArray(data.abilities)) {
      hero.abilityIds = data.abilities.slice();
    }
    return hero;
  }

  function attachAbilities(hero, abilityFactory) {
    if (!hero.abilityIds || !abilityFactory) return Promise.resolve(hero);
    return abilityFactory.load().then(() => {
      hero.abilities = hero.abilityIds.map(id => abilityFactory.create(id, { owner: hero }));
      return hero;
    });
  }

  return {
    load,
    create,
    attachAbilities
  };
})();
export default HeroFactory;
