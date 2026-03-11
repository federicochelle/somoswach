// admin-upload.js
document.addEventListener("DOMContentLoaded", () => {
  const input = document.querySelector("#f-image-file");
  const imageUrlEl = document.querySelector("#f-image");

  if (!input || !imageUrlEl) return;

  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const path = `projects/${fileName}`;

    const { error } = await window.supabaseClient.storage
      .from("projects")
      .upload(path, file);

    if (error) {
      alert(error.message);
      return;
    }

    const { data } = window.supabaseClient.storage
      .from("projects")
      .getPublicUrl(path);

    imageUrlEl.value = data.publicUrl;
  });
});
