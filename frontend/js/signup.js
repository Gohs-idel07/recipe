const API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && window.location.port !== "3000"
  ? "http://localhost:3000"
  : "";

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  const errorMessage = document.getElementById("errorMessage");

  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("username")?.value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      try {
        const response = await fetch(`${API_BASE}/api/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          alert("Account created successfully! Please sign in.");
          window.location.href = "signin.html";
        } else {
          showError(data.message || "Sign up failed.");
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