document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');

  if (!form) {
    console.error('❌ Could not find #loginForm in login.html');
    return;
  }

  // Check if #message exists; if not, inject one dynamically above the submit button
  let messageBox = document.getElementById('message');
  if (!messageBox) {
    messageBox = document.createElement('p');
    messageBox.id = 'message';
    messageBox.style.marginTop = '12px';
    messageBox.style.marginBottom = '12px';
    messageBox.style.fontWeight = 'bold';
    messageBox.style.textAlign = 'center';

    const submitBtn = form.querySelector('.btn-login') || form.querySelector('button[type="submit"]');
    if (submitBtn) {
      form.insertBefore(messageBox, submitBtn);
    } else {
      form.appendChild(messageBox);
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    messageBox.textContent = 'Signing in...';
    messageBox.style.color = '#555';

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Auto-detect backend port if running on local Live Server vs Express vs Vercel
    const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '3000'
      ? 'http://localhost:3000'
      : '';

    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      messageBox.textContent = data.message;
      messageBox.style.color = data.success ? '#1C8A4B' : '#D6304A';

      if (data.success) {
        // Save user data for recipe.html header
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect to recipe page after 1 second
        setTimeout(() => {
          window.location.href = 'recipe.html';
        }, 1000);
      }
    } catch (err) {
      console.error('Login Error:', err);
      messageBox.textContent = 'Could not connect to server.';
      messageBox.style.color = '#D6304A';
    }
  });
});