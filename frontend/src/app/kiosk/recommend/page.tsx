'use client';

import React from 'react';
// ⬇️ 여기가 수정된 부분입니다. 중괄호 {} 를 뺐습니다.
import KioskHeader from '../components/KioskHeader';

export default function RecommendPage() {
  return (
    <div className="flex flex-col h-screen">
      {/* KioskHeader를 import 해서 사용합니다. 
        이 페이지의 제목은 KioskHeader 컴포넌트 내부에서 'AI 상담'으로 고정되어 있습니다.
        추후에는 페이지마다 다른 제목이 보이도록 KioskHeader를 수정하는 것이 좋습니다.
      */}
      <KioskHeader />
      <main className="flex-grow p-4 md:p-6 max-w-7xl mx-auto w-full">
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/30 h-full shadow-lg">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            프로그램 추천
          </h1>
          <p className="text-slate-600">
            현재 프로그램 추천 기능은 준비 중입니다.
          </p>
          {/* 여기에 나중에 프로그램 추천 관련 컴포넌트를 넣으면 됩니다. */}
        </div>
      </main>
    </div>
  );
}