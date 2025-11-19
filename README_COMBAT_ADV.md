
# Combat System Avançado

Este módulo (CombatSystem_Advanced.js) fornece um sistema completo de combate,
compatível com HeroFactory e AbilityFactory.

API principal:
- applyDamage(source, target, amount, type, opts)
- applyShield(target, amount)
- applyStatus(target, effectObject)
- updateStatus(entity, dt)
- applyDOT(...)
- applyHOT(...)
- applyStun(...)

Exemplo:
CombatSystemAdvanced.applyDamage(caster, enemy, 40, 'magic', { scaling:{ ap: 0.5 } });
