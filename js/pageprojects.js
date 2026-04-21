function normalizeVimeoUrl(rawUrl) {
  const trimmedUrl = String(rawUrl || "").trim();
  if (!trimmedUrl) return "";

  try {
    let url = new URL(trimmedUrl);
    const isVimeoPage =
      /(^|\.)vimeo\.com$/i.test(url.hostname) &&
      !url.hostname.toLowerCase().startsWith("player.");

    if (isVimeoPage) {
      const segments = url.pathname.split("/").filter(Boolean);
      const videoIndex = segments.findIndex((segment) => /^\d+$/.test(segment));
      const videoId = videoIndex >= 0 ? segments[videoIndex] : "";

      if (videoId) {
        const embedUrl = new URL(`https://player.vimeo.com/video/${videoId}`);
        const privateHash =
          url.searchParams.get("h") || segments[videoIndex + 1];

        if (privateHash && !/^\d+$/.test(privateHash)) {
          embedUrl.searchParams.set("h", privateHash);
        }

        url.searchParams.forEach((value, key) => {
          if (key !== "h") embedUrl.searchParams.set(key, value);
        });

        url = embedUrl;
      }
    }

    url.searchParams.set("autopause", "0");
    url.searchParams.set("controls", "0");
    url.searchParams.set("dnt", "1");
    url.searchParams.set("playsinline", "1");

    return url.toString();
  } catch (error) {
    console.warn("URL de Vimeo inválida:", rawUrl, error);
    return trimmedUrl;
  }
}

function parseVideoRatio(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return null;

  const ratioMatch = text.match(/(\d+(?:\.\d+)?)\s*(?::|\/|x)\s*(\d+(?:\.\d+)?)/);
  if (ratioMatch) {
    const width = Number(ratioMatch[1]);
    const height = Number(ratioMatch[2]);

    if (width > 0 && height > 0) {
      return {
        width,
        height,
        label: `${ratioMatch[1]}:${ratioMatch[2]}`,
      };
    }
  }

  if (/(vertical|reel|story|stories|tiktok|short)/.test(text)) {
    return { width: 9, height: 16, label: "9:16" };
  }

  if (/(square|cuadrado)/.test(text)) {
    return { width: 1, height: 1, label: "1:1" };
  }

  if (/(cinema|scope|wide|widescreen)/.test(text)) {
    return { width: 2.35, height: 1, label: "2.35:1" };
  }

  return null;
}

function getProjectVideoRatio(project) {
  const candidates = [
    project.video_ratio,
    project.videoRatio,
    project.aspect_ratio,
    project.aspectRatio,
    project.ratio,
    project.format,
  ];

  for (const candidate of candidates) {
    const ratio = parseVideoRatio(candidate);
    if (ratio) return ratio;
  }

  return { width: 16, height: 9, label: "16:9" };
}

function applyProjectVideoRatio(iframe, project) {
  const wrap = iframe.closest(".project-video-inner");
  if (!wrap) return;

  const ratio = getProjectVideoRatio(project);
  wrap.dataset.ratio = ratio.label;
  wrap.style.setProperty("--video-ratio", String(ratio.width / ratio.height));
  wrap.style.setProperty(
    "--video-ratio-inverse",
    String(ratio.height / ratio.width),
  );
}

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const lang = window.location.pathname.includes("/en/") ? "en" : "es";

  if (!slug) return;

  const { data: projects, error } = await window.supabaseClient
    .from("projects")
    .select("*")
    .eq("published", true)
    .order("position", { ascending: true });

  if (error) {
    console.error("Error cargando projects:", error);
    return;
  }

  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    console.error("Proyecto no encontrado:", slug);
    return;
  }

  const title = project[`title_${lang}`] || project.title_es || "";
  const description =
    project[`description_${lang}`] || project.description_es || "";
  const client = project.client || "";
  const role = project[`role_${lang}`] || project.role_es || "";

  const titleEl = document.querySelector("#project-title");
  const clientEl = document.querySelector("#project-client");
  const descriptionEl = document.querySelector("#project-description");
  const vimeoEl = document.querySelector("#project-vimeo");
  const yearEl = document.querySelector("#project-year");
  const durationEl = document.querySelector("#project-duration");
  const formatEl = document.querySelector("#project-format");
  const platformsEl = document.querySelector("#project-platforms");
  const relatedGrid = document.querySelector("#related-projects-grid");

  document.title = `${client} — ${title} | Wach`;

  if (titleEl) titleEl.textContent = title;
  if (clientEl) clientEl.textContent = client;
  if (descriptionEl) descriptionEl.textContent = description;

  if (vimeoEl) {
    applyProjectVideoRatio(vimeoEl, project);
    vimeoEl.src = normalizeVimeoUrl(project.vimeo);

    setTimeout(() => {
      if (typeof initProjectVimeoPlayer === "function") {
        initProjectVimeoPlayer();
      }
    }, 300);
  }

  if (yearEl) yearEl.textContent = project.year || "";
  if (durationEl) durationEl.textContent = project.duration || "";
  if (formatEl) formatEl.textContent = project.format || "";
  if (platformsEl) platformsEl.textContent = project.platforms || "";

  if (relatedGrid) {
    let related = projects.filter(
      (p) => p.slug !== slug && p.category === project.category,
    );

    if (related.length < 6) {
      const others = projects.filter(
        (p) => p.slug !== slug && p.category !== project.category,
      );

      related = [...related, ...others];
    }

    related = related.slice(0, 6);

    const relatedPage = "project.html";

    relatedGrid.innerHTML = related
      .map((p) => {
        const relatedTitle = p[`title_${lang}`] || p.title_es || "";
        const relatedRole = p[`role_${lang}`] || p.role_es || "";
        const imageUrl = p.image_cf || p.image || "";

        return `
      <a
        class="project-card"
        data-category="${p.category}"
        href="${relatedPage}?slug=${p.slug}"
      >
        <img src="${imageUrl}" alt="${relatedTitle}">

        <div class="project-overlay">
          <div class="project-meta">
            <p class="project-client">${p.client || ""}</p>
            <h3 class="project-title">${relatedTitle}</h3>
            <p class="project-role">${relatedRole}</p>
          </div>
        </div>
      </a>
    `;
      })
      .join("");
  }
});
