import { ZodError } from 'zod';
import { sessionUser, siteOrigin, checkOrigin } from '../../../deployment/auth.mjs';
import { hubDatabase } from '../../../deployment/storage.mjs';
import { handleHub, HttpError } from '../../../lib/server';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };

async function handler(request: Request) {
    try {
        const user = sessionUser(request.headers);
        if (!user) return Response.json({ error: 'Bạn cần đăng nhập lại.' }, { status: 401, headers });
        if (request.method === 'POST' && !checkOrigin(request)) {
            return Response.json({ error: 'Nguồn yêu cầu không hợp lệ.' }, { status: 403, headers });
        }
        return Response.json(await handleHub(request, hubDatabase(), user, siteOrigin()), { headers });
    } catch (error) {
        if (error instanceof ZodError) {
            return Response.json({ error: 'Thông tin không hợp lệ. Kiểm tra các trường bắt buộc.' }, { status: 400, headers });
        }
        if (error instanceof HttpError) {
            return Response.json({ error: error.message }, { status: error.status, headers });
        }
        console.error('Hub operation failed', error instanceof Error ? error.message : 'unknown');
        return Response.json({ error: 'Không thể xử lý yêu cầu lúc này.' }, { status: 500, headers });
    }
}

export const GET = handler;
export const POST = handler;
