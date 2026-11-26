/**
 * content.js — Collection management for the simpler content types:
 * Services, Experience, Why Work With Me, Testimonials, Achievements, Certificates.
 * (Projects have their own richer editor in projects.js.)
 */
import * as store from "./store.js";
import { $, esc, toast, confirmDialog, initSortable, renderFields, readForm } from "./ui.js";
import { pickDashboard } from "./lang.js";

export const SCHEMAS = {
  services: {
    title: "Services",
    singular: "Service",
    blurb: "Service categories shown on the public site. Order matters.",
    titleKey: "category_en",
    titleKeyAr: "category_ar",
    fields: [
      { key: "category", type: "pair", label: "Category name", required: true },
      { key: "items", type: "pairLines", label: "Items in this category", hint: "One item per line. Arabic list should match the English order." },
    ],
    blank: { category_en: "", category_ar: "", items_en: [], items_ar: [] },
    rowMeta: (r) => `${(r.items || []).length} items`,
  },
  experience: {
    title: "Experience",
    singular: "Experience entry",
    blurb: "Professional experience timeline. Leave a field empty to hide it — never invent dates, employers or results.",
    titleKey: "role_en",
    titleKeyAr: "role_ar",
    fields: [
      { key: "role", type: "pair", label: "Role / title", required: true },
      { key: "org", type: "pair", label: "Company or description", hint: "e.g. “Marketing agency” — leave the name out if it is not allowed to be published." },
      { key: "period", type: "pair", label: "Period (optional)", hint: "Only if real, e.g. 2023 — 2024. Otherwise leave empty." },
      { key: "desc", type: "pairArea", label: "Description" },
      { key: "points", type: "pairLines", label: "Highlights", hint: "One per line. Only verified responsibilities." },
    ],
    blank: { role_en: "", role_ar: "", org_en: "", org_ar: "", period_en: "", period_ar: "", desc_en: "", desc_ar: "", points_en: [], points_ar: [] },
    rowMeta: (r) => pickDashboard(r.org_en,r.org_ar),
  },
  why: {
    title: "Why Work With Me",
    singular: "Reason",
    blurb: "The reasons clients choose to work with you. Keep them honest and specific.",
    titleKey: "en",
    titleKeyAr: "ar",
    fields: [
      { key: "title", type: "pair", keys: ["en", "ar"], label: "Reason", required: true },
      { key: "desc", type: "pairArea", keys: ["d_en", "d_ar"], label: "Explanation" },
    ],
    blank: { en: "", ar: "", d_en: "", d_ar: "" },
    rowMeta: () => "",
  },
  testimonials: {
    title: "Testimonials",
    singular: "Testimonial",
    blurb: "Only real testimonials, with permission to publish. The section stays hidden on the site while this list is empty.",
    titleKey: "name",
    fields: [
      { key: "quote", type: "pairArea", label: "Testimonial text", required: true },
      { key: "name", type: "text", label: "Client name" },
      { key: "role", type: "text", label: "Role / company (optional)" },
    ],
    blank: { quote_en: "", quote_ar: "", name: "", role: "" },
    rowMeta: (r) => r.role || "",
  },
  achievements: {
    title: "Achievements",
    singular: "Achievement",
    blurb: "Verified achievements and milestones only. The section stays hidden while this list is empty.",
    titleKey: "title_en",
    titleKeyAr: "title_ar",
    fields: [
      { key: "title", type: "pair", label: "Achievement", required: true },
      { key: "desc", type: "pairArea", label: "Details" },
    ],
    blank: { title_en: "", title_ar: "", desc_en: "", desc_ar: "" },
    rowMeta: () => "",
  },
  certificates: {
    title: "Certificates",
    singular: "Certificate",
    blurb: "Real certificates only — issuer and (optionally) a verification link.",
    titleKey: "title_en",
    titleKeyAr: "title_ar",
    fields: [
      { key: "title", type: "pair", label: "Certificate", required: true },
      { key: "issuer", type: "pair", label: "Issuer" },
      { key: "date", type: "text", label: "Date (optional)" },
      { key: "url", type: "text", inputType: "url", label: "Verification URL (optional)" },
    ],
    blank: { title_en: "", title_ar: "", issuer_en: "", issuer_ar: "", date: "", url: "" },
    rowMeta: (r) => pickDashboard(r.issuer_en,r.issuer_ar),
  },
};

export function renderCollection(name, container) {
  const schema = SCHEMAS[name];
  const rows = store.list(name);

  container.innerHTML = `
    <header class="view-head">
      <div>
        <h1>${schema.title}</h1>
        <p class="view-blurb">${esc(schema.blurb)}</p>
      </div>
      <button type="button" class="btn btn-primary" id="addBtn">+ Add ${esc(schema.singular.toLowerCase())}</button>
    </header>
    ${rows.length ? `<ul class="sortable" id="rows" aria-label="${esc(schema.title)} list"></ul>` : `
      <div class="empty-state">
        <strong>Nothing here yet</strong>
        <p>Add your first ${esc(schema.singular.toLowerCase())}. Empty sections stay hidden on the public site.</p>
      </div>`}
  `;

  if (rows.length) {
    const listEl = $("#rows", container);
    listEl.innerHTML = rows.map((r, i) => rowHTML(name, schema, r, i)).join("");
    initSortable(listEl, (ids) => {
      store.reorder(name, ids);
      toast("Order saved");
    });
  }

  $("#addBtn", container).addEventListener("click", () => openEditor(name, null, container));

  container.onclick = async (e) => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const id = btn.closest("[data-id]")?.dataset.id;
    if (!id) return;
    const act = btn.dataset.act;

    if (act === "edit") return openEditor(name, store.get(name, id), container);
    if (act === "toggle") {
      const row = store.get(name, id);
      store.update(name, id, { published: row.published === false });
      toast(row.published === false ? "Published" : "Moved to draft");
      return renderCollection(name, container);
    }
    if (act === "delete") {
      const row = store.get(name, id);
      const label = esc(row[schema.titleKey] || schema.singular);
      const ok = await confirmDialog({
        title: `Delete ${schema.singular.toLowerCase()}?`,
        body: `“${label}” will be removed from this demo dashboard. This cannot be undone.`,
      });
      if (!ok) return;
      store.remove(name, id);
      toast("Deleted", "info");
      renderCollection(name, container);
    }
  };
}

function rowHTML(name, schema, row, index) {
  const title = pickDashboard(row[schema.titleKey],row[schema.titleKeyAr]) || row.title_en || row.role_en || "(untitled)";
  const meta = schema.rowMeta?.(row) || "";
  const draft = row.published === false;
  return `
    <li class="row ${draft ? "is-draft" : ""}" data-id="${esc(row.id)}" draggable="true">
      <button type="button" class="handle" data-handle aria-label="Reorder ${esc(title)}. Hold Alt and press arrow keys." title="Drag, or Alt + ↑ / ↓">⋮⋮</button>
      <span class="row-index">${index + 1}</span>
      <div class="row-main">
        <strong>${esc(title)}</strong>
        ${meta ? `<small>${esc(meta)}</small>` : ""}
      </div>
      <span class="badge ${draft ? "badge-draft" : "badge-live"}">${draft ? "Draft" : "Published"}</span>
      <div class="row-actions">
        <button type="button" class="btn btn-ghost btn-xs" data-act="toggle">${draft ? "Publish" : "Unpublish"}</button>
        <button type="button" class="btn btn-ghost btn-xs" data-act="edit">Edit</button>
        <button type="button" class="btn btn-ghost btn-xs btn-danger-ghost" data-act="delete">Delete</button>
      </div>
    </li>`;
}

function openEditor(name, row, container) {
  const schema = SCHEMAS[name];
  const isNew = !row;
  const draft = row ? structuredClone(row) : structuredClone(schema.blank);
  if (name === "services" && row) {
    draft.items_en = (row.items || []).map((x) => x.en || "");
    draft.items_ar = (row.items || []).map((x) => x.ar || "");
  }

  const dlg = document.createElement("dialog");
  dlg.className = "editor-dialog";
  dlg.innerHTML = `
    <form method="dialog" id="editorForm">
      <header class="editor-head">
        <h2>${isNew ? "New" : "Edit"} ${esc(schema.singular.toLowerCase())}</h2>
        <button type="button" class="icon-btn" data-close aria-label="Close">×</button>
      </header>
      <div class="editor-body">${renderFields(schema.fields, draft)}</div>
      <footer class="editor-foot">
        <button type="button" class="btn btn-ghost" data-close>Cancel</button>
        <button type="submit" class="btn btn-primary">${isNew ? "Create" : "Save changes"}</button>
      </footer>
    </form>`;
  document.body.appendChild(dlg);
  dlg.showModal();

  dlg.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) dlg.close(); });
  dlg.addEventListener("close", () => dlg.remove());

  $("#editorForm", dlg).addEventListener("submit", (e) => {
    e.preventDefault();
    const patch = readForm(e.target, schema.fields);
    if (name === "services") {
      patch.items = patch.items_en.map((en, i) => ({ en, ar: patch.items_ar[i] || "" })).filter((x) => x.en || x.ar);
      delete patch.items_en;
      delete patch.items_ar;
    }
    const required = schema.fields.find((f) => f.required);
    const [enKey] = required.keys || [`${required.key}_en`];
    if (!patch[enKey]) {
      toast("The English value is required", "error");
      return;
    }
    if (isNew) store.create(name, patch);
    else store.update(name, row.id, patch);
    dlg.close();
    toast(isNew ? "Created" : "Changes saved");
    renderCollection(name, container);
  });
}
