function updateMovement(player, dt, keys) {
  const speed = player.speed;
  let vx = 0, vy = 0;

  const up = keys["w"] || keys["ArrowUp"];
  const down = keys["s"] || keys["ArrowDown"];
  const left = keys["a"] || keys["ArrowLeft"];
  const right = keys["d"] || keys["ArrowRight"];

  vy = (down - up) * speed;
  vx = (right - left) * speed;

  const len = Math.hypot(vx, vy);
  if (len > speed) {
    const ratio = speed / len;
    vx *= ratio;
    vy *= ratio;
  }

  player.x = player.x + vx * dt * 0.95;
  player.y = player.y + vy * dt * 0.95;
}
