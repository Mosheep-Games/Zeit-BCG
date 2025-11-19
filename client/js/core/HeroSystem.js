
window.HeroSystem = {
    spawnHero(id, pos) {
        const hero = HeroFactory.create(id);
        hero.position = pos;

        hero.update = function(dt) {
            const nearest = GameWorld.entities.find(e => e !== hero && !e.dead);
            if (nearest) {
                const dx = nearest.position.x - hero.position.x;
                const dy = nearest.position.y - hero.position.y;
                const dist = Math.hypot(dx, dy);
                if (dist < 1.4) {
                    hero.attack(nearest);
                }
            }
        };

        GameWorld.add(hero);
        return hero;
    }
};
