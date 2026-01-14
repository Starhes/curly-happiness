import { checkAuth, getCookie, TARGET_URL, AUTH_KEY } from './_auth';

export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request): Promise<Response> {
    const url = new URL(req.url);

    // Check authentication
    if (!checkAuth(req)) {
        // Redirect to login for browser requests
        const accept = req.headers.get('accept') || '';
        if (accept.includes('text/html')) {
            return Response.redirect(`${url.origin}/login`, 302);
        }
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Construct target URL
    const targetUrl = new URL(url.pathname + url.search, TARGET_URL);

    // Prepare headers
    const newHeaders = new Headers(req.headers);
    const hopByHopHeaders = ['host', 'x-forwarded-for', 'x-real-ip', 'x-vercel-id', 'x-vercel-deployment-url'];
    hopByHopHeaders.forEach(h => newHeaders.delete(h));

    // Filter out our auth cookie
    const cookieHeader = newHeaders.get('cookie');
    if (cookieHeader) {
        const upstreamCookies = cookieHeader.split(';')
            .filter(c => !c.trim().startsWith('auth_key='))
            .join(';');
        if (upstreamCookies.trim()) {
            newHeaders.set('cookie', upstreamCookies);
        } else {
            newHeaders.delete('cookie');
        }
    }

    // Set Host header
    newHeaders.set('host', targetUrl.hostname);
    newHeaders.set('referer', targetUrl.origin + '/');
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        newHeaders.set('origin', targetUrl.origin);
    }

    // Only include body for appropriate methods
    const hasBody = req.method !== 'GET' && req.method !== 'HEAD';

    try {
        const proxyResponse = await fetch(targetUrl.toString(), {
            method: req.method,
            headers: newHeaders,
            body: hasBody ? req.body : undefined,
            redirect: 'manual'
        });

        // Prepare response headers
        const responseHeaders = new Headers(proxyResponse.headers);

        // Rewrite Location header for redirects
        const location = responseHeaders.get('location');
        if (location) {
            try {
                const locUrl = new URL(location, targetUrl.origin);
                if (locUrl.hostname === targetUrl.hostname ||
                    locUrl.hostname === 'swisstargetprediction.ch' ||
                    locUrl.hostname === 'www.swisstargetprediction.ch') {
                    const newLocation = url.origin + locUrl.pathname + locUrl.search;
                    responseHeaders.set('location', newLocation);
                }
            } catch {
                // Keep original if parsing fails
            }
        }

        // Set CORS headers
        responseHeaders.set('access-control-allow-origin', '*');

        // Check if this is HTML content - if so, rewrite URLs in the body
        const contentType = responseHeaders.get('content-type') || '';
        if (contentType.includes('text/html')) {
            let html = await proxyResponse.text();

            // Rewrite absolute URLs to stay on proxy
            const targetDomains = [
                'https://swisstargetprediction.ch',
                'http://swisstargetprediction.ch',
                'https://www.swisstargetprediction.ch',
                'http://www.swisstargetprediction.ch'
            ];

            for (const domain of targetDomains) {
                html = html.split(domain).join(url.origin);
            }

            return new Response(html, {
                status: proxyResponse.status,
                statusText: proxyResponse.statusText,
                headers: responseHeaders
            });
        }

        return new Response(proxyResponse.body, {
            status: proxyResponse.status,
            statusText: proxyResponse.statusText,
            headers: responseHeaders
        });

    } catch (e) {
        return new Response(`Proxy Error: ${e}`, { status: 502 });
    }
}
