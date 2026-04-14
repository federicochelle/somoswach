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
    vimeoEl.src = project.vimeo;

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
