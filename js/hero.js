(() => {
  const root = document.documentElement;
  const hero = document.querySelector("#hero");
  if (!hero) return;

  const video = hero.querySelector("[data-hero-video]");
  const fill = document.querySelector("#hero-progress-fill");
  if (!video || !fill) return;

  // Ahorro de datos / reduce motion => no autoplay, queda en poster
  const saveData = navigator.connection && navigator.connection.saveData;
  const reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let loaderDone = !document.getElementById("page-loader");
  let playbackFailed = false;
  let playAttempted = false;

  function setProgress(p) {
    const clamped = Math.max(0, Math.min(1, p));
    fill.style.transform = `scaleX(${clamped})`;
  }

  function setStaticState() {
    playbackFailed = true;
    hero.classList.add("hero--static");
    setProgress(0);
    try {
      video.pause();
    } catch {}
  }

  if (saveData || reduceMotion) {
    setStaticState();
    return;
  }

  function syncProgress() {
    const d = video.duration;
    if (Number.isFinite(d) && d > 0) {
      setProgress(video.currentTime / d);
    } else {
      setProgress(0);
    }
  }

  async function playHero() {
    if (!loaderDone || playbackFailed || document.hidden) return;
    if (playAttempted && !video.paused) return;

    playAttempted = true;

    try {
      await video.play();
      hero.classList.remove("hero--static");
      syncProgress();
    } catch (error) {
      console.warn("Hero autoplay failed:", error);
      setStaticState();
    }
  }

  video.addEventListener("loadedmetadata", () => {
    setProgress(0);
  });

  video.addEventListener("timeupdate", () => {
    syncProgress();
  });

  video.addEventListener("ended", () => {
    setProgress(0);
  });

  video.addEventListener("seeking", () => {
    syncProgress();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      try {
        video.pause();
      } catch {}
    } else {
      playHero();
    }
  });

  window.addEventListener(
    "loader:done",
    () => {
      loaderDone = true;
      playHero();
    },
    { once: true },
  );

  if (root.classList.contains("is-ready") || loaderDone) {
    loaderDone = true;
    playHero();
  }
})();
