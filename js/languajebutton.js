const switchBtn = document.getElementById("lang-switch");

switchBtn.addEventListener("click", () => {
  const es = switchBtn.querySelector(".lang-es");
  const en = switchBtn.querySelector(".lang-en");

  es.classList.toggle("active");
  en.classList.toggle("active");
});
