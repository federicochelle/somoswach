// Requiere:
// <script src="https://player.vimeo.com/api/player.js"></script>

function initProjectVimeoPlayer() {
  const iframe = document.getElementById("project-vimeo");
  if (!iframe || !window.Vimeo) return;

  const wrap = iframe.closest(".project-video-inner");
  if (!wrap) return;

  if (wrap.dataset.playerReady === "true") return;
  wrap.dataset.playerReady = "true";

  const hitarea = wrap.querySelector(".player-hitarea");
  const btnPlay = wrap.querySelector("[data-play]");
  const btnFs = wrap.querySelector("[data-fullscreen]");
  const volRange = wrap.querySelector("[data-volume]");
  const elTime = wrap.querySelector("[data-time]");
  const elProgress = wrap.querySelector("[data-progress]");
  const bar = wrap.querySelector(".player-range");
  const controls = wrap.querySelector(".player-controls");

  const player = new Vimeo.Player(iframe);

  let duration = 0;
  let uiTimer = null;
  let isPlaying = false;

  // =========================
  // HELPERS
  // =========================

  const pad = (n) => String(n).padStart(2, "0");

  const format = (s) => {
    s = Math.max(0, Math.floor(s || 0));
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${pad(sec)}`;
  };

  const isMobile = () => window.matchMedia("(max-width: 768px)").matches;

  const isNativeFullscreen = () =>
    document.fullscreenElement === wrap ||
    document.webkitFullscreenElement === wrap;

  const setPlayerError = (error, context = "Vimeo player") => {
    console.warn(`${context}:`, error);
    wrap.classList.add("is-error", "ui-active");
  };

  const setPlayingUI = (playing) => {
    isPlaying = playing;
    wrap.classList.toggle("is-playing", playing);
    wrap.classList.toggle("is-paused", !playing);

    if (btnPlay) {
      btnPlay.setAttribute("aria-pressed", String(playing));
      btnPlay.setAttribute("aria-label", playing ? "Pausar" : "Reproducir");
      btnPlay.innerHTML = playing
        ? `<svg viewBox="0 0 24 24" class="player-icon">
           <path d="M6 5h4v14H6zm8 0h4v14h-4z"/>
         </svg>`
        : `<svg viewBox="0 0 24 24" class="player-icon">
           <path d="M8 5v14l11-7z"/>
         </svg>`;
    }
  };

  // =========================
  // VOLUME
  // =========================
  if (volRange) {
    // setear slider según volumen actual del player
    player
      .getVolume()
      .then((v) => {
        volRange.value = String(v ?? 0.8);
      })
      .catch((error) => setPlayerError(error, "No se pudo leer el volumen"));

    // cuando el usuario mueve el slider
    volRange.addEventListener("input", async (e) => {
      showUI();

      const val = Number(e.target.value);

      try {
        await player.setVolume(val);
      } catch (error) {
        setPlayerError(error, "No se pudo cambiar el volumen");
      }
    });

    // evitar que el click pause el video
    volRange.addEventListener("click", (e) => e.stopPropagation());
  }
  // =========================
  // UI VISIBILITY
  // =========================

  const hideUILater = () => {
    clearTimeout(uiTimer);

    uiTimer = setTimeout(() => {
      if (wrap.classList.contains("is-playing")) {
        wrap.classList.remove("ui-active");
      }
    }, 1400);
  };

  const showUI = () => {
    wrap.classList.add("ui-active");
    hideUILater();
  };

  const addRevealListeners = (element) => {
    if (!element) return;

    element.addEventListener("pointermove", showUI);
    element.addEventListener("pointerenter", showUI);
    element.addEventListener("mousemove", showUI);
    element.addEventListener("mouseenter", showUI);
  };

  // =========================
  // FULLSCREEN
  // =========================

  const enterFakeFullscreen = () => {
    wrap.classList.add("is-fs", "ui-active");
    document.body.classList.add("is-locked");
  };

  const exitFakeFullscreen = () => {
    wrap.classList.remove("is-fs");
    document.body.classList.remove("is-locked");
  };

  const enterNativeFullscreen = () => {
    if (isNativeFullscreen()) return;

    const req = wrap.requestFullscreen || wrap.webkitRequestFullscreen;
    if (!req) return;

    try {
      const request = req.call(wrap);
      if (request?.catch) {
        request.catch((error) =>
          setPlayerError(error, "No se pudo entrar en pantalla completa"),
        );
      }
    } catch (error) {
      setPlayerError(error, "No se pudo entrar en pantalla completa");
    }
  };

  const exitNativeFullscreen = () => {
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (!exit) return;

    try {
      const request = exit.call(document);
      if (request?.catch) {
        request.catch((error) =>
          setPlayerError(error, "No se pudo salir de pantalla completa"),
        );
      }
    } catch (error) {
      setPlayerError(error, "No se pudo salir de pantalla completa");
    }
  };

  const enterFullscreen = () => {
    if (isMobile()) {
      enterFakeFullscreen();
      return;
    }

    enterNativeFullscreen();
  };

  const toggleFullscreen = () => {
    if (wrap.classList.contains("is-fs")) {
      exitFakeFullscreen();
      return;
    }

    if (isMobile()) {
      enterFakeFullscreen();
      return;
    }

    if (isNativeFullscreen()) {
      exitNativeFullscreen();
      return;
    }

    enterNativeFullscreen();
  };
  // =========================
  // PLAY / PAUSE
  // =========================

  const togglePlay = async (enterFsOnPlay = false) => {
    showUI();

    try {
      const paused = await player.getPaused();

      if (paused) {
        if (enterFsOnPlay) enterFullscreen();
        await player.play();
      } else {
        await player.pause();
      }
    } catch (error) {
      setPlayerError(error, "No se pudo alternar play/pause");
    }
  };

  // botón play
  if (btnPlay) {
    btnPlay.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isPlaying) enterFullscreen();
      togglePlay(false);
    });
  }

  // click en cualquier parte del video
  if (hitarea) {
    hitarea.addEventListener("click", () => {
      togglePlay(false);
    });
  }

  // si entra a la zona de controles o barra, reaparecen
  addRevealListeners(hitarea);
  addRevealListeners(controls);
  addRevealListeners(bar);

  // botón fullscreen
  if (btnFs) {
    btnFs.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      showUI();
      toggleFullscreen();
    });
  }

  // seek
  if (bar) {
    bar.addEventListener("click", async (e) => {
      e.stopPropagation();
      showUI();

      try {
        if (!duration) duration = await player.getDuration();

        const rect = bar.getBoundingClientRect();
        const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
        const pct = rect.width ? x / rect.width : 0;

        await player.setCurrentTime(pct * duration);
      } catch (error) {
        setPlayerError(error, "No se pudo mover el progreso");
      }
    });
  }

  // =========================
  // INIT
  // =========================

  setPlayingUI(false);
  wrap.classList.add("is-ready", "ui-active");

  player
    .getDuration()
    .then((d) => {
      duration = d || 0;

      if (elTime) {
        elTime.textContent = `0:00 / ${format(duration)}`;
      }
    })
    .catch((error) => setPlayerError(error, "No se pudo leer la duración"));

  // =========================
  // PLAYER EVENTS
  // =========================

  player.on("play", () => {
    setPlayingUI(true);
    hideUILater();
  });

  player.on("pause", () => {
    setPlayingUI(false);
    wrap.classList.add("ui-active");
    clearTimeout(uiTimer);
  });

  player.on("ended", () => {
    setPlayingUI(false);
    wrap.classList.add("ui-active");
    clearTimeout(uiTimer);
  });

  player.on("timeupdate", (data) => {
    if (!duration) duration = data.duration || 0;

    const pct = duration ? (data.seconds / duration) * 100 : 0;

    if (elProgress) {
      elProgress.style.width = `${pct}%`;
    }

    if (elTime) {
      elTime.textContent = `${format(data.seconds)} / ${format(duration)}`;
    }
  });

  document.addEventListener("fullscreenchange", () => {
    if (!isNativeFullscreen()) wrap.classList.add("ui-active");
  });

  document.addEventListener("webkitfullscreenchange", () => {
    if (!isNativeFullscreen()) wrap.classList.add("ui-active");
  });

  window.addEventListener("resize", () => {
    if (!isMobile()) exitFakeFullscreen();
  });

  window.addEventListener("orientationchange", () => {
    window.setTimeout(() => {
      if (!isMobile()) exitFakeFullscreen();
      showUI();
    }, 250);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && wrap.classList.contains("is-fs")) {
      exitFakeFullscreen();
      showUI();
    }
  });
}
