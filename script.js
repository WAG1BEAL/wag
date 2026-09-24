const form = document.getElementById("requestForm");
const statusEl = document.getElementById("status");
const submitButton = document.getElementById("submitButton");
const classInput = document.getElementById("className");
const requestInput = document.getElementById("request");
const websiteInput = document.getElementById("website");

const aboutToggle = document.getElementById("aboutToggle");
const aboutPanel = document.getElementById("aboutPanel");

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

function setStatus(message, kind = "") {
  statusEl.textContent = message;
  statusEl.dataset.kind = kind;
}

function normalizeText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function isLikelyValidClass(value) {
  return /^[\p{L}\p{N}\s./_-]{1,30}$/u.test(value);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (websiteInput.value.trim() !== "") {
    setStatus("Gönderim tamamlanamadı.", "error");
    return;
  }

  const className = normalizeText(classInput.value);
  const request = requestInput.value.trim();

  if (!className || !request) {
    setStatus("Lütfen iki alanı da doldur.", "error");
    return;
  }

  if (!isLikelyValidClass(className)) {
    setStatus("Sınıf bilgisini kontrol et.", "error");
    return;
  }

  if (request.length < 3) {
    setStatus("İsteğini biraz daha açık yaz.", "error");
    return;
  }

  if (!CONFIG_READY) {
    setStatus("Anonim sistem henüz yapılandırılmadı. supabase-config.js bilgilerini ekle.", "error");
    return;
  }

  submitButton.disabled = true;
  submitButton.classList.add("is-loading");
  setStatus("İletiliyor...", "loading");

  const { error } = await supabaseClient
    .from("requests")
    .insert({
      class_name: className,
      message: request
    });

  if (error) {
    console.error(error);
    setStatus("Gönderilemedi. Lütfen biraz sonra tekrar dene.", "error");
    submitButton.disabled = false;
    submitButton.classList.remove("is-loading");
    return;
  }

  form.reset();
  setStatus("✓ İsteğiniz anonim olarak iletildi.", "success");
  submitButton.disabled = false;
  submitButton.classList.remove("is-loading");
});

aboutToggle.addEventListener("click", () => {
  const open = aboutToggle.getAttribute("aria-expanded") === "true";
  const next = !open;

  aboutToggle.setAttribute("aria-expanded", String(next));
  aboutPanel.setAttribute("aria-hidden", String(!next));
  aboutPanel.classList.toggle("open", next);
});
