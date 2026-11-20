import type { ReactNode } from 'react';
import { ArrowUpRight, BookOpen, Building2, Cpu, MessageSquare, Plus, Sparkles, Star, UsersRound } from 'lucide-react';
import type { Item } from '../lib/content';

type DiscoveryProps = {
    navigate: (page: string) => void;
    open: (item: Item) => void;
    compose: () => void;
    products: Item[];
    discussions: Item[];
    renderProduct: (item: Item) => ReactNode;
    renderPost: (item: Item) => ReactNode;
};

const destinations = [
    { page: 'groups', label: 'Cộng đồng', icon: UsersRound },
    { page: 'shop', label: 'Sản phẩm', icon: Cpu },
    { page: 'business', label: 'Doanh nghiệp', icon: Building2 },
    { page: 'reviews', label: 'Đánh giá', icon: Star },
    { page: 'learn', label: 'Học tập', icon: BookOpen },
];

export function Discover({ navigate, open, compose, products, discussions, renderProduct, renderPost }: DiscoveryProps) {
    return (
        <div className="discover">
            <section className="home-hero" aria-labelledby="hero-title">
                <img className="home-hero-image" src="/images/hero-hardware.webp" alt="" fetchPriority="high" />
                <div className="home-hero-copy">
                    <span className="hero-label"><span /> CỘNG ĐỒNG CÔNG NGHỆ VIỆT NAM</span>
                    <h1 id="hero-title">Khám phá công nghệ.<br /><em>Kết nối người Việt.</em></h1>
                    <p>Tìm thiết bị, đọc đánh giá và chia sẻ điều bạn đang học cùng cộng đồng công nghệ Việt Nam.</p>
                    <div className="hero-actions">
                        <button className="primary" onClick={() => navigate('shop')}>Khám phá sản phẩm</button>
                        <button className="secondary" onClick={() => navigate('groups')}><UsersRound size={17} /> Tham gia cộng đồng</button>
                    </div>
                </div>
            </section>
            <nav className="jump-nav" aria-label="Khám phá nhanh">
                {destinations.map(({ page, label, icon: Icon }) => (
                    <button key={page} onClick={() => navigate(page)}><Icon size={17} />{label}</button>
                ))}
            </nav>
            <div className="discover-grid">
                <div className="discover-main">
                    <section aria-labelledby="products-title" className="discover-products">
                        <div className="discover-heading">
                            <div><h2 id="products-title">Sản phẩm nổi bật</h2><p>Thiết bị và phụ kiện cho góc làm việc của bạn.</p></div>
                            <button className="textbutton" onClick={() => navigate('shop')}>Xem tất cả <ArrowUpRight size={15} /></button>
                        </div>
                        <div className="productgrid">{products.slice(0, 3).map(renderProduct)}</div>
                    </section>
                    <section aria-labelledby="discussion-title" className="discover-feed">
                        <div className="discover-heading">
                            <div><h2 id="discussion-title">Mới từ cộng đồng</h2><p>Câu hỏi và kinh nghiệm từ người dùng công nghệ.</p></div>
                            <button className="secondary" onClick={compose}><Plus size={16} /> Chia sẻ</button>
                        </div>
                        {discussions.slice(0, 4).map(renderPost)}
                    </section>
                </div>
                <aside className="discover-aside" aria-label="Thảo luận và trợ lý">
                    <section className="card discussion-panel">
                        <div className="side-heading"><span className="side-icon"><MessageSquare size={17} /></span><h2>Cùng thảo luận</h2></div>
                        <ul>{discussions.slice(0, 3).map(item => (
                            <li key={item.id}><button onClick={() => open(item)}>
                                <span className="discussion-title">{item.title}</span>
                                <span className="small">{item.category}</span>
                            </button></li>
                        ))}</ul>
                        <button className="textbutton" onClick={() => navigate('questions')}>Xem hỏi đáp <ArrowUpRight size={14} /></button>
                    </section>
                    <section className="card assistant-panel">
                        <div className="side-heading"><span className="side-icon"><Sparkles size={18} /></span><h2>Trợ lý công nghệ</h2></div>
                        <p>Nhận gợi ý chọn thiết bị, tìm khóa học hoặc chuẩn bị câu hỏi cho cộng đồng.</p>
                        <button className="secondary" onClick={() => navigate('assistant')}>Thử hướng dẫn <ArrowUpRight size={15} /></button>
                    </section>
                </aside>
            </div>
        </div>
    );
}
