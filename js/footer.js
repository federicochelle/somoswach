/* =====================================================
   FOOTER CONTACT — reveal on viewport (stagger)
   Requiere:
   - <footer id="contacto" class="footer"> ...
   - .footer-contact-title
   - .footer-links-contact li
===================================================== */
(() => {
  const footer = document.querySelector("#contacto, #footer");
  if (!footer) return;

  const reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const title = footer.querySelector(".footer-contact-title");
  const items = Array.from(footer.querySelectorAll(".footer-links-contact li"));

  // Si no hay nada que animar, salimos
  if (!title && items.length === 0) return;

  // Si reduce motion: mostrar todo directo
  if (reduceMotion) return;

  // Evitar doble init
  if (footer.dataset.revealInit === "1") return;
  footer.dataset.revealInit = "1";

  // Estado inicial (sin tocar tu CSS)
  const initial = (el) => {
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(10px)";
    el.style.transition =
      "opacity 700ms ease, transform 900ms cubic-bezier(0.22, 1, 0.36, 1)";
    el.style.willChange = "opacity, transform";
  };

  const show = (el, delay = 0) => {
    if (!el) return;
    el.style.transitionDelay = `${delay}ms`;
    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
  };

  initial(title);
  items.forEach(initial);

  let played = false;

  const play = () => {
    if (played) return;
    played = true;

    // Title primero
    show(title, 0);

    // Stagger items
    items.forEach((li, i) => {
      show(li, 120 + i * 110);
    });
  };

  // Observer: dispara cuando entra el footer en viewport
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          play();
          io.disconnect();
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -15% 0px",
    },
  );

  io.observe(footer);

  // Por si el usuario vuelve con BFCache
  window.addEventListener("pageshow", () => {
    // Si ya se animó, no re-animar
    if (played) return;

    // Si ya está visible, disparar
    const rect = footer.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < vh * 0.9 && rect.bottom > 0) play();
  });
})();
