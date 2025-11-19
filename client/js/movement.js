// Modernized Movement System (Level 3)
export function updateMovement(player, input, dt) {
  const speed = player.speed;
  const dir = {x:0, y:0};
  if (input.up) dir.y -= 1;
  if (input.down) dir.y += 1;
  if (input.left) dir.x -= 1;
  if (input.right) dir.x += 1;

  const len = Math.hypot(dir.x, dir.y) || 1;
  const nx = dir.x/len, ny = dir.y/len;

  // Physics-like integration
  player.vx = nx * speed;
  player.vy = ny * speed;

  // Sub-stepping for smoother movement
  const step = dt/2;
  for (let i=0;i<2;i++){
    player.x += player.vx * step;
    player.y += player.vy * step;
  }
}
