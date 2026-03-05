/* =====================================================
   PROJECTS HERO + CARDS — Cinematic
===================================================== */

/* 1) HERO: cuando entra en viewport + stagger botones */
(() => {
  const hero = document.querySelector(".projects-hero");
  if (!hero) return;

  const btns = Array.from(
    hero.querySelectorAll(".projects-filters .filter-btn"),
  );
  btns.forEach((btn, i) => {
    btn.style.setProperty("--d", `${240 + i * 90}ms`);
  });

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          hero.classList.add("is-inview");
          obs.disconnect();
        }
      });
    },
    { threshold: 0.25 },
  );

  obs.observe(hero);
})();

/* 2) CARDS: reveal on scroll */
(() => {
  const cards = document.querySelectorAll(".project-card");
  if (!cards.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
  );

  cards.forEach((card) => observer.observe(card));
})();

/* 3) FILTERS: al click, filtra + re-reveal con stagger */
(() => {
  const buttons = Array.from(document.querySelectorAll(".filter-btn"));
  const cards = Array.from(document.querySelectorAll(".project-card"));

  if (!buttons.length || !cards.length) return;

  function setActiveButton(btn) {
    buttons.forEach((b) => {
      const active = b === btn;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function applyFilter(filter) {
    const toShow = [];

    cards.forEach((card) => {
      const cat = (card.getAttribute("data-category") || "").toLowerCase();
      const shouldShow = filter === "all" || cat === filter;

      if (shouldShow) {
        card.classList.remove("is-filtered-out");
        card.removeAttribute("aria-hidden");
        card.style.pointerEvents = "";
        toShow.push(card);
      } else {
        card.classList.add("is-filtered-out");
        card.setAttribute("aria-hidden", "true");
        card.style.pointerEvents = "none";
        // por si estaba visible
        card.classList.remove("is-visible");
      }
    });

    // Re-reveal cinematográfico al filtrar (stagger)
    toShow.forEach((card, i) => {
      // reset anim
      card.classList.remove("is-visible");
      // reflow para reiniciar transición
      void card.offsetWidth;
      // delay escalonado
      card.style.transitionDelay = `${i * 55}ms`;
      card.classList.add("is-visible");
    });

    // limpia delays luego para que hover/scroll no se sienta raro
    window.setTimeout(() => {
      toShow.forEach((c) => (c.style.transitionDelay = ""));
    }, 600);
  }

  // handlers
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = (btn.getAttribute("data-filter") || "all").toLowerCase();
      setActiveButton(btn);
      applyFilter(filter);
    });
  });

  // init
  const initialBtn =
    buttons.find((b) => b.classList.contains("is-active")) || buttons[0];
  setActiveButton(initialBtn);
  applyFilter((initialBtn.getAttribute("data-filter") || "all").toLowerCase());
})();
