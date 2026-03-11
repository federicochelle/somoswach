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

  const setPlayingUI = (playing) => {
    wrap.classList.toggle("is-playing", playing);

    if (btnPlay) {
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
    player.getVolume().then((v) => {
      volRange.value = String(v ?? 0.8);
    });

    // cuando el usuario mueve el slider
    volRange.addEventListener("input", async (e) => {
      showUI();

      const val = Number(e.target.value);

      await player.setVolume(val);
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

  const showUIOnly = () => {
    wrap.classList.add("ui-active");
    hideUILater();
  };

  // =========================
  // FULLSCREEN
  // =========================

  const enterFullscreen = () => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    if (isMobile) {
      wrap.classList.add("is-fs");
      document.body.classList.add("is-locked");
      return;
    }

    const isFs = document.fullscreenElement || document.webkitFullscreenElement;

    if (isFs) return;

    const req = wrap.requestFullscreen || wrap.webkitRequestFullscreen;

    if (req) req.call(wrap);
  };

  const toggleFullscreen = () => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    if (isMobile) {
      const isFakeFs = wrap.classList.contains("is-fs");

      wrap.classList.toggle("is-fs", !isFakeFs);
      document.body.classList.toggle("is-locked", !isFakeFs);

      return;
    }

    const isFs = document.fullscreenElement || document.webkitFullscreenElement;

    if (!isFs) {
      const req = wrap.requestFullscreen || wrap.webkitRequestFullscreen;

      if (req) req.call(wrap);
    } else {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;

      if (exit) exit.call(document);
    }
  };
  // =========================
  // PLAY / PAUSE
  // =========================

  const togglePlay = async (enterFsOnPlay = false) => {
    showUIOnly();

    const paused = await player.getPaused();

    if (paused) {
      if (enterFsOnPlay) enterFullscreen();
      await player.play();
    } else {
      await player.pause();
    }
  };

  // botón play
  if (btnPlay) {
    btnPlay.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      togglePlay(true);
    });
  }

  // click en cualquier parte del video
  if (hitarea) {
    hitarea.addEventListener("click", () => {
      togglePlay(false);
    });

    hitarea.addEventListener("mousemove", showUIOnly);
    hitarea.addEventListener("mouseenter", showUIOnly);
  }

  // si entra a la zona de controles o barra, reaparecen
  if (controls) {
    controls.addEventListener("mousemove", showUIOnly);
    controls.addEventListener("mouseenter", showUIOnly);
  }

  if (bar) {
    bar.addEventListener("mousemove", showUIOnly);
    bar.addEventListener("mouseenter", showUIOnly);
  }

  // botón fullscreen
  if (btnFs) {
    btnFs.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      showUIOnly();
      toggleFullscreen();
    });
  }

  // seek
  if (bar) {
    bar.addEventListener("click", async (e) => {
      e.stopPropagation();
      showUIOnly();

      if (!duration) duration = await player.getDuration();

      const rect = bar.getBoundingClientRect();
      const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
      const pct = rect.width ? x / rect.width : 0;

      player.setCurrentTime(pct * duration).catch(() => {});
    });
  }

  // =========================
  // INIT
  // =========================

  player.getDuration().then((d) => {
    duration = d || 0;

    if (elTime) {
      elTime.textContent = `0:00 / ${format(duration)}`;
    }
  });

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
}
