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
