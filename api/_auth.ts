// Authentication helper for Vercel API routes
export const AUTH_KEY = process.env.AUTH_KEY || 'Hui123';
export const TARGET_URL = process.env.TARGET_URL || 'https://swisstargetprediction.ch';

export function getCookie(cookieHeader: string | null, name: string): string | null {
    if (!cookieHeader) return null;
    const match = cookieHeader.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
    return match ? decodeURIComponent(match[2]) : null;
}

export function checkAuth(req: Request): boolean {
    const url = new URL(req.url);
    const apiKey = req.headers.get('x-api-key') ||
        url.searchParams.get('api_key') ||
        getCookie(req.headers.get('cookie'), 'auth_key');

    return apiKey === AUTH_KEY;
}

export function unauthorizedResponse(): Response {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
    });
}
