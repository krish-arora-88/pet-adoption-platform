const API_BASE = '';

function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

// Login form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const msg = document.getElementById('loginMessage');
        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (data.success) {
                setToken(data.token);
                msg.textContent = 'Login successful! Redirecting...';
                setTimeout(() => { window.location.href = '/'; }, 500);
            } else {
                msg.textContent = data.error || 'Login failed';
            }
        } catch (err) {
            msg.textContent = 'Login failed. Please try again.';
        }
    });
}

// Register form
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const msg = document.getElementById('registerMessage');

        if (password !== confirmPassword) {
            msg.textContent = 'Passwords do not match';
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (data.success) {
                setToken(data.token);
                msg.textContent = 'Registration successful! Redirecting...';
                setTimeout(() => { window.location.href = '/'; }, 500);
            } else {
                msg.textContent = data.error || 'Registration failed';
            }
        } catch (err) {
            msg.textContent = 'Registration failed. Please try again.';
        }
    });
}
