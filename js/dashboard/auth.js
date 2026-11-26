import { passwordSignIn, freshSession, isAllowlisted, signOut } from "./api.js";

export async function lock() {
  await signOut();
  location.reload();
}

export function initGate(onUnlock) {
  const gate = document.getElementById("gate");
  const app = document.getElementById("app");
  const form = document.getElementById("gateForm");
  const email = document.getElementById("gateEmail");
  const input = document.getElementById("gatePassword");
  const error = document.getElementById("gateError");
  const toggle = document.getElementById("gateToggle");
  const submit = form?.querySelector('[type="submit"]');
  const open = async (session) => {
    gate.hidden = true;
    app.hidden = false;
    try { await onUnlock?.(session); }
    catch (error) { app.hidden = true; gate.hidden = false; throw error; }
  };
  const showGateError = (message) => { error.textContent = message; error.hidden = false; };

  gate.hidden = false;
  app.hidden = true;
  toggle?.addEventListener("click", () => {
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    toggle.textContent = show ? "Hide" : "Show";
    toggle.setAttribute("aria-pressed", String(show));
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    error.hidden = true;
    submit.disabled = true;
    submit.textContent = "Checking access…";
    try {
      const session = await passwordSignIn(email.value.trim(), input.value);
      if (!await isAllowlisted(session)) {
        await signOut();
        throw new Error("This account is not on the portfolio admin allowlist. Ask the project owner to authorize it.");
      }
      input.value = "";
      await open(session);
    } catch (err) {
      showGateError(err.message || "Could not sign in. Check your email and password.");
    } finally {
      submit.disabled = false;
      submit.innerHTML = 'Sign in securely <span>→</span>';
    }
  });

  (async () => {
    const session = await freshSession();
    if (!session) { setTimeout(() => email?.focus(), 50); return; }
    try {
      if (await isAllowlisted(session)) await open(session);
      else { await signOut(); setTimeout(() => email?.focus(), 50); }
    } catch { await signOut(); setTimeout(() => email?.focus(), 50); }
  })();
}
