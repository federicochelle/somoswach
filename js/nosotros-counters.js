(() => {
  const statsSection = document.querySelector(".about-stats");
  if (!statsSection) return;

  const counters = Array.from(statsSection.querySelectorAll(".stat-number[data-target]"));
  if (counters.length === 0) return;

  const reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const formatValue = (value, prefix = "", suffix = "") =>
    `${prefix}${Math.round(value)}${suffix}`;

  if (reduceMotion) {
    counters.forEach((counter) => {
      const target = Number(counter.dataset.target || 0);
      counter.textContent = formatValue(
        target,
        counter.dataset.prefix || "",
        counter.dataset.suffix || "",
      );
    });
    return;
  }

  let hasPlayed = false;

  const animateCounter = (counter, index) => {
    const target = Number(counter.dataset.target || 0);
    const prefix = counter.dataset.prefix || "";
    const suffix = counter.dataset.suffix || "";
    const duration = 1200 + index * 160;
    const start = performance.now();

    counter.textContent = formatValue(0, prefix, suffix);

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;

      counter.textContent = formatValue(current, prefix, suffix);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        counter.textContent = formatValue(target, prefix, suffix);
      }
    };

    requestAnimationFrame(tick);
  };

  const playCounters = () => {
    if (hasPlayed) return;
    hasPlayed = true;
    counters.forEach(animateCounter);
  };

  counters.forEach((counter) => {
    const prefix = counter.dataset.prefix || "";
    const suffix = counter.dataset.suffix || "";
    counter.textContent = formatValue(0, prefix, suffix);
  });

  if (!("IntersectionObserver" in window)) {
    playCounters();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          playCounters();
          observer.disconnect();
        }
      });
    },
    {
      threshold: 0.35,
      rootMargin: "0px 0px -10% 0px",
    },
  );

  observer.observe(statsSection);
})();
