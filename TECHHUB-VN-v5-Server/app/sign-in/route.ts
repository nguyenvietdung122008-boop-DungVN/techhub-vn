import { checkOrigin, createSession, sessionUser } from '../../deployment/auth.mjs';
import { HttpError, readBody } from '../../lib/server';

export const dynamic = 'force-dynamic';

const responseHeaders = {
    'Cache-Control': 'no-store',
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    'Referrer-Policy': 'same-origin',
    'X-Content-Type-Options': 'nosniff',
};

function loginForm(status = 200) {
    const feedback = status === 200 ? '' : '<p role="alert">Đăng nhập chưa thành công. Kiểm tra tài khoản và mật khẩu rồi thử lại.</p>';
    return new Response(`<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Đăng nhập · TECHHUB VN</title>
<style>
*{box-sizing:border-box}body{font:16px system-ui,sans-serif;color:#1d1838;margin:0;padding:24px;background:#f6f4ff;min-height:100svh;display:grid;place-items:center}
main{width:min(100%,440px);padding:32px;border:1px solid #e4dff2;border-radius:20px;background:white;box-shadow:0 20px 48px #3c257617}
h1{margin:6px 0;font-size:1.8rem}small{font-weight:750;color:#5333bc}p{line-height:1.5;color:#544769;margin:10px 0 24px}
label{display:block;margin:14px 0 5px;font-weight:650}input,button{width:100%;font:inherit;padding:12px;border-radius:9px}
input{border:1px solid #b7adc9}button{margin-top:18px;border:0;color:white;background:#562dcc;font-weight:700;cursor:pointer}p[role=alert]{color:#a11e36}
:focus-visible{outline:2px solid #562dcc;outline-offset:3px}
</style>
</head>
<body>
<main>
<small>TECHHUB VN</small>
<h1>Đăng nhập</h1>
<p>Dùng tài khoản được quản trị viên TECHHUB VN cấp.</p>
${feedback}
<form method="post" action="/sign-in">
<label for="username">Tên đăng nhập</label>
<input id="username" name="username" maxlength="40" autocomplete="username" autocapitalize="none" required>
<label for="password">Mật khẩu</label>
<input id="password" name="password" type="password" maxlength="256" autocomplete="current-password" required>
<button>Đăng nhập</button>
</form>
</main>
</body>
</html>`, { status, headers: responseHeaders });
}

export function GET(request: Request) {
    if (sessionUser(request.headers)) return new Response(null, { status: 303, headers: { ...responseHeaders, Location: '/' } });
    return loginForm();
}

export async function POST(request: Request) {
    if (!checkOrigin(request)) return loginForm(403);
    if (!request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded')) return loginForm(415);

    try {
        const form = new URLSearchParams(new TextDecoder().decode(await readBody(request, 4096)));
        const username = (form.get('username') || '').trim().toLowerCase();
        const cookie = await createSession(username, form.get('password') || '');
        if (!cookie) return loginForm(401);
        return new Response(null, { status: 303, headers: { ...responseHeaders, 'Set-Cookie': cookie, Location: '/' } });
    } catch (error) {
        return loginForm(error instanceof HttpError ? error.status : 503);
    }
}
