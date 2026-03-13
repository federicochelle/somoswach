document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.querySelector("#projects-grid");
  if (!grid) return;

  const lang = window.location.pathname.includes("/en/") ? "en" : "es";
  const projectPage = lang === "en" ? "project.html" : "pages/project.html";

  const { data: projects, error } = await window.supabaseClient
    .from("projects")
    .select("*")
    .eq("published", true);

  if (error) {
    console.error(error);
    return;
  }

  console.log("PROJECTS:", projects);

  grid.innerHTML = projects
    .map((project) => {
      const title = project[`title_${lang}`] || project.title_es || "";
      const client = project.client || "";
      const role = project[`role_${lang}`] || project.role_es || "";

      return `
        <a class="project-card"
          data-category="${project.category}"
          href="${projectPage}?slug=${project.slug}">

          <img src="${project.image}" alt="${title}">

          <div class="project-overlay">
            <div class="project-meta">
              <p class="project-client">${client}</p>
              <h3 class="project-title">${title}</h3>
              <p class="project-role">${role}</p>
            </div>
          </div>

        </a>
      `;
    })
    .join("");
});
