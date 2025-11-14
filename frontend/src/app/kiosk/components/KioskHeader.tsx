'use client'; // <-- 이게 빠졌을 수도 있습니다. (1)

import React from 'react'; // <-- 이게 빠졌을 수도 있습니다. (2)
import Link from 'next/link';

// 뒤로가기 아이콘 (SVG)
const BackIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 19.5L8.25 12l7.5-7.5"
    />
  </svg>
);

// KioskHeader 컴포넌트 (default export)
// ⬇️ 'export default' 이게 빠졌을 수도 있습니다. (3)
export default function KioskHeader() {
  return (
    <header className="w-full bg-white/50 backdrop-blur-lg p-4 flex items-center justify-between shadow-md border-b border-white/30 sticky top-0 z-50">
      {/* 뒤로가기 버튼 */}
      <Link
        href="/kiosk"
        className="flex items-center gap-2 text-slate-700 hover:text-purple-600 transition-colors group"
      >
        <div className="bg-white/70 group-hover:bg-purple-100 rounded-full p-2 transition-colors">
          <BackIcon className="w-6 h-6" />
        </div>
        <span className="text-lg font-semibold">뒤로가기</span>
      </Link>
      
      {/* 페이지 제목 */}
      <h1 className="text-2xl font-bold text-slate-800">AI 상담</h1>
      
      {/* 오른쪽 공간 (비워둠) */}
      <div className="w-24"></div>
    </header>
  );
}