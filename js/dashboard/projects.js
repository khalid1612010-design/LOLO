import * as store from "./store.js";
import { $, esc, toast, confirmDialog, initSortable, renderFields, readForm } from "./ui.js";
import { imageField, bindImageField } from "./images.js";
import { uploadImageDataUrl } from "./api.js";
import { pickDashboard } from "./lang.js";

const FIELDS = [
  { key: "title", type: "pair", label: "Project title", required: true },
  { key: "category", type: "pair", label: "Category" },
  { key: "short", type: "pairArea", label: "Short summary" },
  { key: "overview", type: "pairArea", label: "Overview" },
  { key: "challenge", type: "pairArea", label: "Challenge" },
  { key: "solution", type: "pairArea", label: "Solution" },
  { key: "role", type: "pairArea", label: "Your role" },
  { key: "outcome", type: "pairArea", label: "Outcome (verified only)" },
  { key: "tech", type: "tags", label: "Technologies (allowed list only)", placeholder: "HTML, CSS, JavaScript, Supabase" },
  { key: "client", type: "text", label: "Client name (optional; permission required)" },
  { key: "liveUrl", type: "text", inputType: "url", label: "Live URL" },
  { key: "githubUrl", type: "text", inputType: "url", label: "GitHub URL" },
  { key: "videoUrl", type: "text", inputType: "url", label: "Video URL" },
];
const BLANK = { title_en:"", title_ar:"", category_en:"", category_ar:"", short_en:"", short_ar:"", overview_en:"", overview_ar:"", challenge_en:"", challenge_ar:"", solution_en:"", solution_ar:"", role_en:"", role_ar:"", outcome_en:"", outcome_ar:"", tech:[], client:"", liveUrl:"", githubUrl:"", videoUrl:"", image:"", gallery:[], slug:"", sample:false };

export function renderProjects(container) {
  const rows = store.list("projects");
  container.innerHTML = `<header class="view-head"><div><h1>My Work</h1><p class="view-blurb">Manage your projects and their public cards. Sample records are labeled clearly; publish only verified work.</p></div><button class="btn btn-primary" id="addProject">+ Add project</button></header>
    ${rows.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Order</th><th>Project</th><th>Category</th><th>Status</th><th>Actions</th></tr></thead><tbody id="projectRows"></tbody></table></div>` : `<div class="empty-state"><strong>No projects yet</strong><p>Create a project to begin.</p></div>`}`;
  const tbody = $("#projectRows", container);
  if (tbody) {
    tbody.innerHTML = rows.map((p,i)=>`<tr data-id="${esc(p.id)}" draggable="true" class="${p.published===false?'is-draft':''}"><td><button class="handle" data-handle aria-label="Reorder ${esc(pickDashboard(p.title_en,p.title_ar))}. Hold Alt and press arrow keys." title="Drag or Alt + ↑ / ↓">⋮⋮</button><span class="row-index">${i+1}</span></td><td><div class="project-cell">${p.image?`<img src="${esc(p.image)}" alt="" />`:`<span class="project-thumb">◈</span>`}<div><strong>${esc(pickDashboard(p.title_en,p.title_ar)||"Untitled")}</strong>${p.sample?`<small class="sample-chip">SAMPLE</small>`:""}<small>${esc(p.slug||"")}</small></div></div></td><td>${esc(pickDashboard(p.category_en,p.category_ar)||"—")}</td><td><span class="badge ${p.published===false?'badge-draft':'badge-live'}">${p.published===false?'Draft':'Published'}</span></td><td class="table-actions"><button class="btn btn-ghost btn-xs" data-act="toggle">${p.published===false?'Publish':'Unpublish'}</button><button class="btn btn-ghost btn-xs" data-act="edit">Edit</button><button class="btn btn-ghost btn-xs btn-danger-ghost" data-act="delete">Delete</button></td></tr>`).join("");
    initSortable(tbody, ids => {store.reorder("projects",ids); refreshRowNumbers(tbody); toast("Order saved");});
  }
  $("#addProject",container).addEventListener("click",()=>editor(null,container));
  container.onclick=async e=>{
    const b=e.target.closest("[data-act]"); if(!b)return;
    const tr=b.closest("[data-id]"), id=tr?.dataset.id; if(!id)return;
    if(b.dataset.act==="edit")return editor(store.get("projects",id),container);
    if(b.dataset.act==="toggle"){const p=store.get("projects",id);store.update("projects",id,{published:p.published===false});toast(p.published===false?"Published":"Moved to draft");return renderProjects(container);}
    const p=store.get("projects",id);if(await confirmDialog({title:"Delete project?",body:`“${p.title_en}” will be removed from this demo dashboard.`})){store.remove("projects",id);toast("Deleted","info");renderProjects(container);}
  };
}
function refreshRowNumbers(root){[...root.querySelectorAll("tr")].forEach((r,i)=>r.querySelector(".row-index").textContent=String(i+1));}
function slugify(s){return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||`project-${Date.now()}`;}
function editor(project,container){
  const isNew=!project, item=project?structuredClone(project):structuredClone(BLANK);
  const dlg=document.createElement("dialog");dlg.className="editor-dialog project-editor";
  dlg.innerHTML=`<form id="projectForm"><header class="editor-head"><div><h2>${isNew?"New project":"Edit project"}</h2><p>English and Arabic content are stored separately.</p></div><button type="button" class="icon-btn" data-close aria-label="Close">×</button></header><div class="editor-body"><div class="form-section"><h3>Project content</h3>${renderFields(FIELDS,item)}</div><div class="form-section"><h3>Cover image</h3>${imageField("image",item.image||"")}</div><div class="form-section"><h3>Publishing</h3><label class="switch-row"><input type="checkbox" name="published" ${item.published!==false?"checked":""}><span>Published on the public portfolio</span></label><label class="field-group"><span class="field-label">URL slug</span><input name="slug" value="${esc(item.slug||"")}" placeholder="project-name"></label><p class="hint">Published project cards and case studies load from Supabase. Keep a project as a draft until its content is ready.</p></div></div><footer class="editor-foot"><button type="button" class="btn btn-ghost" data-close>Cancel</button><button type="submit" class="btn btn-primary">${isNew?"Create project":"Save changes"}</button></footer></form>`;
  document.body.append(dlg);bindImageField(dlg);dlg.showModal();
  dlg.addEventListener("click",e=>{if(e.target.closest("[data-close]"))dlg.close();});dlg.addEventListener("close",()=>dlg.remove());
  $("#projectForm",dlg).addEventListener("submit",async e=>{
    e.preventDefault();
    const form=e.target, submit=form.querySelector('[type="submit"]');
    const patch={...readForm(form,FIELDS),image:form.elements.image.value,published:form.elements.published.checked,slug:form.elements.slug.value.trim()};
    if(!patch.title_en){toast("English project title is required","error");return;}
    const allowed=["HTML","CSS","JavaScript","Supabase","Git & GitHub","Vercel"];
    const invalid=(patch.tech||[]).filter(x=>!allowed.includes(x));
    if(invalid.length){toast(`Use only: ${allowed.join(", ")}`,"error");return;}
    if(!patch.slug)patch.slug=slugify(patch.title_en);
    if(patch.image.startsWith("data:image/")){
      submit.disabled=true;submit.textContent="Uploading image…";
      try{patch.image=await uploadImageDataUrl(patch.image,patch.slug);}
      catch(error){toast(error.message,"error");submit.disabled=false;submit.textContent=isNew?"Create project":"Save changes";return;}
    }
    if(isNew)store.create("projects",patch);else store.update("projects",project.id,patch);
    dlg.close();toast(isNew?"Project created":"Changes saved");renderProjects(container);
  });
}
