function render(ctx, assets) {
  ctx.save();

  if (!window.__renderCache) {
    window.__renderCache = {
      bg: assets.bg,
      map: assets.map
    };
  }
  const cache = window.__renderCache;

  ctx.drawImage(cache.bg, 0, 0);
  ctx.drawImage(cache.map, 0, 0);

  drawEntities(ctx);
  drawProjectiles(ctx);
  drawParticles(ctx);

  ctx.restore();
}
