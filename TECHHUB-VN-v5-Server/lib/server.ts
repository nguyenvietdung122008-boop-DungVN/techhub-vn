import type { hubDatabase } from '../deployment/storage.mjs';
import { z } from 'zod';
import { catalog, courses, examples, groups, news, sampleReviews, sampleThreads } from './content';
export class HttpError extends Error {
    constructor(public status: number, message: string) { super(message); }
}
export async function readBody(request: Request, max: number) { const length = Number(request.headers.get('content-length') || 0); if (length > max)
    throw new HttpError(413, 'Nội dung vượt giới hạn.'); const reader = request.body?.getReader(); if (!reader)
    return new Uint8Array(); let size = 0; const chunks: Uint8Array[] = []; while (true) {
    const { done, value } = await reader.read();
    if (done)
        break;
    size += value.length;
    if (size > max) {
        await reader.cancel();
        throw new HttpError(413, 'Nội dung vượt giới hạn.');
    }
    chunks.push(value);
} const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
} return bytes; }
export type Identity = {
    id: string;
    name: string;
    admin: boolean;
};
const txt = (max = 3000) => z.string().trim().min(1).max(max);
const idSchema = txt(160);
const threadPageSize = 30;
const types = z.enum(['post', 'question', 'project', 'review', 'product', 'company', 'article']);
const payloadSchema = z.object({ image: z.string().max(200).regex(/^\/media\/[a-f0-9-]{36}$/).optional(), price: z.number().int().min(1000).max(10000000000).optional(), type: z.enum(['B2B', 'B2C', 'B2B + B2C']).optional(), condition: z.enum(['Mới', 'Đã qua sử dụng']).optional(), location: z.string().max(100).optional(), ram: z.string().max(100).optional(), storage: z.string().max(100).optional(), stack: z.string().max(200).optional(), stage: z.string().max(100).optional(), looking: z.string().max(200).optional(), url: z.string().url().max(500).refine(u => u.startsWith('https://')).optional(), rating: z.number().int().min(1).max(5).optional(), pros: z.string().max(1000).optional(), cons: z.string().max(1000).optional(), sponsor: z.string().max(200).optional(), product: z.string().max(160).optional(), source: z.string().max(200).optional(), published: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), label: z.enum(['Tin tức', 'Ý kiến', 'Tài trợ']).optional(), services: z.string().max(500).optional() });
export async function handleHub(request: Request, db: ReturnType<typeof hubDatabase>, user: Identity | null, expectedOrigin = new URL(request.url).origin) {
    const now = () => new Date().toISOString(), uid = () => crypto.randomUUID();
    const stmt = (sql: string, ...v: any[]) => db.prepare(sql).bind(...v);
    const rows = async (sql: string, ...v: any[]) => (await stmt(sql, ...v).all()).results;
    const one = async (sql: string, ...v: any[]): Promise<any> => await stmt(sql, ...v).first();
    async function ensure() { if (!user)
        throw new HttpError(401, 'Đăng nhập để thực hiện thao tác.'); await stmt('INSERT OR IGNORE INTO users(id,name,created_at) VALUES(?,?,?)', user.id, user.name, now()).run(); return user; }
    function admin() { if (!user?.admin)
        throw new HttpError(403, 'Chỉ quản trị viên có quyền thực hiện.'); }
    async function log(action: string, target: string, reason: string) { return stmt('INSERT INTO audit(id,actor,action,target,reason,created_at) VALUES(?,?,?,?,?,?)', uid(), user!.id, action, target, reason, now()); }
    if (request.method === 'GET') {
        const params = new URL(request.url).searchParams;
        if (params.has('thread')) {
            const target = idSchema.parse(params.get('thread'));
            const entity = await one('SELECT status FROM entities WHERE id=?', target);
            if (entity ? entity.status !== 'visible' : !sampleThreads.some(item => item.id === target))
                throw new HttpError(404, 'Cuộc thảo luận không còn khả dụng.');
            const before = params.has('before') ? idSchema.parse(params.get('before')) : null;
            const cursor = before && await one('SELECT created_at,id FROM comments WHERE id=? AND entity=?', before, target);
            if (before && !cursor)
                throw new HttpError(400, 'Không tìm thấy mốc bình luận trong cuộc thảo luận này.');
            const comments = await rows(
                `SELECT c.*,u.name AS author,previous_author.name AS reply_author
                 FROM comments c
                 JOIN entities thread ON thread.id=c.entity AND thread.status='visible'
                 JOIN users u ON u.id=c.owner
                 LEFT JOIN comments previous ON previous.id=c.reply_to AND previous.entity=c.entity
                 LEFT JOIN users previous_author ON previous_author.id=previous.owner
                 WHERE c.entity=? ${cursor ? 'AND (c.created_at,c.id)<(?,?)' : ''}
                 ORDER BY c.created_at DESC,c.id DESC LIMIT ?`,
                target, ...(cursor ? [cursor.created_at, cursor.id] : []), threadPageSize + 1,
            );
            const total = await one(
                "SELECT count(*) AS count FROM comments c JOIN entities e ON e.id=c.entity AND e.status='visible' WHERE c.entity=?",
                target,
            );
            const page = comments.slice(0, threadPageSize);
            return { before: comments.length > threadPageSize ? page.at(-1)!.id : null, comments: page.reverse(), total: total.count };
        }
        let me = user ? await one('SELECT * FROM users WHERE id=?', user.id) : null;
        const entities = await rows(`SELECT e.*,u.name as author FROM entities e JOIN users u ON e.owner=u.id WHERE e.owner NOT LIKE 'sample:%' AND (${user?.admin ? '1=1' : "e.status='visible'"} ${user ? 'OR e.owner=?' : ''}) ORDER BY e.created_at DESC LIMIT 250`, ...(user ? [user.id] : []));
        const comments = await rows("SELECT c.*,u.name as author FROM comments c JOIN users u ON c.owner=u.id JOIN entities e ON e.id=c.entity WHERE e.status='visible' ORDER BY c.created_at LIMIT 1000");
        const counts = await rows(
            `SELECT target,kind,count(*) AS count FROM links WHERE kind IN ('like','follow','join') GROUP BY target,kind
             UNION ALL
             SELECT c.entity AS target,'comment' AS kind,count(*) AS count
             FROM comments c JOIN entities e ON e.id=c.entity AND e.status='visible' GROUP BY c.entity`,
        );
        return { me: user ? { id: user.id, name: me?.name || user.name, bio: me?.bio || '', interests: me?.interests || '', seller_status: me?.seller_status || 'none', admin: user.admin } : null, entities: entities.map((e: any) => ({ ...e, payload: JSON.parse(e.payload) })), comments, counts, links: user ? await rows('SELECT * FROM links WHERE owner=?', user.id) : [], progress: user ? await rows('SELECT lesson FROM progress WHERE owner=?', user.id) : [], orders: user ? (await rows('SELECT * FROM orders WHERE owner=? ORDER BY created_at DESC', user.id)).map((o: any) => ({ ...o, items: JSON.parse(o.items), events: JSON.parse(o.events) })) : [], reports: user ? await rows(`SELECT * FROM reports ${user.admin ? '' : 'WHERE owner=? OR target IN (SELECT id FROM entities WHERE owner=?)'} ORDER BY created_at DESC`, ...(user.admin ? [] : [user.id, user.id])) : [], users: await rows("SELECT id,name,bio,interests,seller_status,created_at FROM users WHERE id NOT LIKE 'sample:%' ORDER BY created_at DESC LIMIT 200"), audit: user?.admin ? await rows('SELECT a.*,u.name as actor_name FROM audit a LEFT JOIN users u ON a.actor=u.id ORDER BY a.created_at DESC LIMIT 200') : [], storage: 'server', integrations: { payment: false, shipping: false, ai: false } };
    }
    const origin = request.headers.get('origin');
    if (origin && origin !== expectedOrigin)
        throw new HttpError(403, 'Nguồn yêu cầu không hợp lệ.');
    if (!request.headers.get('content-type')?.includes('application/json'))
        throw new HttpError(415, 'Yêu cầu JSON.');
    let raw = new TextDecoder().decode(await readBody(request, 24000));
    let b: any;
    try {
        b = JSON.parse(raw);
    }
    catch {
        throw new HttpError(400, 'JSON không hợp lệ.');
    }
    if (!b || typeof b !== 'object' || Array.isArray(b))
        throw new HttpError(400, 'Thông tin không hợp lệ.');
    let u = await ensure();
    let recent = await one('SELECT count(*) as n FROM entities WHERE owner=? AND created_at>?', u.id, new Date(Date.now() - 60000).toISOString());
    if (recent.n >= 10 && b.action === 'create')
        throw new HttpError(429, 'Bạn đăng quá nhanh. Vui lòng thử lại sau.');
    switch (b.action) {
        case 'profile': {
            let x = z.object({ name: txt(80), bio: z.string().max(500), interests: z.string().max(200) }).parse(b);
            await stmt('UPDATE users SET name=?,bio=?,interests=? WHERE id=?', x.name, x.bio, x.interests, u.id).run();
            break;
        }
        case 'create': {
            let x = z.object({ kind: types, title: txt(160), body: txt(6000), category: txt(100), payload: payloadSchema }).parse(b);
            if (x.kind === 'article')
                admin();
            if (x.kind === 'product') {
                const me = await one('SELECT seller_status FROM users WHERE id=?', u.id);
                if (me.seller_status !== 'approved')
                    throw new HttpError(403, 'Cần hồ sơ người bán được quản trị viên xét duyệt trước khi đăng sản phẩm.');
                if (!x.payload.price)
                    throw new HttpError(400, 'Cần giá sản phẩm hợp lệ.');
            }
            if (x.kind === 'article' && (!x.payload.source || !x.payload.url || !x.payload.published || !x.payload.label))
                throw new HttpError(400, 'Tin cần nguồn, liên kết, ngày xuất bản và nhãn nội dung.');
            if (x.kind === 'review' && x.payload.product && !catalog.some(p => p.id === x.payload.product) && !await one("SELECT id FROM entities WHERE id=? AND kind='product' AND status='visible'", x.payload.product))
                throw new HttpError(400, 'Sản phẩm đánh giá không tồn tại.');
            if (x.kind === 'review' && (!x.payload.rating || !x.payload.pros?.trim() || !x.payload.cons?.trim() || !x.payload.product))
                throw new HttpError(400, 'Đánh giá cần sản phẩm, điểm, ưu điểm và hạn chế.');
            let id = uid();
            await stmt('INSERT INTO entities(id,kind,owner,title,body,category,payload,created_at) VALUES(?,?,?,?,?,?,?,?)', id, x.kind, u.id, x.title, x.body, x.category, JSON.stringify(x.payload), now()).run();
            return { ok: true, id };
        }
        case 'comment': {
            const x = z.object({ target: idSchema, body: txt(2000), replyTo: idSchema.optional() }).parse(b);
            const sample = sampleThreads.find(item => item.id === x.target);
            const target = await one("SELECT status FROM entities WHERE id=?", x.target);
            if (target ? target.status !== 'visible' : !sample)
                throw new HttpError(404, 'Nội dung không còn khả dụng.');
            if (x.replyTo && !await one('SELECT id FROM comments WHERE id=? AND entity=?', x.replyTo, x.target))
                throw new HttpError(400, 'Bình luận được trả lời phải thuộc bài viết này.');
            const recentComments = await one('SELECT count(*) AS n FROM comments WHERE owner=? AND created_at>?', u.id, new Date(Date.now() - 60000).toISOString());
            if (recentComments.n >= 20)
                throw new HttpError(429, 'Bạn phản hồi quá nhanh.');
            const comment = stmt('INSERT INTO comments(id,entity,owner,body,created_at,reply_to) VALUES(?,?,?,?,?,?)',
                uid(), x.target, u.id, x.body, now(), x.replyTo ?? null);
            if (!target && sample) {
                const owner = 'sample:' + sample.id;
                await db.batch([
                    stmt('INSERT OR IGNORE INTO users(id,name,created_at) VALUES(?,?,?)', owner, sample.author, sample.created_at),
                    stmt('INSERT OR IGNORE INTO entities(id,kind,owner,title,body,category,payload,created_at) VALUES(?,?,?,?,?,?,?,?)',
                        sample.id, sample.kind, owner, sample.title, sample.body, sample.category, JSON.stringify(sample.payload), sample.created_at),
                    comment,
                ]);
            } else {
                await comment.run();
            }
            break;
        }
        case 'link': {
            let x = z.object({ target: idSchema, kind: z.enum(['like', 'save', 'follow', 'join']), enabled: z.boolean() }).parse(b);
            if (x.kind === 'join' && !groups.some(g => g.id === x.target))
                throw new HttpError(400, 'Cộng đồng không hợp lệ.');
            if (x.kind === 'follow' && (!await one("SELECT id FROM users WHERE id=? AND id NOT LIKE 'sample:%'", x.target) || x.target === u.id))
                throw new HttpError(400, 'Thành viên không hợp lệ.');
            if (['like', 'save'].includes(x.kind) && ![...catalog, ...examples, ...sampleReviews, ...news].some(item => item.id === x.target) && !await one("SELECT id FROM entities WHERE id=? AND status='visible'", x.target))
                throw new HttpError(404, 'Nội dung không còn khả dụng.');
            await (x.enabled ? stmt('INSERT OR IGNORE INTO links(owner,target,kind,created_at) VALUES(?,?,?,?)', u.id, x.target, x.kind, now()) : stmt('DELETE FROM links WHERE owner=? AND target=? AND kind=?', u.id, x.target, x.kind)).run();
            break;
        }
        case 'progress': {
            let lesson = txt(80).parse(b.lesson);
            if (!courses.some(c => c.lessons.some((_, i) => `${c.id}-${i}` === lesson)))
                throw new HttpError(400, 'Bài học không hợp lệ.');
            await stmt('INSERT OR IGNORE INTO progress(owner,lesson,created_at) VALUES(?,?,?)', u.id, lesson, now()).run();
            break;
        }
        case 'seller': {
            await stmt("UPDATE users SET seller_status='pending' WHERE id=? AND seller_status IN ('none','rejected')", u.id).run();
            break;
        }
        case 'sellerReview': {
            admin();
            let x = z.object({ target: idSchema, status: z.enum(['approved', 'rejected']), reason: txt(1000) }).parse(b);
            const target = await one('SELECT seller_status FROM users WHERE id=?', x.target);
            if (target?.seller_status !== 'pending')
                throw new HttpError(409, 'Hồ sơ không ở trạng thái chờ duyệt.');
            await db.batch([stmt('UPDATE users SET seller_status=? WHERE id=?', x.status, x.target), await log('seller_' + x.status, x.target, x.reason)]);
            break;
        }
        case 'order': {
            let x = z.object({ items: z.array(z.object({ id: idSchema, quantity: z.number().int().min(1).max(10) })).min(1).max(15), recipient: txt(100), phone: z.string().regex(/^[+\d ()-]{9,16}$/), address: txt(300) }).parse(b);
            let items = [];
            for (const it of x.items) {
                let p = catalog.find(p => p.id === it.id);
                if (!p) {
                    let e = await one("SELECT * FROM entities WHERE id=? AND kind='product' AND status='visible'", it.id);
                    if (!e)
                        throw new HttpError(400, 'Sản phẩm không khả dụng.');
                    p = { ...e, payload: JSON.parse(e.payload) };
                }
                items.push({ id: it.id, name: p!.title, price: p!.payload.price, quantity: it.quantity });
            }
            const total = items.reduce((s, p) => s + p.price * p.quantity, 0), id = uid();
            await stmt('INSERT INTO orders(id,owner,items,total,recipient,phone,address,events,created_at) VALUES(?,?,?,?,?,?,?,?,?)', id, u.id, JSON.stringify(items), total, x.recipient, x.phone, x.address, JSON.stringify([{ status: 'created', at: now(), note: 'Đơn trải nghiệm, không phát sinh thanh toán hay giao hàng.' }]), now()).run();
            return { ok: true, id };
        }
        case 'orderStep': {
            let x = z.object({ target: idSchema, status: z.enum(['confirmed', 'shipping', 'delivered', 'cancelled']) }).parse(b), o = await one('SELECT * FROM orders WHERE id=? AND owner=?', x.target, u.id);
            if (!o)
                throw new HttpError(404, 'Không tìm thấy đơn.');
            let expected: Record<string, string> = { created: 'confirmed', confirmed: 'shipping', shipping: 'delivered' };
            if (x.status === 'cancelled' ? ['delivered', 'cancelled'].includes(o.status) : expected[o.status] !== x.status)
                throw new HttpError(409, 'Chuyển trạng thái không hợp lệ.');
            let events = JSON.parse(o.events);
            events.push({ status: x.status, at: now(), note: 'Mô phỏng do chính bạn xác nhận; không phải dữ liệu hãng vận chuyển.' });
            await stmt('UPDATE orders SET status=?,events=? WHERE id=? AND owner=?', x.status, JSON.stringify(events), x.target, u.id).run();
            break;
        }
        case 'report': {
            let x = z.object({ target: idSchema, reason: txt(2000) }).parse(b);
            if (!await one("SELECT id FROM entities WHERE id=? AND owner NOT LIKE 'sample:%'", x.target) && !await one('SELECT id FROM orders WHERE id=? AND owner=?', x.target, u.id))
                throw new HttpError(404, 'Không tìm thấy nội dung hoặc đơn hàng.');
            await stmt('INSERT INTO reports(id,owner,target,reason,created_at) VALUES(?,?,?,?,?)', uid(), u.id, x.target, x.reason, now()).run();
            break;
        }
        case 'resolve': {
            admin();
            let x = z.object({ target: idSchema, status: z.enum(['resolved', 'dismissed']), reason: txt(2000), hide: z.boolean() }).parse(b);
            let report = await one('SELECT * FROM reports WHERE id=?', x.target);
            if (!report)
                throw new HttpError(404, 'Không tìm thấy báo cáo.');
            if (!['pending', 'appealed'].includes(report.status))
                throw new HttpError(409, 'Vụ việc đã được xử lý.');
            if (x.hide && x.status !== 'resolved')
                throw new HttpError(400, 'Chỉ ẩn khi đã kết luận có cơ sở.');
            let ops = [stmt('UPDATE reports SET status=?,resolution=? WHERE id=?', x.status, x.reason, x.target), await log(x.hide ? 'hide_content' : 'resolve_report', report.target, x.reason)];
            if (x.hide)
                ops.push(stmt("UPDATE entities SET status='hidden' WHERE id=?", report.target));
            await db.batch(ops);
            break;
        }
        case 'appeal': {
            let x = z.object({ target: idSchema, reason: txt(2000) }).parse(b);
            let r = await one('SELECT * FROM reports WHERE id=? AND (owner=? OR target IN (SELECT id FROM entities WHERE owner=?))', x.target, u.id, u.id);
            if (!r || !['resolved', 'dismissed'].includes(r.status))
                throw new HttpError(409, 'Chỉ khiếu nại vụ việc đã có kết quả của bạn.');
            await db.batch([stmt("UPDATE reports SET status='appealed',appeal=? WHERE id=?", x.reason, x.target), await log('appeal', x.target, x.reason)]);
            break;
        }
        case 'restore': {
            admin();
            let x = z.object({ target: idSchema, reason: txt(2000) }).parse(b);
            await db.batch([stmt("UPDATE entities SET status='visible' WHERE id=?", x.target), await log('restore', x.target, x.reason)]);
            break;
        }
        default: throw new HttpError(400, 'Thao tác không hợp lệ.');
    }
    return { ok: true };
}
