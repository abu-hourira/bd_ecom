// Global helper functions
function showToast(message, duration = 3000) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, duration);
}

// Check user authentication status
async function checkAuth() {
    try {
        const res = await fetch('/api/auth/profile');
        if (res.ok) {
            const user = await res.json();
            localStorage.setItem('user', JSON.stringify(user));
            updateNavbar(user);
            return user;
        } else {
            localStorage.removeItem('user');
            updateNavbar(null);
            return null;
        }
    } catch (error) {
        return null;
    }
}

function updateNavbar(user) {
    const navLinks = document.getElementById('nav-links');
    if (!navLinks) return;

    if (user) {
        navLinks.innerHTML = `
            <li><a href="/">Home</a></li>
            <li><a href="/products.html">Shop</a></li>
            <li><a href="/cart.html">Cart</a></li>
            <li><a href="/orders.html">My Orders</a></li>
            <li><a href="/profile.html">Profile</a></li>
            ${user.role === 'admin' ? '<li><a href="/admin/dashboard.html" style="color: var(--secondary-color); font-weight: bold;">Admin Panel</a></li>' : ''}
            <li><button onclick="logout()" class="btn btn-primary" style="padding: 5px 15px;">Logout</button></li>
        `;
    } else {
        navLinks.innerHTML = `
            <li><a href="/">Home</a></li>
            <li><a href="/products.html">Shop</a></li>
            <li><a href="/login.html">Login</a></li>
            <li><a href="/register.html" class="btn" style="padding: 5px 15px; color: white;">Register</a></li>
        `;
    }
}

async function logout() {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    if (res.ok) {
        localStorage.removeItem('user');
        showToast('Logged out successfully.');
        setTimeout(() => window.location.href = '/', 1000);
    }
}

document.addEventListener('DOMContentLoaded', checkAuth);
