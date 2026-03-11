document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  if (!slug) return;

  const { data: projects, error } = await window.supabaseClient
    .from("projects")
    .select("*")
    .eq("published", true);

  if (error) {
    console.error("Error cargando projects:", error);
    return;
  }

  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    console.error("Proyecto no encontrado:", slug);
    return;
  }

  const titleEl = document.querySelector("#project-title");
  const clientEl = document.querySelector("#project-client");
  const descriptionEl = document.querySelector("#project-description");
  const vimeoEl = document.querySelector("#project-vimeo");
  const yearEl = document.querySelector("#project-year");
  const durationEl = document.querySelector("#project-duration");
  const formatEl = document.querySelector("#project-format");
  const platformsEl = document.querySelector("#project-platforms");
  const relatedGrid = document.querySelector("#related-projects-grid");

  document.title = `${project.client} — ${project.title} | Wach`;

  if (titleEl) titleEl.textContent = project.title;
  if (clientEl) clientEl.textContent = project.client;
  if (descriptionEl) descriptionEl.textContent = project.description;
  if (vimeoEl) vimeoEl.src = project.vimeo;
  if (yearEl) yearEl.textContent = project.year;
  if (durationEl) durationEl.textContent = project.duration;
  if (formatEl) formatEl.textContent = project.format;
  if (platformsEl) platformsEl.textContent = project.platforms;

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

    relatedGrid.innerHTML = related
      .map(
        (p) => `
          <a
            class="project-card"
            data-category="${p.category}"
            href="project.html?slug=${p.slug}"
          >
            <img src="${p.image}" alt="${p.title}">

            <div class="project-overlay">
              <div class="project-meta">
                <p class="project-client">${p.client}</p>
                <h3 class="project-title">${p.title}</h3>
                <p class="project-role">${p.role}</p>
              </div>
            </div>
          </a>
        `,
      )
      .join("");
  }
});
