document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector("#projects-grid");
  const loadMoreButton = document.querySelector("#projects-load-more");
  const loadMoreWrapper = loadMoreButton?.closest(".projects-actions");
  const projectsTrigger =
    document.querySelector("#projects-hero") || document.querySelector(".projects");
  const projectsHeroBg = document.querySelector(".projects-hero-bg");
  if (!grid) return;

  const lang = window.location.pathname.includes("/en/") ? "en" : "es";
  const projectPage = lang === "en" ? "project.html" : "pages/project.html";
  const INITIAL_PROJECTS_LIMIT = 8;
  const PAGE_SIZE = INITIAL_PROJECTS_LIMIT;

  const state = {
    activeFilter: "all",
    projects: [],
    visibleCount: PAGE_SIZE,
    isLoaded: false,
    isLoading: false,
  };

  function getActiveFilterFromDOM() {
    const activeButton = document.querySelector(
      '.filter-btn[aria-pressed="true"], .filter-btn.is-active',
    );

    return (activeButton?.dataset.filter || "all").toLowerCase();
  }

  function getFilteredProjects() {
    if (state.activeFilter === "all") return state.projects;

    return state.projects.filter((project) => {
      return (project.category || "").toLowerCase() === state.activeFilter;
    });
  }

  function createProjectCard(project) {
    const title = project[`title_${lang}`] || project.title_es || "";
    const client = project.client || "";
    const role = project[`role_${lang}`] || project.role_es || "";
    const imageUrl = window.publicProjectsData.getProjectImageUrl(project);

    return `
      <a class="project-card"
        data-category="${project.category || ""}"
        href="${projectPage}?slug=${project.slug}">

        <img
          src="${imageUrl}"
          alt="${title}"
          loading="lazy"
          decoding="async"
          fetchpriority="low"
          width="1600"
          height="900"
        >

        <div class="project-overlay">
          <div class="project-meta">
            <p class="project-client">${client}</p>
            <h3 class="project-title">${title}</h3>
            <p class="project-role">${role}</p>
          </div>
        </div>

      </a>
    `;
  }

  function updateLoadMoreButton(filteredProjects) {
    if (!loadMoreButton) return;

    const hasMore = filteredProjects.length > state.visibleCount;
    if (loadMoreWrapper) loadMoreWrapper.hidden = !hasMore;
    loadMoreButton.hidden = !hasMore;
    loadMoreButton.disabled = !hasMore;
  }

  function renderProjects() {
    const filteredProjects = getFilteredProjects();
    const visibleProjects = filteredProjects.slice(0, state.visibleCount);

    grid.innerHTML = visibleProjects
      .map((project) => createProjectCard(project))
      .join("");

    updateLoadMoreButton(filteredProjects);
  }

  function observeProjectsHeroBackground() {
    if (!projectsHeroBg || projectsHeroBg.classList.contains("loaded")) return;

    if (!("IntersectionObserver" in window)) {
      projectsHeroBg.classList.add("loaded");
      return;
    }

    const backgroundObserver = new IntersectionObserver(
      (entries, obs) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;

        projectsHeroBg.classList.add("loaded");
        obs.disconnect();
      },
      {
        rootMargin: "200px 0px",
      },
    );

    backgroundObserver.observe(projectsHeroBg);
  }

  document.addEventListener("projects:filter-change", (event) => {
    state.activeFilter = (event.detail?.filter || "all").toLowerCase();
    state.visibleCount = PAGE_SIZE;
    renderProjects();
  });

  loadMoreButton?.addEventListener("click", () => {
    state.visibleCount += PAGE_SIZE;
    renderProjects();
  });

  async function loadProjects() {
    if (state.isLoaded || state.isLoading) return;
    state.isLoading = true;
    const projects = await window.publicProjectsData.fetchPublicProjects();

    state.isLoading = false;

    if (!projects.length) {
      if (loadMoreWrapper) loadMoreWrapper.hidden = true;
      loadMoreButton?.setAttribute("hidden", "");
    }

    state.projects = projects;
    state.activeFilter = getActiveFilterFromDOM();
    state.isLoaded = true;
    renderProjects();
  }

  if (!projectsTrigger || !("IntersectionObserver" in window)) {
    observeProjectsHeroBackground();
    loadProjects();
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      const entry = entries[0];
      if (!entry?.isIntersecting) return;

      obs.disconnect();
      loadProjects();
    },
    {
      rootMargin: "100px 0px",
    },
  );

  observer.observe(projectsTrigger);
  observeProjectsHeroBackground();
});
