
# HERO SYSTEM — Consolidated (Guia Completo)

Este documento descreve o novo **HeroFactory_Consolidated** e o formato `heroes_consolidated.json`.

## Objetivo
Sistema centralizado para heróis: fácil adição via JSON, padronização de stats/growth/skills, suporte a passivas e triggers.

## Como carregar
```js
fetch('/client/json/heroes_consolidated.json').then(r=>r.json()).then(data=>{
  HeroFactoryConsolidated.loadFromJSON(data);
});
```

## Criar um herói
```js
const h = HeroFactoryConsolidated.create('chronos', { x: 4, y: 4 });
GameWorld.add(h);
```

## Campos importantes
- stats: hp, maxHp, mp, atk, ap, armor, resistance, speed, attackRange, critChance, critMultiplier, attackSpeed
- growth: valores ganhos por level
- skills: array de ids ligados ao SKILL_DATABASE
- passives: array de ids para passivas (lógica pode viver no CombatSystem)

## Progressão
- addXP(amount) e levelUp() são fornecidos
- reqXP base: 50 + level*25 (ajustável)

## Próximos passos
- Mapear passivas para efeitos concretos (regen, lifesteal)
- Criar editor de heróis
- Validar dados automaticamente

