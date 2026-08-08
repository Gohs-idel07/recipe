document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const messageBox = document.getElementById('message');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageBox.textContent = '';

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      showMessage(data.message, data.success ? 'success' : 'error');

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setTimeout(() => { window.location.href = 'recipe.html'; }, 1200);
      }
    } catch (err) {
      showMessage('Could not connect to server.', 'error');
    }
  });

  function showMessage(msg, type) {
    if (!messageBox) return;
    messageBox.textContent = msg;
    messageBox.style.color = type === 'error' ? '#D6304A' : '#1C8A4B';
  }
});