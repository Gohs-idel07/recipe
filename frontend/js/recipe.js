document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const searchResults = document.getElementById('searchResults');

  // List of all available recipes and their filenames
  const recipes = [
    { name: 'Chicken Chow Mein', file: 'chicken-chow-mein.html' },
    { name: 'Chicken Fried Rice', file: 'chicken-fried-rice.html' },
    { name: 'Chicken Momo', file: 'chicken-momo.html' },
    { name: 'Crispy Samosa', file: 'crispy-samosa.html' },
    { name: 'Buff Wellington', file: 'buff-wellington.html' },
    { name: 'Pasta Salad', file: 'pasata-salad.html' },
    { name: 'Portuguese Black Pork Bacon & Eggs', file: 'portuguese-eggs.html' },
    { name: 'Roast Buff with Caramelised Onion Gravy', file: 'roast-buff.html' },
    { name: 'Pan-Seared Scallops', file: 'scallops.html' }
  ];

  // 1. Show suggestions dropdown as user types (e.g. typing "cho")
  function handleInput() {
    const query = searchInput.value.toLowerCase().trim();

    if (!query) {
      searchResults.style.display = 'none';
      searchResults.innerHTML = '';
      return;
    }

    // Filter matching recipes
    const matches = recipes.filter(r => r.name.toLowerCase().includes(query));

    searchResults.innerHTML = '';

    if (matches.length > 0) {
      matches.forEach(item => {
        const option = document.createElement('div');
        option.className = 'search-dropdown-item';
        option.textContent = item.name;

        // Redirect when option is clicked
        option.addEventListener('click', () => {
          window.location.href = item.file;
        });

        searchResults.appendChild(option);
      });
    } else {
      // Show "Not available" if query matches nothing
      const noMatch = document.createElement('div');
      noMatch.className = 'search-dropdown-item no-result';
      noMatch.textContent = 'Not available';
      searchResults.appendChild(noMatch);
    }

    searchResults.style.display = 'block';
  }

  // 2. Search on Magnifying Glass Icon Click or Enter Key
  function handleSubmit() {
    const query = searchInput.value.toLowerCase().trim();
    if (!query) return;

    const matched = recipes.find(r => r.name.toLowerCase().includes(query));

    if (matched) {
      window.location.href = matched.file;
    } else {
      searchResults.innerHTML = '<div class="search-dropdown-item no-result">Not available</div>';
      searchResults.style.display = 'block';
    }
  }

  // Event Listeners
  if (searchInput) {
    searchInput.addEventListener('input', handleInput);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', handleSubmit);
  }

  // Hide dropdown list when clicking anywhere outside search area
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrapper')) {
      if (searchResults) searchResults.style.display = 'none';
    }
  });
});