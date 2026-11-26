/** helpers.js — shared utilities (escaping, dates, urls). */
export const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const isHttpUrl = (u = "") => /^https?:\/\//i.test(u);
export const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : "");
