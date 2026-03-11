// admin-projects.js
let currentProjectId = null;

async function loadAdminProjects() {
  const listEl = document.querySelector("#admin-projects-list");
  if (!listEl) return;

  const { data, error } = await window.supabaseClient
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  listEl.innerHTML = data
    .map(
      (p) => `
        <button type="button" class="admin-project-item" data-id="${p.id}">
          ${p.client} — ${p.title}
        </button>
      `,
    )
    .join("");

  listEl.querySelectorAll(".admin-project-item").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      const { data: rows, error: oneError } = await window.supabaseClient
        .from("projects")
        .select("*")
        .eq("id", id)
        .limit(1);

      if (oneError || !rows?.length) return;

      fillProjectForm(rows[0]);
    });
  });
}

function fillProjectForm(project) {
  currentProjectId = project.id;

  document.querySelector("#f-client").value = project.client || "";
  document.querySelector("#f-title").value = project.title || "";
  document.querySelector("#f-role").value = project.role || "";
  document.querySelector("#f-category").value = project.category || "";
  document.querySelector("#f-description").value = project.description || "";
  document.querySelector("#f-vimeo").value = project.vimeo || "";
  document.querySelector("#f-year").value = project.year || "";
  document.querySelector("#f-duration").value = project.duration || "";
  document.querySelector("#f-format").value = project.format || "";
  document.querySelector("#f-platforms").value = project.platforms || "";
  document.querySelector("#f-published").checked = !!project.published;
  document.querySelector("#f-image").value = project.image || "";
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#admin-project-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      client: document.querySelector("#f-client").value.trim(),
      title: document.querySelector("#f-title").value.trim(),
      role: document.querySelector("#f-role").value.trim(),
      category: document.querySelector("#f-category").value.trim(),
      description: document.querySelector("#f-description").value.trim(),
      vimeo: document.querySelector("#f-vimeo").value.trim(),
      year: document.querySelector("#f-year").value.trim(),
      duration: document.querySelector("#f-duration").value.trim(),
      format: document.querySelector("#f-format").value.trim(),
      platforms: document.querySelector("#f-platforms").value.trim(),
      published: document.querySelector("#f-published").checked,
      image: document.querySelector("#f-image").value.trim(),
    };

    let result;

    if (currentProjectId) {
      result = await window.supabaseClient
        .from("projects")
        .update(payload)
        .eq("id", currentProjectId)
        .select();
    } else {
      payload.slug = crypto.randomUUID().slice(0, 8);
      result = await window.supabaseClient
        .from("projects")
        .insert(payload)
        .select();
    }

    if (result.error) {
      alert(result.error.message);
      return;
    }

    alert("Guardado");
    loadAdminProjects();
  });
});

async function loadAdminProjects() {
  const list = document.querySelector("#admin-projects-list");

  const { data, error } = await window.supabaseClient
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  list.innerHTML = data
    .map(
      (p) => `
      <button class="admin-project-item" data-id="${p.id}">
        ${p.client} — ${p.title}
      </button>
    `,
    )
    .join("");

  document.querySelectorAll(".admin-project-item").forEach((btn) => {
    btn.addEventListener("click", () => loadProject(btn.dataset.id));
  });
}

async function loadProject(id) {
  const { data, error } = await window.supabaseClient
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  document.querySelector("#f-client").value = data.client || "";
  document.querySelector("#f-title").value = data.title || "";
  document.querySelector("#f-role").value = data.role || "";
  document.querySelector("#f-category").value = data.category || "";
  document.querySelector("#f-description").value = data.description || "";
  document.querySelector("#f-vimeo").value = data.vimeo || "";
  document.querySelector("#f-year").value = data.year || "";
  document.querySelector("#f-duration").value = data.duration || "";
  document.querySelector("#f-format").value = data.format || "";
  document.querySelector("#f-platforms").value = data.platforms || "";
  document.querySelector("#f-published").checked = data.published || false;
  document.querySelector("#f-image").value = data.image || "";

  window.currentProjectId = data.id;
}
loadAdminProjects();
