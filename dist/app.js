import { ContactError } from "./contact.js";
import { ContactDelivery } from "./contact-state.js";
const contactDelivery = new ContactDelivery();
import { TouchInput, nearLadder, cameraForPlayer } from "./mobile.js";
import { drawPlayer } from "./player.js";
import { Game, clamp } from "./game.js";
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const stage = $("#stage"),
  content = $("#content"),
  world = $("#world"),
  actors = $("#actors"),
  bg = world.getContext("2d"),
  ctx = actors.getContext("2d");
const LI = "https://www.linkedin.com/in/jppineda1/";
const GH = "https://github.com/Caospierre";
const icons = {
  web: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a20 20 0 0 1 0 18 20 20 0 0 1 0-18Z"/>',
  app: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 18h4"/>',
  game: '<path d="M7 7h10c4 0 6 12 3 12-2 0-4-4-5-4H9c-1 0-3 4-5 4C1 19 3 7 7 7Z"/><path d="M5 11h6M8 8v6M16 10h.1M19 13h.1"/>',
};
icons.security =
  '<path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6Z"/><path d="m8 12 3 3 5-6"/>';
icons.infra =
  '<rect x="3" y="3" width="18" height="7" rx="1"/><rect x="3" y="14" width="18" height="7" rx="1"/><path d="M6 7h2m-2 11h2m5-11h5m-5 11h5"/>';
const svg = (id) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[id]}</svg>`;
const portrait = () =>
  `<div class="block portrait" data-block="portrait" data-critical="true" role="img" aria-label="Avatar pixel art de ChaosPierre."><div class="portrait-header"><i></i><i></i><i></i></div><div class="avatar"></div></div>`;
const title = (n, t, p) =>
  `<div class="section-title"><span class="eyebrow">${n} / PORTAFOLIO</span><h2>${t}</h2><p>${p}</p></div>`;
const areas = {
  software: {
    title: "Software",
    description: "Desarrollo web, aplicaciones móviles y servicios backend.",
    tools: [
      "TypeScript",
      "Python",
      "Go",
      "Scala",
      "React",
      "Angular",
      "Flutter",
      "Node.js",
      "Spring Boot",
    ],
    reason: "Desarrollo de software",
  },
  infra: {
    title: "Infraestructura",
    description:
      "Arquitectura cloud, servicios serverless y automatización de despliegues.",
    tools: [
      "AWS",
      "Google Cloud",
      "Firebase",
      "Firestore",
      "Serverless",
      "CI/CD",
    ],
    reason: "Infraestructura y automatización",
  },
  security: {
    title: "Seguridad",
    description:
      "Trabajo en seguridad y hacking ético. Si necesitas revisar un sistema, cuéntame el alcance y qué quieres evaluar.",
    tools: ["Seguridad", "Hacking ético"],
    reason: "Seguridad y hacking ético",
  },
};
let selectedArea = "software";
function openArea(id) {
  const area = areas[id];
  if (!area) return;
  selectedArea = id;
  $("#area-title").textContent = area.title;
  $("#area-description").textContent = area.description;
  $("#area-tools").replaceChildren(
    ...area.tools.map((tool) => {
      const tag = document.createElement("span");
      tag.textContent = tool;
      return tag;
    }),
  );
  $("#area-dialog").showModal();
}
const pages = {
  perfil: () =>
    `${portrait()}<div class="block identity" data-block="identity"><span class="eyebrow">INGENIERO DE SOFTWARE / QUITO, ECUADOR</span><h1>ChaosPierre</h1><p>Desarrollo software. También trabajo con infraestructura y seguridad.</p></div><button type="button" class="block mini" data-block="web" data-area="software" aria-haspopup="dialog" aria-controls="area-dialog">${svg("web")}<div><strong>SOFTWARE</strong><small>Web, apps y backend</small></div><span class="card-action" aria-hidden="true">↗</span></button><button type="button" class="block mini amber" data-block="infra" data-area="infra" aria-haspopup="dialog" aria-controls="area-dialog">${svg("infra")}<div><strong>INFRA</strong><small>Cloud y automatización</small></div><span class="card-action" aria-hidden="true">↗</span></button><button type="button" class="block mini" data-block="security" data-area="security" aria-haspopup="dialog" aria-controls="area-dialog">${svg("security")}<div><strong>SEGURIDAD</strong><small>Hacking ético</small></div><span class="card-action" aria-hidden="true">↗</span></button><div class="block about" data-block="about"><button class="about-open" type="button" data-go="experiencia" aria-label="Ver experiencia profesional"></button><span class="doc-icon">▤</span><span class="eyebrow">EXPERIENCIA</span><p>Datafast<br>Kushki · ConQuito</p><a href="${LI}" target="_blank" rel="noopener noreferrer">Ver LinkedIn ↗</a></div><button class="block cta amber" data-block="cta" data-go="experiencia">VER EXPERIENCIA <span style="margin-left:22px">→</span></button>`,
  proyectos: () =>
    `${portrait()}${title("02", "Proyectos.", "Algunos de mis trabajos para clientes.")}<div class="block contact-card client-project" data-block="fluent"><span class="eyebrow">SITIO WEB / EDUCACIÓN</span><h3>Fluent English Course</h3><p>Sitio web y aula virtual en Moodle para un cliente de formación en inglés.</p><div class="contact-links"><a class="primary" href="https://imfluent.org/" target="_blank" rel="noopener noreferrer">SITIO WEB ↗</a><a class="primary" href="https://learning.imfluent.org/login/index.php?loginredirect=1" target="_blank" rel="noopener noreferrer">AULA VIRTUAL · MOODLE ↗</a></div><a class="client-contact" href="#contacto" data-go="contacto">Hablemos de tu proyecto →</a></div>`,
  juegos: () =>
    `${portrait()}${title("03", "Juegos.", "Los puedes jugar en el navegador desde itch.io.")}<div class="games-list"><a class="block game-card" data-block="chaos-invader" href="https://caospierre.itch.io/chaos-invader" target="_blank" rel="noopener noreferrer"><img src="assets/chaos-invader.png" alt="Portada de Chaos Invader" width="315" height="250"><div><h3>Chaos Invader</h3><span>JUGAR EN ITCH.IO ↗</span></div></a><a class="block game-card" data-block="chaos-crusader" href="https://caospierre.itch.io/chaos-crusader" target="_blank" rel="noopener noreferrer"><img src="assets/chaos-crusader.png" alt="Portada de Chaos Crusader" width="315" height="250"><div><h3>Chaos Crusader</h3><span>JUGAR EN ITCH.IO ↗</span></div></a><a class="block game-card amber" data-block="caos-space" href="https://caospierre.itch.io/caosspace" target="_blank" rel="noopener noreferrer"><img src="assets/caos-space.png" alt="Portada de Caos Space" width="315" height="250"><div><h3>Caos Space</h3><span>JUGAR EN ITCH.IO ↗</span></div></a></div><div class="block games-link" data-block="itch-profile"><a href="https://caospierre.itch.io/" target="_blank" rel="noopener noreferrer">MI PERFIL EN ITCH.IO ↗</a></div>`,
  experiencia: () =>
    `${portrait()}${title("04", "Experiencia.", "Estos son algunos de los equipos con los que he trabajado.")}<div class="block timeline" data-block="career"><article class="job"><span>2026 — ACTUALIDAD</span><h3>ConQuito</h3><p>Especialista en Metodologías de Incubación de Videojuegos.</p></article><article class="job"><span>2023 — ACTUALIDAD</span><h3>Datafast</h3><p>Ingeniero de software.</p></article><article class="job"><span>2021 — 2023</span><h3>Kushki</h3><p>Ingeniero de software.</p></article><article class="job"><span>2020 — 2021</span><h3>AlquimiaSoft</h3><p>Desarrollador de aplicaciones.<br>Previamente, prácticas de ingeniería de software.</p></article></div><div class="block education" data-block="education"><div class="education-details"><span class="eyebrow">FORMACIÓN</span><span>Ingeniería de Software</span><span>Máster Universitario en Diseño y Desarrollo de Videojuegos</span></div><a href="${LI}" target="_blank" rel="noopener noreferrer">VER TRAYECTORIA COMPLETA ↗</a></div>`,
  habilidades: () =>
    `${portrait()}${title("05", "Con qué trabajo.", "Lenguajes, herramientas y áreas de trabajo.")}<div class="skills-list"><div class="block" data-block="languages"><strong>Lenguajes</strong><small>TypeScript · Python · Go · Scala</small></div><div class="block" data-block="web-mobile"><strong>Web y móvil</strong><small>React · Angular · Flutter</small></div><div class="block" data-block="backend"><strong>Backend</strong><small>Node.js · Spring Boot · Serverless</small></div><div class="block amber" data-block="infrastructure"><strong>Infraestructura</strong><small>AWS · Google Cloud · Firebase · Firestore</small></div><div class="block" data-block="security"><strong>Seguridad</strong><small>Hacking ético</small></div><div class="block" data-block="quality"><strong>Automatización y pruebas</strong><small>CI/CD · TDD · Pruebas unitarias</small></div></div><div class="block skills-note" data-block="skills-link">Español nativo · Inglés profesional · Francés en formación.<br><a href="${LI}" target="_blank" rel="noopener noreferrer">Más información en LinkedIn ↗</a></div>`,
  contacto: () =>
    contactDelivery.state.status === "pending"
      ? `${portrait()}${title("06", "Contacto.", "Tu mensaje se está enviando.")}<div class="block contact-card contact-pending" data-block="delivery" aria-busy="true"><span class="eyebrow">ENVÍO EN CURSO</span><h3>Los constructores llevan tu mensaje.</h3><p>Puedes seguir explorando o jugar. Te avisaré cuando se envíe.</p><div class="delivery-lane" aria-hidden="true"></div><button class="primary" data-go="perfil">VOLVER AL INICIO →</button></div>`
      : `${portrait()}${title("06", "Contacto.", "Cuéntame qué necesitas.")}<div class="block contact-card contact-form-card" data-block="contact"><form id="contact-form" class="contact-form" action="https://formsubmit.co/d202890e64cfa55578401c6335562ddb" method="POST"><input type="hidden" name="_subject" value="Una persona quiere ponerse en contacto contigo | Portafolio"><input type="hidden" name="_template" value="table"><input type="hidden" name="_next" value="${new URL("?contacto=enviado", new URL("./", location.href)).href}"><input type="hidden" name="Aviso" value="Hola ChaosPierre, esta persona busca ponerse en contacto contigo. Aquí tienes su información:"><div class="contact-honey" aria-hidden="true"><label>No completar<input type="text" name="_honey" tabindex="-1" autocomplete="off"></label></div><fieldset><div class="contact-row"><label for="visitor-email">TU CORREO <span>*</span><input id="visitor-email" name="email" type="email" placeholder="tu@correo.com" autocomplete="email" maxlength="254" required></label><label for="visitor-phone">TELÉFONO <small>OPCIONAL</small><input id="visitor-phone" name="Teléfono" type="tel" placeholder="+593 …" autocomplete="tel" maxlength="40"></label></div><label for="visitor-reason">MOTIVO <span>*</span><input id="visitor-reason" name="Motivo" placeholder="Una colaboración, un proyecto, una idea…" maxlength="150" required></label><label for="visitor-message">MENSAJE <span>*</span><textarea id="visitor-message" name="Mensaje" rows="3" placeholder="Hola ChaosPierre, me gustaría…" maxlength="5000" required></textarea></label><div class="contact-send"><button class="primary" type="submit">ENVIAR MENSAJE ↗</button><div class="social-links"><a href="${LI}" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><a href="${GH}" target="_blank" rel="noopener noreferrer">GitHub ↗</a></div></div></fieldset><p class="contact-result" role="status" aria-live="polite" hidden></p><p class="contact-game-note">Sal del juego con ▶ o Esc para escribir.</p></form></div>`,
};
let lastProgress = "",
  section = "perfil",
  game = null,
  playing = false,
  buildingUntil = 0,
  width = 0,
  height = 0,
  last = 0,
  keys = {},
  audio = null,
  sound = false,
  noticeTimer,
  overTimer,
  buildTimers = [],
  raf = 0,
  visited = new Set(),
  reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
function tone(freq = 250, d = 0.07, type = "square") {
  if (!sound) return;
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    audio.resume();
    const o = audio.createOscillator(),
      g = audio.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, audio.currentTime);
    g.gain.setValueAtTime(0.025, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + d);
    o.connect(g);
    g.connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + d);
  } catch {}
}
// Melodía original: rock en 8 bits con bajo y acordes de los sesenta.
let musicTimer = null;
let musicBeat = 0;
function stopMusic() {
  clearTimeout(musicTimer);
  musicTimer = null;
}
function startMusic() {
  stopMusic();
  const melody = [
    67,
    69,
    71,
    74,
    71,
    69,
    67,
    64,
    67,
    69,
    71,
    76,
    74,
    71,
    69,
    null,
    72,
    72,
    76,
    79,
    76,
    74,
    72,
    69,
    74,
    71,
    69,
    66,
    67,
    null,
    62,
    null,
  ];
  const roots = [48, 48, 53, 55];
  const gameMelody = [
    64,
    null,
    67,
    66,
    64,
    71,
    70,
    null,
    64,
    67,
    71,
    76,
    75,
    71,
    67,
    null,
    60,
    null,
    63,
    66,
    69,
    66,
    63,
    60,
    59,
    62,
    65,
    68,
    71,
    70,
    65,
    null,
  ];
  const gameRoots = [40, 40, 36, 35];
  const frequency = (note) => 440 * 2 ** ((note - 69) / 12);
  function note(pitch, duration, volume, type = "square") {
    if (!sound || !audio || pitch == null) return;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    const now = audio.currentTime;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency(pitch), now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
    oscillator.start(now);
    oscillator.stop(now + duration);
  }
  function tick() {
    if (!sound) return;
    if (!document.hidden && !$("dialog[open]")) {
      const step = musicBeat % melody.length;
      const root = (playing ? gameRoots : roots)[Math.floor(step / 8)];
      note((playing ? gameMelody : melody)[step], playing ? 0.12 : 0.16, 0.012);
      note(root + (step % 4 === 2 ? 7 : 0), 0.14, 0.025, "triangle");
      if (playing) {
        // Quintas cortas y un pulso grave para acompañar la acción.
        note(root + 12, 0.085, 0.008, "sawtooth");
        note(root + 19, 0.085, 0.005);
        if (step % 4 === 0) note(28, 0.1, 0.035, "sine");
        if (step % 4 === 2) note(78, 0.025, 0.006, "triangle");
      } else if (step % 2 === 1) {
        note(root + 12, 0.075, 0.005);
        note(root + 16, 0.075, 0.004);
        note(root + 19, 0.075, 0.004);
      }
      musicBeat++;
    }
    musicTimer = setTimeout(tick, playing ? 165 : 225);
  }
  tick();
}
function breakSound() {
  if (!sound) return;
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    audio.resume();
    const duration = 0.22;
    const buffer = audio.createBuffer(
      1,
      audio.sampleRate * duration,
      audio.sampleRate,
    );
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) {
      samples[i] = (Math.random() * 2 - 1) * (1 - i / samples.length);
    }
    const source = audio.createBufferSource();
    const filter = audio.createBiquadFilter();
    const gain = audio.createGain();
    source.buffer = buffer;
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2300, audio.currentTime);
    filter.frequency.exponentialRampToValueAtTime(
      180,
      audio.currentTime + duration,
    );
    gain.gain.setValueAtTime(0.07, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      audio.currentTime + duration,
    );
    source.connect(filter);
    filter.connect(gain);
    gain.connect(audio.destination);
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
    source.start();
    tone(95, 0.12, "triangle");
  } catch {}
}
function announce(text) {
  $("#announcement").textContent = text;
  $("#announcement").classList.add("show");
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(
    () => $("#announcement").classList.remove("show"),
    2900,
  );
}
function measureBlocks() {
  const r = stage.getBoundingClientRect();
  const scale = stage.clientWidth / r.width;
  return $$(".block").map((el) => {
    const b = el.getBoundingClientRect();
    return {
      id: el.dataset.block,
      x: (b.left - r.left) * scale,
      y: (b.top - r.top) * scale,
      w: b.width * scale,
      h: b.height * scale,
      critical: el.dataset.critical === "true",
      dead: el.classList.contains("destroyed"),
    };
  });
}
function syncBlocks() {
  if (game) game.blocks = measureBlocks();
}
function progress(n, total) {
  const state = [n, total, playing, game?.destroyed].join("/");
  if (state === lastProgress) return;
  lastProgress = state;
  $("#progress").innerHTML = Array.from(
    { length: Math.min(8, total) },
    (_, i) =>
      `<i class="${i < Math.round((n / total) * Math.min(8, total)) ? "on" : ""}"></i>`,
  ).join("");
  $("#block-count").textContent = playing
    ? `${game?.destroyed || 0}/${total} rotos`
    : `${n}/${total} bloques`;
}
function resize() {
  fitMobileGame();
  width = stage.clientWidth;
  height = stage.clientHeight;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  for (const c of [world, actors]) {
    c.width = Math.round(width * dpr);
    c.height = Math.round(height * dpr);
    c.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
    c.getContext("2d").imageSmoothingEnabled = false;
  }
  const old = game;
  game = new Game(width, height, measureBlocks());
  game.blocks.forEach(
    (b) =>
      (b.dead = !!$(`[data-block="${b.id}"]`)?.classList.contains("destroyed")),
  );
  if (old && playing) {
    game.score = old.score;
    game.hp = old.hp;
    game.destroyed = old.destroyed;
    game.state = old.state;
    game.player = {
      ...old.player,
      x: clamp((old.player.x / old.w) * width, 4, width - old.player.w - 4),
      y: (old.player.y / old.h) * height,
    };
    game.enemies = old.enemies.map((e) => ({
      ...e,
      x: (e.x / old.w) * width,
      y: (e.y / old.h) * height,
    }));
  }
  drawBackground();
}
function render(next = section) {
  clearTimeout(overTimer);
  buildTimers.forEach(clearTimeout);
  buildTimers = [];
  clearTouchInput();
  keys = {};
  section = pages[next] ? next : "perfil";
  game = null;
  lastProgress = "";
  visited.add(section);
  content.className = "content is-" + section;
  content.innerHTML = pages[section]();
  $("#gameover").hidden = true;
  $("#path").textContent = "~/" + section;
  $$(".nav").forEach((b) => {
    const on = b.dataset.section === section;
    b.classList.toggle("active", on);
    if (on) b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  });
  const blocks = $$(".block");
  blocks.forEach((b, i) => {
    b.style.setProperty("--delay", `${reduced ? 0 : i * 0.13}s`);
  });
  buildingUntil =
    performance.now() + (reduced ? 30 : blocks.length * 130 + 750);
  $("#status").textContent = "ensamblando " + section + "…";
  progress(0, blocks.length);
  blocks.forEach((b, i) =>
    buildTimers.push(
      setTimeout(
        () => {
          tone(180 + i * 35, 0.035);
          progress(i + 1, blocks.length);
        },
        reduced ? 10 : i * 130 + 750,
      ),
    ),
  );
  buildTimers.push(
    setTimeout(
      () => {
        resize();
        $("#status").textContent = playing
          ? "Los otros constructores no están de tu lado."
          : "listo. explora las secciones o pulsa ▶ para jugar.";
        if (playing) updateHUD();
      },
      reduced ? 30 : blocks.length * 130 + 800,
    ),
  );
  resize();
  syncContactForm();
  if (playing) {
    const fs = $("#contact-form fieldset");
    if (fs) fs.disabled = true;
    announce("Nuevo escenario. ¡A jugar!");
  }
}
function start() {
  if (playing) {
    if (externalPause.open) externalPause.close();
    else pauseGame();
    return;
  }
  if (performance.now() < buildingUntil) {
    announce("El equipo está terminando. Podrás jugar en un instante.");
    return;
  }
  playing = true;
  musicBeat = 0;
  if (sound) startMusic();
  enterMobileGame();
  resize();
  const fs = $("#contact-form fieldset");
  if (fs) fs.disabled = true;
  game = new Game(width, height, measureBlocks());
  $(".terminal").classList.add("game-active");
  $("#game-controls").hidden = false;
  $("#hud").hidden = false;
  $("#mode").innerHTML = '<i class="live-dot"></i> MODO JUEGO';
  $("#play").classList.add("playing");
  $("#play").setAttribute("aria-label", "Pausar juego");
  $("#play").innerHTML =
    '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" fill="currentColor" stroke="none"/></svg>';
  stage.focus({ preventScroll: true });
  announce(
    document.body.classList.contains("touch-game")
      ? "← → Mover · ↥ Saltar · ⚒ Golpear"
      : "¡A jugar! E = martillo.",
  );
  $("#status").textContent = "salta, sube y enfréntate a los constructores.";
  updateHUD();
  tone(530, 0.12);
}
function stop() {
  playing = false;
  if (externalPause.open) externalPause.close();
  musicBeat = 0;
  if (sound) startMusic();
  clearTouchInput();
  exitMobileGame();
  keys = {};
  clearTimeout(overTimer);
  $("#gameover").hidden = true;
  $(".terminal").classList.remove("game-active");
  $("#game-controls").hidden = true;
  $("#hud").hidden = true;
  $("#mode").innerHTML = '<i class="live-dot"></i> MODO EXPLORAR';
  $("#play").classList.remove("playing");
  $("#play").setAttribute("aria-label", "Jugar");
  $("#play").innerHTML =
    '<svg viewBox="0 0 24 24"><path d="m8 5 11 7-11 7Z" fill="currentColor" stroke="none"/></svg>';
  render();
}
function rebuild() {
  const active = playing;
  render();
  if (active) announce("Reconstruyendo escenario. Nueva partida.");
}
function updateHUD() {
  $("#health").textContent = Array.from({ length: 3 }, (_, i) =>
    i < game.hp ? "♥" : "♡",
  ).join(" ");
  $("#health").setAttribute("aria-label", game.hp + " vidas");
  $("#points").textContent = String(game.score).padStart(4, "0");
  progress(game.blocks.length, game.blocks.length);
}
function gameOver(reason) {
  clearTouchInput();
  keys = {};
  $("#gameover").hidden = false;
  $("#countdown").textContent = "3";
  $("#status").textContent = "game over. reiniciando el escenario…";
  tone(100, 0.5, "sawtooth");
  let count = 3;
  const tick = () => {
    count--;
    if (count <= 0) {
      rebuild();
      return;
    }
    $("#countdown").textContent = count;
    overTimer = setTimeout(tick, 1000);
  };
  overTimer = setTimeout(tick, 1000);
}
function rect(c, x, y, w, h, color) {
  c.fillStyle = color;
  c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}
function beam(x, y, w) {
  rect(bg, x, y, w, 12, "#2a3930");
  rect(bg, x, y + 2, w, 2, "#536356");
  rect(bg, x, y + 10, w, 3, "#050c08");
  for (let k = x; k < x + w; k += 22) {
    bg.strokeStyle = "#131e16";
    bg.lineWidth = 3;
    bg.beginPath();
    bg.moveTo(k, y + 3);
    bg.lineTo(k + 17, y + 10);
    bg.moveTo(k + 17, y + 3);
    bg.lineTo(k, y + 10);
    bg.stroke();
    rect(bg, k + 2, y + 2, 2, 2, "#81917c");
  }
}
function ladder(l) {
  rect(bg, l.x - 10, l.y, 3, l.bottom - l.y, "#b58a3f");
  rect(bg, l.x + 9, l.y, 3, l.bottom - l.y, "#d4aa54");
  for (let y = l.y + 6; y < l.bottom; y += 13) {
    rect(bg, l.x - 7, y, 16, 3, "#cca452");
    rect(bg, l.x - 7, y + 3, 16, 1, "#5d4520");
  }
}
function crate(c) {
  rect(bg, c.x, c.y, c.w, c.h, "#6a512a");
  rect(bg, c.x + 3, c.y + 3, c.w - 6, c.h - 6, "#3b321f");
  bg.strokeStyle = "#856539";
  bg.lineWidth = 3;
  bg.strokeRect(c.x + 2, c.y + 2, c.w - 4, c.h - 4);
  bg.beginPath();
  bg.moveTo(c.x + 4, c.y + 4);
  bg.lineTo(c.x + c.w - 4, c.y + c.h - 4);
  bg.moveTo(c.x + c.w - 4, c.y + 4);
  bg.lineTo(c.x + 4, c.y + c.h - 4);
  bg.stroke();
}
function drawBackground() {
  bg.clearRect(0, 0, width, height);
  if (!game) return;
  for (const x of [16, width - 26]) {
    rect(bg, x, 65, 9, height - 65, "#1b2a20");
    rect(bg, x + 2, 65, 2, height - 65, "#344338");
    for (let y = 70; y < height; y += 41) {
      bg.strokeStyle = "#2c3d30";
      bg.lineWidth = 3;
      bg.beginPath();
      bg.moveTo(x, y);
      bg.lineTo(x + 14, y + 36);
      bg.moveTo(x + 14, y);
      bg.lineTo(x, y + 36);
      bg.stroke();
    }
  }
  beam(0, height * 0.15, width * 0.29);
  beam(width * 0.64, height * 0.13, width * 0.36);
  rect(bg, 0, height * 0.16, width, 1, "#1b2b1e");
  for (let x = 25; x < width; x += 120) {
    rect(bg, x, height * 0.16, 3, height * 0.55, "#1b2b1e66");
  }
  for (const l of game.ladders) ladder(l);
  for (const b of game.blocks) {
    if (!b.dead) beam(b.x - 4, b.y + b.h + 4, b.w + 8);
  }
  for (const c of game.crates) crate(c);
  beam(0, game.floor, width);
  for (let x = 0; x < width; x += 55) {
    rect(bg, x, game.floor + 13, 7, 70, "#26372b");
    bg.strokeStyle = "#1b2b20";
    bg.lineWidth = 4;
    bg.beginPath();
    bg.moveTo(x + 8, game.floor + 20);
    bg.lineTo(x + 48, height);
    bg.moveTo(x + 48, game.floor + 20);
    bg.lineTo(x + 8, height);
    bg.stroke();
  }
  for (let x = 40; x < width; x += 180) {
    rect(bg, x, game.floor - 8, 4, 8, "#f5c86a");
    rect(bg, x - 2, game.floor - 10, 8, 3, "#ffdf8a");
  }
  bg.strokeStyle = "#bb8c37";
  bg.lineWidth = 2;
  const crane = width * 0.51;
  bg.beginPath();
  bg.moveTo(crane, 0);
  bg.lineTo(crane, 65);
  bg.stroke();
  rect(bg, crane - 7, 65, 14, 11, "#c39746");
  bg.strokeStyle = "#97733c";
  bg.lineWidth = 4;
  bg.beginPath();
  bg.moveTo(crane, 77);
  bg.lineTo(crane - 20, 98);
  bg.lineTo(crane - 16, 108);
  bg.moveTo(crane, 77);
  bg.lineTo(crane + 20, 98);
  bg.lineTo(crane + 16, 108);
  bg.stroke();
}
function worker(
  c,
  x,
  y,
  {
    dir = 1,
    walk = 0,
    player = false,
    enemy = false,
    stun = 0,
    swing = 0,
    carry = false,
    climb = false,
    climbPhase = 0,
    airborne = false,
    walking = false,
  } = {},
) {
  if (player) {
    drawPlayer(c, x, y, {
      dir,
      walk,
      climb,
      climbPhase,
      airborne,
      swing,
      walking,
    });
    return;
  }
  c.save();
  c.translate(Math.round(x + 12), Math.round(y + 40));
  c.scale(dir, 1);
  if (stun) {
    c.globalAlpha = 0.3 + 0.3 * Math.sin(performance.now() / 100);
  }
  const leg = Math.sin(walk) * 3;
  rect(c, -8, -14, 7, 11 + leg, "#335e6a");
  rect(c, 2, -14, 7, 11 - leg, "#426c7b");
  rect(c, -10, -4 + leg, 10, 4, "#8a6435");
  rect(c, 1, -4 - leg, 11, 4, "#8a6435");
  rect(c, -8, -28, 17, 16, enemy ? "#a55f49" : "#cd8246");
  rect(c, -5, -26, 5, 12, "#e2a060");
  rect(c, -8, -37, 17, 13, "#efbc85");
  rect(c, 5, -34, 6, 6, "#e6ae76");
  rect(c, -9, -39, 20, 5, enemy ? "#c8a171" : "#f6c858");
  rect(c, -6, -43, 13, 8, enemy ? "#b88a55" : "#edb942");
  rect(c, -2, -44, 4, 8, enemy ? "#d2b086" : "#ffe08d");
  rect(c, -11, -36, 24, 3, enemy ? "#d8b48a" : "#ffdb76");
  rect(c, 1, -34, 7, 5, "#1b2622");
  rect(c, 3, -33, 3, 2, "#c8e3c3");
  rect(c, -6, -34, 5, 5, "#1b2622");
  rect(c, -4, -33, 2, 2, "#d7e7cc");
  rect(c, -1, -33, 3, 1, "#16221b");
  rect(c, -9, -25, 5, 11, "#e6a973");
  if (carry) {
    rect(c, 8, -27, 5, 10, "#e5ad75");
    rect(c, 12, -34, 24, 21, "#235b38");
    rect(c, 14, -32, 20, 17, "#3f8852");
    rect(c, 21, -28, 5, 7, "#90dba2");
  } else if (player || enemy) {
    c.save();
    c.translate(8, -24);
    if (swing > 0) c.rotate(-1.8 + Math.sin((swing / 0.23) * Math.PI) * 2.9);
    else c.rotate(-0.3);
    rect(c, 0, -2, 9, 5, "#f3be84");
    rect(c, 7, -23, 4, 26, "#b38a51");
    rect(c, 2, -27, 18, 10, "#758a82");
    rect(c, 3, -27, 16, 3, "#c6d4c8");
    rect(c, 17, -25, 4, 7, "#4b6157");
    c.restore();
  } else rect(c, 8, -25, 4, 11, "#edb17d");
  if (player) {
    rect(c, -9, -59, 19, 3, "#88fdb9");
    c.fillStyle = "#88fdb9";
    c.font = "8px monospace";
    c.textAlign = "center";
    c.fillText("TÚ", 0, -64);
    c.beginPath();
    c.moveTo(-4, -54);
    c.lineTo(4, -54);
    c.lineTo(0, -50);
    c.fill();
  }
  c.restore();
}
function envelope(c, x, y) {
  rect(c, x, y, 23, 17, "#dfd8b0");
  rect(c, x + 1, y + 1, 21, 2, "#fff4ca");
  c.strokeStyle = "#927e48";
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(x + 1, y + 2);
  c.lineTo(x + 11, y + 10);
  c.lineTo(x + 22, y + 2);
  c.moveTo(x + 1, y + 16);
  c.lineTo(x + 8, y + 9);
  c.moveTo(x + 22, y + 16);
  c.lineTo(x + 15, y + 9);
  c.stroke();
}
function frame(t) {
  const dt = Math.min((t - last) / 1000 || 0.016, 0.035);
  last = t;
  ctx.clearRect(0, 0, width, height);
  if (game) {
    if (playing && !document.hidden && !$("dialog[open]")) {
      game.step(dt, keys);
      if (keys.jump) keys.jump = false;
      for (const ev of game.events) {
        if (ev.type === "destroy") {
          const el = $(`[data-block="${ev.id}"]`);
          el?.classList.add("destroyed");
          drawBackground();
          breakSound();
          $("#status").textContent = "bloque destruido. +100 pts";
        }
        if (ev.type === "enemy") {
          tone(430, 0.08);
          $("#status").textContent = "constructor aturdido. +50 pts";
        }
        if (ev.type === "hurt") {
          tone(90, 0.15, "sawtooth");
          announce("¡Cuidado con los constructores! Usa E para defenderte.");
        }
        if (ev.type === "climb")
          tone(ev.step % 2 ? 220 : 280, 0.045, "triangle");
        if (ev.type === "jump") tone(300, 0.05, "sine");
        if (ev.type === "swing") tone(120, 0.03);
        if (ev.type === "over") gameOver(ev.reason);
      }
      game.events = [];
      updateHUD();
    }
    const p = game.player;
    updateLadderButtons();
    updateMobileCamera();
    if (playing) {
      for (const e of game.enemies)
        worker(ctx, e.x, e.y, {
          dir: e.dir,
          walk: t / 100,
          enemy: true,
          stun: e.stun,
        });
      if (p.hit === 0 || Math.floor(t / 90) % 2 === 0)
        worker(ctx, p.x, p.y, {
          dir: p.dir,
          walk: p.walkPhase,
          player: true,
          swing: p.swing,
          climb: p.climb,
          climbPhase: p.climbPhase,
          airborne: !p.ground && !p.climb,
          walking: p.ground && Math.abs(p.vx) > 1,
        });
    } else {
      const moving = !reduced || t < buildingUntil;
      for (let i = 0; i < 4; i++) {
        const travel = moving ? Math.sin(t / 4000 + i * 2) * width * 0.05 : 0;
        const x = width * (0.07 + i * 0.26) + travel;
        worker(ctx, x, game.floor - 40, {
          dir: i % 2 ? -1 : 1,
          walk: moving ? t / 150 + i : 0,
          carry: i === 0 || i === 3,
        });
      }
      if (contactDelivery.state.status === "pending") {
        const deliveryBlock = game.blocks.find(
          (b) => b.id === "delivery" && !b.dead,
        );
        if (deliveryBlock) {
          const path = Math.max(50, deliveryBlock.w - 95);
          for (let i = 0; i < 3; i++) {
            const x =
              deliveryBlock.x +
              20 +
              ((reduced ? (path * (i + 1)) / 4 : t / 34 + (i * path) / 3) %
                path);
            const y = deliveryBlock.y + deliveryBlock.h - 155;
            worker(ctx, x, y, {
              dir: 1,
              walk: reduced ? 0 : t / 140 + i,
              carry: true,
            });
            envelope(ctx, x + 24, y + 7);
          }
        }
      }
      const top = game.blocks.find(
        (b) => b.id === "identity" || b.id === "career" || b.id === "contact",
      );
      if (top)
        worker(ctx, top.x + top.w - 18, top.y - 42, {
          dir: -1,
          walk: 0,
          carry: true,
        });
    }
    for (const a of game.particles)
      rect(ctx, a.x, a.y, a.size, a.size, a.color);
  }
  raf = requestAnimationFrame(frame);
}
$$(".nav").forEach((b) =>
  b.addEventListener("click", () => {
    tone(350, 0.05);
    render(b.dataset.section);
  }),
);
$("#play").addEventListener("click", start);
$("#start-inline").addEventListener("click", start);
$("#rebuild").addEventListener("click", rebuild);
$("#restart-now").addEventListener("click", rebuild);
$("#help").addEventListener("click", () => {
  $("#help-dialog").showModal();
  keys = {};
});
$("#help-play").addEventListener("click", () => {
  $("#help-dialog").close();
  if (!playing) start();
});
$$(".close-dialog").forEach((b) =>
  b.addEventListener("click", () => b.closest("dialog").close()),
);
$$("dialog").forEach((d) =>
  d.addEventListener("click", (e) => {
    if (e.target === d) {
      const r = d.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        d.close();
    }
  }),
);
$("#sound").addEventListener("click", () => {
  sound = !sound;
  if (!sound) {
    stopMusic();
    if (audio) audio.suspend();
  } else {
    tone(500, 0.1);
    startMusic();
  }
  $("#sound").setAttribute("aria-pressed", sound);
  $("#sound").title = sound ? "Silenciar sonido" : "Activar sonido";
  $("#sound").setAttribute(
    "aria-label",
    sound ? "Desactivar sonido" : "Activar sonido",
  );
  $("#sound").innerHTML = sound
    ? '<svg viewBox="0 0 24 24"><path d="M11 4 5 9H2v6h3l6 5ZM15 8q5 4 0 8m3-11q8 7 0 14"/></svg>'
    : '<svg viewBox="0 0 24 24"><path d="M11 4 5 9H2v6h3l6 5ZM16 9l5 6m0-6-5 6"/></svg>';
});
function pauseGame() {
  if (!playing || game?.state !== "playing" || externalPause.open) return;
  keys = {};
  clearTouchInput();
  $("#play").setAttribute("aria-label", "Reanudar juego");
  $("#play").innerHTML =
    '<svg viewBox="0 0 24 24"><path d="m8 5 11 7-11 7Z" fill="currentColor" stroke="none"/></svg>';
  externalPause.showModal();
}
const externalPause = document.createElement("dialog");
externalPause.id = "external-pause";
externalPause.setAttribute("aria-labelledby", "external-pause-title");
externalPause.innerHTML = `<h2 id="external-pause-title">Juego en pausa</h2><p>Tu partida sigue aquí.</p><button class="primary" id="resume-external" type="button">SEGUIR JUGANDO ▶</button>`;
$(".terminal").append(externalPause);
// Todos los paneles suspenden la partida mediante la misma condición del bucle.
for (const dialog of $$("dialog")) {
  $(".terminal").append(dialog);
  new MutationObserver(() => {
    keys = {};
    clearTouchInput();
    if (!dialog.open && playing && !$("dialog[open]"))
      stage.focus({ preventScroll: true });
  }).observe(dialog, { attributes: true, attributeFilter: ["open"] });
}

$("#resume-external").addEventListener("click", () => externalPause.close());
externalPause.addEventListener("close", () => {
  if (playing) {
    $("#play").setAttribute("aria-label", "Pausar juego");
    $("#play").innerHTML =
      '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" fill="currentColor" stroke="none"/></svg>';
  }
  keys = {};
  clearTouchInput();
  stage.focus({ preventScroll: true });
});
content.addEventListener("click", async (e) => {
  const area = e.target.closest("[data-area]");
  if (area) {
    e.preventDefault();
    keys = {};
    clearTouchInput();
    openArea(area.dataset.area);
    return;
  }
  if (playing) {
    const link = e.target.closest("a[href]");
    if (
      link &&
      /^https?:$/.test(new URL(link.href).protocol) &&
      new URL(link.href).origin !== location.origin
    ) {
      pauseGame();
      return;
    }
    if (e.target.closest(".block")) {
      e.preventDefault();
      game.attack();
    }
    return;
  }
  const go = e.target.closest("[data-go]");
  if (go) {
    e.preventDefault();
    render(go.dataset.go);
  }
  if (e.target.closest("#copy-link")) {
    try {
      await navigator.clipboard.writeText(LI);
      announce("Enlace de LinkedIn copiado.");
    } catch {
      announce(LI);
    }
  }
});
const keymap = {
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
  ArrowUp: "up",
  KeyW: "up",
  ArrowDown: "down",
  KeyS: "down",
  Space: "jump",
  KeyE: "attack",
};
window.addEventListener("keydown", (e) => {
  if (
    $("dialog[open]") ||
    e.target.closest("input,textarea,select,[contenteditable=true]")
  )
    return;
  if (e.code === "Escape" && playing) {
    stop();
    return;
  }
  if (!playing || !keymap[e.code]) return;
  if (e.target.closest("button,a") && e.code === "Space") return;
  e.preventDefault();
  if (e.repeat && e.code === "Space") return;
  keys[keymap[e.code]] = true;
});
window.addEventListener("keyup", (e) => {
  if (keymap[e.code]) keys[keymap[e.code]] = false;
});
const touchInput = new TouchInput((action, down) => {
  keys[action] = down;
});
function clearTouchInput() {
  touchInput.clear();
  $$("[data-key]").forEach((b) => b.classList.remove("pressed"));
}
window.addEventListener("blur", () => {
  clearTouchInput();
  keys = {};
});
document.addEventListener("visibilitychange", () => {
  clearTouchInput();
  keys = {};
});
$$("[data-key]").forEach((b) => {
  b.addEventListener("pointerdown", (e) => {
    if (!playing || game?.state !== "playing") return;
    e.preventDefault();
    b.setPointerCapture(e.pointerId);
    touchInput.press(e.pointerId, keymap[b.dataset.key]);
    b.classList.add("pressed");
  });
  for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
    b.addEventListener(event, (e) => {
      touchInput.release(e.pointerId);
      if (![...touchInput.pointers.values()].includes(keymap[b.dataset.key]))
        b.classList.remove("pressed");
    });
  b.addEventListener("contextmenu", (e) => e.preventDefault());
});
let savedScroll = 0,
  rotateDismissed = false;
async function requestLandscapeGame() {
  try {
    if (!document.fullscreenElement && document.fullscreenEnabled)
      await $(".terminal").requestFullscreen();
    if (!playing || !document.body.classList.contains("touch-game")) {
      if (document.fullscreenElement) await document.exitFullscreen();
      return;
    }
    if (screen.orientation?.lock) {
      await screen.orientation.lock("landscape");
      if (!playing) screen.orientation.unlock();
    }
  } catch {
    // Si el navegador no permite bloquear el giro, conserva el juego y la sugerencia.
  }
  fitMobileGame();
}
function enterMobileGame() {
  if (!matchMedia("(pointer: coarse), (max-width: 720px)").matches) return;
  savedScroll = window.scrollY;
  rotateDismissed = false;
  document.body.classList.add("touch-game");
  $("#mobile-fullscreen").hidden = !document.fullscreenEnabled;
  stage.style.width = "1100px";
  stage.style.height = "650px";
  stage.style.minHeight = "650px";
  void requestLandscapeGame();
}
let mobileViewport = { width: 0, height: 0 };
function fitMobileGame() {
  if (!document.body.classList.contains("touch-game")) return;
  const viewport = $(".game-viewport");
  mobileViewport = {
    width: viewport.clientWidth,
    height: viewport.clientHeight,
  };
  updateMobileCamera();
  $(".rotate-hint").hidden =
    rotateDismissed || !matchMedia("(orientation: portrait)").matches;
}
function updateMobileCamera() {
  if (!document.body.classList.contains("touch-game")) return;
  const player =
    game?.state === "over"
      ? { x: 550, y: 325, w: 0, h: 0 }
      : game?.player || { x: 88, y: 540, w: 23, h: 40 };
  const camera = cameraForPlayer(
    mobileViewport.width,
    mobileViewport.height,
    player,
  );
  stage.style.transform = `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`;
}
function exitMobileGame() {
  if (!document.body.classList.contains("touch-game")) return;
  document.body.classList.remove("touch-game");
  try {
    screen.orientation?.unlock?.();
  } catch {}
  for (const property of ["width", "height", "min-height", "transform"])
    stage.style.removeProperty(property);
  $(".rotate-hint").hidden = true;
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  window.scrollTo(0, savedScroll);
}
function updateLadderButtons() {
  const group = $(".touch-ladder");
  const show =
    playing &&
    game?.state === "playing" &&
    (game.player.climb || nearLadder(game.player, game.ladders));
  if (group.hidden === !show) return;
  group.hidden = !show;
  if (!show) {
    for (const [id, action] of touchInput.pointers) {
      if (action === "up" || action === "down") touchInput.release(id);
    }
    group
      .querySelectorAll("button")
      .forEach((b) => b.classList.remove("pressed"));
  }
}
$("#mobile-exit").addEventListener("click", stop);
$("#mobile-fullscreen").addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await requestLandscapeGame();
  } catch {
    announce("Puedes seguir jugando sin pantalla completa.");
  }
});
$("#dismiss-rotate").addEventListener("click", () => {
  rotateDismissed = true;
  $(".rotate-hint").hidden = true;
});
document.addEventListener("fullscreenchange", () => {
  fitMobileGame();
  resize();
});
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    keys = {};
    resize();
  }, 150);
});
render(
  new URLSearchParams(location.search).get("contacto") === "enviado"
    ? "contacto"
    : "perfil",
);
if (new URLSearchParams(location.search).get("contacto") === "enviado")
  announce("FormSubmit procesó tu solicitud. Gracias por escribir.");
raf = requestAnimationFrame(frame);

$("#over-contact").addEventListener("click", (e) => {
  e.preventDefault();
  clearTimeout(overTimer);
  if (playing) stop();
  render("contacto");
  setTimeout(() => $("#visitor-email")?.focus({ preventScroll: true }), 1100);
});
function syncContactForm() {
  const form = $("#contact-form");
  if (!form) return;
  const state = contactDelivery.state;
  for (const field of form.elements) {
    if (field.type !== "hidden" && Object.hasOwn(state.values, field.name))
      field.value = state.values[field.name];
  }
  const result = form.querySelector(".contact-result");
  if (state.status === "sent") {
    form.reset();
    result.textContent = "Mensaje enviado. Gracias por escribir.";
    result.dataset.state = "success";
    result.hidden = false;
  }
  if (state.status === "error") {
    result.textContent =
      state.error instanceof ContactError
        ? state.error.message
        : "No se pudo confirmar el envío. Tus datos siguen aquí.";
    result.dataset.state = "error";
    result.hidden = false;
  }
}
let contactToastTimer;
function contactToast(message, state = "info", returnToContact = false) {
  const toast = $("#contact-toast");
  clearTimeout(contactToastTimer);
  $("#contact-toast-message").textContent = message;
  toast.dataset.state = state;
  toast.hidden = false;
  $("#contact-toast-return").hidden = !returnToContact;
  if (state !== "error")
    contactToastTimer = setTimeout(() => (toast.hidden = true), 9000);
}
$("#contact-toast-close").addEventListener("click", () => {
  $("#contact-toast").hidden = true;
  clearTimeout(contactToastTimer);
});
$("#contact-toast-return").addEventListener("click", () => {
  if (playing) stop();
  render("contacto");
  $("#contact-toast").hidden = true;
});
contactDelivery.onChange = (event, state) => {
  if (event === "pending" && section === "contacto" && !playing)
    render("contacto");
  if (event === "slow") {
    if (section === "contacto" && !playing) render("perfil");
    contactToast(
      "Está tardando un poco. Puedes seguir explorando o jugar mientras tanto.",
    );
  }
  if (event === "sent" || event === "error") {
    if (section === "contacto" && !playing) render("contacto");
    else if (section === "contacto") {
      const heading = $(".contact-pending h3");
      const text = $(".contact-pending p");
      if (heading)
        heading.textContent =
          event === "sent"
            ? "Mensaje enviado."
            : "No se pudo confirmar el envío.";
      if (text)
        text.textContent =
          event === "sent"
            ? "Gracias por escribir. Puedes seguir jugando."
            : "Al salir del juego podrás volver a intentarlo.";
    }
    contactToast(
      event === "sent"
        ? state.slow
          ? "Tardó un poco, pero tu mensaje ya se envió."
          : "Mensaje enviado. Gracias por escribir."
        : "No pudimos confirmar el envío. Guardamos lo que escribiste.",
      event === "sent" ? "success" : "error",
      event === "error",
    );
  }
};
content.addEventListener("submit", (e) => {
  const form = e.target;
  if (form.id !== "contact-form") return;
  e.preventDefault();
  if (
    playing ||
    contactDelivery.state.status === "pending" ||
    !form.reportValidity()
  )
    return;
  const action = form.action,
    values = Object.fromEntries(new FormData(form));
  const button = form.querySelector('[type="submit"]');
  button.disabled = true;
  button.textContent = "ENVIANDO…";
  contactDelivery.send(action, values).catch(() => {});
});

$("#area-contact").addEventListener("click", () => {
  $("#area-dialog").close();
  render("contacto");
  const reason = $("#visitor-reason");
  if (reason) reason.value = areas[selectedArea].reason;
  setTimeout(() => $("#visitor-email")?.focus({ preventScroll: true }), 900);
});

// Intenta reproducir al abrir; desbloquea el audio con el primer gesto si el navegador lo exige.
$("#sound").click();
function unlockAudio(event) {
  if (!sound || event.target.closest?.("#sound")) return;
  if (audio?.state === "suspended") audio.resume().catch(() => {});
}
document.addEventListener("pointerdown", unlockAudio, { capture: true });
document.addEventListener("keydown", unlockAudio, { capture: true });
