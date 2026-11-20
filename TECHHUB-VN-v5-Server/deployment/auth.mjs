import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { database } from './storage.mjs';

const verifyPassword = promisify(scrypt);
const sessionSeconds = 12 * 60 * 60;
const cookieName = 'techhub_session';
let pendingLogins = 0;

export function siteOrigin() {
    const parsed = new URL(process.env.TECHHUB_ORIGIN || 'http://localhost:3000');
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname);
    if (parsed.protocol !== 'https:' && (parsed.protocol !== 'http:' || !local)) {
        throw new Error('TECHHUB_ORIGIN phải dùng HTTPS cho tên miền trên Internet.');
    }
    return parsed.origin;
}

export function checkOrigin(request) {
    return request.headers.get('origin') === siteOrigin();
}

function tokenHash(token) {
    return createHash('sha256').update(token).digest('hex');
}

function sessionToken(headers) {
    return headers.get('cookie')?.match(/(?:^|;\s*)techhub_session=([A-Za-z0-9_-]{43})(?:;|$)/)?.[1];
}

export function sessionUser(headers) {
    const token = sessionToken(headers);
    if (!token) return null;
    const row = database().prepare(`
        SELECT a.username,a.display_name,a.role
        FROM selfhost_sessions s JOIN selfhost_accounts a ON a.username=s.username
        WHERE s.token_hash=? AND s.expires_at>?
    `).get(tokenHash(token), Date.now());
    return row ? {
        id: 'local:' + String(row.username),
        name: String(row.display_name),
        admin: row.role === 'admin',
    } : null;
}

export async function createSession(username, password) {
    if (!/^[a-z0-9][a-z0-9._-]{1,39}$/.test(username) || !password || password.length > 256) return null;
    if (pendingLogins >= 4) return null;
    pendingLogins += 1;
    try {
        const db = database();
        const account = db.prepare('SELECT salt,password_hash FROM selfhost_accounts WHERE username=?').get(username);
        const expected = Buffer.from(String(account?.password_hash ?? '0'.repeat(64)), 'hex');
        const derived = await verifyPassword(password, String(account?.salt ?? '0'.repeat(32)), 32);
        if (!timingSafeEqual(expected, derived) || !account) return null;

        const token = randomBytes(32).toString('base64url');
        const at = Date.now();
        db.prepare('DELETE FROM selfhost_sessions WHERE expires_at<=?').run(at);
        db.prepare(`
            INSERT INTO selfhost_sessions(token_hash,username,expires_at)
            SELECT ?,username,? FROM selfhost_accounts WHERE username=? AND password_hash=?
        `).run(tokenHash(token), at + sessionSeconds * 1000, username, account.password_hash);
        return cookie(token, sessionSeconds);
    } finally {
        pendingLogins -= 1;
    }
}

function cookie(value, maxAge) {
    const secure = siteOrigin().startsWith('https:') ? '; Secure' : '';
    return cookieName + '=' + value + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=' + maxAge + secure;
}

export function closeSession(headers) {
    const token = sessionToken(headers);
    if (token) database().prepare('DELETE FROM selfhost_sessions WHERE token_hash=?').run(tokenHash(token));
    return cookie('', 0);
}
