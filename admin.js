let data = getSiteData();
const $ = (q) => document.querySelector(q);

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[c]));
}

function getPhotoUrl(item) {
  return typeof item === "string" ? item : item?.url;
}

async function login() {
  data = await SiteStore.loadData();
  if ($("#adminPassword").value === data.adminPassword) {
    $("#loginBox").classList.add("hidden");
    $("#panelBox").classList.remove("hidden");
    loadForm();
  } else {
    alert("Password salah kang 😭");
  }
}

function loadForm() {
  $("#mainTitleInput").value = data.home.title || "";
  $("#mainMessageInput").value = data.home.message || "";
  $("#themeSelect").value = data.theme || "soft";
  $("#specialDateInput").value = data.specialDate || "";
  $("#endingTitleInput").value = data.ending.title || "";
  $("#endingMessageInput").value = data.ending.message || "";
  $("#petalsToggle").checked = !!data.effects.petals;
  $("#heartsToggle").checked = !!data.effects.hearts;
  $("#sparkleToggle").checked = !!data.effects.sparkle;
  renderLetterEditor();
  renderGalleryEditor();
  $("#saveStatus").textContent = SiteStore.isOnline ? "Mode online Supabase aktif ✅" : "Mode localStorage. Isi supabase-config.js biar online ✅";
}

function renderLetterEditor() {
  const wrap = $("#letterEditor");
  wrap.innerHTML = "";
  data.letters.forEach((letter, i) => {
    const box = document.createElement("div");
    box.className = "mini-editor";
    box.innerHTML = `
      <h3>Surat ${i + 1}</h3>
      <label>Judul</label>
      <input class="letter-title" data-i="${i}" value="${escapeHtml(letter.title)}" />
      <label>Isi surat</label>
      <textarea class="letter-body" data-i="${i}" rows="10">${escapeHtml(letter.body)}</textarea>
      <label>Lagu khusus surat ini</label>
      <input class="letter-music" data-i="${i}" type="file" accept="audio/*" />
      <p class="hint">${letter.music ? "Lagu surat sudah ada ✅ Upload file baru kalau mau ganti." : "Belum ada lagu khusus. Kalau kosong, pakai lagu menu utama."}</p>
      <button class="danger-btn small remove-letter" data-i="${i}">Hapus Surat</button>
    `;
    wrap.appendChild(box);
  });
  document.querySelectorAll(".remove-letter").forEach(btn => {
    btn.onclick = () => {
      if (confirm("Hapus surat ini?")) {
        data.letters.splice(Number(btn.dataset.i), 1);
        renderLetterEditor();
      }
    };
  });
}

function renderGalleryEditor() {
  const wrap = $("#galleryEditor");
  wrap.innerHTML = "";
  if (!data.gallery.length) wrap.innerHTML = `<p class="hint">Belum ada foto di Our Memories.</p>`;
  data.gallery.forEach((item, i) => {
    const url = getPhotoUrl(item);
    const title = typeof item === "object" ? (item.title || `Memory ${i + 1}`) : `Memory ${i + 1}`;
    const div = document.createElement("div");
    div.className = "gallery-admin-item";
    div.innerHTML = `<img src="${escapeHtml(url)}"><input class="photo-title" data-i="${i}" value="${escapeHtml(title)}" placeholder="Caption foto"><button class="danger-btn small" data-i="${i}">Hapus</button>`;
    wrap.appendChild(div);
  });
  wrap.querySelectorAll("button").forEach(btn => {
    btn.onclick = () => {
      data.gallery.splice(Number(btn.dataset.i), 1);
      renderGalleryEditor();
    };
  });
}

async function save() {
  const btn = $("#saveBtn");
  btn.disabled = true;
  $("#saveStatus").textContent = "Saving... tunggu bentar ya ngab ⏳";
  try {
    data.home.title = $("#mainTitleInput").value;
    data.home.message = $("#mainMessageInput").value;
    data.theme = $("#themeSelect").value;
    data.specialDate = $("#specialDateInput").value;
    data.ending.title = $("#endingTitleInput").value;
    data.ending.message = $("#endingMessageInput").value;
    data.effects.petals = $("#petalsToggle").checked;
    data.effects.hearts = $("#heartsToggle").checked;
    data.effects.sparkle = $("#sparkleToggle").checked;

    const homeMusic = $("#homeMusicInput").files[0];
    if (homeMusic) data.home.music = await SiteStore.uploadFile("music", homeMusic);

    document.querySelectorAll(".letter-title").forEach(el => data.letters[Number(el.dataset.i)].title = el.value);
    document.querySelectorAll(".letter-body").forEach(el => data.letters[Number(el.dataset.i)].body = el.value);
    document.querySelectorAll(".photo-title").forEach(el => {
      const i = Number(el.dataset.i);
      const current = data.gallery[i];
      data.gallery[i] = { title: el.value, url: getPhotoUrl(current) };
    });

    for (const input of document.querySelectorAll(".letter-music")) {
      const file = input.files[0];
      if (file) data.letters[Number(input.dataset.i)].music = await SiteStore.uploadFile("music", file);
    }

    for (const file of $("#galleryInput").files) {
      const url = await SiteStore.uploadFile("photos", file);
      data.gallery.push({ title: `Memory ${data.gallery.length + 1}`, url });
    }
    $("#galleryInput").value = "";

    const newPass = $("#newPasswordInput").value.trim();
    if (newPass) data.adminPassword = newPass;

    const result = await SiteStore.saveData(data);
    $("#saveStatus").textContent = result.online ? "Saved online! Semua device bakal ikut berubah ✅💗" : "Saved local! Supabase belum aktif, jadi cuma browser ini ✅";
    renderLetterEditor();
    renderGalleryEditor();
  } catch (err) {
    console.error(err);
    $("#saveStatus").textContent = "Gagal save: " + (err.message || err);
  } finally {
    btn.disabled = false;
  }
}

$("#loginBtn").onclick = login;
$("#adminPassword").addEventListener("keydown", e => { if (e.key === "Enter") login(); });
$("#addLetterBtn").onclick = () => {
  data.letters.push({ title: `💌 Surat ${data.letters.length + 1} 💗🌸`, body: "Tulis isi surat baru di sini 💗🌸", music: "" });
  renderLetterEditor();
};
$("#saveBtn").onclick = save;
$("#resetBtn").onclick = async () => {
  if (confirm("Reset semua ke default?")) {
    data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    await SiteStore.saveData(data);
    loadForm();
  }
};
