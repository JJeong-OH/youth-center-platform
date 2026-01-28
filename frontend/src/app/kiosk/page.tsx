'use client';

import React from 'react';
import Link from 'next/link';
import { ChatBotIcon, SparklesIcon, BuildingIcon } from './components/Icons';

const ActionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}> = ({ icon, title, description, href }) => (
  <Link
    href={href}
    className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl p-8 text-center flex flex-col items-center gap-4 group hover:bg-white/90 hover:shadow-2xl hover:shadow-purple-200/50 transition-all duration-300 transform hover:-translate-y-2 w-full h-full"
  >
    <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 mb-2 shadow-lg">
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-slate-800">{title}</h3>
    <p className="text-slate-500">{description}</p>
  </Link>
);

export default function KioskMainPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 md:px-12 lg:px-20 xl:px-32 py-12">
      <div className="text-center mb-16 w-full">
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-purple-800 to-slate-900 text-transparent bg-clip-text">
          청소년 AI 키오스크
        </h1>
        <p className="text-lg md:text-xl text-slate-600">
          무엇을 도와드릴까요? 아래에서 원하는 서비스를 선택해주세요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 w-full">
        <ActionCard
          icon={<ChatBotIcon className="w-12 h-12 text-white" />}
          title="AI 상담"
          description="고민이나 궁금한 점을 AI 상담사에게 편하게 이야기해요."
          href="/kiosk/counselor"
        />
        <ActionCard
          icon={<SparklesIcon className="w-12 h-12 text-white" />}
          title="프로그램 추천"
          description="나에게 맞는 재미있는 프로그램을 찾아보세요."
          href="/kiosk/recommend"
        />
        <ActionCard
          icon={<BuildingIcon className="w-12 h-12 text-white" />}
          title="시설 예약"
          description="댄스실, 합주실 등 센터 시설을 예약하고 이용해요."
          href="/kiosk/facilities"
        />
      </div>
    </div>
  );
}