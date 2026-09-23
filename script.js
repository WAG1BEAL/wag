/*
  WAG1 İstek Formu

  E-posta adresini aşağıdaki satıra yaz.
  Örn: const DESTINATION_EMAIL = "wag1@gmail.com";

  Bu sürüm "mailto:" kullanır: ziyaretçinin cihazındaki
  varsayılan e-posta uygulamasını açar ve mesajı hazırlar.
  Gerçekten sunucu üzerinden otomatik gönderim için
  Formspree/EmailJS gibi bir servis veya kendi backend'in gerekir.
*/

const DESTINATION_EMAIL = "deranatac@gmail.com";

const form = document.getElementById("requestForm");
const status = document.getElementById("status");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const className = document.getElementById("className").value.trim();
  const request = document.getElementById("request").value.trim();

  if (!className || !request) {
    status.textContent = "Lütfen iki alanı da doldur.";
    return;
  }

  if (DESTINATION_EMAIL === "BURAYA_GMAIL_ADRESINI_YAZ") {
    status.textContent = "Önce script.js içindeki Gmail adresini yazmalısın.";
    return;
  }

  const subject = `WAG1 İstek — ${className}`;
  const body =
`Sınıf: ${className}

İstek:
${request}`;

  const mailto =
    `mailto:${DESTINATION_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  window.location.href = mailto;
  status.textContent = "E-posta uygulaması açılıyor...";
});


const aboutToggle = document.getElementById("aboutToggle");
const aboutPanel = document.getElementById("aboutPanel");

aboutToggle.addEventListener("click", () => {
  const open = aboutToggle.getAttribute("aria-expanded") === "true";
  const next = !open;

  aboutToggle.setAttribute("aria-expanded", String(next));
  aboutPanel.setAttribute("aria-hidden", String(!next));
  aboutPanel.classList.toggle("open", next);
});
