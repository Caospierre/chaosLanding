// Poses distintas para reposo frontal, caminata lateral y escalera de espaldas.
export function playerPose({
  walking = false,
  walk = 0,
  climb = false,
  climbPhase = 0,
  airborne = false,
} = {}) {
  const frame = Math.floor(((climb ? climbPhase : walk) * 4) / Math.PI) % 8;
  const gait = [0, 4, 7, 4, 0, -4, -7, -4][(frame + 8) % 8];
  return {
    view: climb ? "back" : walking || airborne ? "side" : "front",
    frame,
    gait,
    bob: walking ? (frame % 4 === 1 || frame % 4 === 3 ? 2 : 0) : 0,
  };
}
export function drawPlayer(c, x, y, options = {}) {
  const {
    dir = 1,
    walking = false,
    walk = 0,
    climb = false,
    climbPhase = 0,
    airborne = false,
    swing = 0,
  } = options;
  const { view, frame, gait, bob } = playerPose({
    walking,
    walk,
    climb,
    climbPhase,
    airborne,
  });
  const pixel = (x, y, w, h, color) => {
    c.fillStyle = color;
    c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };
  const line = (x1, y1, x2, y2, w, color) => {
    const steps = Math.ceil(Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)));
    for (let i = 0; i <= steps; i++) {
      const k = steps ? i / steps : 0;
      pixel(
        x1 + (x2 - x1) * k - w / 2,
        y1 + (y2 - y1) * k - w / 2,
        w,
        w,
        color,
      );
    }
  };
  const skin = "#e9b58a",
    light = "#f1c39b",
    hair = "#30251f",
    hairLight = "#523a2c",
    hood = "#23352c",
    pants = "#3c5145",
    sole = "#99ae9b";
  const hammer = (hx, hy, angle) => {
    c.save();
    c.translate(hx, hy);
    c.rotate(angle);
    pixel(-2, -2, 5, 24, "#b78d53");
    pixel(-7, -8, 19, 10, "#849c8d");
    pixel(-7, -8, 19, 3, "#cfddd0");
    pixel(9, -5, 4, 7, "#4c6857");
    c.restore();
  };
  c.save();
  c.translate(Math.round(x + 12), Math.round(y + 40));
  c.scale(view === "back" ? 1 : dir, 1);
  if (view === "back") {
    // Manos y pies alternan peldaños; al detenerse se conserva el fotograma.
    const handLeft = -39 - gait,
      handRight = -39 + gait;
    const footLeft = -3 + Math.max(0, gait),
      footRight = -3 + Math.max(0, -gait);
    line(-5, -16, -10, -11 + Math.max(0, gait) * 0.6, 6, pants);
    line(-10, -11 + Math.max(0, gait) * 0.6, -9, footLeft, 5, pants);
    line(5, -16, 10, -11 + Math.max(0, -gait) * 0.6, 6, "#506354");
    line(10, -11 + Math.max(0, -gait) * 0.6, 9, footRight, 5, "#506354");
    pixel(-13, footLeft, 9, 4, "#101c16");
    pixel(5, footRight, 9, 4, "#101c16");
    pixel(-13, footLeft + 3, 9, 1, sole);
    pixel(5, footRight + 3, 9, 1, sole);
    line(-8, -27, -14, -31 - gait * 0.4, 5, hood);
    line(-14, -31 - gait * 0.4, -12, handLeft + 2, 5, hood);
    pixel(-14, handLeft - 2, 5, 5, skin);
    line(8, -27, 14, -31 + gait * 0.4, 5, hood);
    line(14, -31 + gait * 0.4, 12, handRight + 2, 5, hood);
    pixel(10, handRight - 2, 5, 5, skin);
    pixel(-10, -29, 21, 16, "#14251b");
    pixel(-7, -27, 15, 14, hood);
    pixel(-6, -28, 13, 8, "#35483a");
    pixel(-4, -26, 9, 3, "#475c49");
    line(-7, -27, 7, -13, 2, "#746b4c");
    hammer(7, -17, 0.7);
    // Nuca y cabello corto: sin cara ni lentes desde atrás.
    pixel(-5, -31, 10, 5, "#c78f69");
    pixel(-10, -43, 21, 15, hair);
    pixel(-8, -46, 16, 8, hair);
    pixel(-4, -47, 7, 4, hairLight);
    pixel(-8, -40, 5, 3, hairLight);
    pixel(2, -44, 5, 3, "#634631");
    pixel(7, -39, 4, 6, "#3e2d22");
  } else {
    const moving = walking || airborne;
    const forward = airborne ? 6 : gait,
      back = airborne ? -6 : -gait;
    const liftFront = airborne ? -5 : Math.max(0, -gait) * 0.75,
      liftBack = airborne ? -2 : Math.max(0, gait) * 0.75;
    // Piernas articuladas: avance de muslo, rodilla y pie, no solo estiramiento.
    line(-4, -16, -4 + back * 0.5, -9 - liftBack, 6, "#293d32");
    line(
      -4 + back * 0.5,
      -9 - liftBack,
      -4 + back,
      -3 - liftBack,
      5,
      "#293d32",
    );
    pixel(-8 + back, -4 - liftBack, 10, 4, "#101a15");
    pixel(-8 + back, -1 - liftBack, 10, 1, "#6d8573");
    line(4, -16, 4 + forward * 0.55, -9 - liftFront, 6, pants);
    line(
      4 + forward * 0.55,
      -9 - liftFront,
      4 + forward,
      -3 - liftFront,
      5,
      pants,
    );
    pixel(0 + forward, -4 - liftFront, 11, 4, "#101a15");
    pixel(0 + forward, -1 - liftFront, 11, 1, sole);
    const armSwing = moving ? -gait * 0.65 : 0;
    line(-7, -26 - bob, -10 - armSwing, -18 - bob, 5, "#1a2a20");
    line(-10 - armSwing, -18 - bob, -10 - armSwing, -12 - bob, 4, "#1a2a20");
    pixel(-12 - armSwing, -13 - bob, 4, 5, skin);
    pixel(-9, -29 - bob, 19, 16, "#14231a");
    pixel(-6, -26 - bob, 13, 13, hood);
    pixel(-8, -29 - bob, 6, 6, "#3b4a3b");
    if (view === "front") {
      pixel(-3, -24 - bob, 1, 6, "#9caa91");
      pixel(3, -24 - bob, 1, 6, "#9caa91");
    }
    // Rostro: un solo lente en perfil, dos únicamente de frente.
    if (view === "side") {
      pixel(-7, -42 - bob, 17, 17, "#192018");
      pixel(-5, -40 - bob, 14, 14, skin);
      pixel(0, -39 - bob, 10, 9, light);
      pixel(9, -33 - bob, 5, 4, skin);
      pixel(-7, -34 - bob, 5, 6, "#d69b71");
      pixel(-5, -33 - bob, 2, 3, "#edbb91");
      pixel(1, -36 - bob, 11, 8, "#0c1711");
      pixel(3, -34 - bob, 7, 4, "#c5cfb7");
      pixel(6, -34 - bob, 2, 3, "#202b20");
      line(-4, -35 - bob, 2, -34 - bob, 2, "#111c13");
      pixel(8, -27 - bob, 4, 1, "#80553d");
      pixel(-9, -43 - bob, 18, 8, hair);
      pixel(-6, -46 - bob, 12, 5, hair);
      pixel(-9, -38 - bob, 5, 8, hair);
      pixel(5, -40 - bob, 5, 4, hair);
      pixel(-4, -45 - bob, 5, 3, hairLight);
      pixel(-7, -40 - bob, 4, 3, "#654a34");
    } else {
      pixel(-10, -42 - bob, 22, 18, "#142018");
      pixel(-8, -40 - bob, 18, 14, skin);
      pixel(-6, -39 - bob, 16, 9, light);
      pixel(-11, -33 - bob, 4, 6, "#d89b70");
      pixel(9, -32 - bob, 4, 5, skin);
      pixel(-8, -36 - bob, 8, 8, "#0b1710");
      pixel(3, -36 - bob, 9, 8, "#0b1710");
      pixel(0, -34 - bob, 3, 2, "#0b1710");
      pixel(-6, -34 - bob, 4, 4, "#c5cfb7");
      pixel(5, -34 - bob, 5, 4, "#c5cfb7");
      pixel(-4, -34 - bob, 2, 2, "#263326");
      pixel(7, -34 - bob, 2, 2, "#263326");
      pixel(3, -27 - bob, 5, 1, "#80553d");
      pixel(-11, -43 - bob, 22, 7, hair);
      pixel(-8, -46 - bob, 16, 5, hair);
      pixel(-3, -47 - bob, 6, 3, hairLight);
      pixel(-11, -38 - bob, 4, 7, hair);
      pixel(7, -39 - bob, 5, 4, hair);
      pixel(-7, -42 - bob, 5, 3, "#614530");
      pixel(2, -44 - bob, 5, 3, hairLight);
    }
    const hx = 10 + armSwing * 0.5,
      hy = -17 - bob + (airborne ? -4 : Math.abs(gait) * 0.35);
    line(8, -25 - bob, 11 + armSwing * 0.4, -21 - bob, 5, hood);
    line(11 + armSwing * 0.4, -21 - bob, hx, hy, 4, hood);
    pixel(hx - 2, hy - 2, 5, 5, skin);
    hammer(
      hx + 2,
      hy - 2,
      swing > 0
        ? -1.7 + Math.sin((swing / 0.23) * Math.PI) * 2.8
        : -0.2 + armSwing * 0.025,
    );
  }
  c.fillStyle = "#88fdb9";
  c.font = "8px monospace";
  c.textAlign = "center";
  c.fillText("TÚ", 0, -63);
  c.beginPath();
  c.moveTo(-4, -57);
  c.lineTo(4, -57);
  c.lineTo(0, -53);
  c.fill();
  c.restore();
}
