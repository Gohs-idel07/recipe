document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signupForm');
  const messageBox = document.getElementById('message');
 
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageBox.textContent = '';
 
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agree = document.getElementById('agree').checked;
 
    if (!name || !email || !password || !confirmPassword) {
      return showMessage('Please fill in all fields.', 'error');
    }
    if (password !== confirmPassword) {
      return showMessage('Passwords do not match.', 'error');
    }
    if (!agree) {
      return showMessage('Please agree to the terms to continue.', 'error');
    }
 
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      showMessage(data.message, data.success ? 'success' : 'error');
      if (data.success) {
        form.reset();
        setTimeout(() => { window.location.href = 'login.html'; }, 1200);
      }
    } catch (err) {
      showMessage('Could not reach the server. Is it running?', 'error');
    }
  });
 
  function showMessage(text, type) {
    messageBox.textContent = text;
    messageBox.style.color = type === 'error' ? '#D6304A' : '#1C8A4B';
  }
});
