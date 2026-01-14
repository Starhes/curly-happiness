import { checkAuth, unauthorizedResponse } from './_auth';

export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request): Promise<Response> {
    if (!checkAuth(req)) {
        return unauthorizedResponse();
    }

    try {
        const ipServices = [
            'https://api.ipify.org?format=json',
            'https://httpbin.org/ip',
            'https://api.ip.sb/ip'
        ];

        for (const service of ipServices) {
            try {
                const response = await fetch(service, {
                    headers: { 'User-Agent': 'curl/7.68.0' }
                });

                if (response.ok) {
                    const text = await response.text();
                    let ip: string;

                    try {
                        const json = JSON.parse(text);
                        ip = json.ip || json.origin || text.trim();
                    } catch {
                        ip = text.trim();
                    }

                    return new Response(JSON.stringify({
                        ip: ip,
                        service: service,
                        timestamp: new Date().toISOString()
                    }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            } catch {
                continue;
            }
        }

        return new Response(JSON.stringify({ error: 'Failed to fetch IP' }), {
            status: 502,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: String(e) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
