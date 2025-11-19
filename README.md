# ZEIT — README (Versão Modernizada)

> Documento completo que explica o projeto, arquitetura, APIs, exemplos de código, guia de desenvolvimento, tuning e próximos passos. Escrito em português para uso imediato no repositório.

---

## Sumário rápido

* [O que é o projeto](#o-que-é-o-projeto)
* [Visão geral da arquitetura](#visão-geral-da-arquitetura)
* [Estrutura de arquivos (importante)](#estrutura-de-arquivos-importante)
* [Como rodar a demo localmente](#como-rodar-a-demo-localmente)
* [APIs centrais — exemplos de uso](#apis-centrais---exemplos-de-uso)

  * `GameWorld`
  * `HeroFactory`
  * `AbilityFactory`
  * `CombatSystem`
  * `AI_Ultra`
* [Como criar / adicionar Heróis (exemplo JSON)](#como-criar--adicionar-heróis-exemplo-json)
* [Como criar / adicionar Habilidades (exemplo JSON e funções)](#como-criar--adicionar-habilidades-exemplo-json-e-funções)
* [Loop principal e integração (exemplo)](#loop-principal-e-integração-exemplo)
* [Sistema de status e efeitos (DOT, Slow, Stun etc.)](#sistema-de-status-e-efeitos-dot-slow-stun-etc)
* [Render / FX — integração mínima e pontos de extensão](#render--fx---integração-mínima-e-pontos-de-extensão)
* [Como testar / debug / ferramentas úteis](#como-testar--debug--ferramentas-úteis)
* [Guia rápido de tuning (duas dicas rápidas)](#guia-rápido-de-tuning-duas-dicas-rápidas)
* [Checklist de performance (duas ações essenciais)](#checklist-de-performance-duas-ações-essenciais)
* [Roadmap recomendado e próximos passos](#roadmap-recomendado-e-próximos-passos)
* [Licença e créditos](#licença-e-créditos)

---

## O que é o projeto

**Zeit (versão modernizada)** é uma engine/mini-jogo de combate em tempo real com heróis e habilidades.
Objetivo: fornecer uma base modular, extensível e performática para criar um jogo do tipo *Action RPG / Arena / MOBA-lite*.

Principais características que já implementamos:

* Motor de mundo (`GameWorld`) com gerenciamento de entidades, projéteis e efeitos.
* Sistema de criação de heróis (`HeroFactory`) baseado em dados.
* Sistema de habilidades (`AbilityFactory`) com cooldown e efeitos integrados ao `GameWorld`.
* Sistema de combate (`CombatSystem`) com crit, armor, shield, status effects (DOT, slow, stun).
* IA avançada (AI_Ultra) com percepção, cálculo de ameaça, FSM, evasão de projéteis e uso contextual de habilidades.
* Demo mínima pronta para testar interações.

---

## Visão geral da arquitetura

Diagrama conceitual (texto):

```
[Input / Config] -> Factories (Hero/Ability) -> Entities -> GameWorld (update loop)
                                   ↑                     |
                                   |                     V
                                AI_Ultra  <----  CombatSystem, RenderFX, World APIs
```

Responsabilidades:

* **GameWorld**: atualiza entidades, move projéteis, gerencia AOE/effects e limpa mortos.
* **HeroFactory**: instancia heróis com stats, growth e habilidades.
* **AbilityFactory**: cria objetos de habilidade, com `canCast()` e `cast()` que chamam APIs do `GameWorld`.
* **CombatSystem**: aplica dano, status effects, gerencia shield/crit/armor/resist.
* **AI_Ultra**: decide ações de cada herói (percepção, GOAP-like, FSM, evasão, uso de skills).
* **RenderFX**: helpers para efeitos visuais (pode ser substituído por um sistema de partículas completo).

---

## Estrutura de arquivos (importante)

Exemplo de organização usada no pacote:

```
client/
  js/
    core/
      GameWorld.js
      HeroFactory.js
      AbilityFactory.js
      CombatSystem.js
      HeroSystem.js
      AI_Ultra.js
    render/
      RenderFX.js
  json/
    heroes.json
    skills.json
index.html (demo)
README.md
```

> Observação: os paths podem variar no seu repositório; ajuste os `import`/`script` tags conforme necessário.

---

## Como rodar a demo localmente

1. Copie todo o diretório `client/` gerado para um servidor estático simples (ou use o ZIP extraído).
2. Rode um servidor local (ex.: terminal no diretório onde está `index.html`):

```bash
# Python 3
python -m http.server 8000
# ou (Node)
npx http-server . -p 8000
```

3. Abra `http://localhost:8000/index.html`.
4. O demo carrega `heroes.json` e `skills.json`, spawna entidades e executa loop com IA.

---

## APIs centrais — exemplos de uso

### `GameWorld` (APIs principais)

```js
// adicionar entidade (hero)
GameWorld.add(hero);

// spawn projectile
GameWorld.spawnProjectile({
  from: hero,
  to: target,
  speed: 12,
  onHit: (enemy) => { CombatSystem.applyDamage(hero, enemy, 50, 'magic'); }
});

// apply area effect (AOE)
GameWorld.applyAreaEffect({
  position: {x:5, y:5},
  radius: 3,
  duration: 4,
  onEnter: (ent) => { /* aplicar slow */ },
  onExit: (ent) => { /* reverter slow */ }
});

// chamado a cada frame
GameWorld.update(dt);
```

---

### `HeroFactory`

```js
// cria instância a partir de HERO_DATABASE (ou client/json/heroes.json)
const hero = HeroFactory.create('chronos', { x: 4, y: 4 });
GameWorld.add(hero);
```

Hero retornado tem métodos básicos (por padrão):

* `hero.attack(target)`
* `hero.takeDamage(dmg, source)`
* `hero.update(dt)` — pode ser sobrescrito pelo HeroSystem para ligar IA

---

### `AbilityFactory`

```js
const skill = AbilityFactory.create('time_blast');
// verificar cooldown e cast:
if (skill.canCast(hero)) skill.cast(hero, target, GameWorld);
```

`AbilityFactory.create()` retorna objeto com:

* `id`, `name`, `cooldown`, `manaCost`, `lastCast`
* `canCast(owner)` e `cast(owner, target, world)`

As habilidades definidas em `SKILL_DATABASE` (ou `client/json/skills.json`) podem executar `world.spawnProjectile` / `world.applyAreaEffect` / `world.fx`.

---

### `CombatSystem`

```js
CombatSystem.applyDamage(attacker, defender, 80, 'physical');
// aplica crit, armor, shield, reduz HP e marca dead se necessário

CombatSystem.applyStatus(target, {
  type: 'slow',
  duration: 3,
  onStart: (t) => { t.stats.speed *= 0.5; },
  onEnd: (t) => { t.stats.speed *= 2; }
});
```

`CombatSystem.updateStatus(entity, dt)` deve ser chamado todo frame para processar DOT/HOT/intervals.

---

### `AI_Ultra`

API simples para executar AI por entidade (ex.: dentro do `hero.update`):

```js
AI_Ultra.process(hero, dt);
```

O módulo provê:

* `scanEnemies(hero)` — retorna lista de inimigos visíveis
* `calculateThreats(hero, enemies)` — lista ordenada por ameaça
* `chooseGoal(hero, threats)` — retorna 'FLEE'|'ROAM'|'CHASE'|'ENGAGE'
* `process(hero, dt)` — executa FSM, evasão e autoUseSkills

---

## Como criar / adicionar Heróis (exemplo JSON)

Coloque em `client/json/heroes.json` ou mantenha `HERO_DATABASE` em JS.

Exemplo:

```json
{
  "chronos": {
    "name": "Chronos",
    "class": "mage",
    "stats": {
      "hp": 200,
      "maxHp": 200,
      "mp": 120,
      "atk": 6,
      "ap": 12,
      "armor": 5,
      "resistance": 0.1,
      "speed": 2.5,
      "attackRange": 3,
      "critChance": 0.05,
      "critMultiplier": 1.6
    },
    "growth": { "hp": 18, "mp": 10, "atk": 2 },
    "skills": ["time_blast","slow_field","time_stop"]
  }
}
```

Após colocar o arquivo, carregue no browser (fetch) e crie com `HeroFactory.create('chronos', {x:4, y:4})`.

---

## Como criar / adicionar Habilidades (exemplo JSON + função)

No `client/json/skills.json` mantenha dados básicos; implemente a lógica em `SKILL_DATABASE` ou `AbilityFactory` callbacks.

Exemplo JSON (simplificado):

```json
{
  "time_blast": { "name":"Time Blast", "type":"projectile", "cooldown":3, "manaCost":20, "castRange":6, "speed":12 }
}
```

Implementação do efeito (em JS — `SKILL_DATABASE` ou diretamente em `AbilityFactory`):

```js
SKILL_DATABASE['time_blast'].effect = function(hero, target, world) {
  world.spawnProjectile({
    from: hero,
    to: target,
    speed: this.speed || 12,
    onHit: (enemy) => {
      const dmg = (hero.stats.ap || 0) * 0.6 + (hero.stats.atk || 0);
      CombatSystem.applyDamage(hero, enemy, dmg, 'magic');
    }
  });
};
```

Para habilidades AOE:

```js
SKILL_DATABASE['slow_field'].effect = function(hero, target, world) {
  world.applyAreaEffect({
    position: target.position,
    radius: 3,
    duration: 4,
    onEnter: (ent) => { CombatSystem.applyStatus(ent, { type:'slow', duration:4, onStart: (t)=>t.stats.speed*=0.5, onEnd: (t)=>t.stats.speed*=2 }); }
  });
};
```

---

## Loop principal e integração (exemplo)

Exemplo mínimo de game loop que integra `GameWorld`:

```js
let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  // atualiza mundo e entidades
  GameWorld.update(dt);

  // render = sua função que desenha canvas / DOM
  render();

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
```

> Importante: cada `entity.update(dt)` deve chamar `CombatSystem.updateStatus(this, dt)` para ticks de status efetivos.

---

## Sistema de status e efeitos (DOT, Slow, Stun etc.)

Padrão de efeito:

```js
{
  type: 'dot',           // ou 'slow','stun','shield','buff'
  duration: 5,           // em segundos
  interval: 1,           // se DOT/HOT: tick a cada X seg
  tick: (target) => {...}, // função de tick para DOT/HOT
  onStart: (target) => {...}, // execução na aplicação
  onEnd: (target) => {...}    // execução ao fim
}
```

Adição:

```js
CombatSystem.applyStatus(target, effectObject);
```

Processamento por frame:

```js
CombatSystem.updateStatus(target, dt);
```

---

## Render / FX — integração mínima e pontos de extensão

O `RenderFX` atual é placeholder: imprime texto no console e atua como stubs. Pontos de extensão:

* Implementar `RenderFX.floatText(text, pos, color)` para criar sprites/DOM overlays.
* `RenderFX.createTrail(a,b,type)` → partículas seguindo projéteis.
* `RenderFX.createCircle(pos, radius, type)` → anim AOE.
* Integrar com camadas do `renderFrame(ctx, world, camera)` e usar spritesheets.

Dica: mantenha `RenderFX` separado e assíncrono (fila de efeitos) para não bloquear lógica.

---

## Como testar / debug / ferramentas úteis

* Use `console.log` e `RenderFX.floatText` para visualizar eventos de combate.
* Abra DevTools → Performance para medir GC e frame cost.
* Use `requestAnimationFrame` loop com um cap (dt clamped) para evitar spikes.
* Para testar IA: altere `heroes.json` para 10 entidades e veja o comportamento (stress test).
* Criar overlay debug: desenhar linhas de visão, radiuses de AOE e vectores de movimento.

---

## Guia rápido de tuning (duas dicas rápidas)

1. **Ajuste de cooldown e mana:** Comece com `manaCost` alto para ultimates e `cooldown` maior. Balanceie pelo tempo médio entre usos (ex.: ultimate 25s, capaz de mudar fight).
2. **Dano e resistência:** Use formula de armor `reduction = armor/(armor+100)` (já implementada). Para balance, experimente multipliers de 0.8–1.2 por ajuste fino.

---

## Checklist de performance (duas ações essenciais)

1. **Culling e batching:** desenhar apenas entidades visíveis e agrupar draw calls no canvas.
2. **Object pooling:** projéteis/particles devem usar pool para reduzir GC.

---

## Roadmap recomendado e próximos passos

* **Curto prazo (1–2 semanas)**: polir FX (RenderFX), HUD de habilidades/cooldowns, demo com 4 heroes.
* **Médio prazo (1–3 meses)**: pathfinding A* em mapas com obstáculos, AI refinada por roles (tank/healer/assassin), matchmaking básico.
* **Longo prazo**: servidor authoritative (Node) com sincronização, modos PVP/PVE, editor de habilidades.

---

## Exemplos práticos adicionais (snippet avançado)

**Spawn + Skill cast automático (demo):**

```js
// spawn dois heróis
const a = HeroFactory.create('chronos', {x:4,y:4});
const b = HeroFactory.create('brawler', {x:9,y:6});
GameWorld.add(a); GameWorld.add(b);

// forçar skill do chronos no b
const s = a.skills.find(s=>s.id==='time_blast');
if (s && s.canCast(a)) s.cast(a, b, GameWorld);
```

**Script de teste de stress (spawn N bots):**

```js
for (let i=0;i<20;i++){
  const key = i%2===0 ? 'chronos' : 'brawler';
  const h = HeroFactory.create(key, {x: Math.random()*12, y: Math.random()*8});
  // attach AI if not present
  h.update = function(dt){ CombatSystem.updateStatus(this,dt); AI_Ultra.process(this,dt); };
  GameWorld.add(h);
}
```

---

## Licença e créditos

* Este pacote é uma modificação / extensão do seu projeto Zeit original.
* Verifique a licença original do Zeit antes de redistribuição comercial.
* Código aqui oferecido é para desenvolvimento, aprendizado e prototipagem.

---

## Contato e próximos passos recomendados por mim

Se quiser eu posso:

* Gerar patch `.diff` para integrar automaticamente ao `Zeit-master`.
* Criar demo com HUD interativo (botões spawn, sliders para stats).
* Implementar RenderFX com canvas particles.
* Criar painel de tuning em tempo real (debug UI).

Diga qual desses você prefere que eu faça em seguida.
