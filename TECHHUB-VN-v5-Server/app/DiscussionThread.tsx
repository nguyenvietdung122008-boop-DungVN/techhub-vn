import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { MessageCircle, RefreshCw, Reply, Send, X } from 'lucide-react';

type Comment = {
    id: string;
    author: string;
    body: string;
    created_at: string;
    reply_to: string | null;
    reply_author: string | null;
};

type CommentPage = {
    comments: Comment[];
    before: string | null;
    total: number;
};

type ThreadProps = {
    target: string;
    question: boolean;
    signedIn: boolean;
    total: number;
    busy: boolean;
    submitError: string;
    onSignIn: () => void;
    onPost: (body: string, replyTo?: string) => Promise<boolean>;
};

const commentDate = new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh',
});

export function DiscussionThread({ target, question, signedIn, total, busy, submitError, onSignIn, onPost }: ThreadProps) {
    const [page, setPage] = useState<CommentPage | null>(null);
    const [reply, setReply] = useState<Comment | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const request = useRef<AbortController | null>(null);
    const textarea = useRef<HTMLTextAreaElement>(null);

    const load = useCallback(async (before?: string) => {
        request.current?.abort();
        const controller = new AbortController();
        request.current = controller;
        setLoading(true);
        setLoadError('');
        try {
            const params = new URLSearchParams({ thread: target });
            if (before) params.set('before', before);
            const response = await fetch('/api/hub?' + params, { cache: 'no-store', signal: controller.signal });
            const result = await response.json() as CommentPage & { error?: string };
            if (!response.ok || !Array.isArray(result.comments)) throw new Error(result.error || 'Không thể tải cuộc thảo luận.');
            if (!controller.signal.aborted) {
                setPage(current => before && current
                    ? { ...result, comments: [...result.comments, ...current.comments] }
                    : result);
            }
        } catch (error) {
            if (!controller.signal.aborted)
                setLoadError(error instanceof Error ? error.message : 'Không thể tải cuộc thảo luận.');
        } finally {
            if (!controller.signal.aborted) setLoading(false);
        }
    }, [target]);

    useEffect(() => {
        void load();
        return () => request.current?.abort();
    }, [load]);

    function startReply(comment: Comment) {
        if (!signedIn) {
            onSignIn();
            return;
        }
        setReply(comment);
        textarea.current?.focus();
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;
        const body = String(new FormData(form).get('body') ?? '').trim();
        if (busy) return;
        if (!body) {
            textarea.current?.setCustomValidity('Nhập nội dung bình luận.');
            textarea.current?.reportValidity();
            return;
        }
        if (await onPost(body, reply?.id)) {
            form.reset();
            setReply(null);
            void load();
        }
    }

    return (
        <section className="thread" aria-label={question ? 'Câu trả lời' : 'Thảo luận'}>
            <div className="sectionline row between thread-heading">
                <div><h3>{question ? 'Câu trả lời' : 'Thảo luận'}</h3><span className="small">{page?.total ?? total} phản hồi</span></div>
                <button type="button" className="textbutton" onClick={() => load()} disabled={loading || busy}><RefreshCw size={15} /> Làm mới</button>
            </div>
            {loadError && <p className="formerror" role="alert">{loadError}</p>}
            {loading && <p className="small thread-loading" role="status">Đang tải bình luận…</p>}
            {page?.before && <button type="button" className="secondary thread-older" onClick={() => load(page.before!)} disabled={loading || busy}>
                Xem bình luận trước
            </button>}
            {page && !page.comments.length && !loading && <p className="thread-empty muted">
                <MessageCircle size={17} /> Hãy bắt đầu bằng một câu hỏi hoặc chia sẻ kinh nghiệm của bạn.
            </p>}
            {!!page?.comments.length && <ol className="thread-comments">
                {page.comments.map(comment => (
                    <li className={'thread-comment' + (comment.reply_to ? ' thread-reply' : '')} key={comment.id}>
                        {comment.reply_author && <span className="thread-reply-label"><Reply size={14} /> Trả lời <strong>{comment.reply_author}</strong></span>}
                        <div className="thread-byline">
                            <strong>{comment.author}</strong>
                            <time dateTime={comment.created_at}>{commentDate.format(new Date(comment.created_at))}</time>
                        </div>
                        <p>{comment.body}</p>
                        <button type="button" className="textbutton" onClick={() => startReply(comment)} disabled={busy}
                            aria-label={'Trả lời bình luận của ' + comment.author}><Reply size={15} /> Trả lời</button>
                    </li>
                ))}
            </ol>}
            {signedIn ? <form className="commentform thread-form" onSubmit={submit}>
                {reply && <div className="thread-reply-target">
                    <span>Đang trả lời <strong>{reply.author}</strong></span>
                    <button type="button" className="icon" onClick={() => { setReply(null); textarea.current?.focus(); }} aria-label="Hủy trả lời"><X size={17} /></button>
                </div>}
                <label className="field">
                    <span>{reply ? 'Nội dung trả lời' : 'Bình luận của bạn'}</span>
                    <textarea ref={textarea} name="body" placeholder="Chia sẻ ý kiến hoặc kinh nghiệm của bạn…" maxLength={2000} onInput={event => event.currentTarget.setCustomValidity('')} required />
                </label>
                {submitError && <p className="formerror" role="alert">{submitError}</p>}
                <button type="submit" className="primary" disabled={busy}><Send size={16} /> {busy ? 'Đang gửi…' : reply ? 'Gửi trả lời' : 'Đăng bình luận'}</button>
            </form> : <button type="button" className="secondary" onClick={onSignIn}>Đăng nhập để bình luận</button>}
        </section>
    );
}
