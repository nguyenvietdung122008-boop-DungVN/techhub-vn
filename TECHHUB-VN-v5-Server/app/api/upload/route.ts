import { randomUUID } from 'node:crypto';
import { checkOrigin, sessionUser } from '../../../deployment/auth.mjs';
import { database } from '../../../deployment/storage.mjs';
import { HttpError, readBody } from '../../../lib/server';

function imageType(data: Uint8Array) {
    if (data[0] === 137 && data[1] === 80 && data[2] === 78 && data[3] === 71) return 'image/png';
    if (data[0] === 255 && data[1] === 216 && data[2] === 255) return 'image/jpeg';
    if (data[0] === 82 && data[1] === 73 && data[2] === 70 && data[3] === 70
        && data[8] === 87 && data[9] === 69 && data[10] === 66 && data[11] === 80) return 'image/webp';
    return null;
}

export async function POST(request: Request) {
    const user = sessionUser(request.headers);
    if (!user) return Response.json({ error: 'Cần đăng nhập.' }, { status: 401 });
    if (!checkOrigin(request)) return Response.json({ error: 'Nguồn yêu cầu không hợp lệ.' }, { status: 403 });
    try {
        const bytes = await readBody(request, 2 * 1024 * 1024);
        const type = imageType(bytes);
        if (!type) return Response.json({ error: 'Chỉ nhận ảnh PNG, JPEG hoặc WebP.' }, { status: 400 });
        const id = randomUUID();
        database().prepare('INSERT INTO selfhost_media(id,owner,mime,content) VALUES(?,?,?,?)')
            .run(id, user.id, type, bytes);
        return Response.json({ url: '/media/' + id });
    } catch (error) {
        if (error instanceof HttpError) return Response.json({ error: error.message }, { status: error.status });
        return Response.json({ error: 'Không lưu được ảnh.' }, { status: 500 });
    }
}
