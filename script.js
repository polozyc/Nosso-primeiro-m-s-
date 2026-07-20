/* =====================================================================
   CONFIGURAÇÃO — edite aqui sem precisar mexer no resto do código.
===================================================================== */
const CONFIG = {
  // Nome dela, usado para o brilho especial em "amor / te amo / [nome]"
  // Troque "meu amor" pelo nome dela para o efeito de brilho aparecer no nome.
  partnerName: "meu amor",

  // Data e hora de início do namoro (usada no contador ao vivo)
  // formato: ano, mês (0 = janeiro!), dia, hora, minuto
  startDate: new Date(2026, 5, 20, 0, 0, 0), // 20/06/2026

  // Quantidade de elementos de fundo (reduza em aparelhos mais fracos)
  heartCount: 22,
  petalCount: 16,
  fireflyCount: 10,
};

/* =====================================================================
   UTILITÁRIOS
===================================================================== */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const rand = (min, max) => Math.random() * (max - min) + min;

/* =====================================================================
   NAVEGAÇÃO ENTRE TELAS (CAPÍTULOS)
   Cada troca dispara: som de transição + fade/zoom via CSS
   (classes .active / .leaving definidas em style.css).
===================================================================== */
function goToScreen(targetId) {
  const current = $(".screen.active");
  const target = document.getElementById(targetId);
  if (!target || current === target) return;

  playChime();

  if (current) {
    current.classList.add("leaving");
    current.classList.remove("active");
  }

  // pequeno atraso para a transição de saída começar antes da entrada
  setTimeout(() => {
    if (current) current.classList.remove("leaving");
    target.classList.add("active");
    onScreenEnter(targetId);
    // leva o usuário para o topo do novo capítulo
    target.scrollTop = 0;
  }, 120);

  // explosão suave de partículas a cada transição de capítulo
  burstAmbientHearts(10);
}

// Ações específicas de cada capítulo, disparadas quando ele entra em cena
function onScreenEnter(id) {
  if (id === "screen-ch2") animateTimeline();
  if (id === "screen-ch3") startCounter();
  if (id === "screen-ch4") buildStarsHeart();
  if (id === "screen-ch5") buildMergeHearts();
  if (id === "screen-letter") revealLetter();
}

// Liga todos os botões "Continuar" de capítulo em capítulo
$$(".next-chapter").forEach((btn) => {
  btn.addEventListener("click", () => goToScreen(btn.dataset.next));
});

/* =====================================================================
   ABERTURA — frase, depois botão, depois abre o coração
===================================================================== */
const introBtn = $("#btn-open-heart");

// o botão só aparece depois da frase terminar de se revelar
setTimeout(() => introBtn.classList.remove("hidden"), 2600);

introBtn.addEventListener("click", () => {
  startMusic();
  // efeito cinematográfico: leve zoom + explosão de corações e brilho
  burstAmbientHearts(24);
  goToScreen("screen-ch1");
}, { once: true });

/* =====================================================================
   ÁUDIO — a música só começa após interação do usuário (política dos
   navegadores) e falha silenciosamente se o arquivo não existir.
===================================================================== */
function startMusic() {
  const music = $("#bg-music");
  music.volume = 0.35;
  music.play().catch(() => { /* arquivo de música ainda não adicionado — tudo bem */ });
}
function playChime() {
  const chime = $("#chime-sound");
  chime.volume = 0.25;
  chime.currentTime = 0;
  chime.play().catch(() => { /* som opcional — segue sem ele */ });
}

/* =====================================================================
   CAPÍTULO 2 — LINHA DO TEMPO
   Os itens "acendem" um a um, como se a memória fosse se formando.
===================================================================== */
function animateTimeline() {
  const items = $$(".timeline-item", $("#screen-ch2"));
  items.forEach((item) => item.classList.remove("lit")); // permite reassistir
  items.forEach((item) => {
    const delay = Number(item.dataset.delay) * 450 + 300;
    setTimeout(() => item.classList.add("lit"), delay);
  });
}

/* =====================================================================
   CAPÍTULO 3 — CONTADOR "ESTAMOS JUNTOS HÁ..."
===================================================================== */
let counterTimer = null;
function startCounter() {
  clearInterval(counterTimer);
  updateCounter();
  counterTimer = setInterval(updateCounter, 1000);
}
function updateCounter() {
  const now = new Date();
  let diff = Math.max(0, now - CONFIG.startDate) / 1000; // segundos

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
   CAPÍTULO 4 — ESTRELAS FORMANDO UM CORAÇÃO
   Usa a equação paramétrica clássica do coração para posicionar
   estrelas ao longo do contorno (e algumas espalhadas por dentro).
===================================================================== */
let starsBuilt = false;
function buildStarsHeart() {
  if (starsBuilt) return; // constrói só uma vez, a animação de entrada é o suficiente
  starsBuilt = true;

  const svg = $("#stars-heart");
  const cx = 150, cy = 130, scale = 8;
  const points = [];

  // contorno do coração
  const steps = 46;
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    points.push({ x: cx + x * scale, y: cy - y * scale });
  }
  // algumas estrelas soltas por dentro, para dar profundidade de céu
  for (let i = 0; i < 16; i++) {
    const t = rand(0, Math.PI * 2);
    const r = rand(0.15, 0.65);
    const x = 16 * Math.pow(Math.sin(t), 3) * r;
    const y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * r;
    points.push({ x: cx + x * scale, y: cy - y * scale });
  }

  // embaralha para que o "acender" não siga só o contorno em ordem
  points.sort(() => Math.random() - 0.5);

  points.forEach((p, i) => {
    const size = rand(1.6, 3.4);
    const star = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    star.setAttribute("cx", p.x.toFixed(2));
    star.setAttribute("cy", p.y.toFixed(2));
    star.setAttribute("r", size.toFixed(2));
    star.classList.add("heart-star");
    star.style.setProperty("--pop-delay", `${(i * 45) / 1000}s`);
    svg.appendChild(star);
  });
}

/* =====================================================================
   CAPÍTULO 5 — PEQUENOS CORAÇÕES SE UNEM EM UM GRANDE CORAÇÃO
===================================================================== */
let mergeBuilt = false;
function buildMergeHearts() {
  if (mergeBuilt) return;
  mergeBuilt = true;

  const wrap = $("#merge-wrap");
  const result = $("#merge-result");
  const total = 14;

  for (let i = 0; i < total; i++) {
    const piece = document.createElement("span");
    piece.className = "merge-piece";
    piece.textContent = "❤️";
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
   CARTA — revela parágrafo a parágrafo, com destaque de brilho em
   "amor", "te amo" e no nome dela.
===================================================================== */
let letterRevealed = false;
function revealLetter() {
  if (letterRevealed) return;
  letterRevealed = true;

  const paragraphs = $$("#letter-paper p");

  // aplica o brilho nas palavras-chave antes de revelar
  paragraphs.forEach((p) => highlightWords(p));

  paragraphs.forEach((p, i) => {
    setTimeout(() => p.classList.add("show"), i * 650 + 300);
  });

  const totalTime = paragraphs.length * 650 + 1200;
  setTimeout(() => {
    $("#btn-after-letter").classList.remove("hidden");
  }, totalTime);
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

// esse listener é religado sempre que a tela é revisitada, então usamos
// delegação simples no clique do botão "Responder"
$("#btn-show-question")?.addEventListener("click", () => {
  $("#btn-show-question").classList.add("hidden");
  $("#question-box").classList.remove("hidden");
});

$$(".btn-answer").forEach((btn) => {
  btn.addEventListener("click", () => {
    const isPlayful = btn.dataset.answer === "2";
    const responseEl = $("#answer-response");

    if (isPlayful) {
      // pequeno tremor de brincadeira antes da resposta "certa"
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
   CELEBRAÇÃO — explosão de corações, confetes e fogos discretos
===================================================================== */
function celebrate() {
  const layer = $("#celebration-layer");
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  // explosão de corações
  for (let i = 0; i < 26; i++) {
    const h = document.createElement("div");
    h.className = "burst-heart";
    h.textContent = ["❤️", "💖", "💕", "💗"][Math.floor(rand(0, 4))];
    h.style.left = cx + "px";
    h.style.top = cy + "px";
    const angle = rand(0, Math.PI * 2);
    const dist = rand(120, 340);
    h.style.setProperty("--bx", `${Math.cos(angle) * dist}px`);
    h.style.setProperty("--by", `${Math.sin(angle) * dist}px`);
    h.style.animationDelay = `${rand(0, 200)}ms`;
    layer.appendChild(h);
    setTimeout(() => h.remove(), 1700);
  }

  // confetes caindo
  const colors = ["#c81e45", "#d9b46a", "#e6a3b8", "#fbf3ec"];
  for (let i = 0; i < 36; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.left = rand(0, 100) + "vw";
    c.style.background = colors[Math.floor(rand(0, colors.length))];
    c.style.animationDuration = rand(2.4, 4) + "s";
    c.style.animationDelay = rand(0, 500) + "ms";
    layer.appendChild(c);
    setTimeout(() => c.remove(), 4600);
  }

  // fogos discretos: pequenas fagulhas douradas em 3 pontos da tela
  [0.25, 0.5, 0.75].forEach((xf, idx) => {
    setTimeout(() => sparkBurst(window.innerWidth * xf, window.innerHeight * rand(0.25, 0.45)), idx * 260);
  });
}

function sparkBurst(x, y) {
  const layer = $("#celebration-layer");
  for (let i = 0; i < 18; i++) {
    const s = document.createElement("div");
    s.className = "spark";
    s.style.left = x + "px";
    s.style.top = y + "px";
    const angle = rand(0, Math.PI * 2);
    const dist = rand(40, 110);
    s.style.setProperty("--sx", `${Math.cos(angle) * dist}px`);
    s.style.setProperty("--sy", `${Math.sin(angle) * dist}px`);
    layer.appendChild(s);
    setTimeout(() => s.remove(), 1000);
  }
}

/* pequena explosão ambiente de corações usada nas trocas de capítulo */
function burstAmbientHearts(count) {
  const layer = $("#celebration-layer");
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight * 0.4;
  for (let i = 0; i < count; i++) {
    const h = document.createElement("div");
    h.className = "burst-heart";
    h.textContent = "❤️";
    h.style.fontSize = rand(10, 18) + "px";
    h.style.left = cx + rand(-60, 60) + "px";
    h.style.top = cy + rand(-30, 30) + "px";
    const angle = rand(0, Math.PI * 2);
    const dist = rand(60, 160);
    h.style.setProperty("--bx", `${Math.cos(angle) * dist}px`);
    h.style.setProperty("--by", `${Math.sin(angle) * dist}px`);
    layer.appendChild(h);
    setTimeout(() => h.remove(), 1500);
  }
}

/* =====================================================================
   FUNDO AMBIENTE — corações flutuando, pétalas de cerejeira e vagalumes
   gerados continuamente com posições/tempos aleatórios.
===================================================================== */
function spawnFloatingHeart() {
  const el = document.createElement("span");
  el.className = "floating-heart";
  el.textContent = ["❤️", "💕", "💗", "💖"][Math.floor(rand(0, 4))];
  el.style.left = rand(0, 100) + "vw";
  el.style.setProperty("--size", rand(12, 26) + "px");
  el.style.setProperty("--drift", rand(-60, 60) + "px");
  el.style.animationDuration = rand(9, 18) + "s";
  $("#floating-hearts").appendChild(el);
  setTimeout(() => el.remove(), 19000);
}

function spawnPetal() {
  const el = document.createElement("span");
  el.className = "petal";
  el.style.left = rand(0, 100) + "vw";
  el.style.setProperty("--drift", rand(-80, 80) + "px");
  el.style.animationDuration = rand(8, 15) + "s";
  const size = rand(6, 12);
  el.style.width = size + "px";
  el.style.height = size + "px";
  $("#petals").appendChild(el);
  setTimeout(() => el.remove(), 16000);
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

// popula o fundo continuamente em intervalos escalonados
setInterval(spawnFloatingHeart, 900);
setInterval(spawnPetal, 1100);
setInterval(spawnFirefly, 1800);
for (let i = 0; i < 8; i++) setTimeout(spawnFloatingHeart, i * 200);
for (let i = 0; i < 6; i++) setTimeout(spawnPetal, i * 250);
for (let i = 0; i < CONFIG.fireflyCount; i++) setTimeout(spawnFirefly, i * 300);

/* =====================================================================
   CANVAS DE ESTRELAS DE FUNDO — leve cintilar contínuo
===================================================================== */
(function starsBackground() {
  const canvas = $("#bg-canvas");
  const ctx = canvas.getContext("2d");
  let stars = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = Math.floor((canvas.width * canvas.height) / 9000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: rand(0.4, 1.6),
      speed: rand(0.01, 0.03),
      phase: rand(0, Math.PI * 2),
    }));
  }

  function draw(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // reaplica o degradê de fundo (o CSS já cobre o base, então aqui só as estrelas)
    stars.forEach((s) => {
      const twinkle = 0.5 + 0.5 * Math.sin(time * s.speed + s.phase);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(251,243,236,${0.15 + twinkle * 0.55})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(draw);
})();

/* =====================================================================
   RASTRO DE CORAÇÕES NO CURSOR
===================================================================== */
(function cursorTrail() {
  let lastSpawn = 0;
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  if (isTouch) return; // evita ruído visual em telas de toque

  document.addEventListener("mousemove", (e) => {
    const now = Date.now();
    if (now - lastSpawn < 60) return; // limita a frequência
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
