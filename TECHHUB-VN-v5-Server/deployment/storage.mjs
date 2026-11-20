import { mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const connection = Symbol.for('techhub.sqliteConnection');

export function database() {
    if (globalThis[connection]) return globalThis[connection];

    const directory = resolve(process.env.TECHHUB_DATA_DIR || 'data');
    const migrations = resolve('drizzle');
    mkdirSync(directory, { recursive: true, mode: 0o700 });
    const db = new DatabaseSync(resolve(directory, 'techhub.sqlite'), { timeout: 5000 });
    try {
        db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;');
        db.exec('BEGIN IMMEDIATE');
        db.exec(`
            CREATE TABLE IF NOT EXISTS selfhost_migrations (name TEXT PRIMARY KEY);
            CREATE TABLE IF NOT EXISTS selfhost_accounts (
                username TEXT PRIMARY KEY,
                display_name TEXT NOT NULL,
                role TEXT NOT NULL CHECK (role IN ('admin','member')),
                salt TEXT NOT NULL,
                password_hash TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS selfhost_sessions (
                token_hash TEXT PRIMARY KEY,
                username TEXT NOT NULL REFERENCES selfhost_accounts(username) ON DELETE CASCADE,
                expires_at INTEGER NOT NULL
            );
            CREATE INDEX IF NOT EXISTS selfhost_sessions_user ON selfhost_sessions(username);
            CREATE TABLE IF NOT EXISTS selfhost_media (
                id TEXT PRIMARY KEY,
                owner TEXT NOT NULL,
                mime TEXT NOT NULL,
                content BLOB NOT NULL
            );
        `);
        const applied = db.prepare('SELECT 1 FROM selfhost_migrations WHERE name=?');
        const record = db.prepare('INSERT INTO selfhost_migrations(name) VALUES(?)');
        for (const file of readdirSync(migrations).filter(name => /^\d+_.+\.sql$/.test(name)).sort()) {
            if (applied.get(file)) continue;
            db.exec(readFileSync(resolve(migrations, file), 'utf8'));
            record.run(file);
        }
        db.exec('COMMIT');
        globalThis[connection] = db;
        return db;
    } catch (error) {
        if (db.isTransaction) db.exec('ROLLBACK');
        db.close();
        throw error;
    }
}

export function hubDatabase() {
    const db = database();
    return {
        prepare(sql) {
            const statement = db.prepare(sql);
            return {
                bind(...values) {
                    return {
                        all: () => ({ results: statement.all(...values) }),
                        first: () => statement.get(...values) ?? null,
                        run: () => statement.run(...values),
                    };
                },
            };
        },
        batch(statements) {
            db.exec('BEGIN IMMEDIATE');
            try {
                const result = statements.map(statement => statement.run());
                db.exec('COMMIT');
                return result;
            } catch (error) {
                db.exec('ROLLBACK');
                throw error;
            }
        },
    };
}
