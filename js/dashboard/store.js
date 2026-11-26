/** Supabase-backed content repository for the admin dashboard. */
import { SETTINGS, PROJECTS, SERVICES, EXPERIENCE, WHY, TESTIMONIALS, ACHIEVEMENTS, CERTIFICATES } from "../public/data.js";
import { dbRequest } from "./api.js";

const COLLECTIONS = ["projects","services","experience","why","testimonials","achievements","certificates"];
let cache = null;
let initialized = false;
let settingContent = {};

const clone = (v) => structuredClone(v);
function seed() {
  return {
    settings: clone(SETTINGS),
    projects: clone(PROJECTS),
    services: clone(SERVICES),
    experience: clone(EXPERIENCE),
    why: clone(WHY).map((x,i)=>({...x,id:`why-${i+1}`})),
    testimonials: clone(TESTIMONIALS),
    achievements: clone(ACHIEVEMENTS),
    certificates: clone(CERTIFICATES),
  };
}
function setSaveState(ok, error = "") {
  document.dispatchEvent(new CustomEvent("dashboard-save", { detail: { ok, error } }));
}
function rowsToRecords(rows) {
  return (rows || []).map((row) => ({
    ...(row.content || {}), id: row.id, order: row.sort_order,
    published: row.published, sample: row.sample,
    created_at: row.created_at, updated_at: row.updated_at,
  }));
}
export async function init() {
  const query = `select=collection,id,content,sort_order,published,sample,created_at,updated_at`;
  const [remoteEntries, remoteSettings] = await Promise.all([
    dbRequest(`/rest/v1/portfolio_entries?${query}&order=sort_order.asc,id.asc`),
    dbRequest("/rest/v1/portfolio_settings?select=content&id=eq.1"),
  ]);
  cache = Object.fromEntries(COLLECTIONS.map((c) => [c, []]));
  for (const name of COLLECTIONS) cache[name] = rowsToRecords(remoteEntries.filter((x) => x.collection === name));
  settingContent = remoteSettings?.[0]?.content || {};
  cache.settings = clone(settingContent);
  initialized = true;
  return cache;
}
function db() {
  if (!initialized || !cache) throw new Error("Dashboard data has not loaded from Supabase yet.");
  return cache;
}
export function dbSnapshot() { return db(); }

async function saveRows(name, rows) {
  if (!rows.length) return true;
  const body = rows.map((row) => ({
    collection: name,
    id: String(row.id),
    content: row,
    sort_order: Number(row.order ?? 1),
    published: row.published !== false,
    sample: row.sample === true,
  }));
  try {
    await dbRequest("/rest/v1/portfolio_entries?on_conflict=collection,id", {
      method: "POST", body,
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    });
    setSaveState(true);
    return true;
  } catch (error) {
    console.error("Supabase content save failed", error);
    setSaveState(false, error.message);
    return false;
  }
}
export function persist() { return Promise.resolve(true); }
export function list(name) { return [...db()[name]].sort((a,b)=>(a.order??999)-(b.order??999)); }
export function get(name,id) { return db()[name].find((x)=>String(x.id)===String(id)) || null; }
export function create(name,item) {
  const rows=db()[name];
  const record={id:item.id||`${name}-${crypto.randomUUID()}`,order:rows.length?Math.max(...rows.map(r=>r.order??0))+1:1,published:true,created_at:new Date().toISOString(),...item};
  rows.push(record); void saveRows(name,[record]); return record;
}
export function update(name,id,patch) {
  const row=get(name,id); if(!row)return null;
  Object.assign(row,patch,{updated_at:new Date().toISOString()}); void saveRows(name,[row]); return row;
}
export function remove(name,id) {
  const rows=db()[name],i=rows.findIndex(x=>String(x.id)===String(id)); if(i<0)return false;
  rows.splice(i,1);
  void dbRequest(`/rest/v1/portfolio_entries?collection=eq.${encodeURIComponent(name)}&id=eq.${encodeURIComponent(id)}`,{method:"DELETE",headers:{Prefer:"return=minimal"}}).then(()=>setSaveState(true)).catch(e=>{console.error(e);setSaveState(false,e.message);});
  return true;
}
export function reorder(name,ids) {
  ids.forEach((id,i)=>{const row=get(name,id);if(row)row.order=i+1;});
  void saveRows(name,list(name));
}
export function settings() { return db().settings; }
export async function saveSettings(patch) {
  const next = { ...db().settings, ...patch };
  try {
    await dbRequest("/rest/v1/portfolio_settings?id=eq.1", { method: "PATCH", body: { content: next }, headers: { Prefer: "return=minimal" } });
    cache.settings = next;
    setSaveState(true);
    return true;
  } catch (error) {
    console.error("Supabase settings save failed", error);
    setSaveState(false, error.message);
    throw error;
  }
}
export function counts() {
  const d=db();
  return {
    projects:d.projects.length,published:d.projects.filter(p=>p.published!==false).length,drafts:d.projects.filter(p=>p.published===false).length,
    services:d.services.length,experience:d.experience.length,why:d.why.length,
    testimonials:d.testimonials.length,achievements:d.achievements.length,certificates:d.certificates.length,
  };
}
export async function resetDemo() {
  const sample=seed();
  for(const name of COLLECTIONS){
    await dbRequest(`/rest/v1/portfolio_entries?collection=eq.${encodeURIComponent(name)}`,{method:"DELETE",headers:{Prefer:"return=minimal"}});
    cache[name]=sample[name];
    await saveRows(name,cache[name]);
  }
  cache.settings=clone(SETTINGS);
  await dbRequest("/rest/v1/portfolio_settings?id=eq.1",{method:"PATCH",body:{content:cache.settings},headers:{Prefer:"return=minimal"}});
  settingContent=cache.settings;
  setSaveState(true);
}
export function isDemo() { return false; }
