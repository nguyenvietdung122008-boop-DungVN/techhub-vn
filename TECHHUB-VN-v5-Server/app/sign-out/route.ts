import { checkOrigin, closeSession } from '../../deployment/auth.mjs';

export function POST(request: Request) {
    if (!checkOrigin(request)) return new Response(null, { status: 403 });
    return new Response(null, {
        status: 303,
        headers: {
            Location: '/sign-in',
            'Set-Cookie': closeSession(request.headers),
            'Cache-Control': 'no-store',
        },
    });
}
