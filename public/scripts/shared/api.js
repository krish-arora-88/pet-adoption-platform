// shared/api.js — centralised fetch wrapper with JWT auth

export function getToken() {
    return localStorage.getItem('token');
}

export function setToken(token) {
    localStorage.setItem('token', token);
}

export function clearToken() {
    localStorage.removeItem('token');
}

export function isLoggedIn() {
    return !!getToken();
}

/**
 * Wrapper around fetch() that:
 *  - attaches the JWT bearer token from localStorage
 *  - auto-stringifies object bodies and sets Content-Type
 *  - redirects to login page on 401
 */
export async function apiFetch(url, options = {}) {
    const headers = { ...(options.headers || {}) };

    // Attach JWT if available
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Auto-stringify object bodies
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, { ...options, headers });

    // On 401 clear credentials and redirect to login
    if (response.status === 401) {
        clearToken();
        window.location.href = '/pages/login.html';
        return response;
    }

    return response;
}
