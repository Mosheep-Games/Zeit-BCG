// client/js/factories/AbilityFactory.js
// AbilityFactory: loads skill definitions and creates ability objects
export const AbilityFactory = (function(){
  let skillsData = null;

  async function load() {
    if (skillsData) return skillsData;
    const res = await fetch('/client/json/skills.json');
    skillsData = await res.json();
    return skillsData;
  }

  function create(id, opts = {}) {
    if (!skillsData) throw new Error('AbilityFactory: call load() before create()');
    // skills.json structured per hero then skill; we search
    let found = null;
    let ownerHero = opts.owner && opts.owner.key;
    // First try owner-specific
    if (ownerHero && skillsData[ownerHero] && skillsData[ownerHero][id]) {
      found = skillsData[ownerHero][id];
    } else {
      // search globally
      for (const h in skillsData) {
        if (skillsData[h] && skillsData[h][id]) {
          found = skillsData[h][id];
          break;
        }
      }
    }
    if (!found) {
      // fallback: create a generic basic ability
      return {
        id,
        name: id,
        cooldown: 1,
        power: 10,
        type: 'generic',
        canCast: () => true,
        cast: (owner, world) => {
          console.log('Cast generic ability', id, 'owner', owner && owner.key);
        }
      };
    }
    const ability = {
      id,
      name: found.name || id,
      cooldown: (found.cooldown || found.cd || 1),
      power: found.power || found.damage || 0,
      type: found.type || 'generic',
      description: found.description || '',
      data: found,
      lastCast: 0,
      canCast: function() {
        const now = Date.now();
        return (now - this.lastCast) >= (this.cooldown * 1000);
      },
      cast: function(owner, world) {
        if (!this.canCast()) return false;
        this.lastCast = Date.now();
        // Basic behaviors: melee area or projectile
        if (this.type === 'projectile' || (this.data && this.data.type === 'projectile')) {
          if (world && world.spawnProjectile) {
            world.spawnProjectile({
              x: owner.x, y: owner.y,
              dir: owner.dir || {x:1,y:0},
              speed: this.data.speed || 300,
              power: this.power
            });
          }
        } else if (this.type === 'melee' || (this.data && this.data.targets && this.data.targets.indexOf('Enemy')!==-1)) {
          if (world && world.dealAreaDamage) {
            world.dealAreaDamage(owner.x, owner.y, this.data.range || 40, this.power, owner);
          }
        } else {
          // default: log
          console.log('Ability cast:', this.name, 'by', owner && owner.key);
        }
        return true;
      }
    };
    return ability;
  }

  return {
    load,
    create
  };
})();
export default AbilityFactory;
