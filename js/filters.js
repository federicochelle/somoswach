/* =====================================================
   PROJECTS HERO — animate when enters viewport
   Compatible con tu loader (html.is-ready)
===================================================== */

(() => {
  const hero = document.querySelector(".projects-hero");
  if (!hero) return;

  const root = document.documentElement;

  const reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    hero.classList.add("is-animated");
    return;
  }

  function startObserver() {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          hero.classList.add("is-animated");

          obs.unobserve(entry.target);
        });
      },
      {
        threshold: 0.35,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    observer.observe(hero);
  }

  // Espera a que el loader termine (html.is-ready)
  if (root.classList.contains("is-ready")) {
    startObserver();
  } else {
    const mo = new MutationObserver(() => {
      if (root.classList.contains("is-ready")) {
        mo.disconnect();
        startObserver();
      }
    });

    mo.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }
})();
/* =====================================================
   PROJECTS: reveal on scroll + filters (con colapso)
   Requiere clases CSS:
   - .project-card
   - .project-card.is-visible
   - .project-card.is-filtered-out
   - .project-card.is-hidden { display:none; }  <-- agregala en CSS
===================================================== */

(() => {
  const cards = Array.from(document.querySelectorAll(".project-card"));
  const buttons = Array.from(document.querySelectorAll(".filter-btn"));

  if (!cards.length) return;

  // -----------------------------
  // Helpers
  // -----------------------------
  const FILTER_FADE_MS = 220; // debe matchear tu CSS (opacity/transform 220ms)

  function setActiveButton(btn) {
    if (!buttons.length) return;

    buttons.forEach((b) => {
      const active = b === btn;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function showCard(card) {
    // la devolvemos al layout
    card.classList.remove("is-hidden");
    // y la hacemos visible (sin estar filtrada)
    card.classList.remove("is-filtered-out");
    card.removeAttribute("aria-hidden");
    card.style.pointerEvents = "";
  }

  function hideCard(card) {
    // primero animamos fade/slide
    card.classList.add("is-filtered-out");
    card.setAttribute("aria-hidden", "true");
    card.style.pointerEvents = "none";

    // luego colapsamos el espacio
    window.setTimeout(() => {
      // si sigue filtrada, recién ahí ocultamos con display:none
      if (card.classList.contains("is-filtered-out")) {
        card.classList.add("is-hidden");
      }
    }, FILTER_FADE_MS);
  }

  function revealVisibleCards() {
    // cuando cambiás de filtro, las que quedan visibles pueden estar abajo sin haber pasado por el observer
    // esto “dispara” is-visible a las que estén en viewport o cerca.
    cards.forEach((card) => {
      if (card.classList.contains("is-hidden")) return;
      if (card.classList.contains("is-filtered-out")) return;

      const rect = card.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;

      // si está dentro (o cerca) del viewport, revelamos
      const inView = rect.top < vh * 0.92 && rect.bottom > 0;
      if (inView) card.classList.add("is-visible");
    });
  }

  function applyFilter(filter) {
    cards.forEach((card) => {
      const cat = (card.getAttribute("data-category") || "").toLowerCase();
      const shouldShow = filter === "all" || cat === filter;

      if (shouldShow) showCard(card);
      else hideCard(card);
    });

    // luego del cambio, aseguramos reveal de las visibles
    // (doble tick para evitar que el browser “pierda” la transición)
    requestAnimationFrame(() => {
      requestAnimationFrame(revealVisibleCards);
    });
  }

  // -----------------------------
  // Reveal on scroll (IntersectionObserver)
  // -----------------------------
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const card = entry.target;

        // si está filtrada/oculta, no la revelamos
        if (card.classList.contains("is-hidden")) return;
        if (card.classList.contains("is-filtered-out")) return;

        if (entry.isIntersecting) {
          card.classList.add("is-visible");
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  cards.forEach((c) => observer.observe(c));

  // -----------------------------
  // Filters (click)
  // -----------------------------
  if (buttons.length) {
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const filter = (btn.getAttribute("data-filter") || "all").toLowerCase();
        setActiveButton(btn);
        applyFilter(filter);
      });
    });

    // Init: respeta el botón activo del HTML
    const initialBtn =
      buttons.find((b) => b.classList.contains("is-active")) || buttons[0];

    setActiveButton(initialBtn);
    applyFilter(
      (initialBtn.getAttribute("data-filter") || "all").toLowerCase(),
    );
  } else {
    // si no hay botones, al menos revelamos lo que está visible
    revealVisibleCards();
  }

  // Si el usuario vuelve atrás/adelante, recalculamos
  window.addEventListener("pageshow", () => {
    requestAnimationFrame(revealVisibleCards);
  });
})();
