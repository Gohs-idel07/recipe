require("dotenv").config();
const path = require("path");
const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => res.redirect("/signup.html"));

// ================= AUTH =================

app.post("/api/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }
  try {
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return res.status(409).json({ success: false, message: "That email is already registered." });
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)")
      .run(name, email, hashedPassword);
    return res.json({ success: true, message: "Account created!" });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong." });
  }
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required." });
  }
  try {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) return res.status(401).json({ success: false, message: "Invalid email or password." });

    const passwordMatches = bcrypt.compareSync(password, user.password);
    if (!passwordMatches) return res.status(401).json({ success: false, message: "Invalid email or password." });

    return res.json({ success: true, message: `Welcome back, ${user.name}!`, name: user.name });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong." });
  }
});

// ================= RECIPES =================

app.post("/api/recipes", (req, res) => {
  const { name, category, prepTime, servings, ingredients, instructions, imageUrl } = req.body;
  if (!name || !category || !ingredients || !ingredients.length || !instructions || !instructions.length) {
    return res.status(400).json({ success: false, message: "Name, category, ingredients, and instructions are required." });
  }
  try {
    const result = db.prepare(`
      INSERT INTO recipes (name, category, prep_time, servings, ingredients, instructions, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, category, prepTime || null, servings || null,
      JSON.stringify(ingredients), JSON.stringify(instructions), imageUrl || null);
    return res.json({ success: true, message: "Recipe saved!", id: result.lastInsertRowid });
  } catch (err) {
    console.error("Create recipe error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong saving the recipe." });
  }
});

app.get("/api/recipes", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM recipes ORDER BY created_at DESC").all();
    const recipes = rows.map((row) => ({
      ...row,
      ingredients: JSON.parse(row.ingredients),
      instructions: JSON.parse(row.instructions),
    }));
    return res.json({ success: true, recipes });
  } catch (err) {
    console.error("List recipes error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong loading recipes." });
  }
});

app.get("/api/recipes/:id", (req, res) => {
  try {
    const row = db.prepare("SELECT * FROM recipes WHERE id = ?").get(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Recipe not found." });
    return res.json({
      success: true,
      recipe: { ...row, ingredients: JSON.parse(row.ingredients), instructions: JSON.parse(row.instructions) },
    });
  } catch (err) {
    console.error("Get recipe error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong loading the recipe." });
  }
});

app.put("/api/recipes/:id", (req, res) => {
  const { id } = req.params;
  const { name, category, prepTime, servings, ingredients, instructions, imageUrl } = req.body;
  if (!name || !category || !ingredients || !ingredients.length || !instructions || !instructions.length) {
    return res.status(400).json({ success: false, message: "Name, category, ingredients, and instructions are required." });
  }
  try {
    const existing = db.prepare("SELECT id FROM recipes WHERE id = ?").get(id);
    if (!existing) return res.status(404).json({ success: false, message: "Recipe not found." });
    db.prepare(`
      UPDATE recipes
      SET name = ?, category = ?, prep_time = ?, servings = ?, ingredients = ?, instructions = ?, image_url = ?
      WHERE id = ?
    `).run(name, category, prepTime || null, servings || null,
      JSON.stringify(ingredients), JSON.stringify(instructions), imageUrl || null, id);
    return res.json({ success: true, message: "Recipe updated!" });
  } catch (err) {
    console.error("Update recipe error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong updating the recipe." });
  }
});

app.delete("/api/recipes/:id", (req, res) => {
  const { id } = req.params;
  try {
    const existing = db.prepare("SELECT id, name FROM recipes WHERE id = ?").get(id);
    if (!existing) return res.status(404).json({ success: false, message: "Recipe not found." });
    db.prepare("DELETE FROM recipes WHERE id = ?").run(id);
    return res.json({ success: true, message: "Recipe deleted." });
  } catch (err) {
    console.error("Delete recipe error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong deleting the recipe." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});