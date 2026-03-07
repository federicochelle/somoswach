const switchBtn = document.getElementById("lang-switch");

switchBtn.addEventListener("click", () => {
  const es = switchBtn.querySelector(".lang-es");
  const en = switchBtn.querySelector(".lang-en");
  const flag = switchBtn.querySelector(".lang-flag");

  es.classList.toggle("active");
  en.classList.toggle("active");

  if (es.classList.contains("active")) {
    flag.src = "assets/";
  } else {
    flag.src = "assets/flag-us.svg";
  }
});
const langDropdown = document.querySelector(".lang-dropdown");
const langCurrent = document.getElementById("lang-current");

langCurrent.addEventListener("click", () => {
  langDropdown.classList.toggle("open");

  const expanded = langCurrent.getAttribute("aria-expanded") === "true";
  langCurrent.setAttribute("aria-expanded", String(!expanded));
});

document.addEventListener("click", (e) => {
  if (!langDropdown.contains(e.target)) {
    langDropdown.classList.remove("open");
    langCurrent.setAttribute("aria-expanded", "false");
  }
});
