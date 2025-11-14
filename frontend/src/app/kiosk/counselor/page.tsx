'use client';

import React from 'react';
// ⬇️ 중괄호 {} 를 제거하고 default import로 변경합니다.
import AICounselor from '../components/AICounselor';
import KioskHeader from '../components/KioskHeader';

export default function CounselorPage() {
  return (
    <div className="flex flex-col h-screen">
      <KioskHeader />
      <main className="flex-grow p-4 md:p-6 max-w-7xl mx-auto w-full">
        {/* 배경을 흐릿하게 만드는 부분 추가 */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/30 h-full shadow-lg">
          {/* AICounselor 컴포넌트가 이 안에서 렌더링됩니다. */}
          <AICounselor />
        </div>
      </main>
    </div>
  );
}