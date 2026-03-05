(() => {
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

  if (saveData || reduceMotion) {
    try {
      video.pause();
    } catch {}
    fill.style.transform = "scaleX(0)";
    return;
  }

  // Asegurar loop (por si no lo pusiste en HTML)
  video.loop = true;

  let rafId = null;

  function setProgress(p) {
    const clamped = Math.max(0, Math.min(1, p));
    fill.style.transform = `scaleX(${clamped})`;
  }

  function tick() {
    const d = video.duration;
    if (Number.isFinite(d) && d > 0) {
      setProgress(video.currentTime / d);
    } else {
      // si todavía no hay duración (metadata), mantenemos 0
      setProgress(0);
    }
    rafId = requestAnimationFrame(tick);
  }

  async function safePlay() {
    try {
      const p = video.play();
      if (p && typeof p.catch === "function") await p.catch(() => {});
    } catch {}
  }

  function start() {
    if (rafId) return;
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    if (!rafId) return;
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  // Cuando cargan metadatos, ya tenemos duration
  video.addEventListener("loadedmetadata", () => {
    setProgress(0);
  });

  // Si el video termina (por si loop falla), reiniciamos
  video.addEventListener("ended", () => {
    setProgress(0);
  });

  // Si el usuario scrubea/pausa, igual sigue mostrando estado correcto
  video.addEventListener("seeking", () => {
    const d = video.duration;
    if (Number.isFinite(d) && d > 0) setProgress(video.currentTime / d);
  });

  // Pausar si la pestaña no está visible
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stop();
      try {
        video.pause();
      } catch {}
    } else {
      safePlay();
      start();
    }
  });

  // Inicial
  // Importante: iOS a veces necesita "muted + playsinline" (ya lo tenés)
  safePlay();
  start();
})();
