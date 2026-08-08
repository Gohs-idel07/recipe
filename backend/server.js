// Example route with async/await
app.get('/api/recipes', async (req, res) => {
  try {
    const recipes = await all('SELECT * FROM recipes');
    res.json({ success: true, recipes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Make sure app.listen only runs during local development
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;