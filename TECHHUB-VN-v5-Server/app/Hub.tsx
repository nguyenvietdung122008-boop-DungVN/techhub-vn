'use client';
import { useState, useEffect, useCallback, useRef, type FormEvent, type ReactNode } from 'react';
import { Home, Users, BookOpen, Newspaper, Layers3, ShoppingBag, Truck, Sparkles, ShieldCheck, Bookmark, Search, Bell, Plus, ArrowUpRight, ChevronRight, MessageCircle, ThumbsUp, X, Link2, Check, MapPin, Clock3, Star, UserRound, LogOut, Package, Code2, GraduationCap, Flag, Send, ExternalLink, ArrowRight, ImagePlus, Building2, RefreshCw, Cpu, Menu, Compass } from 'lucide-react';
import { catalog, examples, courses, groups, news, sampleReviews, sampleThreads, type Item } from '../lib/content';
import { Discover } from './Discover';
import { DiscussionThread } from './DiscussionThread';
type Data = {
    me: any;
    entities: Item[];
    comments: any[];
    counts: any[];
    links: any[];
    progress: any[];
    orders: any[];
    reports: any[];
    users: any[];
    audit: any[];
};
const initial: Data = { me: null, entities: [], comments: [], counts: [], links: [], progress: [], orders: [], reports: [], users: [], audit: [] };
const titles: Record<string, string> = { feed: 'Khám phá', groups: 'Cộng đồng', learn: 'Học tập', news: 'Tin công nghệ', projects: 'Dự án', shop: 'Sản phẩm', logistics: 'Đơn hàng & Vận chuyển', assistant: 'Trợ lý công nghệ', reviews: 'Đánh giá', business: 'Doanh nghiệp', search: 'Tìm kiếm', profile: 'Hồ sơ của tôi', saved: 'Đã lưu', safety: 'Tin cậy & Hỗ trợ', admin: 'Quản trị', about: 'Về TECHHUB VN', questions: 'Hỏi đáp kỹ thuật' };
const normalizeSearch = (value: string) => value.toLocaleLowerCase('vi').normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/đ/g, 'd').trim();
const discussionKinds = ['post', 'question'];
const communityFilters = [
    { key: 'all', title: 'Tất cả' },
    { key: 'post', title: 'Thảo luận' },
    { key: 'question', title: 'Hỏi đáp' },
] as const;
const communityPageSize = 8;
const stateNames: Record<string, string> = { created: 'Đã tạo', confirmed: 'Đã xác nhận', shipping: 'Đang giao', delivered: 'Đã nhận', cancelled: 'Đã hủy', pending: 'Chờ xem xét', resolved: 'Đã xử lý', dismissed: 'Không đủ cơ sở', appealed: 'Đang khiếu nại', approved: 'Đã xét duyệt hồ sơ', rejected: 'Chưa được duyệt', none: 'Chưa đăng ký' };
const money = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
const date = (s: string) => new Date(s).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
const human = (s: string) => s?.split(' ').map(x => x[0]).slice(-2).join('').toUpperCase() || 'TV';
function Avatar({ name, size = '' }: {
    name: string;
    size?: string;
}) { return <span className={'avatar ' + size}>{human(name)}</span>; }
function Empty({ children }: {
    children: ReactNode;
}) { return <div className="empty"><Layers3 size={28}/><p>{children}</p></div>; }
function Head({ eyebrow, title, desc, action }: {
    eyebrow: string;
    title: string;
    desc: string;
    action?: ReactNode;
}) { return <div className="pagehead"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{desc}</p></div>{action}</div>; }
export default function Hub() {
    const [data, setData] = useState<Data>(initial), [page, setPage] = useState('feed'), [filter, setFilter] = useState('Tất cả'), [query, setQuery] = useState(''), [loading, setLoading] = useState(true), [error, setError] = useState(''), [busy, setBusy] = useState(false), [notice, setNotice] = useState(''), [modal, setModal] = useState<any>(null), [cart, setCart] = useState<{
        id: string;
        quantity: number;
    }[]>([]), [compares, setCompares] = useState<string[]>([]), [lesson, setLesson] = useState<{
        course: string;
        index: number;
    } | null>(null), [chat, setChat] = useState<{
        role: string;
        text: string;
    }[]>([]), [chatInput, setChatInput] = useState(''), [selectedGroup, setSelectedGroup] = useState(''), [formError, setFormError] = useState('');
    const [tradeFilter, setTradeFilter] = useState('Tất cả'), [reviewFilter, setReviewFilter] = useState('');
    const [itemHash, setItemHash] = useState('');
    const [communityKind, setCommunityKind] = useState<(typeof communityFilters)[number]['key']>('all');
    const [communityLimit, setCommunityLimit] = useState(communityPageSize);
    const searchRef = useRef<HTMLInputElement>(null);
    const dialogRef = useRef<HTMLDialogElement>(null), toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const toast = (text: string) => { setNotice(text); if (toastTimer.current)
        clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setNotice(''), 4500); };
    const refresh = useCallback(async () => { try {
        const r = await fetch('/api/hub', { cache: 'no-store' }), j: any = await r.json();
        if (!r.ok)
            throw Error(j.error);
        setData(j);
        setError('');
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'Không tải được dữ liệu.');
    }
    finally {
        setLoading(false);
    } }, []);
    useEffect(() => {
        function readRoute() {
            const [route, params] = location.hash.slice(1).split('?');
            if (route.startsWith('item-')) {
                setItemHash(route.slice(5));
                return;
            }
            const search = new URLSearchParams(params);
            setItemHash('');
            setModal(null);
            setPage(Object.hasOwn(titles, route) ? route : 'feed');
            setQuery(search.get('q') || '');
            setSelectedGroup(search.get('group') || '');
            setCommunityKind('all');
            setCommunityLimit(communityPageSize);
            setReviewFilter(search.get('product') || '');
            setTradeFilter('Tất cả');
            setFilter('Tất cả');
            setLesson(null);
        }

        readRoute();
        refresh();
        try {
            const stored = JSON.parse(localStorage.getItem('techhub-cart-v3') || '[]');
            if (Array.isArray(stored)) setCart(stored);
        } catch {}
        window.addEventListener('popstate', readRoute);
        window.addEventListener('hashchange', readRoute);
        return () => {
            window.removeEventListener('popstate', readRoute);
            window.removeEventListener('hashchange', readRoute);
        };
    }, [refresh]);
    useEffect(() => {
        try { localStorage.setItem('techhub-cart-v3', JSON.stringify(cart)); } catch {}
    }, [cart]);
    useEffect(() => { if (modal) {
        setFormError('');
        dialogRef.current?.showModal();
    }
    else
        dialogRef.current?.close(); }, [modal]);
    useEffect(() => { const key = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (searchRef.current?.offsetParent) {
            searchRef.current.focus();
        } else {
            nav('search');
        }
    } }; window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key); }, []);
    useEffect(() => { const f = () => refresh(); window.addEventListener('focus', f); return () => window.removeEventListener('focus', f); }, [refresh]);
    function nav(p: string, options: { group?: string; product?: string } = {}) {
        setPage(p);
        setFilter('Tất cả');
        setQuery('');
        setLesson(null);
        setSelectedGroup(options.group || '');
        setCommunityKind('all');
        setCommunityLimit(communityPageSize);
        setReviewFilter(options.product || '');
        setTradeFilter('Tất cả');
        setItemHash('');
        setModal(null);
        const params = new URLSearchParams(options);
        const next = '#' + p + (params.size ? '?' + params : '');
        if (location.hash !== next) window.history.pushState(null, '', next);
        window.scrollTo({ top: 0, behavior: 'instant' });
    }

    function searchFor(value: string) {
        const next = '#search' + (value ? '?' + new URLSearchParams({ q: value }) : '');
        if (page === 'search') window.history.replaceState(null, '', next);
        else window.history.pushState(null, '', next);
        setPage('search');
        setQuery(value);
        setFilter('Tất cả');
        setSelectedGroup('');
        setItemHash('');
    }

    function closeModal() {
        if (itemHash) {
            setItemHash('');
            window.history.replaceState(null, '', '#' + page);
        }
        setModal(null);
    }
    async function mutate(action: any, message = 'Đã lưu thay đổi') { if (busy)
        return false; setBusy(true); setFormError(''); try {
        const r = await fetch('/api/hub', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(action) }), j: any = await r.json();
        if (!r.ok)
            throw Error(j.error);
        await refresh();
        if (message)
            toast(message);
        return true;
    }
    catch (e) {
        const text = e instanceof Error ? e.message : 'Không thể lưu.';
        setFormError(text);
        toast(text);
        return false;
    }
    finally {
        setBusy(false);
    } }
    const linked = (kind: string, target: string) => data.links.some(x => x.kind === kind && x.target === target);
    const count = (kind: string, target: string) => Number(data.counts.find(x => x.kind === kind && x.target === target)?.count || 0);
    async function toggle(kind: string, target: string) { await mutate({ action: 'link', kind, target, enabled: !linked(kind, target) }, kind === 'save' ? 'Đã cập nhật mục lưu' : kind === 'join' ? 'Đã cập nhật cộng đồng' : 'Đã cập nhật tương tác'); }
    function requireUser(fn: () => void) { if (!data.me) {
        setModal({ type: 'signin' });
        return;
    } fn(); }
    const activeGroup = groups.find(group => group.id === selectedGroup || group.name === selectedGroup);
    function create(kind = 'post', category?: string, product?: string) {
        const fromCommunity = page === 'groups' && discussionKinds.includes(kind);
        requireUser(() => setModal({
            type: 'create', kind, category: category || (fromCommunity ? activeGroup?.name : undefined), product, fromCommunity,
        }));
    }
    const products = [...data.entities.filter(x => x.kind === 'product' && x.status === 'visible'), ...catalog];
    const all = [...data.entities, ...examples, ...catalog, ...news, ...sampleReviews];
    const productReviews = (id: string) => all.filter(item => item.kind === 'review' && item.status === 'visible' && item.payload.product === id);
    const realProductReviews = (id: string) => productReviews(id).filter(review => !review.demo);
    function openDetail(item: Item) { setModal({ type: 'detail', item }); }
    const searchTerm = normalizeSearch(query);
    const groupCategory = activeGroup?.name || (page === 'questions' ? selectedGroup : '');
    const visible = (kinds: string[]) => all.filter(x => kinds.includes(x.kind) && x.status === 'visible' && (filter === 'Tất cả' || x.category === filter) && (!groupCategory || x.category === groupCategory) && normalizeSearch([x.title, x.body, x.category, x.author, x.payload.type, x.payload.location, x.payload.services].filter(Boolean).join(' ')).includes(searchTerm));
    async function share(id: string) { try {
        await navigator.clipboard.writeText(location.origin + '/#item-' + id);
        toast('Đã sao chép liên kết');
    }
    catch {
        setModal({ type: 'share', url: location.origin + '/#item-' + id });
    } }
    useEffect(() => {
        if (!itemHash) return;
        const item = [...data.entities, ...examples, ...catalog, ...news, ...sampleReviews]
            .find(candidate => candidate.id === itemHash && candidate.status === 'visible');
        if (item) setModal({ type: 'detail', item });
        else if (!loading) setModal({ type: 'missing' });
    }, [itemHash, data.entities, loading]);

    function reviewSummary(item: Item) {
        return (
            <div className="reviewdetails">
                <span className="stars" role="img" aria-label={item.payload.rating + ' trên 5 sao'}>
                    {'★'.repeat(item.payload.rating || 0)}{'☆'.repeat(5 - (item.payload.rating || 0))}
                </span>
                <p><b>Ưu điểm</b> {item.payload.pros}</p>
                <p><b>Hạn chế</b> {item.payload.cons}</p>
                <span className="badge muted">{item.demo ? 'Đánh giá minh họa' : 'Chưa xác minh giao dịch'}</span>
                {item.payload.sponsor && <span className="small review-disclosure">{item.payload.sponsor}</span>}
            </div>
        );
    }

    function postCard(item: Item) {
        const reviewProduct = item.kind === 'review' ? products.find(product => product.id === item.payload.product) : undefined;
        const saved = linked('save', item.id);
        const liked = linked('like', item.id);
        return (
            <article className={'post card' + (page === 'groups' ? ' community-post' : '')} key={item.id}>
                <div className="posthead">
                    <button className="authorbutton" onClick={() => setModal({ type: 'member', item })}>
                        <Avatar name={item.author} />
                        <div><strong>{item.author}</strong><small>{item.category} · {date(item.created_at)}</small></div>
                    </button>
                    <span className="badge">{item.demo ? 'Minh họa' : item.kind === 'question' ? 'Hỏi đáp' : item.kind === 'review' ? 'Đánh giá' : 'Cộng đồng'}</span>
                </div>
                {item.status === 'hidden' && <div className="alert">Nội dung đang được ẩn. Bạn vẫn xem được bài của mình.</div>}
                <h3><button className="item-title" onClick={() => openDetail(item)}>{item.title}</button></h3>
                {reviewProduct && <button className="textbutton review-product" onClick={() => openDetail(reviewProduct)}><Cpu size={15} /> {reviewProduct.title}</button>}
                <p className="bodytext">{item.body}</p>
                {item.payload.image && <img className="postimage" src={item.payload.image} alt="" loading="lazy" />}
                {item.kind === 'review' && reviewSummary(item)}
                <div className="poststats">
                    <span><ThumbsUp size={14} /> {count('like', item.id)} lượt hữu ích</span><span>{count('comment', item.id)} phản hồi</span>
                </div>
                <div className="postactions">
                    <button aria-pressed={liked} className={liked ? 'on' : ''} onClick={() => requireUser(() => toggle('like', item.id))}><ThumbsUp size={16} /> Hữu ích</button>
                    <button onClick={() => openDetail(item)}><MessageCircle size={16} /> {item.kind === 'question' ? 'Trả lời' : 'Thảo luận'}</button>
                    <button aria-label={saved ? 'Bỏ lưu bài' : 'Lưu bài'} aria-pressed={saved} className={saved ? 'on' : ''} onClick={() => requireUser(() => toggle('save', item.id))}><Bookmark size={16} /></button>
                    <button aria-label="Chia sẻ" onClick={() => share(item.id)}><Link2 size={16} /></button>
                    {!item.demo && item.owner !== 'editorial' && <button aria-label="Báo cáo" onClick={() => requireUser(() => setModal({ type: 'report', target: item.id }))}><Flag size={15} /></button>}
                </div>
            </article>
        );
    }

    function productCard(product: Item) {
        const saved = linked('save', product.id);
        const reviews = realProductReviews(product.id);
        return (
            <article key={product.id} className="product card">
                <div className="productphoto">
                    <button className="photobutton" aria-label={'Xem ' + product.title} onClick={() => openDetail(product)}>
                        {product.payload.image ? <img src={product.payload.image} alt="" loading="lazy" /> : <Package size={54} />}
                    </button>
                    <button className={'savebutton ' + (saved ? 'on' : '')} aria-label={(saved ? 'Bỏ lưu ' : 'Lưu ') + product.title} aria-pressed={saved} onClick={() => requireUser(() => toggle('save', product.id))}><Bookmark size={17} /></button>
                    {product.demo && <span className="photobadge">Dữ liệu mẫu</span>}
                </div>
                <div className="productinfo">
                    <span className="product-meta">{product.category} <span>·</span> {product.payload.type || 'B2C'}</span>
                    <h3><button className="producttitle" onClick={() => openDetail(product)}>{product.title}</button></h3>
                    <strong className="price">{money(product.payload.price || 0)}</strong>
                    <small><MapPin size={13} /> {product.payload.location || 'Việt Nam'}</small>
                    {reviews.length > 0 && <button className="textbutton product-review-link" onClick={() => nav('reviews', { product: product.id })}><Star size={14} /> {reviews.length} đánh giá</button>}
                </div>
            </article>
        );
    }
    function addCart(p: Item) { setCart(c => c.some(x => x.id === p.id) ? c.map(x => x.id === p.id ? { ...x, quantity: Math.min(x.quantity + 1, 10) } : x) : [...c, { id: p.id, quantity: 1 }]); toast('Đã thêm vào giỏ hàng trải nghiệm'); }
    function filters(categories: string[]) { return <div className="chips">{['Tất cả', ...categories].map(s => <button className={'chip ' + (filter === s ? 'active' : '')} key={s} onClick={() => setFilter(s)}>{s}</button>)}</div>; }
    function feed() {
        return <Discover navigate={nav} open={openDetail} compose={() => create()} products={products}
            discussions={visible(discussionKinds)} renderProduct={productCard} renderPost={postCard} />;
    }
    function communities() {
        const posts = visible(communityKind === 'all' ? discussionKinds : [communityKind])
            .sort((first, second) => second.created_at.localeCompare(first.created_at));
        const joined = !!activeGroup && linked('join', activeGroup.id);

        return <>
            <Head eyebrow="TECHHUB VN" title={activeGroup?.name || 'Cộng đồng'}
                desc={activeGroup?.desc || 'Chia sẻ kinh nghiệm, đặt câu hỏi và trao đổi với những người cùng quan tâm đến công nghệ.'}
                action={<button className="primary" onClick={() => create()}><Plus size={17} /> Viết bài</button>} />
            <div className="community-layout">
                <nav className="card community-channels" aria-label="Nhóm thảo luận">
                    <h2>Nhóm thảo luận</h2>
                    <button className="community-channel" aria-current={!activeGroup ? 'page' : undefined} onClick={() => nav('groups')}>
                        <span className="community-channel-icon"><Users size={17} /></span>
                        <span>Tất cả nhóm</span>
                    </button>
                    {groups.map(group => <button key={group.id} className="community-channel"
                        aria-current={activeGroup?.id === group.id ? 'page' : undefined}
                        onClick={() => nav('groups', { group: group.id })}>
                        <span className="community-channel-icon" aria-hidden="true" style={{ background: group.color }}>{group.icon}</span>
                        <span>{group.name}</span>
                    </button>)}
                </nav>
                <section className="community-feed" aria-label="Bài viết cộng đồng">
                    {activeGroup && <div className="card community-membership">
                        <span><Users size={16} /> {count('join', activeGroup.id)} thành viên</span>
                        <button className="secondary" type="button" disabled={busy} aria-pressed={joined}
                            onClick={() => requireUser(() => toggle('join', activeGroup.id))}>
                            {joined ? <><Check size={16} /> Đã tham gia</> : <><Plus size={16} /> Tham gia nhóm</>}
                        </button>
                    </div>}
                    <div className="community-feed-heading">
                        <h2>Bài viết mới</h2>
                        <button className="textbutton" onClick={() => create('question')}><MessageCircle size={17} /> Đặt câu hỏi</button>
                    </div>
                    <div className="chips community-filters" role="group" aria-label="Loại bài viết">
                        {communityFilters.map(option => <button key={option.key} className={'chip ' + (communityKind === option.key ? 'active' : '')}
                            aria-pressed={communityKind === option.key} onClick={() => {
                                setCommunityKind(option.key);
                                setCommunityLimit(communityPageSize);
                            }}>{option.title}</button>)}
                    </div>
                    {posts.length ? posts.slice(0, communityLimit).map(postCard) : <Empty>
                        {loading ? 'Đang tải bài viết…' : 'Chưa có bài viết ở đây. Hãy mở đầu bằng điều bạn muốn chia sẻ.'}
                    </Empty>}
                    {posts.length > communityLimit && <button className="secondary" onClick={() => setCommunityLimit(limit => limit + communityPageSize)}>Xem thêm bài viết</button>}
                </section>
            </div>
            {!activeGroup && data.users.length > 0 && <section className="card pad community-members">
                <h2>Thành viên cộng đồng</h2>
                {data.users.map(member => <div className="memberrow" key={member.id}><Avatar name={member.name} />
                    <div><strong>{member.name}</strong><small>{member.bio || 'Thành viên TECHHUB VN'}</small></div>
                    {member.id !== data.me?.id && <button className="secondary" aria-pressed={linked('follow', member.id)}
                        onClick={() => requireUser(() => toggle('follow', member.id))}>
                        {linked('follow', member.id) ? 'Đang theo dõi' : 'Theo dõi'}
                    </button>}
                </div>)}
            </section>}
        </>;
    }
    function learning() { if (lesson) {
        const c = courses.find(c => c.id === lesson.course)!, l = c.lessons[lesson.index], done = data.progress.some(x => x.lesson === c.id + '-' + lesson.index);
        return <><button className="textbutton back" onClick={() => setLesson(null)}>← Về lộ trình học</button><Head eyebrow={`BÀI ${lesson.index + 1} / ${c.lessons.length}`} title={l.title} desc={c.title}/><section className="card article"><p>{l.text}</p>{l.code && <pre><code>{l.code}</code></pre>}<h2>Tự thực hành</h2><p>{l.task}</p><div className="alert">Bài học văn bản. Hãy chạy code trong môi trường của bạn; chưa có trình thực thi hoặc chứng chỉ.</div><button className="primary" disabled={busy} onClick={() => requireUser(async () => { if (await mutate({ action: 'progress', lesson: c.id + '-' + lesson.index }, 'Đã lưu tiến độ học trên tài khoản')) {
            if (lesson.index < 2)
                setLesson({ ...lesson, index: lesson.index + 1 });
            else
                setLesson(null);
        } })}>{done ? 'Học tiếp' : 'Hoàn thành bài học'} <Check size={16}/></button></section><div className="chips">{c.lessons.map((l, i) => <button className={'chip ' + (i === lesson.index ? 'active' : '')} key={i} onClick={() => setLesson({ course: c.id, index: i })}>{i + 1}. {l.title}</button>)}</div></>;
    } ; return <><Head eyebrow="HỌC TẬP & TRI THỨC" title="Một bước nhỏ. Một điều mới." desc="Các lộ trình nhập môn ngắn, dễ bắt đầu. Tiến độ được lưu theo tài khoản."/><div className="learningprogress card"><span className="quickicon violet"><GraduationCap size={24}/></span><div><h2>Hành trình của bạn</h2><p>{data.progress.length}/9 bài học hoàn thành</p><div className="progress"><i style={{ width: data.progress.length / 9 * 100 + '%' }}/></div></div><button className="textbutton" onClick={() => nav('questions')}>Cần giúp đỡ? <ArrowUpRight size={14}/></button></div>{courses.map(c => { let n = data.progress.filter(x => x.lesson.startsWith(c.id + '-')).length; return <section className="card coursecard" key={c.id}><img src={c.image} alt={c.title}/><div><span className="eyebrow">{c.category}</span><h2>{c.title}</h2><p>{c.desc}</p><div className="small">3 bài học · Nhập môn · {n}/3 hoàn thành</div><button className="primary" onClick={() => setLesson({ course: c.id, index: Math.min(n, 2) })}>{n ? 'Tiếp tục học' : 'Bắt đầu học'} <ArrowRight size={15}/></button></div></section>; })}</>; }
    function newsPage() { return <><Head eyebrow="TECH NEWS" title="Hiểu công nghệ đang chuyển động." desc="Nguồn gốc, ngày xuất bản và loại nội dung luôn được hiển thị rõ ràng." action={data.me?.admin ? <button className="primary" onClick={() => create('article')}><Plus size={15}/> Đăng tin</button> : undefined}/><div className="alert compact">Tuyển chọn thủ công ngày 18/11/2026 · Không phải luồng tin tự động hay thời gian thực.</div>{filters(['AI', 'Phần mềm', 'Hạ tầng'])}{visible(['article']).map((a, i) => <article className={'card newscard ' + (i === 0 ? 'featured' : '')} key={a.id}>{a.payload.image && <img src={a.payload.image} alt={a.title}/>}<div><div className="row"><span className="badge">{a.payload.label}</span><span className="small">{a.category} · {a.payload.published}</span></div><h2>{a.title}</h2><p>{a.body}</p><div className="row"><span className="small">Nguồn: {a.payload.source}</span><a href={a.payload.url} target="_blank" rel="noreferrer" className="textbutton">Đọc bản gốc <ExternalLink size={13}/></a></div></div></article>)}</>; }
    function projects() { return <><Head eyebrow="Ý TƯỞNG & SẢN PHẨM" title="Đưa ý tưởng ra thế giới." desc="Chia sẻ điều bạn đang xây dựng. Tìm góp ý và người cùng thực hiện." action={<button className="primary" onClick={() => create('project')}><Plus size={15}/> Dự án mới</button>}/>{filters(['Phần mềm', 'AI & Dữ liệu', 'IoT & Phần cứng'])}<div className="grid2">{visible(['project']).map(p => <section className="card projectcard" key={p.id}>{p.payload.image ? <img src={p.payload.image} alt={p.title}/> : <div className="projectplaceholder"><Code2 size={50}/></div>}<div className="pad"><div className="row"><span className="badge">{p.payload.stage || 'Đang phát triển'}</span>{p.demo && <span className="small">Minh họa</span>}</div><h2>{p.title}</h2><p>{p.body}</p><div className="tags">{p.payload.stack?.split(',').map((s: string) => <span key={s}>{s.trim()}</span>)}</div><div className="small">Tìm cộng tác: {p.payload.looking || 'Mọi đóng góp'}</div><button className="textbutton" onClick={() => setModal({ type: 'detail', item: p })}>Góp ý & Kết nối <ArrowUpRight size={15}/></button></div></section>)}</div>{!visible(['project']).length && <Empty>Chưa có dự án phù hợp. Chia sẻ ý tưởng đầu tiên của bạn.</Empty>}</>; }
    function tradeFilters() {
        return <div className="trade-filter" role="group" aria-label="Mô hình kinh doanh">
            {['Tất cả', 'B2C', 'B2B'].map(model => <button key={model} type="button"
                className={'chip ' + (tradeFilter === model ? 'active' : '')}
                aria-pressed={tradeFilter === model}
                onClick={() => setTradeFilter(model)}>
                {model === 'Tất cả' ? 'Mọi mô hình' : model}
            </button>)}
        </div>;
    }

    function marketplace() {
        const matches = visible(['product']).filter(product => tradeFilter === 'Tất cả'
            || (product.payload.type || 'B2C').includes(tradeFilter));
        return <>
            <Head eyebrow="ĐIỆN TỬ & CÔNG NGHỆ" title="Khám phá sản phẩm"
                desc="Tìm thiết bị theo danh mục, đọc đánh giá và so sánh cấu hình."
                action={<button className="secondary" onClick={() => nav('reviews')}><Star size={17} /> Đánh giá & So sánh</button>} />
            <div className="filter-bar">
                {filters([...new Set(products.map(product => product.category))])}
                {tradeFilters()}
            </div>
            {matches.length ? <div className="productgrid">{matches.map(productCard)}</div>
                : <Empty>Không có sản phẩm phù hợp với bộ lọc bạn chọn.</Empty>}
            <section className="card pad marketplace-themes spaced">
                <div><h2>Bạn là nhà cung cấp?</h2><p className="muted">Giới thiệu thiết bị và giải pháp cho khách hàng cá nhân hoặc doanh nghiệp.</p></div>
                <button className="secondary" onClick={() => data.me?.seller_status === 'approved' ? create('product') : nav('business')}><Plus size={16} /> Đăng sản phẩm</button>
            </section>
        </>;
    }

    function reviews() {
        const chosen = products.filter(product => compares.includes(product.id));
        const current = products.find(product => product.id === reviewFilter);
        const matches = visible(['review']).filter(review => !reviewFilter || review.payload.product === reviewFilter);
        return <>
            <Head eyebrow="TRẢI NGHIỆM NGƯỜI DÙNG" title="Đánh giá & So sánh"
                desc="Đọc ưu điểm, hạn chế và điều kiện sử dụng trước khi chọn thiết bị."
                action={<button className="primary" onClick={() => create('review', undefined, current?.id)}><Plus size={16} /> Viết đánh giá</button>} />
            <section className="card pad compare-card">
                <h2>So sánh sản phẩm</h2>
                <p className="muted">Chọn tối đa 3 sản phẩm để đặt thông số cạnh nhau.</p>
                <div className="chips">{products.map(product => {
                    const selected = compares.includes(product.id);
                    return <button key={product.id} className={'chip ' + (selected ? 'active' : '')} aria-pressed={selected}
                        disabled={!selected && chosen.length >= 3}
                        onClick={() => setCompares(previous => selected ? previous.filter(id => id !== product.id) : [...previous, product.id])}>
                        {selected && <Check size={14} />} {product.title}
                    </button>;
                })}</div>
                {!!chosen.length && <div className="tablewrap"><table><thead><tr><th scope="col">Tiêu chí</th>{chosen.map(product => <th scope="col" key={product.id}>{product.title}</th>)}</tr></thead>
                    <tbody>{[['Giá', 'price'], ['Bộ nhớ RAM', 'ram'], ['Lưu trữ', 'storage'], ['Tình trạng', 'condition'], ['Mô hình', 'type']].map(([label, key]) =>
                        <tr key={key}><th scope="row">{label}</th>{chosen.map(product => <td key={product.id}>{key === 'price' ? money(product.payload[key]) : product.payload[key] || 'Chưa cập nhật'}</td>)}</tr>)}
                        <tr><th scope="row">Nguồn</th>{chosen.map(product => <td key={product.id}>{product.demo ? 'Dữ liệu mẫu' : 'Người bán tự khai'}</td>)}</tr>
                    </tbody></table></div>}
            </section>
            <div className="reviews-heading">
                <h2>Đánh giá sản phẩm <span className="small">({matches.length})</span></h2>
                <label className="field"><span className="sr-only">Lọc theo sản phẩm</span>
                    <select aria-label="Lọc theo sản phẩm" value={reviewFilter} onChange={event => nav('reviews', { product: event.target.value })}>
                        <option value="">Tất cả sản phẩm</option>{products.map(product => <option value={product.id} key={product.id}>{product.title}</option>)}
                    </select>
                </label>
            </div>
            {matches.length ? matches.map(postCard) : <Empty>Chưa có đánh giá cho lựa chọn này.</Empty>}
        </>;
    }

    function business() {
        const companies = visible(['company']).filter(company => tradeFilter === 'Tất cả' || (company.payload.type || 'B2B').includes(tradeFilter));
        const sellerStatus = data.me?.seller_status || 'none';
        return <>
            <Head eyebrow="NHÀ CUNG CẤP & ĐỐI TÁC" title="Doanh nghiệp công nghệ"
                desc="Khám phá đội ngũ, linh kiện và giải pháp cho thị trường Việt Nam."
                action={<button className="primary" onClick={() => create('company')}><Plus size={16} /> Tạo hồ sơ</button>} />
            <div className="filter-bar filter-single">{tradeFilters()}</div>
            {companies.length ? <div className="company-grid">{companies.map(company => (
                <article className="card companycard" key={company.id}>
                    <div className="company-logo-row"><span className="companylogo"><Building2 size={23} /></span>
                        <span className="badge muted">{company.demo ? 'Hồ sơ minh họa' : 'Tự khai'}</span></div>
                    <div>
                        <h2><button className="item-title" onClick={() => openDetail(company)}>{company.title}</button></h2>
                        <small>{company.category} · {company.payload.location || 'Việt Nam'} · {company.payload.type || 'B2B'}</small>
                        <p>{company.body}</p>
                        <button className="textbutton" onClick={() => setModal({ type: 'quote', item: company })}>Soạn yêu cầu hợp tác <ArrowUpRight size={14} /></button>
                    </div>
                </article>
            ))}</div> : <Empty>Chưa có doanh nghiệp phù hợp.</Empty>}
            <section className="card sellerpanel">
                <span className="quickicon blue"><ShieldCheck size={24} /></span>
                <div><h2>Đăng ký người bán</h2><p>Trạng thái · {stateNames[sellerStatus]}. Hồ sơ được xét duyệt nội bộ trước khi đăng sản phẩm.</p></div>
                <button className="secondary" disabled={busy || sellerStatus === 'pending'} onClick={() => sellerStatus === 'approved'
                    ? create('product')
                    : requireUser(() => mutate({ action: 'seller' }, 'Đã gửi yêu cầu xét duyệt người bán'))}>
                    {sellerStatus === 'approved' ? 'Đăng sản phẩm' : sellerStatus === 'pending' ? 'Đang chờ duyệt' : 'Yêu cầu xét duyệt'}
                </button>
            </section>
        </>;
    }
    function logistics() { return <><Head eyebrow="ĐƠN HÀNG & LOGISTICS NỘI ĐỊA" title="Mỗi hành trình, rõ từng bước." desc="Theo dõi đơn trải nghiệm và gửi yêu cầu hỗ trợ. Chưa kết nối thanh toán hay hãng vận chuyển."/><div className="alert">Các trạng thái được mô phỏng theo thao tác của bạn. Không có vận đơn thật và không xác nhận giao dịch đã xác minh.</div>{data.orders.length ? data.orders.map(o => <section className="card ordercard" key={o.id}><div className="row between"><strong>Đơn #{o.id.slice(0, 8)}</strong><span className="badge">{stateNames[o.status]}</span></div><div className="small">{date(o.created_at)} · Đơn trải nghiệm · {o.items.length} sản phẩm</div>{o.items.map((p: any) => <div className="orderitem" key={p.id}><Package size={18}/><span>{p.name} × {p.quantity}</span><strong>{money(p.price * p.quantity)}</strong></div>)}<div className="row between"><span>Tổng cộng</span><strong className="price">{money(o.total)}</strong></div><div className="timeline">{o.events.map((v: any, i: number) => <div key={i}><i /><strong>{stateNames[v.status]}</strong><small>{date(v.at)} · {v.note}</small></div>)}</div><p className="small">Người nhận: {o.recipient} · {o.phone}<br />{o.address}</p><div className="row wrap">{!['cancelled', 'delivered'].includes(o.status) && <><button className="primary" disabled={busy} onClick={() => mutate({ action: 'orderStep', target: o.id, status: ({ created: 'confirmed', confirmed: 'shipping', shipping: 'delivered' } as any)[o.status] }, 'Đã cập nhật trạng thái mô phỏng')}>Mô phỏng bước tiếp <ArrowRight size={14}/></button><button className="secondary" disabled={busy} onClick={() => setModal({ type: 'cancel', item: o })}>Hủy đơn thử</button></>}<button className="textbutton" onClick={() => setModal({ type: 'report', target: o.id })}><Flag size={13}/> Báo sự cố</button></div></section>) : <Empty>Chưa có đơn hàng trên tài khoản. Ghé Marketplace và tạo một đơn trải nghiệm.</Empty>}</>; }
    function assistant() { return <><Head eyebrow="AI HỖ TRỢ · CON NGƯỜI LÀM CHỦ" title="Thêm một góc nhìn, cho bạn." desc="Tìm nội dung phù hợp và chuẩn bị câu hỏi. Quyết định luôn thuộc về bạn."/><div className="integrationstatus"><span className="dot amber"/><strong>Chế độ hướng dẫn theo chủ đề</strong><span>Chưa kết nối mô hình AI</span></div><section className="card assistantcard"><div className="assistantintro"><span className="assistantlogo"><Sparkles size={30}/></span><h2>Bạn muốn khám phá điều gì?</h2><p>Học một kỹ năng, tìm thiết bị, hay chuẩn bị dự án tiếp theo?</p></div><div className="grid2 suggestions">{['Bắt đầu học Python', 'Chọn laptop phù hợp', 'Tìm đối tác B2B', 'Viết đánh giá minh bạch'].map(s => <button key={s} onClick={() => guide(s)}>{s}<ArrowUpRight size={16}/></button>)}</div><div className="chatlog" aria-live="polite">{chat.map((c, i) => <div key={i} className={'chatbubble ' + c.role}>{c.role === 'assistant' && <Sparkles size={16}/>}<p>{c.text}</p></div>)}</div><form className="chatinput" onSubmit={e => { e.preventDefault(); if (chatInput.trim()) {
        guide(chatInput.trim());
        setChatInput('');
    } }}><input aria-label="Câu hỏi cho trợ lý" value={chatInput} onChange={e => setChatInput(e.target.value)} maxLength={1000} placeholder="Nhập điều bạn đang quan tâm..." required/><button className="primary" aria-label="Gửi câu hỏi"><ArrowRight size={19}/></button></form><p className="small center">Phản hồi theo quy tắc có sẵn. Không truy cập web, kết luận gian lận hay tự xử phạt.</p></section><div className="alert">Chưa tích hợp AI thật, phân tích rủi ro tự động hoặc trợ lý riêng lưu hội thoại trên máy chủ. Hội thoại này chỉ tồn tại trong phiên đang mở.</div></>; }
    function guide(text: string) { let t = text.toLowerCase(), answer = /python|lập trình|học/.test(t) ? 'Hãy bắt đầu từ lộ trình Python: biến → điều kiện & vòng lặp → dự án lọc sản phẩm. Dành thời gian tự chạy ví dụ và viết lại bằng cách hiểu của bạn. Mục Học tập có 3 bài nhập môn; mục Hỏi đáp là nơi bạn có thể đăng lỗi và bối cảnh để cộng đồng hỗ trợ.' : /laptop|thiết bị|máy/.test(t) ? 'Xác định ba công việc chính, ngân sách tổng, yêu cầu màn hình, pin và tính di động. So sánh trong mục Đánh giá & So sánh; lưu ý các thông số mẫu không đại diện cho model thương mại. Kiểm tra cấu hình, bảo hành và đánh giá có bằng chứng trước khi mua.' : /b2b|đối tác|doanh nghiệp/.test(t) ? 'Một yêu cầu hợp tác tốt gồm: mục tiêu, phạm vi, thời gian, ngân sách và tiêu chí nghiệm thu. Bạn có thể mở mục Doanh nghiệp để soạn bản yêu cầu tải về. Hồ sơ tự khai chưa phải xác minh năng lực; hãy trao đổi và kiểm tra thông tin trước khi ký kết.' : /đánh giá|minh bạch/.test(t) ? 'Ghi rõ phiên bản, thời gian và điều kiện sử dụng; tách dữ liệu đo khỏi cảm nhận. Nêu cả ưu điểm và hạn chế, công khai tài trợ nếu có. TECHHUB VN chưa gắn nhãn giao dịch xác minh cho các đơn trải nghiệm.' : 'Chế độ hướng dẫn hiện hỗ trợ học lập trình, lựa chọn thiết bị, hợp tác B2B và đánh giá minh bạch. Hãy chọn một chủ đề hoặc đăng câu hỏi cụ thể trong Hỏi đáp. Đây là phản hồi theo mẫu, không phải mô hình AI.'; setChat(c => [...c, { role: 'user', text }, { role: 'assistant', text: answer }]); }
    function profile() { let own = data.entities.filter(x => x.owner === data.me?.id); return <><Head eyebrow="HỒ SƠ & HOẠT ĐỘNG" title="Dấu ấn công nghệ của bạn." desc="Giới thiệu bản thân và theo dõi những đóng góp của mình."/>{data.me ? <><section className="card profilecard"><div className="profilecover"/><div className="profilecontent"><Avatar name={data.me.name} size="large"/><button className="secondary" onClick={() => setModal({ type: 'profile' })}>Chỉnh sửa hồ sơ</button><h1>{data.me.name}</h1><p>{data.me.bio || 'Chưa có giới thiệu. Hãy chia sẻ điều bạn đang học và xây dựng.'}</p><div className="tags"><span>{data.me.interests || 'Khám phá công nghệ'}</span>{data.me.admin && <span>Quản trị viên</span>}</div><div className="profilestats"><div><b>{own.length}</b><small>Đóng góp</small></div><div><b>{count('follow', data.me.id)}</b><small>Người theo dõi</small></div><div><b>{data.progress.length}</b><small>Bài học hoàn thành</small></div></div><div className="alert compact">Uy tín dựa trên hoạt động có căn cứ. TECHHUB VN không cung cấp điểm tín nhiệm hoặc chứng nhận danh tính ở phiên bản này.</div></div></section><h2 className="sectiontitle">Hoạt động gần đây</h2>{own.length ? own.map(postCard) : <Empty>Bạn chưa có đóng góp nào. Hãy viết một bài chia sẻ đầu tiên.</Empty>}</> : <div className="card pad"><p>Đăng nhập để tạo hồ sơ và lưu hoạt động trên tài khoản.</p><a className="primary" href="/sign-in" target="_top">Đăng nhập <ArrowUpRight size={16}/></a></div>}</>; }
    function safety() { return <><Head eyebrow="MINH BẠCH & CÔNG BẰNG" title="Được lắng nghe. Được giải thích." desc="Báo cáo nội dung, theo dõi kết quả và khiếu nại khi cần xem xét lại."/><section className="card pad"><div className="row"><ShieldCheck size={25} color="#2f68da"/><h2>Con người quyết định</h2></div><p className="muted">AI không được tự kết luận ai là người lừa đảo, sửa đánh giá hay xử phạt tài khoản. Quyết định quản trị cần lý do, người chịu trách nhiệm và khả năng khiếu nại.</p><div className="tags"><span>Tôn trọng người tham gia</span><span>Nêu nguồn & bằng chứng</span><span>Công khai tài trợ</span></div></section><h2 className="sectiontitle">Vụ việc của {data.me?.admin ? 'nền tảng' : 'bạn'}</h2>{data.reports.length ? data.reports.map(r => <section className="card pad" key={r.id}><div className="row between"><strong>Vụ việc #{r.id.slice(0, 8)}</strong><span className="badge">{stateNames[r.status]}</span></div><p className="small">Đối tượng: {r.target} · {date(r.created_at)}</p><p>{r.reason}</p>{r.resolution && <div className="resolution"><b>Kết quả & lý do</b><p>{r.resolution}</p></div>}{r.appeal && <div className="resolution"><b>Nội dung khiếu nại</b><p>{r.appeal}</p></div>}<div className="row">{['resolved', 'dismissed'].includes(r.status) && (r.owner === data.me?.id || data.entities.some(x => x.id === r.target && x.owner === data.me?.id)) && <button className="secondary" onClick={() => setModal({ type: 'appeal', target: r.id })}>Yêu cầu xem xét lại</button>}{data.me?.admin && ['pending', 'appealed'].includes(r.status) && <button className="primary" onClick={() => setModal({ type: 'resolve', item: r })}>Xem xét vụ việc</button>}</div></section>) : <Empty>Chưa có báo cáo. Dùng biểu tượng lá cờ trên bài viết hoặc “Báo sự cố” tại đơn hàng.</Empty>}</>; }
    function admin() { return <><Head eyebrow="QUẢN TRỊ & NHẬT KÝ" title="Vận hành với trách nhiệm." desc="Mọi quyết định cần người có thẩm quyền, lý do và dấu vết kiểm tra."/>{!data.me?.admin ? <Empty>Bạn không có quyền truy cập công cụ quản trị.</Empty> : <><div className="statsgrid"><div className="card"><b>{data.reports.filter(x => ['pending', 'appealed'].includes(x.status)).length}</b><span>Vụ việc chờ xử lý</span></div><div className="card"><b>{data.users.filter(x => x.seller_status === 'pending').length}</b><span>Hồ sơ người bán chờ duyệt</span></div><div className="card"><b>{data.audit.length}</b><span>Hoạt động trong nhật ký tải về</span></div></div><section className="card pad"><h2>Xét duyệt người bán</h2><p className="small">Đánh giá nội bộ dựa trên hồ sơ. Không gắn nhãn KYC hoặc đảm bảo giao dịch.</p>{data.users.filter(u => u.seller_status === 'pending').map(u => <div className="memberrow" key={u.id}><Avatar name={u.name}/><div><strong>{u.name}</strong><small>{u.bio || 'Chưa bổ sung giới thiệu'}</small></div><button className="secondary" onClick={() => setModal({ type: 'sellerReview', item: u })}>Xem xét</button></div>)}{!data.users.some(u => u.seller_status === 'pending') && <p className="muted">Không có hồ sơ chờ duyệt.</p>}</section><section className="card pad"><h2>Nội dung đang ẩn</h2>{data.entities.filter(x => x.status === 'hidden').map(x => <div className="memberrow" key={x.id}><div><strong>{x.title}</strong><small>{x.author}</small></div><button className="secondary" onClick={() => setModal({ type: 'restore', target: x.id })}>Xem xét khôi phục</button></div>)}</section><section className="card pad"><div className="row between"><h2>Báo cáo & Khiếu nại</h2><button className="textbutton" onClick={() => nav('safety')}>Mở vụ việc <ArrowRight size={15}/></button></div><p className="muted">Các vụ việc và kết quả được lưu trên máy chủ. Chỉ quản trị viên được xử lý.</p></section><section className="card pad"><h2>Nhật ký quản trị</h2>{data.audit.length ? <div className="tablewrap"><table><thead><tr><th>Ngày / Người thực hiện</th><th>Hành động</th><th>Lý do</th></tr></thead><tbody>{data.audit.map(a => <tr key={a.id}><td>{date(a.created_at)}<br />{a.actor_name || 'Quản trị viên'}</td><td>{a.action}<br /><span className="small">{a.target.slice(0, 12)}</span></td><td>{a.reason}</td></tr>)}</tbody></table></div> : <p className="muted">Chưa có hành động quản trị.</p>}</section></>}</>; }
    function about() { return <><Head eyebrow="TẦM NHÌN & LỘ TRÌNH" title="Một hệ sinh thái, cùng xây dựng." desc="TECHHUB VN kết nối con người, tri thức, sản phẩm và doanh nghiệp công nghệ. Cộng đồng có giá trị là nền móng."/><section className="card pad"><h2>Định hướng nền tảng</h2><table><tbody>{[['Thị trường', 'Việt Nam'], ['Ngôn ngữ / Tiền tệ', 'Tiếng Việt / VNĐ'], ['Thương mại', 'B2B + B2C · Công nghệ & Điện tử'], ['Quản trị', 'Mô hình kết hợp: mở cho thảo luận, xét duyệt trước khi đăng bán'], ['Nguyên tắc', 'AI hỗ trợ – Con người làm chủ']].map(([l, v]) => <tr key={l}><th>{l}</th><td>{v}</td></tr>)}</tbody></table></section><section className="card pad"><h2>Trạng thái chức năng</h2><ul className="statuslist"><li><Check /> Đăng nhập và hồ sơ theo tài khoản</li><li><Check /> Bài viết, hỏi đáp, tương tác và nhóm trên máy chủ</li><li><Check /> Tiến độ học, đánh giá, dự án và doanh nghiệp</li><li><Check /> Báo cáo, khiếu nại, xét duyệt và nhật ký quản trị</li><li><Clock3 /> Đơn hàng và giao nhận ở chế độ trải nghiệm</li><li><Clock3 /> Chưa tích hợp thanh toán, hãng giao hàng, AI thật</li><li><Clock3 /> Chưa xác thực danh tính pháp lý hoặc giao dịch thực</li></ul><div className="alert">Website dành cho các tài khoản do quản trị viên cấp. Dữ liệu mẫu có nhãn riêng và không được tính là hoạt động thật.</div></section><section className="card pad"><h2>Kiến trúc triển khai</h2><p className="muted">Ứng dụng React và TypeScript sử dụng API máy chủ và SQLite để lưu dữ liệu và ảnh. Quản trị viên cấp tài khoản đăng nhập cho thành viên.</p><h2 style={{ marginTop: 24 }}>Quyền riêng tư & giới hạn</h2><p className="muted">Hồ sơ, bài đăng và đánh giá hiển thị cho người được phép vào website. Địa chỉ và số điện thoại đơn thử chỉ tài khoản đặt đơn xem được. Không nhập thông tin thanh toán hoặc dữ liệu nhạy cảm vào bài đăng. Bài viết và ảnh trên máy chủ này được lưu riêng theo bản triển khai.</p><h2 style={{ marginTop: 24 }}>Các mốc tiếp theo</h2><ol className="roadmap"><li>Cộng đồng & Hỏi đáp — nền tảng sử dụng</li><li>Tin cậy & Quản trị — báo cáo, phản hồi, khiếu nại</li><li>Học tập & AI — bổ sung nguồn học, kết nối mô hình</li><li>Marketplace — kiểm chứng người bán, thanh toán thực</li><li>Logistics — tích hợp đối tác và vận đơn nội địa</li></ol></section></>; }
    function saved() { let saved = all.filter(x => linked('save', x.id)); return <><Head eyebrow="BỘ SƯU TẬP CÁ NHÂN" title="Giữ lại điều đáng khám phá." desc="Bài viết, dự án và sản phẩm được lưu theo tài khoản."/>{saved.length ? saved.map(x => x.kind === 'product' ? productCard(x) : postCard(x)) : <Empty>Bạn chưa lưu nội dung nào. Nhấn biểu tượng đánh dấu để lưu lại.</Empty>}</>; }
    async function submit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (busy)
            return;
        const f = new FormData(e.currentTarget), m = modal;
        let value = (n: string) => String(f.get(n) || '').trim();
        if (m.type === 'create') {
            let payload: any = {};
            let kind = value('kind') || m.kind;
            const file = f.get('image') as File;
            if (file?.size) {
                if (file.size > 2097152) {
                    setFormError('Ảnh tối đa 2 MB.');
                    return;
                }
                setBusy(true);
                try {
                    const r = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': file.type }, body: file }), j: any = await r.json();
                    if (!r.ok)
                        throw Error(j.error);
                    payload.image = j.url;
                }
                catch (e) {
                    setFormError(e instanceof Error ? e.message : 'Lỗi tải ảnh');
                    setBusy(false);
                    return;
                }
                setBusy(false);
            }
            if (kind === 'product')
                Object.assign(payload, { price: Number(value('price')), condition: value('condition'), type: value('trade'), location: value('location'), ram: value('ram'), storage: value('storage') });
            if (kind === 'project')
                Object.assign(payload, { stack: value('stack'), stage: value('stage'), looking: value('looking') });
            if (kind === 'company')
                Object.assign(payload, { location: value('location'), type: value('trade'), services: value('services') });
            if (kind === 'article')
                Object.assign(payload, { source: value('source'), url: value('url'), published: value('published'), label: value('label') });
            if (kind === 'review')
                Object.assign(payload, { product: value('product'), rating: Number(value('rating')), pros: value('pros'), cons: value('cons'), sponsor: value('sponsor') });
            if (await mutate({ action: 'create', kind, title: value('title'), body: value('body'), category: kind === 'review' ? products.find(p => p.id === payload.product)?.category || 'Đánh giá sản phẩm' : value('category'), payload }, 'Đã đăng và lưu nội dung trên máy chủ')) {
                if (m.fromCommunity) {
                    const postedGroup = groups.find(group => group.name === value('category'));
                    nav('groups', postedGroup ? { group: postedGroup.id } : {});
                } else {
                    nav(({ project: 'projects', company: 'business', product: 'shop', review: 'reviews', article: 'news', question: 'questions' } as Record<string, string>)[kind] || 'feed',
                        kind === 'review' ? { product: payload.product } : kind === 'question' && selectedGroup ? { group: value('category') } : {});
                }
            }
        }
        else if (m.type === 'profile') {
            if (await mutate({ action: 'profile', name: value('name'), bio: value('bio'), interests: value('interests') }, 'Đã lưu hồ sơ'))
                setModal(null);
        }
        else if (m.type === 'report' || m.type === 'appeal' || m.type === 'restore') {
            if (await mutate({ action: m.type, target: m.target, reason: value('reason') }, m.type === 'report' ? 'Đã gửi báo cáo để người có thẩm quyền xem xét' : 'Đã lưu yêu cầu'))
                setModal(null);
        }
        else if (m.type === 'resolve') {
            if (await mutate({ action: 'resolve', target: m.item.id, status: value('status'), reason: value('reason'), hide: f.get('hide') === 'on' }, 'Đã ghi kết quả và nhật ký xử lý'))
                setModal(null);
        }
        else if (m.type === 'sellerReview') {
            if (await mutate({ action: 'sellerReview', target: m.item.id, status: value('status'), reason: value('reason') }, 'Đã ghi quyết định xét duyệt'))
                setModal(null);
        }
        else if (m.type === 'checkout') {
            if (await mutate({ action: 'order', items: cart, recipient: value('recipient'), phone: value('phone'), address: value('address') }, 'Đã tạo đơn trải nghiệm trên tài khoản')) {
                setCart([]);
                setModal(null);
                nav('logistics');
            }
        }
        else if (m.type === 'quote') {
            let text = `TECHHUB VN — BẢN NHÁP YÊU CẦU HỢP TÁC\nChưa gửi, chưa có cam kết giao dịch\n\nĐơn vị: ${value('organization')}\nĐối tác tham khảo: ${m.item.title}\nNgân sách dự kiến: ${value('budget')}\n\nNhu cầu:\n${value('body')}`;
            const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' })), a = document.createElement('a');
            a.href = url;
            a.download = 'TECHHUB-VN-yeu-cau-hop-tac.txt';
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            setModal(null);
            toast('Đã tải bản nháp. Chưa gửi tới doanh nghiệp.');
        }
    }
    function field(label: string, name: string, type = 'text', props: any = {}) { return <label className="field"><span>{label}</span><input name={name} type={type} required maxLength={type === 'text' ? 160 : undefined} {...props}/></label>; }
    function area(label: string, name: string, props: any = {}) { return <label className="field"><span>{label}</span><textarea name={name} required maxLength={6000} {...props}/></label>; }
    function select(label: string, name: string, options: string[], props: any = {}) { return <label className="field"><span>{label}</span><select name={name} {...props}>{options.map(o => <option key={o}>{o}</option>)}</select></label>; }
    function modalContent() {
        if (!modal)
            return null;
        const m = modal;
        if (m.type === 'signin')
            return <><h2>Bắt đầu cùng TECHHUB VN</h2><p className="muted">Đăng nhập để tạo hồ sơ, đăng bài và lưu dữ liệu trên tài khoản.</p><a className="primary" href="/sign-in" target="_top">Tiếp tục đăng nhập <ArrowUpRight size={16}/></a></>;
        if (m.type === 'create')
            return <><h2>{{ post: 'Chia sẻ với cộng đồng', question: 'Đặt câu hỏi kỹ thuật', project: 'Giới thiệu dự án', product: 'Đăng sản phẩm', review: 'Đánh giá trải nghiệm', company: 'Hồ sơ doanh nghiệp', article: 'Đăng tin có nguồn' }[m.kind as string] || 'Tạo nội dung'}</h2><p className="small">Thông tin bạn đăng hiển thị cho người được phép truy cập nền tảng.</p><form onSubmit={submit}>{field(m.kind === 'product' ? 'Tên sản phẩm' : m.kind === 'company' ? 'Tên doanh nghiệp' : 'Tiêu đề', 'title')}{m.kind !== 'review' && select('Chủ đề', 'category', m.kind === 'product' ? ['Laptop', 'Phụ kiện', 'Máy ảnh', 'Điện tử khác'] : m.kind === 'project' ? ['Phần mềm', 'AI & Dữ liệu', 'IoT & Phần cứng'] : m.kind === 'company' ? ['Phần mềm & Cloud', 'AI & Dữ liệu', 'Thiết bị & Điện tử'] : m.kind === 'article' ? ['AI', 'Phần mềm', 'Hạ tầng'] : groups.map(g => g.name), { defaultValue: m.category })}{area(m.kind === 'review' ? 'Bối cảnh và điều kiện sử dụng' : m.kind === 'post' ? 'Nội dung bài viết' : m.kind === 'question' ? 'Nội dung câu hỏi' : 'Nội dung / Mô tả', 'body')}{m.kind === 'project' && <>{field('Công nghệ sử dụng (cách nhau bởi dấu phẩy)', 'stack')}{select('Giai đoạn', 'stage', ['Ý tưởng', 'Đang phát triển', 'Đã phát hành'])}{field('Vai trò cộng tác đang tìm', 'looking')}</>}{m.kind === 'product' && <><div className="grid2">{field('Giá bán (VNĐ)', 'price', 'number', { min: 1000, max: 10000000000 })}{select('Tình trạng', 'condition', ['Mới', 'Đã qua sử dụng'])}</div><div className="grid2">{field('RAM / Bộ nhớ', 'ram', 'text', { required: false, maxLength: 100 })}{field('Lưu trữ', 'storage', 'text', { required: false, maxLength: 100 })}</div></>}{['product', 'company'].includes(m.kind) && <div className="grid2">{select('Mô hình', 'trade', ['B2C', 'B2B', 'B2B + B2C'])}{select('Tỉnh / Thành phố', 'location', ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Khác tại Việt Nam'])}</div>}{m.kind === 'company' && <>{field('Sản phẩm / Dịch vụ', 'services', 'text', { maxLength: 500 })}<div className="alert compact">Hồ sơ tự khai. Không tự gắn huy hiệu xác minh hay chứng nhận pháp lý.</div></>}{m.kind === 'review' && <><label className="field"><span>Sản phẩm</span><select name="product" defaultValue={m.product || ''} required><option value="" disabled>Chọn sản phẩm</option>{products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</select></label>{select('Mức đánh giá', 'rating', ['5', '4', '3', '2', '1'])}{area('Ưu điểm quan sát được', 'pros', { maxLength: 1000 })}{area('Hạn chế / Điểm cần cải thiện', 'cons', { maxLength: 1000 })}{select('Công khai quan hệ', 'sponsor', ['Không tài trợ / không liên kết tiếp thị', 'Có tài trợ hoặc tặng sản phẩm', 'Có liên kết tiếp thị'])}<div className="alert compact">Đánh giá sẽ hiển thị với nhãn chưa xác minh giao dịch.</div></>}{m.kind === 'article' && <>{field('Tên nguồn gốc', 'source')}{field('Liên kết gốc (HTTPS)', 'url', 'url', { pattern: 'https://.*', maxLength: 500 })}{field('Ngày xuất bản tại nguồn', 'published', 'date')}{select('Loại nội dung', 'label', ['Tin tức', 'Ý kiến', 'Tài trợ'])}</>}{['post', 'project', 'product'].includes(m.kind) && <label className="field upload"><span><ImagePlus size={16}/> Hình ảnh (tùy chọn, tối đa 2 MB)</span><input name="image" type="file" accept="image/png,image/jpeg,image/webp"/></label>}{submitButton(m.kind === 'post' ? 'Đăng bài' : m.kind === 'question' ? 'Đăng câu hỏi' : 'Đăng nội dung')}</form></>;
        if (m.type === 'profile')
            return <><h2>Chỉnh sửa hồ sơ</h2><form onSubmit={submit}>{field('Tên hiển thị', 'name', 'text', { defaultValue: data.me?.name, maxLength: 80 })}{area('Giới thiệu', 'bio', { required: false, maxLength: 500, defaultValue: data.me?.bio })}{field('Mối quan tâm công nghệ', 'interests', 'text', { required: false, defaultValue: data.me?.interests, maxLength: 200 })}{submitButton('Lưu hồ sơ')}</form></>;
        if (m.type === 'missing')
            return <><h2>Nội dung không còn khả dụng</h2><p className="muted">Hãy thử tìm một bài viết hoặc sản phẩm khác trong mục Khám phá.</p></>;
        if (m.type === 'share')
            return <><h2>Chia sẻ liên kết</h2><p className="muted">Người có quyền truy cập TECHHUB VN có thể mở liên kết này.</p>
                <label className="field"><span>Liên kết nội dung</span><input readOnly value={m.url} onFocus={event => event.currentTarget.select()} /></label></>;
        if (m.type === 'menu')
            return <><h2>Điều hướng</h2><nav className="mobile-menu" aria-label="Tất cả khu vực">{navigation()}</nav></>;
        if (m.type === 'detail') {
            const item = m.item as Item;
            const canComment = item.status === 'visible' && item.owner !== 'editorial'
                && (!item.demo || sampleThreads.some(thread => thread.id === item.id));
            return <>
                <span className="badge">{item.demo ? 'Dữ liệu minh họa' : item.category}</span><h2>{item.title}</h2>
                <div className="small">{item.author} · {date(item.created_at)}</div>
                {item.payload.image && <img className="detailimage" src={item.payload.image} alt={item.title} />}
                <p className="bodytext">{item.body}</p>
                {item.kind === 'review' && reviewSummary(item)}
                {item.kind === 'product' && <>
                    <strong className="price bigprice">{money(item.payload.price)}</strong>
                    <div className="detail-specs">
                        {[['Địa điểm', item.payload.location], ['Tình trạng', item.payload.condition],
                          ['Mô hình', item.payload.type], ['RAM', item.payload.ram], ['Lưu trữ', item.payload.storage]]
                            .filter(([, value]) => value && value !== '—')
                            .map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
                    </div>
                    <div className="product-detail-actions">
                        <button className="primary" onClick={() => create('review', undefined, item.id)}><Star size={17} /> Viết đánh giá</button>
                        <button className="secondary" onClick={() => addCart(item)}><ShoppingBag size={17} /> Thêm vào giỏ thử</button>
                    </div>
                    <div className="sectionline row between"><h3>Đánh giá sản phẩm</h3>
                        <button className="textbutton" onClick={() => nav('reviews', { product: item.id })}>Xem đánh giá <ArrowUpRight size={14} /></button>
                    </div>
                    {productReviews(item.id).length ? productReviews(item.id).slice(0, 2).map(review =>
                        <button className="review-preview" onClick={() => openDetail(review)} key={review.id}>
                            <Star size={16} /><span><strong>{review.title}</strong><small>{review.payload.rating}/5 · {review.demo ? 'Minh họa' : 'Chưa xác minh giao dịch'}</small></span>
                        </button>) : <p className="muted">Chưa có đánh giá cho sản phẩm này.</p>}
                </>}
                {item.kind === 'company' && <>
                    <p className="small">{item.payload.location || 'Việt Nam'} · {item.payload.type || 'B2B'}</p>
                    {!!item.payload.services && <p className="bodytext">{item.payload.services}</p>}
                    <button className="secondary" onClick={() => setModal({ type: 'quote', item })}><Building2 size={17} /> Soạn yêu cầu hợp tác</button>
                </>}
                {item.payload.url && <a className="textbutton" href={item.payload.url} target="_blank" rel="noreferrer">Xem nguồn <ExternalLink size={14} /></a>}
                {canComment && <DiscussionThread
                    key={item.id}
                    target={item.id}
                    question={item.kind === 'question'}
                    signedIn={!!data.me}
                    total={count('comment', item.id)}
                    busy={busy}
                    submitError={formError}
                    onSignIn={() => setModal({ type: 'signin' })}
                    onPost={(body, replyTo) => mutate({ action: 'comment', target: item.id, body, replyTo },
                        replyTo ? 'Đã gửi trả lời' : 'Đã đăng bình luận')}
                />}
            </>;
        }
        if (m.type === 'member') {
            let u = data.users.find(x => x.id === m.item.owner);
            return <><Avatar name={m.item.author} size="large"/><h2>{m.item.author}</h2><p>{u?.bio || 'Hồ sơ giới thiệu chưa có thông tin bổ sung.'}</p><div className="small">{u ? count('follow', u.id) + ' người theo dõi' : 'Hồ sơ minh họa, không phải tài khoản thật'}</div>{u && u.id !== data.me?.id && <button className="primary" onClick={() => requireUser(() => toggle('follow', u.id))}>{linked('follow', u.id) ? 'Đang theo dõi' : 'Theo dõi thành viên'}</button>}</>;
        }
        if (m.type === 'cart') {
            let lines = cart.map(c => ({ c, p: products.find(p => p.id === c.id) })).filter(x => x.p);
            return <><h2>Giỏ hàng trải nghiệm</h2>{lines.length ? lines.map(({ c, p }) => <div className="cartrow" key={c.id}>{p!.payload.image ? <img src={p!.payload.image} alt={p!.title}/> : <Package />}<div><strong>{p!.title}</strong><small>{money(p!.payload.price)}</small><div className="qty"><button aria-label="Giảm số lượng" onClick={() => setCart(v => v.map(x => x.id === c.id ? { ...x, quantity: Math.max(1, x.quantity - 1) } : x))}>−</button><span>{c.quantity}</span><button aria-label="Tăng số lượng" onClick={() => setCart(v => v.map(x => x.id === c.id ? { ...x, quantity: Math.min(10, x.quantity + 1) } : x))}>＋</button></div></div><button className="icon" aria-label="Bỏ sản phẩm" onClick={() => setCart(v => v.filter(x => x.id !== c.id))}><X size={17}/></button></div>) : <Empty>Giỏ hàng đang trống.</Empty>}{lines.length > 0 && <><div className="row between sectionline"><strong>Tổng cộng</strong><strong className="price">{money(lines.reduce((s, { c, p }) => s + p!.payload.price * c.quantity, 0))}</strong></div><div className="alert compact">Không có thanh toán thật hoặc dịch vụ giao hàng trong phiên bản này.</div><button className="primary full" onClick={() => requireUser(() => setModal({ type: 'checkout' }))}>Tạo đơn trải nghiệm <ArrowRight size={16}/></button></>}</>;
        }
        if (m.type === 'checkout')
            return <><h2>Thông tin đơn trải nghiệm</h2><div className="alert compact">Chỉ kiểm thử quy trình, không phát sinh thanh toán. Có thể dùng thông tin giả lập; dữ liệu chỉ tài khoản của bạn truy cập.</div><form onSubmit={submit}>{field('Người nhận', 'recipient', 'text', { maxLength: 100 })}{field('Số điện thoại', 'phone', 'tel', { pattern: '[+0-9 ()-]{9,16}', maxLength: 16 })}{area('Địa chỉ nội địa Việt Nam', 'address', { maxLength: 300 })}{submitButton('Lưu đơn trải nghiệm')}</form></>;
        if (m.type === 'cancel')
            return <><h2>Hủy đơn trải nghiệm?</h2><p className="muted">Lịch sử đơn vẫn được giữ lại. Đây chỉ là đơn mô phỏng, chưa có giao dịch tài chính.</p><button className="primary" disabled={busy} onClick={async () => { if (await mutate({ action: 'orderStep', target: m.item.id, status: 'cancelled' }, 'Đã hủy đơn trải nghiệm'))
                setModal(null); }}>Xác nhận hủy</button></>;
        if (['report', 'appeal', 'restore'].includes(m.type))
            return <><h2>{m.type === 'report' ? 'Gửi báo cáo / sự cố' : m.type === 'appeal' ? 'Yêu cầu xem xét lại' : 'Khôi phục nội dung'}</h2><p className="muted">Ghi rõ vấn đề và bằng chứng bạn có. Một báo cáo không tự động chứng minh vi phạm hay dẫn tới xử phạt.</p><form onSubmit={submit}>{area('Lý do & Thông tin cần xem xét', 'reason', { maxLength: 2000 })}{submitButton('Gửi yêu cầu')}</form></>;
        if (m.type === 'resolve' || m.type === 'sellerReview')
            return <><h2>{m.type === 'resolve' ? 'Xem xét vụ việc' : 'Xét duyệt hồ sơ người bán'}</h2><p className="muted">{m.type === 'resolve' ? m.item.reason : m.item.name + ' — ' + m.item.bio}</p><div className="alert compact">Quyết định do bạn thực hiện, được ghi nhật ký cùng lý do. Không phải kết luận hay đề xuất tự động từ AI.</div><form onSubmit={submit}><label className="field"><span>Kết quả</span><select name="status">{(m.type === 'resolve' ? [['resolved', 'Đã xử lý, có cơ sở'], ['dismissed', 'Không đủ cơ sở']] : [['approved', 'Duyệt hồ sơ nội bộ'], ['rejected', 'Chưa duyệt, cần bổ sung']]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>{area('Lý do quyết định', 'reason', { maxLength: 2000 })}{m.type === 'resolve' && <label className="checkbox"><input name="hide" type="checkbox"/>Ẩn nội dung liên quan (có thể khôi phục)</label>}{submitButton('Lưu quyết định & Nhật ký')}</form></>;
        if (m.type === 'quote')
            return <><h2>Soạn yêu cầu hợp tác</h2><p className="muted">Đối tác tham khảo: {m.item.title}. Bản nháp được tải về máy, chưa gửi cho doanh nghiệp và không tạo cam kết.</p><form onSubmit={submit}>{field('Tên đơn vị / Nhóm của bạn', 'organization')}{area('Mục tiêu, phạm vi & Thời gian', 'body')}{field('Ngân sách dự kiến', 'budget')}{submitButton('Tải bản yêu cầu (.txt)')}</form></>;
        return null;
    }
    function submitButton(label: string) { return <><div className="formerror" role="alert">{formError}</div><button className="primary full" type="submit" disabled={busy}>{busy ? 'Đang lưu...' : label}{!busy && <ArrowRight size={15}/>}</button></>; }
    const menu = [
        { label: 'KHÁM PHÁ', items: [['feed', Compass], ['groups', Users], ['shop', ShoppingBag], ['business', Building2], ['reviews', Star]] },
        { label: 'HỌC VÀ CHIA SẺ', items: [['learn', BookOpen], ['questions', MessageCircle], ['news', Newspaper], ['projects', Layers3], ['assistant', Sparkles]] },
        { label: 'CÁ NHÂN', items: [['saved', Bookmark], ['profile', UserRound], ['logistics', Truck], ['safety', ShieldCheck], ...(data.me?.admin ? ([['admin', ShieldCheck]] as const) : [])] },
    ] as const;

    function navigation() {
        return menu.map(group => <div className="navgroup" key={group.label}>
            <div className="navlabel">{group.label}</div>
            {group.items.map(([id, Icon]) => <a key={id} href={'#' + id} aria-current={page === id ? 'page' : undefined}
                className={'navitem ' + (page === id ? 'active' : '')}
                onClick={event => { event.preventDefault(); nav(id); }}>
                <Icon size={18} /><span>{titles[id]}</span>
            </a>)}
        </div>);
    }

    function searchPage() {
        const matches = visible(['post', 'question', 'project', 'article', 'product', 'company', 'review']);
        return <>
            <Head eyebrow="TÌM KIẾM" title={query.trim() ? 'Kết quả cho “' + query.trim() + '”' : 'Tìm nội dung'}
                desc="Tìm bài viết, dự án, doanh nghiệp, đánh giá và sản phẩm. Bạn có thể gõ tiếng Việt có dấu hoặc không dấu." />
            <input className="mobilesearchinput" aria-label="Từ khóa tìm kiếm" value={query} onChange={event => searchFor(event.target.value)} placeholder="Nhập từ khóa…" />
            {!query.trim() ? <Empty>Nhập từ khóa để xem kết quả.</Empty> : matches.length ? <>
                <p className="small result-count">{matches.length} kết quả</p>
                {matches.map(item => <button className="card searchresult" key={item.id} onClick={() => openDetail(item)}>
                    <span className="badge">{item.category}</span><h2>{item.title}</h2>
                    <p>{item.body.length > 180 ? item.body.slice(0, 180) + '…' : item.body}</p>
                </button>)}
            </> : <Empty>Không tìm thấy kết quả. Hãy thử từ khóa khác.</Empty>}
        </>;
    }

    function questions() {
        const entries = visible(['question']);
        return <>
            <Head eyebrow="CỘNG ĐỒNG GIẢI ĐÁP" title={selectedGroup || 'Hỏi đáp kỹ thuật'}
                desc="Nêu rõ vấn đề, những gì bạn đã thử và kết quả mong muốn."
                action={<button className="primary" onClick={() => create('question', selectedGroup)}><Plus size={16} /> Đặt câu hỏi</button>} />
            {selectedGroup && <button className="chip active group-reset" onClick={() => nav('questions')}>{selectedGroup} <X size={15} /></button>}
            {entries.length ? entries.map(postCard) : <Empty>Chưa có câu hỏi cho chủ đề này. Bạn có thể đặt câu hỏi đầu tiên.</Empty>}
        </>;
    }

    const pages: Record<string, () => ReactNode> = {
        feed, groups: communities, learn: learning, news: newsPage, projects, shop: marketplace, reviews,
        business, logistics, assistant, profile, safety, admin, about, saved, questions, search: searchPage,
    };

    return <>
        <a href="#main-content" className="skip-link" onClick={event => { event.preventDefault(); document.querySelector<HTMLElement>('main')?.focus(); }}>Đến nội dung chính</a>
        <header className="topbar">
            <button className="brand" onClick={() => nav('feed')} aria-label="TECHHUB VN · Trang chủ">
                <span className="brandmark"><Cpu size={22} /></span>
                <span>TECHHUB <span className="brandvn">VN</span></span>
            </button>
            <form role="search" className="headersearch" onSubmit={event => { event.preventDefault(); searchFor(query); }}>
                <Search size={19} /><input ref={searchRef} value={query} onChange={event => searchFor(event.target.value)}
                    maxLength={120} placeholder="Tìm bài viết, sản phẩm, doanh nghiệp…" aria-label="Tìm kiếm nội dung" />
                {query ? <button type="button" className="icon" aria-label="Xóa từ khóa" onClick={() => { searchFor(''); searchRef.current?.focus(); }}><X size={16} /></button> : <kbd>Ctrl K</kbd>}
            </form>
            <div className="headeractions">
                <button className="icon mobilesearchtrigger" aria-label="Tìm kiếm" onClick={() => nav('search')}><Search size={22} /></button>
                <button className="icon carticon" aria-label="Giỏ hàng" onClick={() => setModal({ type: 'cart' })}><ShoppingBag size={20} />
                    {!!cart.length && <b>{cart.reduce((total, line) => total + line.quantity, 0)}</b>}
                </button>
                <button className="primary header-post" onClick={() => create()}><Plus size={17} /> Đăng bài</button>
                {data.me ? <button className="headerprofile" onClick={() => nav('profile')} aria-label="Hồ sơ của tôi"><Avatar name={data.me.name} /></button>
                    : !loading && <a className="secondary login" target="_top" href="/sign-in">Đăng nhập</a>}
            </div>
        </header>
        <div className="appframe">
            <aside className="sidebar">
                <nav className="sidenav" aria-label="Điều hướng chính">{navigation()}</nav>
                <div className="sidebottom">
                    <button className="textbutton" onClick={() => nav('about')}>Về TECHHUB VN <ArrowUpRight size={13} /></button>
                    {!!data.me && <form action="/sign-out" method="post"><button type="submit" className="textbutton"><LogOut size={15} /> Đăng xuất</button></form>}
                </div>
            </aside>
            <div className={'workspace ' + (page === 'feed' ? 'workspace-home' : '')}>
                {error && <div className="errorbanner" role="alert">{error}<button className="textbutton" onClick={() => refresh()}>Thử lại <RefreshCw size={15} /></button></div>}
                <main tabIndex={-1} id="main-content" className={'content-page page-' + page} aria-busy={loading}>
                    {(pages[page] || feed)()}
                </main>
                <footer className="site-footer"><span>TECHHUB VN · Cộng đồng công nghệ Việt Nam</span><button className="textbutton" onClick={() => nav('about')}>Về dự án</button></footer>
            </div>
        </div>
        <nav className="mobilebar" aria-label="Điều hướng di động">
            {([['feed', Home], ['groups', Users], ['shop', ShoppingBag], ['learn', BookOpen]] as const).map(([id, Icon]) =>
                <button key={id} className={page === id ? 'on' : ''} aria-current={page === id ? 'page' : undefined} onClick={() => nav(id)}><Icon size={21} /><small>{titles[id]}</small></button>)}
            <button aria-expanded={modal?.type === 'menu'} onClick={() => setModal({ type: 'menu' })}><Menu size={22} /><small>Thêm</small></button>
        </nav>
        <dialog ref={dialogRef} aria-label={modal?.type === 'menu' ? 'Điều hướng' : 'Chi tiết và thao tác'} className="modal"
            onCancel={closeModal} onClick={event => { if (event.target === dialogRef.current) closeModal(); }}>
            <button className="modalclose icon" onClick={closeModal} aria-label="Đóng"><X size={22} /></button>
            {modalContent()}
        </dialog>
        {notice && <div className="toast" role="status"><Check size={17} />{notice}</div>}
    </>;
}
