/**
 * animations.js — Scroll reveal + subtle card tilt.
 * Respects prefers-reduced-motion.
 */
export function initReveal() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const els = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
    }),
    { threshold: 0.12 }
  );
  els.forEach((el) => io.observe(el));
}

/** Subtle 3D tilt on project cards (pointer devices only). */
export function initTilt(scope = document) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !window.matchMedia("(pointer: fine)").matches) return;
  scope.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `translateY(-6px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });
}
