// Game Loop Modernized (Level 3)
import { renderFrame } from './render.js';
import { updateMovement } from './movement.js';

export function startGame(world, ctx) {
  let last = performance.now();

  function loop(now){
    const dt = (now - last)/1000;
    last = now;

    // Update entities
    for (const e of world.entities){
      if (e.controller) 
        updateMovement(e, e.controller.input, dt);
    }

    renderFrame(ctx, world, world.camera);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
