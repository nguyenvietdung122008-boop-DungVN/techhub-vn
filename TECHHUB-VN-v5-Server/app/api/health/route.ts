import { database } from '../../../deployment/storage.mjs';
import { siteOrigin } from '../../../deployment/auth.mjs';

export const dynamic = 'force-dynamic';

export function GET() {
    try {
        siteOrigin();
        database().prepare('SELECT 1').get();
        return Response.json({ status: 'ok' });
    } catch {
        return Response.json({ status: 'unavailable' }, { status: 503 });
    }
}
