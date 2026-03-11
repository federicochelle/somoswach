document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.querySelector("#projects-grid");
  if (!grid) return;

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
    .map(
      (project) => `
<a class="project-card"
data-category="${project.category}"
href="pages/project.html?slug=${project.slug}">

<img src="${project.image}" alt="${project.title}">

<div class="project-overlay">
<div class="project-meta">

<p class="project-client">${project.client}</p>
<h3 class="project-title">${project.title}</h3>
<p class="project-role">${project.role}</p>

</div>
</div>

</a>
`,
    )
    .join("");
});
