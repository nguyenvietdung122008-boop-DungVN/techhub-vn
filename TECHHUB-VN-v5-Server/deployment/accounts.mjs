import { randomBytes, scryptSync } from 'node:crypto';
import { database } from './storage.mjs';

function main() {
    const [action, rawUsername, displayName, role] = process.argv.slice(2);
    const username = rawUsername?.toLowerCase();
    if (!username || !/^[a-z0-9][a-z0-9._-]{1,39}$/.test(username) || !['create', 'reset'].includes(action)) {
        throw new Error('Cú pháp: create <tên-đăng-nhập> "<tên hiển thị>" <admin|member> hoặc reset <tên-đăng-nhập>');
    }
    if (action === 'create' && (!displayName?.trim() || displayName.trim().length > 80 || !['admin', 'member'].includes(role))) {
        throw new Error('Tên hiển thị phải có 1–80 ký tự. Vai trò là admin hoặc member.');
    }

    const password = randomBytes(18).toString('base64url');
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 32).toString('hex');
    const db = database();

    db.exec('BEGIN IMMEDIATE');
    try {
        if (action === 'create') {
            const result = db.prepare(
                'INSERT OR IGNORE INTO selfhost_accounts(username,display_name,role,salt,password_hash) VALUES(?,?,?,?,?)',
            ).run(username, displayName.trim(), role, salt, hash);
            if (!result.changes) throw new Error('Tên đăng nhập đã tồn tại.');
        } else {
            const result = db.prepare('UPDATE selfhost_accounts SET salt=?,password_hash=? WHERE username=?').run(salt, hash, username);
            if (!result.changes) throw new Error('Không tìm thấy tài khoản.');
            db.prepare('DELETE FROM selfhost_sessions WHERE username=?').run(username);
        }
        db.exec('COMMIT');
    } catch (error) {
        db.exec('ROLLBACK');
        throw error;
    }
    process.stdout.write('Tên đăng nhập: ' + username + '\nMật khẩu mới: ' + password + '\n');
}

try {
    main();
} catch (error) {
    process.stderr.write((error instanceof Error ? error.message : 'Không thể cập nhật tài khoản.') + '\n');
    process.exitCode = 1;
}
