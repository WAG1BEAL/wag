const loginCard = document.getElementById("loginCard");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginStatus = document.getElementById("loginStatus");
const dashStatus = document.getElementById("dashStatus");
const requestsList = document.getElementById("requestsList");
const countLine = document.getElementById("countLine");
const refreshButton = document.getElementById("refreshButton");
const logoutButton = document.getElementById("logoutButton");

const CONFIG_READY =
  window.WAG1_SUPABASE_URL &&
  window.WAG1_SUPABASE_PUBLISHABLE_KEY &&
  !window.WAG1_SUPABASE_URL.includes("YOUR_PROJECT_ID") &&
  !window.WAG1_SUPABASE_PUBLISHABLE_KEY.includes("YOUR_PUBLISHABLE_KEY");

const supabaseClient = CONFIG_READY
  ? window.supabase.createClient(
      window.WAG1_SUPABASE_URL,
      window.WAG1_SUPABASE_PUBLISHABLE_KEY
    )
  : null;

function setLoginStatus(message, kind = "") {
  loginStatus.textContent = message;
  loginStatus.dataset.kind = kind;
}

function setDashStatus(message, kind = "") {
  dashStatus.textContent = message;
  dashStatus.dataset.kind = kind;
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[char]);
}

function showDashboard() {
  loginCard.hidden = true;
  dashboard.hidden = false;
  loadRequests();
}

function showLogin() {
  loginCard.hidden = false;
  dashboard.hidden = true;
  passwordInput.value = "";
}

async function loadSession() {
  if (!supabaseClient) {
    setLoginStatus("Önce supabase-config.js dosyasını yapılandır.", "error");
    return;
  }

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) showDashboard();
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (username !== "Wag1Beal" || password !== "Wagg11") {
    setLoginStatus("İsim veya şifre hatalı.", "error");
    return;
  }

  if (!supabaseClient) {
    setLoginStatus("Giriş kabul edildi; Supabase bağlantısı henüz yapılandırılmadı.", "error");
    return;
  }

  setLoginStatus("Giriş yapılıyor...", "loading");

  // The username/password gate is the requested UI credential. Supabase still
  // needs a real admin auth session before database rows can be read.
  const { data, error } = await supabaseClient.auth.getSession();
  if (error || !data.session) {
    setLoginStatus("Giriş bilgileri doğru. Şimdi Supabase yönetici hesabını yapılandırman gerekiyor.", "error");
    return;
  }

  setLoginStatus("");
  showDashboard();
});

async function loadRequests() {
  if (!supabaseClient) return;

  setDashStatus("İstekler yükleniyor...", "loading");
  requestsList.innerHTML = "";

  const { data, error } = await supabaseClient
    .from("requests")
    .select("id, class_name, message, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error(error);
    countLine.textContent = "İstekler alınamadı.";
    setDashStatus("Yetkin yok veya veritabanı ayarları eksik.", "error");
    return;
  }

  countLine.textContent = `${data.length} istek gösteriliyor`;
  setDashStatus("");

  if (!data.length) {
    requestsList.innerHTML = '<div class="empty">Henüz anonim istek yok.</div>';
    return;
  }

  requestsList.innerHTML = data.map((item) => {
    const time = new Date(item.created_at).toLocaleString("tr-TR", {
      dateStyle: "medium",
      timeStyle: "short"
    });

    return `
      <article class="request-item">
        <div class="request-top">
          <span class="class-pill">${escapeHtml(item.class_name)}</span>
          <time>${escapeHtml(time)}</time>
        </div>
        <p>${escapeHtml(item.message).replace(/\n/g, "<br>")}</p>
        <button class="delete" type="button" data-id="${escapeHtml(item.id)}">SİL</button>
      </article>
    `;
  }).join("");
}

requestsList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button || !supabaseClient) return;

  const confirmed = window.confirm("Bu anonim isteği silmek istiyor musun?");
  if (!confirmed) return;

  button.disabled = true;
  const { error } = await supabaseClient
    .from("requests")
    .delete()
    .eq("id", button.dataset.id);

  if (error) {
    console.error(error);
    button.disabled = false;
    setDashStatus("İstek silinemedi.", "error");
    return;
  }

  loadRequests();
});

refreshButton.addEventListener("click", loadRequests);

logoutButton.addEventListener("click", async () => {
  if (supabaseClient) await supabaseClient.auth.signOut();
  showLogin();
});

if (supabaseClient) {
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    if (session) showDashboard();
    else showLogin();
  });
}

loadSession();
