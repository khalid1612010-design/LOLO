/** ui.js — small DOM + feedback helpers for the dashboard. */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/** Toast notifications (success / error / info). */
let toastTimer = null;
export function toast(message, kind = "success") {
  let el = $("#toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.dataset.kind = kind;
  el.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-visible"), 3200);
}

/** Promise-based confirmation dialog. */
export function confirmDialog({ title = "Are you sure?", body = "", confirmLabel = "Delete", danger = true }) {
  return new Promise((resolve) => {
    const dlg = document.createElement("dialog");
    dlg.className = "confirm-dialog";
    dlg.innerHTML = `
      <h2>${esc(title)}</h2>
      <p>${esc(body)}</p>
      <div class="confirm-actions">
        <button type="button" class="btn btn-ghost" data-act="cancel">Cancel</button>
        <button type="button" class="btn ${danger ? "btn-danger" : "btn-primary"}" data-act="ok">${esc(confirmLabel)}</button>
      </div>`;
    document.body.appendChild(dlg);
    dlg.addEventListener("click", (e) => {
      const act = e.target.closest("[data-act]")?.dataset.act;
      if (!act) return;
      dlg.close();
      resolve(act === "ok");
    });
    dlg.addEventListener("close", () => dlg.remove());
    dlg.showModal();
  });
}

/**
 * Drag-and-drop + keyboard reordering for a list of items.
 * Rows must carry [data-id] and a [data-handle].
 */
export function initSortable(listEl, onReorder) {
  let dragId = null;

  listEl.addEventListener("dragstart", (e) => {
    const row = e.target.closest("[data-id]");
    if (!row) return;
    dragId = row.dataset.id;
    row.classList.add("is-dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", dragId);
  });

  listEl.addEventListener("dragend", (e) => {
    e.target.closest("[data-id]")?.classList.remove("is-dragging");
    dragId = null;
  });

  listEl.addEventListener("dragover", (e) => {
    const row = e.target.closest("[data-id]");
    if (!row || !dragId || row.dataset.id === dragId) return;
    e.preventDefault();
    const dragged = listEl.querySelector(`[data-id="${CSS.escape(dragId)}"]`);
    const rect = row.getBoundingClientRect();
    const after = e.clientY > rect.top + rect.height / 2;
    row.parentNode.insertBefore(dragged, after ? row.nextSibling : row);
  });

  listEl.addEventListener("drop", (e) => {
    e.preventDefault();
    onReorder($$("[data-id]", listEl).map((r) => r.dataset.id));
  });

  // Keyboard: Alt+ArrowUp / Alt+ArrowDown on the handle
  listEl.addEventListener("keydown", (e) => {
    if (!e.altKey || !["ArrowUp", "ArrowDown"].includes(e.key)) return;
    const row = e.target.closest("[data-id]");
    if (!row) return;
    e.preventDefault();
    const rows = $$("[data-id]", listEl);
    const i = rows.indexOf(row);
    const j = e.key === "ArrowUp" ? i - 1 : i + 1;
    if (j < 0 || j >= rows.length) return;
    if (e.key === "ArrowUp") row.parentNode.insertBefore(row, rows[j]);
    else row.parentNode.insertBefore(rows[j], row);
    row.querySelector("[data-handle]")?.focus();
    onReorder($$("[data-id]", listEl).map((r) => r.dataset.id));
  });
}

/** Collect the two-language pair fields defined by a schema. */
const pairKeys = (field) => field.keys || [`${field.key}_en`, `${field.key}_ar`];

export function readForm(form, schema) {
  const out = {};
  schema.forEach((field) => {
    if (field.type === "pair" || field.type === "pairArea" || field.type === "pairLines") {
      const [enKey, arKey] = pairKeys(field);
      const en = form.elements[enKey]?.value ?? "";
      const ar = form.elements[arKey]?.value ?? "";
      if (field.type === "pairLines") {
        out[enKey] = en.split("\n").map((s) => s.trim()).filter(Boolean);
        out[arKey] = ar.split("\n").map((s) => s.trim()).filter(Boolean);
      } else {
        out[enKey] = en.trim();
        out[arKey] = ar.trim();
      }
    } else if (field.type === "tags") {
      out[field.key] = (form.elements[field.key]?.value ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    } else if (field.type === "toggle") {
      out[field.key] = Boolean(form.elements[field.key]?.checked);
    } else if (["image", "gallery"].includes(field.type)) {
      /* handled by the image controller */
    } else {
      out[field.key] = (form.elements[field.key]?.value ?? "").trim();
    }
  });
  return out;
}

/** Render a bilingual/field group from a schema. */
export function renderFields(schema, item = {}) {
  return schema.map((f) => {
    const label = `<span class="field-label">${esc(f.label)}${f.required ? " *" : ""}</span>`;
    if (f.type === "pair" || f.type === "pairArea" || f.type === "pairLines") {
      const tag = f.type === "pair" ? "input" : "textarea";
      const rows = f.type === "pairLines" ? 4 : 3;
      const [enKey, arKey] = pairKeys(f);
      const v = (key) => {
        const val = item[key];
        return Array.isArray(val) ? val.join("\n") : (val ?? "");
      };
      const one = (key, suffix) => tag === "input"
        ? `<input name="${key}" type="${f.inputType === "url" ? "url" : "text"}" value="${esc(v(key))}" ${f.placeholder ? `placeholder="${esc(f.placeholder)}"` : ""} ${f.required && suffix === "en" ? "required" : ""} />`
        : `<textarea name="${key}" rows="${rows}" ${f.placeholder ? `placeholder="${esc(f.placeholder)}"` : ""}>${esc(v(key))}</textarea>`;
      return `<div class="field-group">
        ${label}
        <div class="pair">
          <label class="pair-item"><em>EN</em>${one(enKey, "en")}</label>
          <label class="pair-item"><em>AR</em>${one(arKey, "ar")}</label>
        </div>
        ${f.hint ? `<small class="hint">${esc(f.hint)}</small>` : ""}
      </div>`;
    }
    if (f.type === "tags") {
      return `<label class="field-group">${label}
        <input name="${f.key}" type="text" value="${esc((item[f.key] || []).join(", "))}" placeholder="${esc(f.placeholder || "HTML, CSS, JavaScript")}" />
        <small class="hint">Comma separated</small></label>`;
    }
    if (f.type === "toggle") {
      return `<label class="switch-row">
        <input type="checkbox" name="${f.key}" ${item[f.key] !== false ? "checked" : ""} />
        <span>${esc(f.label)}</span></label>`;
    }
    if (f.type === "textarea") {
      return `<label class="field-group">${label}
        <textarea name="${f.key}" rows="3">${esc(item[f.key] ?? "")}</textarea></label>`;
    }
    return `<label class="field-group">${label}
      <input name="${f.key}" type="${f.inputType || "text"}" value="${esc(item[f.key] ?? "")}" placeholder="${esc(f.placeholder || "")}" ${f.required ? "required" : ""} />
      ${f.hint ? `<small class="hint">${esc(f.hint)}</small>` : ""}</label>`;
  }).join("");
}
