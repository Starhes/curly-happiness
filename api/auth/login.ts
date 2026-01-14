import { AUTH_KEY } from '../_auth';

export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request): Promise<Response> {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const { key } = await req.json();

        if (key === AUTH_KEY) {
            const maxAge = 60 * 60 * 24 * 30; // 30 days
            return new Response(JSON.stringify({ success: true }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Set-Cookie': `auth_key=${key}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax`
                }
            });
        }

        return new Response(JSON.stringify({ error: 'Invalid key' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response('Bad Request', { status: 400 });
    }
}
