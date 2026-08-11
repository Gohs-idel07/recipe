// Dynamic host detection: uses localhost:3000 if running via Live Server (port 5500), otherwise uses relative paths on Vercel
const API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && window.location.port !== "3000"
  ? "http://localhost:3000"
  : "";

document.addEventListener("DOMContentLoaded", () => {
  const signinForm = document.getElementById("signinForm") || document.getElementById("loginForm");
  const errorMessage = document.getElementById("errorMessage");

  if (signinForm) {
    signinForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      try {
        const response = await fetch(`${API_BASE}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          localStorage.setItem("user", JSON.stringify(data.user));
          window.location.href = "recipe.html";
        } else {
          showError(data.message || "Invalid email or password.");
        }
      } catch (err) {
        showError("Could not connect to server.");
      }
    });
  }

  function showError(msg) {
    if (errorMessage) {
      errorMessage.textContent = msg;
      errorMessage.style.display = "block";
      errorMessage.style.color = "#ff4d4d";
    }
  }
});