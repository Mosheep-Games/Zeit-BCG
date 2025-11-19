
const HERO_DATABASE = {
    "chronos": {
        name: "Chronos",
        class: "mage",

        stats: {
            hp: 120,
            mp: 200,
            atk: 8,
            armor: 2,
            moveSpeed: 2.5,
            attackSpeed: 1.0,
            critChance: 0.05,
            critDamage: 1.5
        },

        growth: {
            hp: 15,
            mp: 20,
            atk: 2,
            armor: 0.4
        },

        skills: ["time_blast", "rewind", "slow_field", "time_stop"],

        triggers: {
            onGetHit(hero, dmg) {
                console.log(hero.name, "tomou", dmg, "de dano");
            },
            onAttack(hero, target) {
                console.log(hero.name, "atacou", target.name);
            }
        }
    }
};
