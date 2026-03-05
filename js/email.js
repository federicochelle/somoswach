const emailBtn = document.querySelector(".copy-email");
const emailText = document.getElementById("email-address");

emailBtn.addEventListener("click", () => {
  const email = emailText.textContent.trim();

  navigator.clipboard.writeText(email);

  const original = emailText.textContent;

  emailText.textContent = "Email copiado ✓";

  setTimeout(() => {
    emailText.textContent = original;
  }, 2000);
});
