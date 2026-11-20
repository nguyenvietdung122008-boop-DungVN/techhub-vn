import { sessionUser } from '../../../deployment/auth.mjs';
import { database } from '../../../deployment/storage.mjs';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = sessionUser(request.headers);
    const { id } = await params;
    if (!user || !/^[a-f0-9-]{36}$/.test(id)) return new Response(null, { status: 404 });
    const row = database().prepare(`
        SELECT m.mime,m.content FROM selfhost_media m
        WHERE m.id=? AND (m.owner=? OR ?=1 OR EXISTS (
            SELECT 1 FROM entities e WHERE e.status='visible' AND json_extract(e.payload,'$.image')=?
        ))
    `).get(id, user.id, Number(user.admin), '/media/' + id);
    if (!row || !(row.content instanceof Uint8Array)) return new Response(null, { status: 404 });

    return new Response(new Uint8Array(row.content), {
        headers: {
            'Content-Type': String(row.mime),
            'X-Content-Type-Options': 'nosniff',
            'Cache-Control': 'private, no-store',
        },
    });
}
