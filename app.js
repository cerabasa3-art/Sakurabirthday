let data = getSiteData();
let currentLetter = 0;
let userAllowedMusic = false;

const $ = (q) => document.querySelector(q);
const $$ = (q) => document.querySelectorAll(q);
const audio = $("#bgAudio");

function applyTheme() {
  document.body.dataset.theme = data.theme || "soft";
}

function nl2br(text) {
  return (text || "").split("\n").map(p => p.trim() ? `<p>${escapeHtml(p)}</p>` : "<br>").join("");
}

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[c]));
}

function getPhotoUrl(item) {
  return typeof item === "string" ? item : item?.url;
}

function showScreen(id) {
  $$(".screen").forEach(s => s.classList.remove("active"));
  $("#" + id).classList.add("active");
  if (["home", "gallery", "ending"].includes(id)) playMusic(data.home.music);
  burstHearts();
}

function playMusic(src) {
  if (!userAllowedMusic || !src) return;
  if (audio.src !== src) {
    audio.pause();
    audio.src = src;
    audio.currentTime = 0;
  }
  audio.volume = 0.55;
  audio.play().catch(() => {});
}

function unlockMusic() {
  userAllowedMusic = true;
  $("#tapHint").classList.add("hidden");
  playMusic(data.home.music);
}
document.addEventListener("click", unlockMusic, { once: true });
document.addEventListener("touchstart", unlockMusic, { once: true });

function renderHome() {
  $("#mainTitle").textContent = data.home.title;
  $("#mainMessage").innerHTML = nl2br(data.home.message);
  $("#endingTitle").textContent = data.ending.title;
  $("#endingMessage").innerHTML = nl2br(data.ending.message);
}

function renderLetters() {
  const grid = $("#letterGrid");
  grid.innerHTML = "";
  data.letters.forEach((letter, i) => {
    const card = document.createElement("button");
    card.className = "letter-card glass";
    card.innerHTML = `<div class="envelope">💌</div><h3>${escapeHtml(letter.title)}</h3><p>Tap to open 🌸</p>`;
    card.onclick = () => openLetter(i);
    grid.appendChild(card);
  });
  const galleryCard = document.createElement("button");
  galleryCard.className = "letter-card glass";
  galleryCard.innerHTML = `<div class="envelope">📸</div><h3>Our Memories 💗</h3><p>Gallery time 🌸</p>`;
  galleryCard.onclick = () => showScreen("gallery");
  grid.appendChild(galleryCard);
}

function openLetter(i) {
  currentLetter = i;
  const letter = data.letters[i];
  $("#readerTitle").textContent = letter.title;
  $("#readerBody").innerHTML = nl2br(letter.body);
  showScreen("letterReader");
  playMusic(letter.music || data.home.music);
}

function renderGallery() {
  const grid = $("#galleryGrid");
  grid.innerHTML = "";
  if (!data.gallery.length) {
    grid.innerHTML = `<div class="empty glass">Belum ada foto. Tambahin lewat /admin.html yaa 📸💗</div>`;
    return;
  }
  data.gallery.forEach((item, i) => {
    const img = getPhotoUrl(item);
    if (!img) return;
    const title = typeof item === "object" && item.title ? item.title : `Memory ${i + 1} 🌸`;
    const card = document.createElement("div");
    card.className = "photo-card glass";
    card.innerHTML = `<img src="${escapeHtml(img)}" alt="memory ${i + 1}"><p>${escapeHtml(title)}</p>`;
    grid.appendChild(card);
  });
}

function renderCountdown() {
  const box = $("#countdownBox");
  if (!data.specialDate) {
    box.innerHTML = "Set tanggal ulang tahun / tanggal spesial di admin 💗";
    return;
  }

  const target = new Date(data.specialDate + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diff = target - today;
  const days = Math.round(diff / 86400000);

  if (days > 0) {
    box.innerHTML = `Menuju ulang tahun Sakura tinggal <b>${days}</b> hari lagi 🎂🌸💗`;
  } else if (days === 0) {
    box.innerHTML = `Hari ini ulang tahun Sakura 🎂🥳🌸💗`;
  } else {
    box.innerHTML = `Ulang tahun Sakura sudah lewat <b>${Math.abs(days)}</b> hari lalu, tapi sayangnya tetap setiap hari 💗🌸`;
  }
}

function bindButtons() {
  $("#openLettersBtn").onclick = () => showScreen("letters");
  $("#nextLetterBtn").onclick = () => {
    if (currentLetter < data.letters.length - 1) openLetter(currentLetter + 1);
    else showScreen("gallery");
  };
  $("#toggleMusicBtn").onclick = () => {
    if (audio.paused) playMusic(audio.src || data.home.music);
    else audio.pause();
  };
  $$("[data-goto]").forEach(btn => btn.onclick = () => showScreen(btn.dataset.goto));
}

async function init() {
  data = await SiteStore.loadData();
  applyTheme();
  renderHome();
  renderLetters();
  renderGallery();
  renderCountdown();
  setInterval(renderCountdown, 60000);
  bindButtons();
  setTimeout(() => {
    $("#loadingScreen").classList.remove("active");
    $("#app").classList.remove("hidden");
    showScreen("home");
  }, 1200);
}

init();

// Effects
const canvas = $("#fxCanvas");
const ctx = canvas.getContext("2d");
let W, H;
let particles = [];

function resize() {
  W = canvas.width = innerWidth;
  H = canvas.height = innerHeight;
}
addEventListener("resize", resize);
resize();

function addPetal() {
  if (!data.effects.petals) return;
  particles.push({
    type: "petal",
    x: Math.random() * W,
    y: -20,
    s: 8 + Math.random() * 15,
    vx: -0.5 + Math.random(),
    vy: 0.8 + Math.random() * 1.4,
    rot: Math.random() * 6,
    life: 1
  });
}

function addSparkle(x, y) {
  if (!data.effects.sparkle) return;
  particles.push({ type: "spark", x, y, s: 3 + Math.random()*5, vx: -1+Math.random()*2, vy: -1+Math.random()*2, life: 1 });
}

function burstHearts() {
  if (!data.effects.hearts) return;
  for (let i=0;i<18;i++) {
    particles.push({ type: "heart", x: W/2, y: H/2, s: 12+Math.random()*12, vx: -3+Math.random()*6, vy: -4+Math.random()*3, life: 1 });
  }
}

document.addEventListener("pointermove", e => {
  if (Math.random() < .35) addSparkle(e.clientX, e.clientY);
});
document.addEventListener("click", e => {
  if (!data.effects.hearts) return;
  for(let i=0;i<8;i++) particles.push({ type:"heart", x:e.clientX, y:e.clientY, s:10+Math.random()*10, vx:-2+Math.random()*4, vy:-3+Math.random()*2, life:1 });
});

setInterval(addPetal, 130);

function draw() {
  ctx.clearRect(0,0,W,H);
  particles = particles.filter(p => p.life > 0 && p.y < H + 80);
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.life -= p.type === "petal" ? .002 : .018;
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.translate(p.x, p.y);
    if (p.type === "petal") {
      p.rot += .02;
      ctx.rotate(p.rot);
      ctx.fillStyle = "#ffb7d5";
      ctx.beginPath();
      ctx.ellipse(0, 0, p.s * .45, p.s, 0, 0, Math.PI*2);
      ctx.fill();
    } else if (p.type === "heart") {
      ctx.font = `${p.s}px serif`;
      ctx.fillText("💗", 0, 0);
    } else {
      ctx.font = `${p.s*3}px serif`;
      ctx.fillText("✨", 0, 0);
    }
    ctx.restore();
  });
  requestAnimationFrame(draw);
}
draw();
