const DEFAULT_API_BASE = 'https://api.financegram.community';
function resolveBaseUrl() {
    const fromEnv = import.meta.env.VITE_FINANCEGRAM_API_BASE;
    if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) {
        return fromEnv.trim().replace(/\/$/, '');
    }
    return DEFAULT_API_BASE;
}
export const API_BASE_URL = resolveBaseUrl();
async function request(path, options = {}) {
    const { skipJson, headers, ...rest } = options;
    const response = await fetch(`${API_BASE_URL}${path}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        ...rest,
    });
    if (!response.ok) {
        let message = `Request failed with status ${response.status}`;
        try {
            const body = await response.json();
            if (body?.error) {
                message = body.error;
            }
        }
        catch (error) {
            // Ignore JSON parse errors; fall back to default message.
        }
        throw new Error(message);
    }
    if (skipJson || response.status === 204) {
        return undefined;
    }
    return (await response.json());
}
export async function fetchSession() {
    return request('/api/session');
}
export async function signInWithEmail(payload) {
    return request('/api/auth/email', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}
export async function signInWithLinkedInDemo() {
    return request('/api/auth/demo', {
        method: 'POST',
    });
}
export async function signOut() {
    await request('/api/auth/logout', { method: 'POST', skipJson: true });
}
export async function fetchMarketData() {
    return request('/api/markets/snapshot');
}
export async function fetchNews() {
    return request('/api/news/headlines');
}
export async function fetchJobListings() {
    return request('/api/talent/jobsea');
}
export async function fetchCommunityHighlights() {
    return request('/api/communities/highlights');
}
export async function fetchCertificates() {
    return request('/api/learning/certifications');
}
