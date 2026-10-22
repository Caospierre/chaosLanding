// Mantiene pulsaciones simultáneas de distintos dedos sin dejar teclas atascadas.
export class TouchInput {
  constructor(onChange) {
    this.pointers = new Map();
    this.onChange = onChange;
  }
  press(id, action) {
    if (this.pointers.has(id)) this.release(id);
    this.pointers.set(id, action);
    this.onChange(action, true);
  }
  release(id) {
    const action = this.pointers.get(id);
    if (!action) return;
    this.pointers.delete(id);
    if (![...this.pointers.values()].includes(action))
      this.onChange(action, false);
  }
  clear() {
    const actions = new Set(this.pointers.values());
    this.pointers.clear();
    for (const action of actions) this.onChange(action, false);
  }
}
export function nearLadder(player, ladders) {
  return ladders.some(
    (l) =>
      Math.abs(player.x + player.w / 2 - l.x) < 26 &&
      player.y + player.h >= l.y - 8 &&
      player.y < l.bottom + 3,
  );
}
// Mantiene al jugador visible sin reducirlo a una miniatura.
export function cameraForPlayer(
  width,
  height,
  player,
  worldWidth = 1100,
  worldHeight = 650,
) {
  const scale = Math.min(1, Math.max(0.7, height / worldHeight));
  const offset = (size, world, focus) =>
    world * scale <= size
      ? (size - world * scale) / 2
      : Math.max(size - world * scale, Math.min(0, size / 2 - focus * scale));
  return {
    scale,
    x: offset(width, worldWidth, player.x + player.w / 2),
    y: offset(height, worldHeight, player.y + player.h / 2),
  };
}
