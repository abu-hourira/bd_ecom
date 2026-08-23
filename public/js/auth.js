// Handle Login and Registration
async function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, phone, address })
        });
        const data = await res.json();
        if (res.ok) {
            showToast(data.message);
            setTimeout(() => window.location.href = '/login.html', 1500);
        } else {
            showToast(data.message || 'Registration failed.');
        }
    } catch (error) {
        showToast('An error occurred.');
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            showToast(data.message);
            localStorage.setItem('user', JSON.stringify(data.user));
            setTimeout(() => {
                if (data.user.role === 'admin') {
                    window.location.href = '/admin/dashboard.html';
                } else {
                    window.location.href = '/';
                }
            }, 1000);
        } else {
            showToast(data.message || 'Login failed.');
        }
    } catch (error) {
        showToast('An error occurred.');
    }
}
