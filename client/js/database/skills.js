
const SKILL_DATABASE = {

    "time_blast": {
        name: "Time Blast",
        type: "projectile",
        description: "Dispara um orbe temporal que causa dano mágico.",

        cooldown: 3,
        manaCost: 20,
        castRange: 6,

        scaling: { ap: 0.6 },

        effect(hero, target, world) {
            world.spawnProjectile({
                from: hero,
                to: target,
                speed: 12,
                onHit(enemy) {
                    const dmg = hero.stats.atk + (hero.stats.ap || 0) * 0.6;
                    enemy.takeDamage(dmg, hero);
                }
            });
        },

        visual(hero, target, world) {
            world.fx.createTrail(hero.position, target.position, "time_orb");
        }
    },

    "slow_field": {
        name: "Slow Field",
        type: "aoe",
        description: "Cria um campo que reduz a velocidade dos inimigos.",

        cooldown: 8,
        manaCost: 40,
        castRange: 4,

        effect(hero, target, world) {
            world.applyAreaEffect({
                position: target.position,
                radius: 3,
                duration: 4,
                onEnter(enemy) {
                    enemy.stats.moveSpeed *= 0.5;
                },
                onExit(enemy) {
                    enemy.stats.moveSpeed *= 2;
                }
            });
        },

        visual(hero, target, world) {
            world.fx.createCircle(target.position, 3, "slow_aura");
        }
    },

    "time_stop": {
        name: "Time Stop",
        type: "ultimate",
        description: "Congela todos os inimigos próximos por 2 segundos.",

        cooldown: 25,
        manaCost: 80,
        castRange: 0,

        effect(hero, target, world) {
            world.applyAreaEffect({
                position: hero.position,
                radius: 4,
                duration: 2,
                onEnter(enemy) {
                    enemy.stunned = true;
                },
                onExit(enemy) {
                    enemy.stunned = false;
                }
            });
        },

        visual(hero, target, world) {
            world.fx.screenshake(4);
            world.fx.globalTint("blue", 0.3, 2000);
        }
    }
};
