/**
 * main.js — Public website entry point (Phase 1).
 * Renders content from data.js. Phase 4 swaps data source to Supabase.
 */
import { PROJECTS as SAMPLE_PROJECTS, SERVICES, EXPERIENCE, WHY, TECH, TESTIMONIALS, ACHIEVEMENTS, CERTIFICATES, SETTINGS } from "./data.js";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, isSupabaseConfigured } from "../config/supabase.js";
import { initLang, getLang, pick, t } from "./i18n.js";
import { initReveal, initTilt } from "./animations.js";
import { initContact, renderContactLinks } from "./contact.js";

const $ = (s, r = document) => r.querySelector(s);
const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
let PROJECTS = [...SAMPLE_PROJECTS];
const published = (arr) => [...arr].filter((x) => x.published !== false).sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

async function loadPublishedProjects() {
  if (!isSupabaseConfigured) return;
  try {
    const url = `${SUPABASE_URL}/rest/v1/portfolio_entries?select=id,content,sort_order,published,sample&collection=eq.projects&published=eq.true&order=sort_order.asc`;
    const response = await fetch(url, { headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}` } });
    if (!response.ok) throw new Error(`Projects request returned ${response.status}`);
    const rows = await response.json();
    PROJECTS = rows.map((row) => ({ ...(row.content || {}), id: row.id, order: row.sort_order, published: row.published, sample: row.sample }));
  } catch (error) {
    console.warn("Could not load published projects from Supabase; showing the clearly marked sample content.", error);
  }
}

async function loadPublishedSettings() {
  if (!isSupabaseConfigured) return;
  try {
    const url = `${SUPABASE_URL}/rest/v1/portfolio_settings?select=content&id=eq.1`;
    const response = await fetch(url, { headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}` } });
    if (!response.ok) throw new Error(`Portfolio settings request returned ${response.status}`);
    const rows = await response.json();
    if (rows[0]?.content) Object.assign(SETTINGS, rows[0].content);
  } catch (error) {
    console.warn("Could not load portfolio settings from Supabase; using the bundled defaults.", error);
  }
}

function applyProfileSettings() {
  const lang = getLang();
  const name = SETTINGS.name || "KHALED MOHAMED";
  const role = lang === "ar" ? (SETTINGS.title_ar || SETTINGS.title_en || "") : (SETTINGS.title_en || SETTINGS.title_ar || "");
  for (const id of ["profileNameHeader", "profileNameHero", "profileNameFooter"]) {
    const node = document.getElementById(id);
    if (node) node.textContent = name;
  }
  for (const id of ["profileRole", "profileRoleFooter"]) {
    const node = document.getElementById(id);
    if (node) node.textContent = role;
  }

  const title = SETTINGS.seoTitle || `${name} — ${role}`;
  const description = SETTINGS.seoDescription || "";
  document.title = title;
  const setMeta = (selector, value) => { const node = document.querySelector(selector); if (node && value) node.setAttribute("content", value); };
  setMeta('meta[name="author"]', name);
  setMeta('meta[name="description"]', description);
  setMeta('meta[property="og:title"]', title);
  setMeta('meta[property="og:description"]', description);
  setMeta('meta[name="twitter:title"]', title);
  setMeta('meta[name="twitter:description"]', description);

  const schema = document.querySelector('script[type="application/ld+json"]');
  if (schema) {
    try {
      const data = JSON.parse(schema.textContent);
      data.name = name;
      data.jobTitle = role;
      if (description) data.description = description;
      schema.textContent = JSON.stringify(data);
    } catch { /* keep the bundled structured data if malformed */ }
  }
}

function thumbHTML(p) {
  if (p.image) return `<img src="${esc(p.image)}" alt="${esc(pick({ en: p.title_en, ar: p.title_ar }))}" loading="lazy" />`;
  // No image yet → CSS interface mockup (decorative, no fake screenshot claims)
  return `<div class="thumb-fallback" aria-hidden="true">
      <div class="tm-bar"><i></i><i></i><i></i></div>
      <div class="tm-body">
        <span class="tm-eyebrow"></span>
        <span class="tm-title"></span>
        <span class="tm-line"></span>
        <span class="tm-line short"></span>
        <span class="tm-cta"></span>
        <div class="tm-cards"><i></i><i></i><i></i></div>
      </div>
    </div>`;
}

function renderProjects() {
  const lang = getLang();
  const list = published(PROJECTS);
  const grid = $("#projectsGrid");
  $("#projectsEmpty").hidden = list.length > 0;
  grid.innerHTML = list.map((p) => {
    const title = pick({ en: p.title_en, ar: p.title_ar }, lang);
    const description = pick({ en: p.short_en, ar: p.short_ar }, lang);
    return `
    <article class="project-card" data-id="${esc(p.id)}">
      <div class="project-thumb">
        ${thumbHTML(p)}
        <div class="project-title-overlay"><h3>${esc(title)}</h3></div>
        ${p.sample ? `<span class="sample-tag">${t("sample.tag")}</span>` : ""}
      </div>
      <div class="project-body">
        ${description ? `<p>${esc(description)}</p>` : ""}
        ${p.liveUrl ? `<a class="btn btn-primary project-visit" href="${esc(p.liveUrl)}" target="_blank" rel="noopener">${t("work.viewSite")} <span aria-hidden="true">↗</span></a>` : ""}
      </div>
    </article>`;
  }).join("");
  initTilt(grid);
}

function renderServices() {
  const lang = getLang();
  const sorted = [...SERVICES].sort((a, b) => a.order - b.order);
  $("#servicesGrid").innerHTML = sorted.map((s) => `
    <article class="service-card">
      <h3>${esc(pick({ en: s.category_en, ar: s.category_ar }, lang))}</h3>
      <ul>${s.items.map((i) => `<li>${esc(pick(i, lang))}</li>`).join("")}</ul>
    </article>`).join("");
}

function renderExperience() {
  const lang = getLang();
  $("#experienceTimeline").innerHTML = [...EXPERIENCE].sort((a, b) => a.order - b.order).map((e) => `
    <article class="exp-item">
      <h3>${esc(pick({ en: e.role_en, ar: e.role_ar }, lang))}</h3>
      <p class="exp-meta">${esc(pick({ en: e.org_en, ar: e.org_ar }, lang))}${e.period_en ? ` · ${esc(pick({ en: e.period_en, ar: e.period_ar }, lang))}` : ""}</p>
      <p>${esc(pick({ en: e.desc_en, ar: e.desc_ar }, lang))}</p>
      ${e.points_en?.length ? `<ul>${e.points_en.map((_, i) => `<li>${esc(pick({ en: e.points_en[i], ar: e.points_ar?.[i] }, lang))}</li>`).join("")}</ul>` : ""}
    </article>`).join("");
}

function caseCell(title, body) {
  return body ? `<div class="case-cell"><h4>${title}</h4>${body}</div>` : "";
}

function renderCases() {
  const lang = getLang();
  const list = published(PROJECTS);
  $("#casesList").innerHTML = list.map((p) => {
    const title = pick({ en: p.title_en, ar: p.title_ar }, lang);
    const cells = [
      caseCell(t("case.overview"), p.overview_en ? `<p>${esc(pick({ en: p.overview_en, ar: p.overview_ar }, lang))}</p>` : ""),
      caseCell(t("case.challenge"), p.challenge_en ? `<p>${esc(pick({ en: p.challenge_en, ar: p.challenge_ar }, lang))}</p>` : ""),
      caseCell(t("case.solution"), p.solution_en ? `<p>${esc(pick({ en: p.solution_en, ar: p.solution_ar }, lang))}</p>` : ""),
      caseCell(t("case.role"), p.role_en ? `<p>${esc(pick({ en: p.role_en, ar: p.role_ar }, lang))}</p>` : ""),
      caseCell(t("case.tech"), p.tech?.length ? `<div class="tech-pills">${p.tech.map((x) => `<span>${esc(x)}</span>`).join("")}</div>` : ""),
      caseCell(t("case.outcome"), p.outcome_en ? `<p>${esc(pick({ en: p.outcome_en, ar: p.outcome_ar }, lang))}</p>` : ""),
      caseCell(t("case.client"), p.client ? `<p>${esc(p.client)}</p>` : ""),
      caseCell(t("case.gallery"), p.gallery?.length ? `<div class="case-gallery">${p.gallery.map((g) => `<img src="${esc(g)}" alt="${esc(title)}" loading="lazy" />`).join("")}</div>` : ""),
    ].filter(Boolean).join("");
    const links = [
      p.liveUrl ? `<a class="btn btn-primary btn-sm" href="${esc(p.liveUrl)}" target="_blank" rel="noopener">${t("case.live")}</a>` : "",
      p.githubUrl ? `<a class="btn btn-ghost btn-sm" href="${esc(p.githubUrl)}" target="_blank" rel="noopener">${t("case.github")}</a>` : "",
      p.videoUrl ? `<a class="btn btn-ghost btn-sm" href="${esc(p.videoUrl)}" target="_blank" rel="noopener">Video</a>` : "",
    ].filter(Boolean).join("");
    return `
    <article class="case" id="case-${esc(p.id)}">
      <div class="case-head">
        <div class="case-media">${thumbHTML(p)}${p.sample ? `<span class="sample-tag">${t("sample.tag")}</span>` : ""}</div>
        <div class="case-intro">
          <span class="project-cat">${esc(pick({ en: p.category_en, ar: p.category_ar }, lang))}</span>
          <h3>${esc(title)}</h3>
          <p>${esc(pick({ en: p.short_en, ar: p.short_ar }, lang))}</p>
        </div>
      </div>
      ${cells ? `<div class="case-grid">${cells}</div>` : ""}
      ${links ? `<div class="case-links">${links}</div>` : ""}
    </article>`;
  }).join("");
}

function renderWhy() {
  const lang = getLang();
  $("#whyGrid").innerHTML = WHY.map((w) => `
    <article class="why-card"><h3>${esc(pick({ en: w.en, ar: w.ar }, lang))}</h3><p>${esc(pick({ en: w.d_en, ar: w.d_ar }, lang))}</p></article>`).join("");
}

function renderTech() {
  $("#techList").innerHTML = TECH.map((x) => `<li>${esc(x)}</li>`).join("");
}

function renderTestimonials() {
  const sec = $("#testimonials");
  if (!TESTIMONIALS.length) { sec.hidden = true; return; }
  sec.hidden = false;
  const lang = getLang();
  $("#testiGrid").innerHTML = TESTIMONIALS.map((x) => `
    <article class="testi-card"><blockquote>“${esc(pick({ en: x.quote_en, ar: x.quote_ar }, lang))}”</blockquote>
    <footer><strong>${esc(x.name || "")}</strong>${esc(x.role || "")}</footer></article>`).join("");
}

function renderAchievements() {
  const sec = $("#achievements");
  if (!ACHIEVEMENTS.length && !CERTIFICATES.length) { sec.hidden = true; return; }
  sec.hidden = false;
  const lang = getLang();
  $("#achGrid").innerHTML = ACHIEVEMENTS.map((a) => `
    <article class="ach-card"><h3>${esc(pick({ en: a.title_en, ar: a.title_ar }, lang))}</h3><p>${esc(pick({ en: a.desc_en, ar: a.desc_ar }, lang))}</p></article>`).join("");
  $("#certHead").hidden = !CERTIFICATES.length;
  $("#certGrid").innerHTML = CERTIFICATES.map((c) => `
    <article class="ach-card"><h3>${esc(pick({ en: c.title_en, ar: c.title_ar }, lang))}</h3><p>${esc(pick({ en: c.issuer_en, ar: c.issuer_ar }, lang))}</p></article>`).join("");
}

function renderAboutTags() {
  const lang = getLang();
  const tags = lang === "ar" ? ["فهم الأعمال", "تواصل واضح", "كود نظيف", "تجربة استخدام"] : ["Business understanding", "Clear communication", "Clean code", "Usability focus"];
  $("#aboutTags").innerHTML = tags.map((x) => `<span>${x}</span>`).join("");
}

function openProject(id) {
  const p = PROJECTS.find((x) => x.id === id);
  if (!p) return;
  const lang = getLang();
  const title = pick({ en: p.title_en, ar: p.title_ar }, lang);
  $("#dialogBody").innerHTML = `
    ${p.image ? `<img class="hero-img" src="${esc(p.image)}" alt="${esc(title)}" />` : ""}
    <span class="project-cat">${esc(pick({ en: p.category_en, ar: p.category_ar }, lang))}</span>
    <h3 id="dialogTitle" style="font-size:28px;margin:8px 0 14px">${esc(title)}</h3>
    <p style="color:var(--muted);margin-bottom:18px">${esc(pick({ en: p.short_en, ar: p.short_ar }, lang))}</p>
    ${p.overview_en ? `<h4 style="margin-bottom:8px">${t("case.overview")}</h4><p style="color:#D4D4D8;margin-bottom:16px">${esc(pick({ en: p.overview_en, ar: p.overview_ar }, lang))}</p>` : ""}
    ${p.challenge_en ? `<h4 style="margin-bottom:8px">${t("case.challenge")}</h4><p style="color:#D4D4D8;margin-bottom:16px">${esc(pick({ en: p.challenge_en, ar: p.challenge_ar }, lang))}</p>` : ""}
    ${p.solution_en ? `<h4 style="margin-bottom:8px">${t("case.solution")}</h4><p style="color:#D4D4D8;margin-bottom:16px">${esc(pick({ en: p.solution_en, ar: p.solution_ar }, lang))}</p>` : ""}
    ${p.outcome_en ? `<h4 style="margin-bottom:8px">${t("case.outcome")}</h4><p style="color:#D4D4D8;margin-bottom:16px">${esc(pick({ en: p.outcome_en, ar: p.outcome_ar }, lang))}</p>` : ""}
    <div class="hero-actions">
      ${p.liveUrl ? `<a class="btn btn-primary" href="${esc(p.liveUrl)}" target="_blank" rel="noopener">${t("case.live")}</a>` : ""}
      ${p.githubUrl ? `<a class="btn btn-ghost" href="${esc(p.githubUrl)}" target="_blank" rel="noopener">${t("case.github")}</a>` : ""}
    </div>`;
  const dlg = $("#projectDialog");
  dlg.setAttribute("aria-label", title);
  if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
}

function renderAll() {
  renderProjects(); renderServices(); renderExperience(); renderCases();
  renderWhy(); renderTech(); renderTestimonials(); renderAchievements();
  renderAboutTags(); renderContactLinks();
  const opts = SERVICES.flatMap((s) => s.items.map((i) => pick(i, getLang())));
  initContact(opts);
}

function initChrome() {
  $("#year").textContent = new Date().getFullYear();
  const toggle = $("#menuToggle"), nav = $("#mainNav");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("open")));
  const dlg = $("#projectDialog");
  $("#dialogClose").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  // Subtle hero parallax (skipped for reduced motion)
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mock = $("#browserMock");
  if (!reduce && mock && window.matchMedia("(pointer: fine)").matches) {
    const hero = $(".hero");
    hero.addEventListener("pointermove", (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 8;
      const y = (e.clientY / window.innerHeight - 0.5) * 6;
      mock.style.transform = `rotateY(${-8 + x}deg) rotateX(${4 - y}deg)`;
    });
  }
}

initLang();
initChrome();
initReveal();
document.addEventListener("langchange", () => { applyProfileSettings(); renderAll(); initReveal(); });
Promise.all([loadPublishedProjects(), loadPublishedSettings()]).finally(() => { applyProfileSettings(); renderAll(); initReveal(); });
