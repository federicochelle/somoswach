document.addEventListener("DOMContentLoaded", () => {
  const buttons = Array.from(document.querySelectorAll(".filter-btn"));
  if (!buttons.length) return;

  function setActiveButton(btn) {
    buttons.forEach((b) => {
      const active = b === btn;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function notifyFilterChange(filter) {
    document.dispatchEvent(
      new CustomEvent("projects:filter-change", {
        detail: { filter },
      }),
    );
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = (btn.dataset.filter || "all").toLowerCase();
      setActiveButton(btn);
      notifyFilterChange(filter);
    });
  });

  const initialBtn =
    buttons.find((b) => b.classList.contains("is-active")) || buttons[0];

  setActiveButton(initialBtn);
  notifyFilterChange((initialBtn.dataset.filter || "all").toLowerCase());
});
