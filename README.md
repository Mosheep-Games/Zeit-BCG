# ZEIT — DOCUMENTAÇÃO COMPLETA

## Sumário
- Engine & Gameplay
- Hero System
- Ability System
- Combat (C2)
- Arquitetura & Fluxos
- Guia para Devs

## Conteúdo Unificado

# ZEIT — README UNIFICADO


# Zeit Modernizado — Gameplay + Heroes + Skills

Este pacote inclui:

## ✔ Novo GameWorld (engine de gameplay)
Gerencia:
- entidades
- projéteis
- efeitos AOE
- atualização por frame

## ✔ Novo HeroSystem
Agora heróis são entidades vivas:
- têm posição
- atacam automaticamente
- podem lançar habilidades
- podem receber dano

## ✔ Integration com AbilityFactory e HeroFactory
- Skills agora usam projectiles e AOE reais
- HeroFactory cria heróis com atributos modernos
- GameWorld executa o gameplay

## ✔ Loop principal atualizado
`GameWorld.update(dt)` agora roda a cada frame, permitindo combates reais.

## Como funciona o jogo agora

### 1. Spawn de heróis
```js
HeroSystem.spawnHero("chronos", {x:4, y:6});
```

### 2. Ataques
Quando há um inimigo próximo:
- calcula distância
- chama `hero.attack()`

### 3. Skills
```js
hero.skills[0].cast(hero, target, GameWorld);
```

### 4. Projetéis
Um projétil é criado e movido até o alvo

### 5. Efeitos de área
Criam slow, stun, dano periódico etc.

---






## Hero & Ability System

Added modular HeroFactory and AbilityFactory under `client/js/factories`. Use `client/js/init_hero_system.js` to bootstrap and `HeroSystem.spawnHero(id, opts)` to create heroes.


## CombatSystem (C2)
Sistema avançado de dano, status, DOT, slow, stun.

## Estrutura da Engine
- GameWorld: loop e entidades
- HeroSystem: spawn & IA
- CombatSystem: lógica de combate
- AbilityFactory: habilidades e efeitos

## Guia para Desenvolvedores
Explanação de diretórios, pipelines e pontos de extensão.
