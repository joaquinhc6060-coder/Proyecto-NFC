// Scroll suave a una sección (p. ej. "#catalogo"), descontando el menú fijo.
// Usa Lenis si está activo; respeta prefers-reduced-motion.
export default function scrollToSection(event, target) {
  const el = document.querySelector(target);
  if (!el) return;
  event?.preventDefault();
  const header = document.querySelector('header');
  const offset = header ? header.getBoundingClientRect().bottom : 0;
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (window.vigioLenis) {
    window.vigioLenis.scrollTo(el, { offset: -offset, immediate: reduce });
  } else {
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: reduce ? 'auto' : 'smooth' });
  }
}
