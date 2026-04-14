(() => {
  const root = document.documentElement;
  const loader = document.getElementById("page-loader");

  function notifyDone() {
    window.dispatchEvent(new CustomEvent("loader:done"));
  }

  if (!loader) {
    root.classList.remove("is-loading");
    root.classList.add("is-ready");
    notifyDone();
    return;
  }

  const VISIBLE_TIME = 2500;
  const FADE_TIME = 320;
  let isClosing = false;

  function closeLoader() {
    if (isClosing) return;
    isClosing = true;

    root.classList.remove("is-loading");
    root.classList.add("is-ready");
    loader.classList.add("is-hiding");

    window.setTimeout(() => {
      loader.remove();
      notifyDone();
    }, FADE_TIME);
  }

  window.setTimeout(closeLoader, VISIBLE_TIME);
})();
