/* =====================================================================
   CONFIGURAÇÃO
===================================================================== */
const CONFIG = {
  partnerName: "meu amor", // troque pelo nome dela para o brilho aparecer no nome também
  startDate: new Date(2026, 5, 20, 0, 0, 0), // 20/06/2026
  fireflyCount: 10,
  petalCount: 14,
};

const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const rand = (min, max) => Math.random() * (max - min) + min;

/* =====================================================================
   NAVEGAÇÃO ENTRE CAPÍTULOS
===================================================================== */
function goToScreen(targetId) {
  const current = $(".screen.active");
  const target = document.getElementById(targetId);
  if (!target || current === target) return;

  playChime();
  if (current) { current.classList.add("leaving"); current.classList.remove("active"); }

  setTimeout(() => {
    if (current) current.classList.remove("leaving");
    target.classList.add("active");
    onScreenEnter(targetId);
    target.scrollTop = 0;
  }, 120);

  burstAmbientHearts(8);
}

function onScreenEnter(id) {
  if (id === "screen-ch2") animateTimeline();
  if (id === "screen-ch3") startCounter();
  if (id === "screen-ch4") buildFirefliesHeart();
  if (id === "screen-ch5") buildMergeFlowers();
  if (id === "screen-letter") revealLetter();
}

$$(".next-chapter").forEach((btn) => {
  btn.addEventListener("click", () => goToScreen(btn.dataset.next));
});

/* =====================================================================
   ABERTURA — envelope com selo de cera
===================================================================== */
const envelope = $("#btn-open-heart");
const hint = $("#envelope-hint");

setTimeout(() => {
  envelope.classList.remove("hidden");
  hint.classList.remove("hidden");
}, 2600);

envelope.addEventListener("click", () => {
  startMusic();
  envelope.classList.add("opened");
  burstAmbientHearts(20);
  setTimeout(() => goToScreen("screen-ch1"), 650);
}, { once: true });

/* =====================================================================
   ÁUDIO
===================================================================== */
function startMusic() {
  const music = $("#bg-music");
  music.volume = 0.35;
  music.play().catch(() => {});
}
function playChime() {
  const chime = $("#chime-sound");
  chime.volume = 0.25;
  chime.currentTime = 0;
  chime.play().catch(() => {});
}

/* =====================================================================
   CAPÍTULO 2 — TRILHA
===================================================================== */
function animateTimeline() {
  const items = $$(".timeline-item", $("#screen-ch2"));
  items.forEach((item) => item.classList.remove("lit"));
  items.forEach((item) => {
    const delay = Number(item.dataset.delay) * 450 + 300;
    setTimeout(() => item.classList.add("lit"), delay);
  });
}

/* =====================================================================
   CAPÍTULO 3 — CONTADOR
===================================================================== */
let counterTimer = null;
function startCounter() {
  clearInterval(counterTimer);
  updateCounter();
  counterTimer = setInterval(updateCounter, 1000);
}
function updateCounter() {
  const now = new Date();
  let diff = Math.max(0, now - CONFIG.startDate) / 1000;
  const days = Math.floor(diff / 86400); diff -= days * 86400;
  const hours = Math.floor(diff / 3600); diff -= hours * 3600;
  const mins = Math.floor(diff / 60); diff -= mins * 60;
  const secs = Math.floor(diff);
  $("#c-days").textContent = days;
  $("#c-hours").textContent = String(hours).padStart(2, "0");
  $("#c-mins").textContent = String(mins).padStart(2, "0");
  $("#c-secs").textContent = String(secs).padStart(2, "0");
}

/* =====================================================================
   CAPÍTULO 4 — VAGA-LUMES FORMANDO UM CORAÇÃO
   Mesma equação paramétrica do coração, mas com o clima de vaga-lumes
   ao entardecer (dourado/verde) em vez de estrelas.
===================================================================== */
let firefliesBuilt = false;
function buildFirefliesHeart() {
  if (firefliesBuilt) return;
  firefliesBuilt = true;

  const svg = $("#fireflies-heart");
  const cx = 150, cy = 130, scale = 8;
  const points = [];

  const steps = 42;
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    points.push({ x: cx + x * scale, y: cy - y * scale });
  }
  for (let i = 0; i < 14; i++) {
    const t = rand(0, Math.PI * 2);
    const r = rand(0.15, 0.6);
    const x = 16 * Math.pow(Math.sin(t), 3) * r;
    const y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * r;
    points.push({ x: cx + x * scale, y: cy - y * scale });
  }

  points.sort(() => Math.random() - 0.5);

  points.forEach((p, i) => {
    const size = rand(1.8, 3.6);
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("cx", p.x.toFixed(2));
    dot.setAttribute("cy", p.y.toFixed(2));
    dot.setAttribute("r", size.toFixed(2));
    dot.classList.add("heart-firefly");
    dot.style.setProperty("--pop-delay", `${(i * 48) / 1000}s`);
    svg.appendChild(dot);
  });
}

/* =====================================================================
   CAPÍTULO 5 — FLORES SE UNEM EM UM GRANDE CORAÇÃO
===================================================================== */
let mergeBuilt = false;
function buildMergeFlowers() {
  if (mergeBuilt) return;
  mergeBuilt = true;

  const wrap = $("#merge-wrap");
  const result = $("#merge-result");
  const blooms = ["🌸", "🌷", "🌺", "❤️"];
  const total = 14;

  for (let i = 0; i < total; i++) {
    const piece = document.createElement("span");
    piece.className = "merge-piece";
    piece.textContent = blooms[i % blooms.length];
    const angle = (i / total) * Math.PI * 2;
    const radius = rand(110, 150);
    piece.style.setProperty("--start-x", `${Math.cos(angle) * radius}px`);
    piece.style.setProperty("--start-y", `${Math.sin(angle) * radius}px`);
    piece.style.setProperty("--m-delay", `${i * 70}ms`);
    wrap.insertBefore(piece, result);
  }

  setTimeout(() => result.classList.add("show"), total * 70 + 700);
}

/* =====================================================================
   CARTA
===================================================================== */
let letterRevealed = false;
function revealLetter() {
  if (letterRevealed) return;
  letterRevealed = true;

  const paragraphs = $$("#letter-paper p");
  paragraphs.forEach((p) => highlightWords(p));
  paragraphs.forEach((p, i) => {
    setTimeout(() => p.classList.add("show"), i * 650 + 300);
  });

  const totalTime = paragraphs.length * 650 + 1200;
  setTimeout(() => $("#btn-after-letter").classList.remove("hidden"), totalTime);
}

function highlightWords(p) {
  const targets = ["te amo", "amor", CONFIG.partnerName].filter(Boolean);
  let html = p.innerHTML;
  targets.forEach((word) => {
    if (!word) return;
    const safe = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(${safe})`, "gi");
    html = html.replace(re, '<span class="word-glow">$1</span>');
  });
  p.innerHTML = html;
}

/* =====================================================================
   PERGUNTA FINAL
===================================================================== */
setTimeout(() => {
  const btn = $("#btn-show-question");
  if (btn) btn.classList.remove("hidden");
}, 2200);

$("#btn-show-question")?.addEventListener("click", () => {
  $("#btn-show-question").classList.add("hidden");
  $("#question-box").classList.remove("hidden");
});

$$(".btn-answer").forEach((btn) => {
  btn.addEventListener("click", () => {
    const isPlayful = btn.dataset.answer === "2";
    const responseEl = $("#answer-response");

    if (isPlayful) {
      $("#question-box").classList.add("shake");
      setTimeout(() => $("#question-box").classList.remove("shake"), 500);
      setTimeout(() => {
        responseEl.textContent = "Resposta correta 😌❤️";
        finishAnswer(responseEl);
      }, 500);
    } else {
      responseEl.textContent = "Você é a melhor escolha da minha vida.";
      finishAnswer(responseEl);
    }
  });
});

function finishAnswer(responseEl) {
  $("#question-box").classList.add("hidden");
  responseEl.classList.remove("hidden");
  celebrate();
  setTimeout(() => goToScreen("screen-final"), 3200);
}

/* =====================================================================
   CELEBRAÇÃO
===================================================================== */
function celebrate() {
  const layer = $("#celebration-layer");
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  for (let i = 0; i < 24; i++) {
    const h = document.createElement("div");
    h.className = "burst-heart";
    h.textContent = ["❤️", "🌸", "🌷", "💛"][Math.floor(rand(0, 4))];
    h.style.left = cx + "px";
    h.style.top = cy + "px";
    const angle = rand(0, Math.PI * 2);
    const dist = rand(120, 330);
    h.style.setProperty("--bx", `${Math.cos(angle) * dist}px`);
    h.style.setProperty("--by", `${Math.sin(angle) * dist}px`);
    h.style.animationDelay = `${rand(0, 200)}ms`;
    layer.appendChild(h);
    setTimeout(() => h.remove(), 1700);
  }

  const colors = ["#c06a4d", "#b8934a", "#5c6b47", "#fffaf1"];
  for (let i = 0; i < 32; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.left = rand(0, 100) + "vw";
    c.style.background = colors[Math.floor(rand(0, colors.length))];
    c.style.animationDuration = rand(2.4, 4) + "s";
    c.style.animationDelay = rand(0, 500) + "ms";
    layer.appendChild(c);
    setTimeout(() => c.remove(), 4600);
  }

  [0.25, 0.5, 0.75].forEach((xf, idx) => {
    setTimeout(() => sparkBurst(window.innerWidth * xf, window.innerHeight * rand(0.25, 0.45)), idx * 260);
  });
}

function sparkBurst(x, y) {
  const layer = $("#celebration-layer");
  for (let i = 0; i < 16; i++) {
    const s = document.createElement("div");
    s.className = "spark";
    s.style.left = x + "px";
    s.style.top = y + "px";
    const angle = rand(0, Math.PI * 2);
    const dist = rand(40, 100);
    s.style.setProperty("--sx", `${Math.cos(angle) * dist}px`);
    s.style.setProperty("--sy", `${Math.sin(angle) * dist}px`);
    layer.appendChild(s);
    setTimeout(() => s.remove(), 1000);
  }
}

function burstAmbientHearts(count) {
  const layer = $("#celebration-layer");
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight * 0.4;
  for (let i = 0; i < count; i++) {
    const h = document.createElement("div");
    h.className = "burst-heart";
    h.textContent = "🌸";
    h.style.fontSize = rand(9, 16) + "px";
    h.style.left = cx + rand(-60, 60) + "px";
    h.style.top = cy + rand(-30, 30) + "px";
    const angle = rand(0, Math.PI * 2);
    const dist = rand(60, 150);
    h.style.setProperty("--bx", `${Math.cos(angle) * dist}px`);
    h.style.setProperty("--by", `${Math.sin(angle) * dist}px`);
    layer.appendChild(h);
    setTimeout(() => h.remove(), 1500);
  }
}

/* =====================================================================
   FUNDO — vaga-lumes e pétalas contínuas
===================================================================== */
function spawnPetal() {
  const el = document.createElement("span");
  el.className = "petal";
  el.style.left = rand(0, 100) + "vw";
  el.style.setProperty("--drift", rand(-80, 80) + "px");
  el.style.animationDuration = rand(9, 16) + "s";
  const size = rand(6, 11);
  el.style.width = size + "px";
  el.style.height = size + "px";
  $("#petals").appendChild(el);
  setTimeout(() => el.remove(), 17000);
}

function spawnFirefly() {
  const el = document.createElement("span");
  el.className = "firefly";
  el.style.left = rand(0, 100) + "vw";
  el.style.top = rand(10, 90) + "vh";
  el.style.animationDelay = rand(0, 3) + "s, " + rand(0, 3) + "s";
  $("#fireflies").appendChild(el);
  setTimeout(() => el.remove(), 12000);
}

setInterval(spawnPetal, 1200);
setInterval(spawnFirefly, 1600);
for (let i = 0; i < 6; i++) setTimeout(spawnPetal, i * 260);
for (let i = 0; i < CONFIG.fireflyCount; i++) setTimeout(spawnFirefly, i * 280);

/* =====================================================================
   RASTRO DE CORAÇÕES NO CURSOR
===================================================================== */
(function cursorTrail() {
  let lastSpawn = 0;
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  if (isTouch) return;

  document.addEventListener("mousemove", (e) => {
    const now = Date.now();
    if (now - lastSpawn < 60) return;
    lastSpawn = now;

    const heart = document.createElement("span");
    heart.className = "trail-heart";
    heart.textContent = "❤";
    heart.style.left = e.clientX + "px";
    heart.style.top = e.clientY + "px";
    $("#cursor-trail").appendChild(heart);
    setTimeout(() => heart.remove(), 900);
  });
})();
