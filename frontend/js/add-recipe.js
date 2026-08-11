document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addRecipeForm");
  const grid = document.getElementById("savedRecipesGrid");
  const statusMsg = document.getElementById("statusMessage");

  // Modal Elements
  const modal = document.getElementById("recipeModal");
  const closeModal = document.querySelector(".close-btn");
  const modalTitle = document.getElementById("modalTitle");
  const modalCategory = document.getElementById("modalCategory");
  const modalImgContainer = document.getElementById("modalImageContainer");
  const modalIngredients = document.getElementById("modalIngredients");
  const modalInstructions = document.getElementById("modalInstructions");

  let allRecipes = [];

  loadRecipes();

  // Save Form Handler
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
      .split("\n").map((item) => item.trim()).filter(Boolean);

    const instructions = document.getElementById("instructions").value
      .split("\n").map((item) => item.trim()).filter(Boolean);

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          prepTime: prepTime ? Number(prepTime) : null,
          servings: servings ? Number(servings) : null,
          imageUrl: imageUrl || null, // Will save null if empty
          ingredients,
          instructions,
        }),
      });

      const result = await response.json();

      if (result.success) {
        statusMsg.textContent = "✅ Recipe saved successfully!";
        statusMsg.style.color = "green";
        form.reset();
        loadRecipes();
      } else {
        statusMsg.textContent = "❌ Error: " + result.message;
        statusMsg.style.color = "red";
      }
    } catch (err) {
      statusMsg.textContent = "❌ Failed to reach the server.";
      statusMsg.style.color = "red";
    }
  });

  // Fetch and Render
  async function loadRecipes() {
    try {
      const res = await fetch("/api/recipes");
      const data = await res.json();

      if (!data.success || data.recipes.length === 0) {
        grid.innerHTML = "<p style='color:#777;'>No recipes added yet. Create your first one above!</p>";
        allRecipes = [];
        return;
      }

      allRecipes = data.recipes;
      grid.innerHTML = "";

      allRecipes.forEach((recipe) => {
        const card = document.createElement("div");
        card.className = "recipe-card";

        // ONLY render image if imageUrl was actually provided
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

  // Handle Clicks (View Details & Delete)
  grid.addEventListener("click", async (e) => {
    const id = e.target.dataset.id;

    if (e.target.classList.contains("view-btn")) {
      const recipe = allRecipes.find((r) => r.id == id);
      if (recipe) openRecipeModal(recipe);
    }

    if (e.target.classList.contains("delete-btn")) {
      if (confirm("Are you sure you want to delete this recipe?")) {
        await fetch(`/api/recipes/${id}`, { method: "DELETE" });
        loadRecipes();
      }
    }
  });

  // Modal Open Logic
  function openRecipeModal(recipe) {
    modalTitle.textContent = recipe.name;
    modalCategory.textContent = `${recipe.category} ${recipe.prep_time ? " | Prep: " + recipe.prep_time + " mins" : ""}`;
    
    modalImgContainer.innerHTML = recipe.image_url 
      ? `<img src="${recipe.image_url}" class="modal-img" alt="${recipe.name}">` 
      : '';

    modalIngredients.innerHTML = recipe.ingredients.map(ing => `<li>${ing}</li>`).join("");
    modalInstructions.innerHTML = recipe.instructions.map(ins => `<li>${ins}</li>`).join("");

    modal.style.display = "block";
  }

  // Modal Close Logic
  closeModal.onclick = () => { modal.style.display = "none"; };
  window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
});