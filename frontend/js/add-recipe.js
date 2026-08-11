const API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && window.location.port !== "3000"
  ? "http://localhost:3000"
  : "";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addRecipeForm");
  const grid = document.getElementById("savedRecipesGrid");
  const statusMsg = document.getElementById("statusMessage");

  const modal = document.getElementById("recipeModal");
  const closeModal = document.querySelector(".close-btn");

  let allRecipes = [];

  loadRecipes();

  // Save Recipe
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      statusMsg.textContent = "Saving...";
      statusMsg.style.color = "#555";

      const name = document.getElementById("name").value.trim();
      const category = document.getElementById("category").value;
      const prepTime = document.getElementById("prepTime").value;
      const servings = document.getElementById("servings").value;
      const imageUrl = document.getElementById("imageUrl").value.trim();

      const ingredients = document.getElementById("ingredients").value
        .split("\n").map(i => i.trim()).filter(Boolean);
      const instructions = document.getElementById("instructions").value
        .split("\n").map(i => i.trim()).filter(Boolean);

      try {
        const response = await fetch(`${API_BASE}/api/recipes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            category,
            prepTime: prepTime ? Number(prepTime) : null,
            servings: servings ? Number(servings) : null,
            imageUrl: imageUrl || null,
            ingredients,
            instructions
          })
        });

        const result = await response.json();
        if (result.success) {
          statusMsg.textContent = "✅ Recipe saved successfully!";
          statusMsg.style.color = "green";
          form.reset();
          loadRecipes();
        } else {
          statusMsg.textContent = "❌ " + result.message;
          statusMsg.style.color = "red";
        }
      } catch (err) {
        statusMsg.textContent = "❌ Failed to reach the server.";
        statusMsg.style.color = "red";
      }
    });
  }

  // Load Recipes
  async function loadRecipes() {
    if (!grid) return;
    try {
      const res = await fetch(`${API_BASE}/api/recipes`);
      const data = await res.json();

      if (!data.success || data.recipes.length === 0) {
        grid.innerHTML = "<p style='color:#777;'>No recipes added yet.</p>";
        allRecipes = [];
        return;
      }

      allRecipes = data.recipes;
      grid.innerHTML = "";

      allRecipes.forEach((recipe) => {
        const card = document.createElement("div");
        card.className = "recipe-card";

        const imageHTML = recipe.image_url 
          ? `<img src="${recipe.image_url}" alt="${recipe.name}">` 
          : '';

        card.innerHTML = `
          ${imageHTML}
          <div class="card-body">
            <h3>${recipe.name}</h3>
            <div class="card-meta">${recipe.category} ${recipe.prep_time ? "• " + recipe.prep_time + " mins" : ""}</div>
            <div class="card-actions">
              <button class="view-btn" data-id="${recipe.id}">View Instructions</button>
              <button class="delete-btn" data-id="${recipe.id}">Delete</button>
            </div>
          </div>
        `;
        grid.appendChild(card);
      });
    } catch (err) {
      grid.innerHTML = "<p style='color:red;'>Failed to load saved recipes.</p>";
    }
  }

  // Handle Action Buttons
  if (grid) {
    grid.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      if (e.target.classList.contains("view-btn")) {
        const recipe = allRecipes.find((r) => r.id == id);
        if (recipe) openRecipeModal(recipe);
      }
      if (e.target.classList.contains("delete-btn")) {
        if (confirm("Delete this recipe?")) {
          await fetch(`${API_BASE}/api/recipes/${id}`, { method: "DELETE" });
          loadRecipes();
        }
      }
    });
  }

  function openRecipeModal(recipe) {
    if (!modal) return;
    document.getElementById("modalTitle").textContent = recipe.name;
    document.getElementById("modalCategory").textContent = `${recipe.category} ${recipe.prep_time ? "| Prep: " + recipe.prep_time + " mins" : ""}`;
    document.getElementById("modalImageContainer").innerHTML = recipe.image_url ? `<img src="${recipe.image_url}" class="modal-img">` : '';
    document.getElementById("modalIngredients").innerHTML = recipe.ingredients.map(i => `<li>${i}</li>`).join("");
    document.getElementById("modalInstructions").innerHTML = recipe.instructions.map(i => `<li>${i}</li>`).join("");
    modal.style.display = "block";
  }

  if (closeModal) closeModal.onclick = () => { modal.style.display = "none"; };
  window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
});