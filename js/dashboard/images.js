/** Local image picker for the pre-Supabase dashboard demo. */
import { esc, toast } from "./ui.js";

const MAX_IMAGE_BYTES = 1_000_000;

export function imageField(name, value = "") {
  return `<div class="field-group image-field">
    <span class="field-label">Cover image</span>
    <div class="image-drop" data-dropzone tabindex="0" role="button" aria-label="Choose or drop an image">
      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" data-image-input hidden />
      <div class="image-preview" data-image-preview>${value ? `<img src="${esc(value)}" alt="Current cover preview" />` : `<span class="image-empty">Drop an image here or <u>browse</u><small>JPG, PNG, WebP or GIF · max 1 MB</small></span>`}</div>
    </div>
    <input type="hidden" name="image" value="${esc(value)}" data-image-value />
    <button type="button" class="btn btn-ghost btn-xs image-remove" data-image-remove ${value ? "" : "hidden"}>Remove image</button>
    <small class="hint">Images upload to the portfolio-media Supabase Storage bucket after you save this project.</small>
  </div>`;
}

export function bindImageField(root) {
  const zone = root.querySelector("[data-dropzone]");
  const input = root.querySelector("[data-image-input]");
  const preview = root.querySelector("[data-image-preview]");
  const value = root.querySelector("[data-image-value]");
  const remove = root.querySelector("[data-image-remove]");
  if (!zone || !input || !value) return;

  const show = (src) => {
    value.value = src;
    preview.innerHTML = src ? `<img src="${src}" alt="Cover image preview" />` : `<span class="image-empty">Drop an image here or <u>browse</u><small>JPG, PNG, WebP or GIF · max 1 MB</small></span>`;
    remove.hidden = !src;
  };
  const load = (file) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) return toast("Choose a JPG, PNG, WebP or GIF image", "error");
    if (file.size > MAX_IMAGE_BYTES) return toast("Image exceeds the 1 MB demo limit", "error");
    const reader = new FileReader();
    reader.onload = () => { show(String(reader.result)); toast("Image added to this browser"); };
    reader.onerror = () => toast("Could not read this image", "error");
    reader.readAsDataURL(file);
  };
  zone.addEventListener("click", () => input.click());
  zone.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } });
  input.addEventListener("change", () => load(input.files?.[0]));
  zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("is-over"); });
  zone.addEventListener("dragleave", () => zone.classList.remove("is-over"));
  zone.addEventListener("drop", (e) => { e.preventDefault(); zone.classList.remove("is-over"); load(e.dataTransfer.files?.[0]); });
  remove.addEventListener("click", () => { show(""); input.value = ""; });
}
