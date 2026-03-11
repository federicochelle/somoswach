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

  function applyFilter(filter) {
    const cards = document.querySelectorAll(".project-card");

    cards.forEach((card) => {
      const category = (card.dataset.category || "").toLowerCase();
      const shouldShow = filter === "all" || category === filter;

      if (shouldShow) {
        card.style.display = "";
        card.removeAttribute("aria-hidden");
      } else {
        card.style.display = "none";
        card.setAttribute("aria-hidden", "true");
      }
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = (btn.dataset.filter || "all").toLowerCase();
      setActiveButton(btn);
      applyFilter(filter);
    });
  });

  const initialBtn =
    buttons.find((b) => b.classList.contains("is-active")) || buttons[0];

  setActiveButton(initialBtn);
  applyFilter((initialBtn.dataset.filter || "all").toLowerCase());
});
