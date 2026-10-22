import { test } from "node:test";
import assert from "node:assert/strict";
import { TouchInput, nearLadder, cameraForPlayer } from "../dist/mobile.js";
import { Game } from "../dist/game.js";
test("two fingers can move and jump independently", () => {
  const keys = {};
  const input = new TouchInput((a, v) => (keys[a] = v));
  input.press(1, "right");
  input.press(2, "jump");
  assert.ok(keys.right && keys.jump);
  input.release(2);
  assert.ok(keys.right);
  assert.equal(keys.jump, false);
  input.clear();
  assert.equal(keys.right, false);
});
test("releasing one finger does not cancel another on the same action", () => {
  const keys = {};
  const input = new TouchInput((a, v) => (keys[a] = v));
  input.press(1, "attack");
  input.press(2, "attack");
  input.release(1);
  assert.ok(keys.attack);
  input.release(2);
  assert.equal(keys.attack, false);
});
test("ladder controls appear only where climbing is possible", () => {
  const g = new Game(1100, 650);
  assert.equal(nearLadder(g.player, g.ladders), false);
  g.player.x = g.ladders[0].x - g.player.w / 2;
  assert.ok(nearLadder(g.player, g.ladders));
  g.enemies = [];
  g.step(1 / 60, { up: true });
  assert.ok(g.player.climb);
});
test("camera keeps the player visible at both edges and after rotating", () => {
  for (const [width, height] of [
    [390, 600],
    [844, 260],
  ])
    for (const [x, y] of [
      [4, 100],
      [550, 325],
      [1070, 540],
    ]) {
      const player = { x, y, w: 23, h: 40 };
      const c = cameraForPlayer(width, height, player);
      assert.ok(c.scale >= 0.7);
      const px = (x + 11.5) * c.scale + c.x,
        py = (y + 20) * c.scale + c.y;
      assert.ok(px >= 0 && px <= width);
      assert.ok(py >= 0 && py <= height);
    }
});
