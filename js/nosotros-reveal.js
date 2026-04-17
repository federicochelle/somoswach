(() => {
  const page = document.querySelector(".page-about");
  if (!page) return;

  page.classList.remove("page-about--static");

  const reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const targets = Array.from(page.querySelectorAll(".reveal-section")).filter(
    (node, index, array) => node && array.indexOf(node) === index,
  );

  if (targets.length === 0) return;

  const reveal = (node) => node.classList.add("is-visible");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    targets.forEach(reveal);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -12% 0px",
    },
  );

  targets.forEach((target) => observer.observe(target));
})();
