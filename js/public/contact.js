/**
 * contact.js — Project inquiry form → structured WhatsApp message.
 * No CRM / no DB storage in this version (per spec §7).
 */
import { SETTINGS } from "./data.js";
import { t } from "./i18n.js";

let bound = false; // guards against duplicate listeners on re-render
let currentOptions = [];

export function initContact(serviceOptions) {
  const form = document.getElementById("inquiryForm");
  const err = document.getElementById("formError");
  const select = document.getElementById("fService");
  if (!form || !select) return;

  currentOptions = serviceOptions;
  const previous = select.value;
  select.innerHTML = `<option value="">${t("form.servicePh")}</option>` +
    serviceOptions.map((s) => `<option value="${s}">${s}</option>`).join("");
  if (previous && serviceOptions.includes(previous)) select.value = previous;

  if (bound) return;
  bound = true;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const service = String(fd.get("service") || "").trim();
    const details = String(fd.get("details") || "").trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!name || !emailOk || !service || !details) {
      err.textContent = t("form.err");
      err.hidden = false;
      return;
    }
    err.hidden = true;

    const lines = [
      `New project inquiry — KHALED MOHAMED portfolio`,
      ``,
      `Name: ${name}`,
      `Email: ${email}`,
      fd.get("whatsapp") ? `WhatsApp: ${fd.get("whatsapp")}` : null,
      `Service: ${service}`,
      ``,
      `Project details:`,
      details,
      fd.get("budget") ? `\nBudget: ${fd.get("budget")}` : null,
      fd.get("deadline") ? `Deadline: ${fd.get("deadline")}` : null,
    ].filter(Boolean).join("\n");

    const phone = (SETTINGS.whatsapp || "").replace(/\D/g, "");
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(lines)}`;
    window.open(url, "_blank", "noopener");
  });
}

export function renderContactLinks() {
  const ul = document.getElementById("contactLinks");
  if (!ul) return;
  const items = [];
  if (SETTINGS.whatsapp) items.push({ label: t("contact.whatsapp"), value: SETTINGS.whatsapp, href: `https://wa.me/${SETTINGS.whatsapp.replace(/\D/g, "")}` });
  if (SETTINGS.email) items.push({ label: t("contact.email"), value: SETTINGS.email, href: `mailto:${SETTINGS.email}` });
  if (SETTINGS.linkedin) items.push({ label: t("contact.linkedin"), value: SETTINGS.linkedin, href: SETTINGS.linkedin });
  if (SETTINGS.github) items.push({ label: t("contact.github"), value: SETTINGS.github, href: SETTINGS.github });
  if (SETTINGS.telegram) items.push({ label: t("contact.telegram"), value: SETTINGS.telegram, href: SETTINGS.telegram });
  ul.innerHTML = items.map((i) =>
    `<li><a href="${i.href}" target="_blank" rel="noopener"><span>${i.label}<small>${i.value}</small></span></a></li>`
  ).join("");
  const cta = document.getElementById("ctaWhats");
  if (cta && SETTINGS.whatsapp) cta.href = `https://wa.me/${SETTINGS.whatsapp.replace(/\D/g, "")}`;
}
