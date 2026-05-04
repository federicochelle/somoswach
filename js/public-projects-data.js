const PROJECTS_DATA_URL = "/assets/data/projects.json";

function normalizeProjects(projects) {
  if (!Array.isArray(projects)) return [];

  return projects
    .map((project) => ({
      ...project,
      published: project.published === true || project.published === "true",
      position:
        project.position === null ||
        project.position === undefined ||
        String(project.position).trim() === ""
          ? 9999
          : Number(project.position),
    }))
    .filter((project) => project.published)
    .sort((a, b) => a.position - b.position);
}

async function fetchPublicProjects() {
  try {
    const response = await fetch(PROJECTS_DATA_URL);

    if (!response.ok) {
      console.error(
        `Error cargando proyectos públicos: ${response.status} ${response.statusText}`,
      );
      return [];
    }

    const payload = await response.json();
    const projects = Array.isArray(payload) ? payload : payload?.projects;
    return normalizeProjects(projects);
  } catch (error) {
    console.error("Error cargando proyectos públicos:", error);
    return [];
  }
}

function getProjectImageUrl(project) {
  return project.image_cf || "";
}

window.publicProjectsData = {
  fetchPublicProjects,
  getProjectImageUrl,
  normalizeProjects,
};
