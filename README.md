# Zeit — Edição Modernizada (Engine, Gameplay, Render & Hero System)

Este projeto é uma versão **modernizada e reestruturada** do jogo **Zeit**, originalmente construído em JavaScript.
A modernização introduz:

* Nova **mini-engine de renderização**
* Game loop desacoplado
* Sistema de **entidades**
* Sistema modular de **Heróis e Habilidades**
* Código mais organizado e expansível
* Melhor desempenho (culling, object factories, sub-stepping)

Este README documenta **todos os sistemas**, a arquitetura atual e como trabalhar com o motor modernizado.

---

# 🚀 1. Estrutura Geral do Projeto

```
Zeit/
 ├─ client/
 │   ├─ css/
 │   ├─ img/
 │   ├─ js/
 │   │   ├─ core/
 │   │   ├─ factories/
 │   │   ├─ render/
 │   │   ├─ game.js
 │   │   ├─ init_hero_system.js
 │   │   └─ movement.js
 │   ├─ json/
 │   │   ├─ heroes.json
 │   │   └─ skills.json
 ├─ server/
 └─ README.md
```

---

# 🧩 2. Engine Modernizada

## 2.1 Game Loop (client/js/game.js)

O game loop foi reescrito para:

* atualizar entidades
* atualizar movimento
* renderizar a cena
* desacoplar lógica e renderização

### **Exemplo do novo game loop:**

```js
export function startGame(world, ctx) {
  let last = performance.now();

  function loop(now){
    const dt = (now - last)/1000;
    last = now;

    // Atualiza entidades (players, heróis, projéteis etc.)
    for (const e of world.entities){
      if (e.controller)
        updateMovement(e, e.controller.input, dt);
    }

    renderFrame(ctx, world, world.camera);
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}
```

---

## 2.2 Render System (client/js/render.js)

O renderizador foi modernizado:

* limpeza da tela
* culling automático (desenha só o que aparece na tela)
* suporte a layers

### **Exemplo:**

```js
export function renderFrame(ctx, world, camera) {
  ctx.save();
  ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);

  const visible = world.entities.filter(e => 
    Math.abs(e.x - camera.x) < camera.w &&
    Math.abs(e.y - camera.y) < camera.h
  );

  renderEntities(ctx, visible, camera);
  ctx.restore();
}
```

---

# 🦸 3. Sistema de Heróis (HeroFactory)

O novo sistema permite criar heróis a partir de arquivos JSON, fácil de estender e ideal para jogos com muitos personagens.

## 3.1 Estrutura do heroes.json

`client/json/heroes.json`

```json
{
  "axe": {
    "name": "Axe",
    "hp": 120,
    "speed": 110,
    "abilities": ["axe_attack", "enrage"]
  }
}
```

---

## 3.2 Criando heróis (client/js/factories/HeroFactory.js)

```js
const hero = {
  id,
  name: data.name,
  hp: data.hp,
  speed: data.speed,
  abilities: []
};
```

### Criando um herói:

```js
const hero = HeroFactory.create("axe");
await HeroFactory.attachAbilities(hero, AbilityFactory);
```

---

# 🌀 4. Sistema de Habilidades (AbilityFactory)

Habilidades agora têm:

* cooldown
* tipo (melee, projectile, buff etc.)
* método `canCast()`
* método `cast()`
* dados vindos de JSON

## 4.1 Estrutura do skills.json

```json
{
  "axe": {
    "axe_attack": {
      "name": "Axe Swing",
      "cooldown": 1.1,
      "power": 30,
      "type": "melee"
    }
  }
}
```

---

## 4.2 Criando habilidades

```js
const abl = AbilityFactory.create("axe_attack", { owner: hero });
```

---

## 4.3 Comportamentos nativos

### Ataque melee:

```js
world.dealAreaDamage(owner.x, owner.y, this.data.range || 40, this.power, owner);
```

### Projéteis:

```js
world.spawnProjectile({
  x: owner.x,
  y: owner.y,
  dir: owner.dir,
  speed: this.data.speed,
  power: this.power
});
```

---

# 🎮 5. Integrando com o Sistema Original do Jogo

Heróis agora são criados automaticamente quando um card é colocado no tabuleiro:

```js
if(window.HeroSystem)
    HeroSystem.spawnHero(card.data('hero'), {x:x+p, y:y});
```

Isso permite que:

* O herói apareça visualmente como antes
* Mas também seja criado internamente como uma entidade real
* Com habilidades, vida, velocidade e lógica própria
* Compatível com o engine modernizado

---

# 🔥 6. Exemplo Completo: Criando um Herói no Jogo

```js
await HeroSystem.load();

const axe = await HeroSystem.spawnHero("axe", {
  x: 150,
  y: 300
});

console.log(axe.name); // "Axe"
console.log(axe.abilities); // lista de abilities convertidas
```

---

# 🛠 7. Próximos Passos

O motor está pronto para evolução. Recomendações:

* Criar `world.spawnProjectile()`
* Criar `world.dealAreaDamage()`
* IA para inimigos usando AbilityFactory
* Novos heróis e subclasses
* UI para lançar habilidades
* UI de cooldowns e barras de HP

---

# 📄 8. Licença

Projeto modificado para fins de aprendizado, evolução e documentação.
Consulte a licença original do Zeit para uso comercial ou redistribuição.
