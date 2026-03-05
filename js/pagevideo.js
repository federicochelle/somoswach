// Requiere:
// <script src="https://player.vimeo.com/api/player.js"></script>
// y tu HTML con iframe#vimeo-player + data-* como lo pasaste.

(() => {
  const iframe = document.getElementById("vimeo-player");
  if (!iframe || !window.Vimeo) return;

  const wrap = iframe.closest(".project-video-inner");
  if (!wrap) return;

  const ui = wrap.querySelector("[data-player-ui]");
  const btnPlays = Array.from(wrap.querySelectorAll("[data-play]"));
  const btnMute = wrap.querySelector("[data-mute]");
  const btnFs = wrap.querySelector("[data-fullscreen]");
  const elTime = wrap.querySelector("[data-time]");
  const elProgress = wrap.querySelector("[data-progress]");
  const bar = wrap.querySelector(".player-range");

  const player = new Vimeo.Player(iframe);

  let isMuted = false;
  let duration = 0;

  // Helpers
  const pad2 = (n) => String(n).padStart(2, "0");
  const fmt = (s) => {
    s = Math.max(0, Math.floor(s || 0));
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${pad2(sec)}`;
  };

  const setPlayingUI = (playing) => {
    wrap.classList.toggle("is-playing", playing);
    // iconos simples (si querés los cambiás por SVG)
    btnPlays.forEach((b) => (b.textContent = playing ? "❚❚" : "▶"));
  };

  const setMuteUI = (muted) => {
    isMuted = muted;
    if (btnMute) btnMute.textContent = muted ? "🔇" : "🔊";
  };

  // Mostrar UI en interacción
  let uiTimer;
  const showUI = () => {
    wrap.classList.add("ui-active");
    clearTimeout(uiTimer);
    uiTimer = setTimeout(() => wrap.classList.remove("ui-active"), 1600);
  };

  // Init
  player.getDuration().then((d) => {
    duration = d || 0;
    if (elTime) elTime.textContent = `0:00 / ${fmt(duration)}`;
  });

  // Play/Pause
  const togglePlay = async () => {
    showUI();
    const paused = await player.getPaused();
    if (paused) await player.play();
    else await player.pause();
  };

  btnPlays.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      togglePlay();
    });
  });

  // Mute
  if (btnMute) {
    btnMute.addEventListener("click", async (e) => {
      e.preventDefault();
      showUI();
      const vol = await player.getVolume();
      const muted = vol === 0;
      if (muted) {
        await player.setVolume(0.8);
        setMuteUI(false);
      } else {
        await player.setVolume(0);
        setMuteUI(true);
      }
    });
  }

  // Fullscreen
  if (btnFs) {
    btnFs.addEventListener("click", async (e) => {
      e.preventDefault();
      showUI();

      // Fullscreen al contenedor para que parezca player propio
      const el = wrap;
      const isFs =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;

      if (!isFs) {
        const req =
          el.requestFullscreen ||
          el.webkitRequestFullscreen ||
          el.mozRequestFullScreen ||
          el.msRequestFullscreen;
        if (req) req.call(el);
      } else {
        const exit =
          document.exitFullscreen ||
          document.webkitExitFullscreen ||
          document.mozCancelFullScreen ||
          document.msExitFullscreen;
        if (exit) exit.call(document);
      }
    });
  }

  // Click en la barra para seek
  if (bar) {
    bar.addEventListener("click", async (e) => {
      showUI();
      if (!duration) duration = (await player.getDuration()) || 0;
      const rect = bar.getBoundingClientRect();
      const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
      const pct = rect.width ? x / rect.width : 0;
      const t = pct * duration;
      player.setCurrentTime(t).catch(() => {});
    });
  }

  // Eventos de Vimeo
  player.on("play", () => setPlayingUI(true));
  player.on("pause", () => setPlayingUI(false));
  player.on("ended", () => setPlayingUI(false));

  player.on("timeupdate", (data) => {
    showUI();
    if (!duration) duration = data.duration || 0;

    const pct = duration ? (data.seconds / duration) * 100 : 0;
    if (elProgress) elProgress.style.width = `${pct.toFixed(3)}%`;

    if (elTime) {
      elTime.textContent = `${fmt(data.seconds)} / ${fmt(duration)}`;
    }
  });

  // Arrancar estado de mute UI según volumen actual
  player.getVolume().then((v) => setMuteUI(v === 0));

  // Si el usuario mueve el mouse, mostramos UI un toque
  wrap.addEventListener("mousemove", showUI);
})();
