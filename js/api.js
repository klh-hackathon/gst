// ── API Base URL Configuration ─────────────────────────────────────────
// Auto-detect: if running on localhost → use relative /api
// If running on GitHub Pages → use Cloudflare Tunnel URL from config
function getApiBase() {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') {
        return '/api';  // Local development — served by FastAPI
    }
    // When deployed on GitHub Pages, read the tunnel URL from config
    // Update this with your actual Cloudflare Tunnel URL
    const tunnelUrl = localStorage.getItem('backend_url') || window.BACKEND_URL || '';
    if (tunnelUrl) {
        return tunnelUrl.replace(/\/$/, '') + '/api';
    }
    return '/api'; // fallback
}

const API_BASE = getApiBase();

export async function getToken() {
    return localStorage.getItem('auth_token');
}

export async function getUser() {
    const token = await getToken();
    if (!token) return null;

    try {
        // Decode the JWT payload (base64) to check expiry
        const parts = token.split('.');
        if (parts.length !== 3) {
            localStorage.removeItem('auth_token');
            return null;
        }
        const payload = JSON.parse(atob(parts[1]));

        // Check if the token has expired
        if (payload.exp && (payload.exp * 1000) < Date.now()) {
            localStorage.removeItem('auth_token');
            return null;
        }

        return payload;
    } catch (e) {
        localStorage.removeItem('auth_token');
        return null;
    }
}

export async function requireAuth() {
    const user = await getUser();
    if (!user) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

async function request(method, path, body) {
    const token = await getToken();

    const isFormData = body instanceof FormData;

    const opts = {
        method,
        headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
    };

    if (!isFormData) {
        opts.headers['Content-Type'] = 'application/json';
        if (body) opts.body = JSON.stringify(body);
    } else {
        opts.body = body;
    }

    try {
        const res = await fetch(`${API_BASE}${path}`, opts);

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.detail || 'Request failed');
        }

        return await res.json();
    } catch (error) {
        console.error(`Request failed for ${path}`, error);
        throw error;
    }
}

export const api = {
    login: async (email, password) => {
        const data = await request('POST', '/auth/login', { email, password });
        localStorage.setItem('auth_token', data.access_token);
        return data;
    },
    register: async (payload) => {
        const data = await request('POST', '/auth/register', payload);
        localStorage.setItem('auth_token', data.access_token);
        return data;
    },
    uploadInvoice: async (formData) => {
        return await request('POST', '/invoices/upload', formData);
    },
    logout: async () => {
        localStorage.removeItem('auth_token');
        window.location.href = 'index.html';
    },
    getDashboardStats: () => request('GET', '/dashboard/stats'),
    getRecentActivity: () => request('GET', '/dashboard/recent-activity'),
    getVendorRisks: () => request('GET', '/dashboard/vendor-risks'),
    getAnalytics: () => request('GET', '/analytics/detailed'),
    getSettings: () => request('GET', '/settings'),
    getProfile: () => request('GET', '/user/profile'),
    updateProfile: (data) => request('PATCH', '/user/profile', data),

    // Knowledge Graph APIs
    getUserGraph: () => request('GET', '/graph/user'),
    getAdminGraph: () => request('GET', '/graph/admin'),
    getGraphNode: (gstin) => request('GET', `/graph/node/${gstin}`),

    // Fraud Intelligence APIs
    getEntityRisk: (gstin) => request('GET', `/fraud/entity/${gstin}`),
    getCycles: () => request('GET', '/fraud/cycles'),
    runDbScan: () => request('GET', '/fraud/db-scan'),
};
