import { apiFetch, getToken, clearToken } from './shared/api.js';

function initSidebar() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (currentPath === href ||
            (href === '/' && (currentPath === '/' || currentPath === '/index.html'))) {
            link.classList.add('active');
        }
    });
}

async function initAuthStatus() {
    const authStatusEl = document.getElementById('authStatus');
    const loginLink = document.getElementById('sidebarLoginLink');
    const logoutLink = document.getElementById('sidebarLogoutLink');
    if (!authStatusEl) return;

    const token = getToken();
    if (token) {
        if (loginLink) loginLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'block';
        try {
            const res = await apiFetch('/auth/me');
            const data = await res.json();
            if (data.success) {
                authStatusEl.textContent = data.user.email;
            } else {
                clearToken();
                location.reload();
            }
        } catch { /* silently fail */ }
    } else {
        if (loginLink) loginLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'none';
    }
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            clearToken();
            location.reload();
        });
    }
}

async function initDbStatus() {
    const dot = document.getElementById('dbStatusDot');
    if (!dot) return;
    try {
        const res = await apiFetch('/check-db-connection');
        const text = await res.text();
        dot.classList.add(text === 'Connected' ? 'connected' : 'disconnected');
        dot.title = text === 'Connected' ? 'Database connected' : 'Database disconnected';
    } catch {
        dot.classList.add('disconnected');
        dot.title = 'Connection failed';
    }
}

function initAnimations() {
    const elements = document.querySelectorAll('.fade-in');
    elements.forEach((el, i) => {
        el.style.animationDelay = `${i * 0.05}s`;
    });
}

function initMobileNav() {
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    if (toggle && sidebar) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
}

initSidebar();
initAuthStatus();
initDbStatus();
initAnimations();
initMobileNav();
