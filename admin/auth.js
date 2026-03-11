// admin-auth.js
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector("#admin-login-form");
  const emailEl = document.querySelector("#admin-email");
  const passEl = document.querySelector("#admin-password");
  const loginBox = document.querySelector("#admin-login");
  const panelBox = document.querySelector("#admin-panel");
  const logoutBtn = document.querySelector("#admin-logout");

  async function checkSession() {
    const { data } = await window.supabaseClient.auth.getUser();
    const loggedIn = !!data?.user;

    if (loginBox) loginBox.hidden = loggedIn;
    if (panelBox) panelBox.hidden = !loggedIn;

    if (loggedIn && typeof loadAdminProjects === "function") {
      loadAdminProjects();
    }
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const { error } = await window.supabaseClient.auth.signInWithPassword({
        email: emailEl.value.trim(),
        password: passEl.value,
      });

      if (error) {
        alert(error.message);
        return;
      }

      await checkSession();
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await window.supabaseClient.auth.signOut();
      await checkSession();
    });
  }

  checkSession();
});
