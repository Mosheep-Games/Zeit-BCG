// Modernized Render System (Level 3)
import { renderEntities } from './render/entities.js';

export function renderFrame(ctx, world, camera) {
  ctx.save();
  ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);

  // culling + layer system
  const visible = world.entities.filter(e => 
    Math.abs(e.x - camera.x) < camera.w &&
    Math.abs(e.y - camera.y) < camera.h
  );

  renderEntities(ctx, visible, camera);

  ctx.restore();
}
