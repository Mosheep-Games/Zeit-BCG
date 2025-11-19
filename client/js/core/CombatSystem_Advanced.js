
// CombatSystem_Advanced.js
window.CombatSystemAdvanced = (function(){
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function calcDamage(source,target,baseDamage,type,options){
    options = options || {};
    const critChance = source.stats.critChance || 0;
    const critMult = source.stats.critMultiplier || 1.5;
    const isCrit = Math.random() < critChance;
    let dmg = baseDamage * (isCrit ? critMult : 1);
    if (options.scaling){
      if (options.scaling.ap) dmg += (source.stats.ap || 0) * options.scaling.ap;
      if (options.scaling.ad) dmg += (source.stats.atk || 0) * options.scaling.ad;
    }
    const penetration = source.stats.penetration || 0;
    if (type === 'physical'){
      const armor = (target.stats.armor || 0) - penetration;
      const reduction = armor > 0 ? (armor / (armor + 100)) : (armor / (100 + Math.abs(armor)));
      dmg = dmg * (1 - clamp(reduction, -5, 0.95));
    } else if (type === 'magic'){
      const res = (target.stats.resistance || 0) - (source.stats.magicPen || 0);
      dmg = dmg * (1 - clamp(res, -0.9, 0.95));
    }
    return { dmg: Math.max(0,dmg), isCrit: !!isCrit };
  }

  function applyShield(target, amount){
    target.shield = (target.shield || 0) + amount;
  }

  function applyDamage(source,target,amount,type,opts){
    if (!target or target.dead) return;
  }

  // Placeholder: will be overwritten below with proper applyDamage implementation
  function applyDamage_impl(source, target, amount, type, opts){
    if (!target || target.dead) return;
    opts = opts || {};
    const res = calcDamage(source,target,amount,type,opts);
    let final = res.dmg;
    target.shield = target.shield || 0;
    if (target.shield > 0){
      const absorb = Math.min(target.shield, final);
      target.shield -= absorb;
      final -= absorb;
    }
    final = Math.max(0, final);
    target.stats.hp = (target.stats.hp || 0) - final;
    const lifesteal = source.stats.lifeSteal || 0;
    if (lifesteal > 0 && source.stats.hp !== undefined){
      const heal = final * lifesteal;
      source.stats.hp = Math.min(source.stats.maxHp || source.stats.hp, (source.stats.hp||0) + heal);
    }
    if (window.RenderFX && RenderFX.floatText){
      const txt = (res.isCrit ? 'CRIT ' : '') + '-' + Math.round(final);
      RenderFX.floatText(txt, target.position, res.isCrit ? '#ffd700' : '#ff6666');
    }
    if ((target.stats.hp || 0) <= 0){
      target.dead = true;
      if (target.onDeath) try { target.onDeath(source); } catch(e){ console.error(e); }
    }
  }

  function applyStatus(target,effect){
    if (!target) return false;
    target.statusEffects = target.statusEffects || [];
    const resist = target.stats.statusResist || 0;
    if (Math.random() < resist){
      if (window.RenderFX && RenderFX.floatText) RenderFX.floatText('RESIST', target.position, '#6cf');
      return false;
    }
    const e = Object.assign({}, effect);
    e._time = 0; e._acc = 0;
    if (e.onStart) try { e.onStart(target); } catch(ex){ console.error(ex); }
    target.statusEffects.push(e);
    return true;
  }

  function updateStatus(entity, dt){
    if (!entity || !entity.statusEffects) return;
    const out = [];
    for (const eff of entity.statusEffects){
      eff._time += dt;
      if (eff.interval){
        eff._acc += dt;
        if (eff._acc >= eff.interval){
          eff._acc -= eff.interval;
          if (eff.tick) try { eff.tick(entity); } catch(ex){ console.error(ex); }
        }
      }
      if (eff._time >= (eff.duration || 0)){
        if (eff.onEnd) try { eff.onEnd(entity); } catch(ex){ console.error(ex); }
      } else {
        out.push(eff);
      }
    }
    entity.statusEffects = out;
  }

  function applyDOT(source,target,dmgPerTick,duration,interval,type){
    applyStatus(target, {
      type: 'dot',
      duration: duration,
      interval: interval,
      tick: function(t){ applyDamage_impl(source, t, dmgPerTick, type); }
    });
  }

  function applyHOT(source,target,healPerTick,duration,interval){
    applyStatus(target, {
      type: 'hot',
      duration: duration,
      interval: interval,
      tick: function(t){ t.stats.hp = Math.min(t.stats.maxHp||t.stats.hp, (t.stats.hp||0) + healPerTick); }
    });
  }

  function applyStun(target, duration){
    applyStatus(target, {
      type: 'stun',
      duration: duration,
      onStart: t => { t.canAct = false; },
      onEnd: t => { t.canAct = true; }
    });
  }

  return {
    applyDamage: applyDamage_impl,
    calcDamage,
    applyShield,
    applyStatus,
    updateStatus,
    applyDOT,
    applyHOT,
    applyStun
  };
})();
