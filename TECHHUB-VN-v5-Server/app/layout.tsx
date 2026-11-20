import type { Metadata } from 'next';
import './globals.css';
import './fonts.css';
import './experience.css';
export const metadata: Metadata = { title: 'TECHHUB VN — Cộng đồng công nghệ Việt Nam', description: 'Kết nối con người, tri thức, sản phẩm và doanh nghiệp công nghệ Việt Nam.', icons: { icon: '/favicon.svg' } };
export default function RootLayout({ children }: {
    children: React.ReactNode;
}) { return <html lang="vi"><body>{children}</body></html>; }
