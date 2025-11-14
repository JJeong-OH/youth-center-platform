import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '미추홀구청소년센터 관리자',
  description: '청소년센터 통합 관리 시스템',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}