// HeroUtils.js
window.HeroUtils = {
  estimateDPS(hero){
    const atk = hero.stats.atk || 1;
    const as_ = hero.stats.attackSpeed || 1;
    return atk * as_;
  },
  isMelee(hero){ return (hero.stats.attackRange || 1) < 2; }
};