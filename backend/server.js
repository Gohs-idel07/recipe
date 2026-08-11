const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, "frontend")));

// In-memory data fallback (Ensures Vercel serverless doesn't crash on read-only files)
let users = [];
let recipes = [
  {
    id: 1,
    name: "Crispy Samosa",
    category: "Dinner",
    prep_time: 25,
    servings: 2,
    image_url: "photo/samosa.jpg",
    ingredients: ["Potatoes", "Peas", "Flour", "Spices"],
    instructions: ["Make dough", "Prepare filling", "Stuff and deep fry"]
  }
];

// --- API ENDPOINTS ---

// 1. Sign Up
app.post("/api/signup", (req, res) => {
  const { username, email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password required" });
  }

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ success: false, message: "Email already registered" });
  }

  users.push({ id: Date.now(), username, email, password });
  return res.json({ success: true, message: "User registered successfully!" });
});

// 2. Sign In
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (user || email === "admin@gmail.com") { // Default test access
    return res.json({
      success: true,
      message: "Login successful",
      user: { email: email, username: user ? user.username : "Admin" }
    });
  }

  return res.status(401).json({ success: false, message: "Invalid email or password" });
});

// 3. Get All Recipes
app.get("/api/recipes", (req, res) => {
  return res.json({ success: true, recipes });
});

// 4. Add Recipe
app.post("/api/recipes", (req, res) => {
  const { name, category, prepTime, servings, imageUrl, ingredients, instructions } = req.body;

  if (!name || !category) {
    return res.status(400).json({ success: false, message: "Name and Category are required" });
  }

  const newRecipe = {
    id: Date.now(),
    name,
    category,
    prep_time: prepTime,
    servings,
    image_url: imageUrl || null,
    ingredients: ingredients || [],
    instructions: instructions || []
  };

  recipes.unshift(newRecipe);
  return res.json({ success: true, message: "Recipe saved!", recipe: newRecipe });
});

// 5. Delete Recipe
app.delete("/api/recipes/:id", (req, res) => {
  const id = Number(req.params.id);
  recipes = recipes.filter(r => r.id !== id);
  return res.json({ success: true, message: "Recipe deleted" });
});

// Required export for Vercel
module.exports = app;

// Local development server listener
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}