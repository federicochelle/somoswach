document.addEventListener("DOMContentLoaded", () => {
  const wrap = document.querySelector(".projects-filters");
  if (!wrap) return;

  const indicator = wrap.querySelector(".filter-indicator");
  const buttons = Array.from(wrap.querySelectorAll(".filter-btn"));
  if (!indicator || !buttons.length) return;

  function getActiveBtn() {
    return (
      wrap.querySelector('.filter-btn[aria-pressed="true"]') ||
      wrap.querySelector(".filter-btn.is-active") ||
      buttons[0]
    );
  }

  function moveIndicatorTo(btn) {
    if (!btn) return;

    wrap.style.setProperty("--fx", `${btn.offsetLeft}px`);
    wrap.style.setProperty("--fy", `${btn.offsetTop}px`);
    wrap.style.setProperty("--fw", `${btn.offsetWidth}px`);
    wrap.style.setProperty("--fh", `${btn.offsetHeight}px`);
    wrap.classList.add("is-ready");
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      requestAnimationFrame(() => moveIndicatorTo(btn));
    });
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => moveIndicatorTo(getActiveBtn()));
  });

  window.addEventListener("resize", () => {
    moveIndicatorTo(getActiveBtn());
  });

  window.addEventListener("load", () => {
    moveIndicatorTo(getActiveBtn());
  });
});
