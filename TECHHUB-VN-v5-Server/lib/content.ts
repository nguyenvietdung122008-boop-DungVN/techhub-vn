export type Item = {
    id: string;
    kind: string;
    owner: string;
    author: string;
    title: string;
    body: string;
    category: string;
    payload: Record<string, any>;
    status: string;
    created_at: string;
    demo?: boolean;
};
export const groups = [{ id: 'ai', name: 'AI & Lập trình', icon: '✦', desc: 'Hỏi đáp, chia sẻ code và khám phá AI có trách nhiệm.', color: '#e9e7ff' }, { id: 'hardware', name: 'Thiết bị & Điện tử', icon: '⌘', desc: 'Trải nghiệm phần cứng, đánh giá thực tế và góc setup.', color: '#e2efff' }, { id: 'startup', name: 'Startup & Doanh nghiệp', icon: '↗', desc: 'Kết nối đội ngũ, tìm đối tác và phát triển sản phẩm.', color: '#fff0e1' }, { id: 'learn', name: 'Học cùng nhau', icon: '◈', desc: 'Cộng đồng dành cho người mới bắt đầu công nghệ.', color: '#e5f4ec' }];
export const catalog: Item[] = [{ id: 'demo-laptop', kind: 'product', owner: 'demo', author: 'Gian hàng minh họa', title: 'Laptop sáng tạo 14 inch', body: 'Laptop 14 inch hướng tới người học lập trình và làm sáng tạo nhẹ. Cấu hình mẫu có RAM 16 GB và SSD 512 GB. Hãy kiểm tra khả năng nâng cấp RAM và thông số màn hình khi chọn máy thực tế.', category: 'Laptop', payload: { price: 18990000, image: '/images/laptop.webp', ram: '16 GB', storage: '512 GB SSD', type: 'B2C', condition: 'Mới', location: 'TP. Hồ Chí Minh' }, status: 'visible', created_at: '2026-11-18T00:00:00Z', demo: true }, { id: 'demo-headphone', kind: 'product', owner: 'demo', author: 'Gian hàng minh họa', title: 'Tai nghe chống ồn không dây', body: 'Tai nghe chụp tai có chống ồn chủ động và kết nối Bluetooth. Phù hợp để làm việc ở quán cà phê. Khi chọn mua, nên thử độ ôm tai, chất lượng mic và khả năng kết nối nhiều thiết bị.', category: 'Phụ kiện', payload: { price: 2490000, image: '/images/headphones.webp', ram: '—', storage: '—', type: 'B2C', condition: 'Mới', location: 'Hà Nội' }, status: 'visible', created_at: '2026-11-18T00:00:00Z', demo: true }, { id: 'demo-camera', kind: 'product', owner: 'demo', author: 'Gian hàng minh họa', title: 'Máy ảnh mirrorless + ống kit', body: 'Bộ máy ảnh không gương lật và ống kính kit dành cho người mới tập chụp. Với máy cũ, nên kiểm tra cảm biến, ngàm, pin và tình trạng ống kính.', category: 'Máy ảnh', payload: { price: 14500000, image: '/images/camera.webp', ram: '—', storage: 'Thẻ nhớ rời', type: 'B2C', condition: 'Đã qua sử dụng', location: 'Đà Nẵng' }, status: 'visible', created_at: '2026-11-18T00:00:00Z', demo: true }];
export const examples: Item[] = [{ id: 'demo-post', kind: 'post', owner: 'demo-linh', author: 'Linh Nguyễn', title: 'Bắt đầu học AI từ một dự án nhỏ?', body: 'Mình đang học Python và muốn làm một công cụ phân loại chi tiêu đơn giản. Mọi người thường bắt đầu bằng kiến thức nền hay làm dự án rồi học dần? Chia sẻ cách học của bạn nhé!\n\n#AIChoNguoiViet #HocCungNhau', category: 'AI & Lập trình', payload: { image: '/images/community.webp' }, status: 'visible', created_at: '2026-11-18T00:00:00Z', demo: true }, { id: 'demo-question', kind: 'question', owner: 'demo-nam', author: 'Hoàng Nam', title: 'RAM 16 GB có đủ cho người mới học lập trình?', body: 'Mình học web và chạy một vài container nhỏ. Khi nào nên ưu tiên nâng RAM thay vì CPU? Mong nhận gợi ý về cách tự đo nhu cầu.', category: 'Thiết bị & Điện tử', payload: { tags: 'laptop, lập trình' }, status: 'visible', created_at: '2026-11-18T00:00:00Z', demo: true }, { id: 'demo-project', kind: 'project', owner: 'demo-team', author: 'Nhóm phát triển mẫu', title: 'GreenDesk — Theo dõi năng lượng góc làm việc', body: 'Một ý tưởng dashboard trực quan hóa lượng điện tiêu thụ của thiết bị. Đang tìm cộng tác viên frontend và người quan tâm IoT để thử nghiệm giải pháp.', category: 'IoT & Phần cứng', payload: { image: '/images/prototype.webp', stack: 'React, TypeScript, IoT', stage: 'Ý tưởng', looking: 'Frontend, IoT' }, status: 'visible', created_at: '2026-11-18T00:00:00Z', demo: true }, { id: 'demo-company', kind: 'company', owner: 'demo', author: 'Hồ sơ mẫu', title: 'VietCloud Studio', body: 'Hồ sơ giả lập cho luồng tìm đối tác: giải pháp phần mềm, hạ tầng và tích hợp hệ thống.', category: 'Phần mềm & Cloud', payload: { location: 'Hà Nội', type: 'B2B', services: 'Phát triển phần mềm · Cloud · Tích hợp' }, status: 'visible', created_at: '2026-11-18T00:00:00Z', demo: true }];
export const courses = [{ id: 'python', title: 'Python từ bước đầu tiên', category: 'Lập trình', desc: 'Từ biến và vòng lặp đến một chương trình lọc sản phẩm.', image: '/images/python.webp', lessons: [{ title: 'Biến & kiểu dữ liệu', text: 'Biến là tên để lưu giá trị. Python có các kiểu số nguyên (int), số thực (float), chuỗi (str) và đúng/sai (bool). Đặt tên biến dễ hiểu giúp chương trình dễ đọc hơn.', code: 'name = "TECHHUB VN"\nprint("Xin chào", name)', task: 'Tạo biến chứa tên của bạn, sau đó in lời chào.' }, { title: 'Điều kiện & vòng lặp', text: 'Dùng if để thực hiện một việc khi điều kiện đúng. Dùng for để lặp qua một danh sách thay vì viết lại cùng một thao tác.', code: 'devices = ["Laptop", "Tai nghe"]\nfor device in devices:\n    print(device)', task: 'Thêm một sản phẩm vào danh sách và dự đoán đầu ra.' }, { title: 'Dự án nhỏ: lọc sản phẩm', text: 'Kết hợp danh sách, từ điển và điều kiện để chọn sản phẩm theo ngân sách. Chạy ví dụ trong môi trường Python của bạn.', code: 'products = [{"name": "Tai nghe", "price": 500000}]\nfor item in products:\n    if item["price"] <= 1000000:\n        print(item["name"])', task: 'Tạo thêm hai sản phẩm và thay đổi mức ngân sách.' }] }, { id: 'ai', title: 'Hiểu AI, sử dụng có trách nhiệm', category: 'Trí tuệ nhân tạo', desc: 'Đặt câu hỏi tốt, kiểm chứng kết quả, bảo vệ dữ liệu.', image: '/images/silicon.webp', lessons: [{ title: 'AI có thể sai', text: 'AI tạo sinh học các mẫu trong dữ liệu và tạo đầu ra mới. Câu trả lời có thể nghe hợp lý nhưng vẫn sai. Hãy kiểm chứng thông tin quan trọng với nguồn gốc và thử nghiệm có thể lặp lại.', code: '', task: 'Liệt kê một việc AI hỗ trợ tốt và một quyết định cần người xem xét.' }, { title: 'Viết yêu cầu rõ ràng', text: 'Nêu mục tiêu, bối cảnh, giới hạn và định dạng đầu ra. Cung cấp ví dụ nếu cần, sau đó điều chỉnh dựa trên kết quả.', code: 'Mục tiêu: Giải thích vòng lặp\nBối cảnh: Người mới học Python\nĐầu ra: Một ví dụ và một bài tập', task: 'Viết yêu cầu giải thích một khái niệm bạn đang học.' }, { title: 'Kiểm chứng & quyền riêng tư', text: 'Không đưa mật khẩu, khóa API hoặc dữ liệu khách hàng vào công cụ khi chưa hiểu cách xử lý dữ liệu. Với nội dung quan trọng, đối chiếu tài liệu chính thức và ghi rõ giới hạn.', code: '', task: 'Chọn một câu trả lời AI và mô tả cách kiểm chứng.' }] }, { id: 'hardware', title: 'Chọn thiết bị theo nhu cầu', category: 'Thiết bị', desc: 'Đọc thông số và đánh giá tổng chi phí sử dụng.', image: '/images/laptop.webp', lessons: [{ title: 'Bắt đầu từ công việc', text: 'Liệt kê ba tác vụ thường xuyên, ứng dụng cần dùng, mức di chuyển và ngân sách tổng. Mỗi nhóm nhu cầu có ưu tiên khác nhau.', code: '', task: 'Xếp hạng ba tiêu chí quan trọng nhất của bạn.' }, { title: 'Hiểu cấu hình', text: 'CPU xử lý tác vụ; RAM giữ dữ liệu đang dùng; SSD lưu trữ; GPU hỗ trợ đồ họa và một số phép tính. Cần xem thông số cùng tản nhiệt, màn hình, pin và thử nghiệm thực tế.', code: '', task: 'So sánh hai cấu hình và ghi lại thông tin chưa đủ để quyết định.' }, { title: 'Đánh giá minh bạch', text: 'Ghi phiên bản, điều kiện thử, ưu điểm và giới hạn. Phân biệt trải nghiệm cá nhân với số liệu đo. Công khai tài trợ hoặc liên kết tiếp thị nếu có.', code: '', task: 'Viết một đánh giá có bối cảnh, cách thử và điểm hạn chế.' }] }];
export const news: Item[] = [{ id: 'news-agent', kind: 'article', owner: 'editorial', author: 'TECHHUB VN tuyển chọn', title: 'GitHub giới thiệu giao thức cho phiên làm việc agent xuyên thiết bị', body: 'Bài viết kỹ thuật từ GitHub trình bày Agent Host Protocol và cách duy trì phiên làm việc giữa các môi trường. Đọc nguồn gốc để xem thiết kế và phạm vi triển khai.', category: 'Phần mềm', payload: { source: 'GitHub Blog', published: '2026-11-17', label: 'Tin tức', url: 'https://github.blog/engineering/engineering-principles/building-the-agent-host-protocol-for-sessions-that-continue-across-devices/', image: '/images/silicon.webp' }, status: 'visible', created_at: '2026-11-17T00:00:00Z' }, { id: 'news-git', kind: 'article', owner: 'editorial', author: 'TECHHUB VN tuyển chọn', title: 'Bên trong kiến trúc lưu trữ Git mới của GitHub', body: 'GitHub chia sẻ cách thiết kế hệ thống lưu trữ Git để phục vụ nhu cầu cộng tác ở quy mô lớn. Đây là góc nhìn từ đội ngũ xây dựng nền tảng.', category: 'Hạ tầng', payload: { source: 'GitHub Blog', published: '2026-11-05', label: 'Tin tức', url: 'https://github.blog/engineering/architecture-optimization/inside-githubs-new-git-storage-architecture/' }, status: 'visible', created_at: '2026-11-05T00:00:00Z' }, { id: 'news-deliberation', kind: 'article', owner: 'editorial', author: 'TECHHUB VN tuyển chọn', title: 'AI hỗ trợ con người thảo luận các vấn đề chưa có đáp án rõ ràng', body: 'Google Research giới thiệu Agile Deliberation, hướng nghiên cứu dùng AI hỗ trợ quá trình thảo luận của con người. Nguồn được giữ rõ để người đọc tự xem xét kết luận và giới hạn.', category: 'AI', payload: { source: 'Google Research', published: '2026-11-04', label: 'Tin tức', url: 'https://research.google/blog/agile-deliberation-how-ai-helps-humans-define-the-gray-areas/' }, status: 'visible', created_at: '2026-11-04T00:00:00Z' }];

function sample(item: Pick<Item, 'id' | 'kind' | 'author' | 'title' | 'body' | 'category' | 'payload'>): Item {
    return {
        ...item,
        owner: 'sample:' + item.id,
        status: 'visible',
        created_at: '2026-11-18T07:00:00Z',
        demo: true,
    };
}

examples.push(
    sample({
        id: 'demo-setup', kind: 'post', author: 'Mai Trần',
        title: 'Một góc làm việc gọn với màn hình và hub USB-C',
        body: 'Mình thử dùng một sợi cáp cho cả màn hình, sạc và bàn phím. Hub có cấp nguồn hoạt động tốt hơn khi cắm nhiều thiết bị. Mọi người thường ưu tiên hub rời hay màn hình tích hợp cổng USB-C?',
        category: 'Thiết bị & Điện tử', payload: {},
    }),
    sample({
        id: 'demo-electronics-company', kind: 'company', author: 'Hồ sơ mẫu',
        title: 'Sông Hàn Electronics',
        body: 'Nhà cung cấp minh họa tại Đà Nẵng, tập trung linh kiện, bộ kit IoT và mẫu thử cho phòng lab, trường học và nhóm phát triển sản phẩm.',
        category: 'Thiết bị & Điện tử',
        payload: { location: 'Đà Nẵng', type: 'B2B + B2C', services: 'Linh kiện · Bộ kit IoT · Tư vấn cấu hình phòng lab' },
    }),
    sample({
        id: 'demo-data-company', kind: 'company', author: 'Hồ sơ mẫu',
        title: 'Mekong Data Lab',
        body: 'Nhóm tư vấn minh họa tại Cần Thơ, hỗ trợ doanh nghiệp nhỏ xây dựng dashboard, báo cáo vận hành và quy trình xử lý dữ liệu.',
        category: 'AI & Dữ liệu',
        payload: { location: 'Cần Thơ', type: 'B2B', services: 'Dashboard · Tự động hóa báo cáo · Tích hợp dữ liệu' },
    }),
);

export const sampleReviews: Item[] = [
    sample({
        id: 'demo-laptop-review', kind: 'review', author: 'Minh Phạm',
        title: 'Một chiếc 14 inch dễ mang đi học',
        body: 'Tình huống minh họa: soạn tài liệu, chạy VS Code, mở khoảng 15 tab và chạy một container trong hai tuần.',
        category: 'Laptop',
        payload: {
            product: 'demo-laptop', rating: 4,
            pros: 'Kích thước gọn và RAM 16 GB phù hợp những tác vụ học web cơ bản.',
            cons: 'Cần đối chiếu thời lượng pin thực tế và khả năng nâng cấp RAM theo từng mẫu.',
        },
    }),
    sample({
        id: 'demo-headphone-review', kind: 'review', author: 'An Lê',
        title: 'Chống ồn tốt cho giờ tập trung',
        body: 'Tình huống minh họa: làm việc khoảng hai giờ trong quán cà phê với chống ồn chủ động.',
        category: 'Phụ kiện',
        payload: {
            product: 'demo-headphone', rating: 4,
            pros: 'Giảm tiếng điều hòa và âm nền đều, đệm tai ôm vừa.',
            cons: 'Tiếng nói gần vẫn nghe được. Nên thử mic riêng nếu hay họp trực tuyến.',
        },
    }),
];

export const sampleThreads = examples.filter(item => ['post', 'question', 'project'].includes(item.kind));

catalog.push(sample({
    id: 'demo-iot', kind: 'product', author: 'Sông Hàn Electronics (minh họa)',
    title: 'Bộ kit IoT cho phòng lab',
    body: 'Bộ kit mẫu gồm bo mạch Wi-Fi, cảm biến và phụ kiện để thực hành thu thập dữ liệu. Dành cho lớp học, phòng lab và nhóm phát triển nguyên mẫu.',
    category: 'Điện tử khác',
    payload: { price: 3900000, image: '/images/prototype.webp', type: 'B2B', condition: 'Mới', location: 'Đà Nẵng' },
}));
