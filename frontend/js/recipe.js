document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("recipeGrid"); // Ensure your HTML contains <div id="recipeGrid"></div>

  async function loadRecipes() {
    try {
      const res = await fetch("/api/recipes");
      const data = await res.json();

      if (!data.success || data.recipes.length === 0) {
        grid.innerHTML = "<p>No custom recipes found. Add one!</p>";
        return;
      }

      grid.innerHTML = "";
      data.recipes.forEach((recipe) => {
        const card = document.createElement("article");
        card.className = "recipe-card";
        card.innerHTML = `
          <h3>${recipe.name}</h3>
          <span class="tag">${recipe.category}</span>
          <p>${recipe.prep_time ? recipe.prep_time + " mins" : ""}</p>
          <button type="button" class="delete-btn" data-id="${recipe.id}">Delete</button>
        `;
        grid.appendChild(card);
      });
    } catch (err) {
      grid.innerHTML = "<p>Error loading recipes from server.</p>";
    }
  }

  // Delegated listener for delete buttons
  if (grid) {
    grid.addEventListener("click", async (e) => {
      const deleteBtn = e.target.closest(".delete-btn");
      if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        if (!confirm("Are you sure you want to delete this recipe?")) return;

        const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) await loadRecipes();
      }
    });

    await loadRecipes();
  }
});