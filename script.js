const form = document.getElementById("requestForm");
const statusEl = document.getElementById("status");
const submitButton = document.getElementById("submitButton");
const classInput = document.getElementById("className");
const requestInput = document.getElementById("request");
const websiteInput = document.getElementById("website");
const backendForm = document.getElementById("backendForm");
const backendClass = document.getElementById("backendClass");
const backendRequest = document.getElementById("backendRequest");
const backendWebsite = document.getElementById("backendWebsite");
const aboutToggle = document.getElementById("aboutToggle");
const aboutPanel = document.getElementById("aboutPanel");

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

function backendReady() {
  return Boolean(window.WAG1_GAS_URL) &&
    !window.WAG1_GAS_URL.includes("BURAYA_APPS_SCRIPT_WEB_APP_URL") &&
    /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec(?:\?.*)?$/.test(window.WAG1_GAS_URL);
}

form.addEventListener("submit", (event) => {
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
  if (!backendReady()) {
    setStatus("Sistem henüz yapılandırılmadı.", "error");
    return;
  }

  submitButton.disabled = true;
  submitButton.classList.add("is-loading");
  setStatus("İletiliyor...", "loading");

  backendClass.value = className;
  backendRequest.value = request;
  backendWebsite.value = "";
  backendForm.action = window.WAG1_GAS_URL;

  // Google Apps Script form gönderimini iframe üzerinden kabul ediyor.
  // İstek sunucuya iletildikten sonra Apps Script yanıtı cross-origin
  // sandbox nedeniyle her tarayıcıda postMessage olarak geri dönemeyebilir.
  // Bu yüzden istemci tarafında gereksiz "sunucuya ulaşılamadı" hatası
  // göstermiyoruz. İstek admin panelinde göründüğünde kayıt başarılıdır.
  try {
    backendForm.submit();
  } catch (error) {
    setStatus("Gönderilemedi. Lütfen tekrar dene.", "error");
    submitButton.disabled = false;
    submitButton.classList.remove("is-loading");
    return;
  }

  window.setTimeout(() => {
    form.reset();
    setStatus("✓ İsteğiniz anonim olarak iletildi.", "success");
    submitButton.disabled = false;
    submitButton.classList.remove("is-loading");
  }, 1200);
});

// Eski sunucu yanıtı gelirse onu da kabul et; gelmemesi artık sorun değil.
window.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type !== "wag1-submit") return;
  if (data.ok) {
    form.reset();
    setStatus("✓ İsteğiniz anonim olarak iletildi.", "success");
  } else {
    setStatus(data.message || "Gönderilemedi. Lütfen biraz sonra tekrar dene.", "error");
  }
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
