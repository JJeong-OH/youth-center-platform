import React from 'react';
import type { View } from '../types/types';

// 1. 이미지 import 경로는 그대로 사용합니다.
import logoUrl from '/src/assets/react.svg'; // 임시 로고
import mainBotUrl from '/src/assets/image.png'; // 메인 로봇 (가정)
import counselBotUrl from '/src/assets/image1.png'; // AI 상담 (가정)
import recommendBotUrl from '/src/assets/image2.png'; // 프로그램 추천 (가정)
import facilityBotUrl from '/src/assets/image3.png'; // 시설 예약 (가정)

interface LandingProps {
  onStart: (view: View) => void;
}

// ActionCard 컴포넌트 (변경 없음)
const ActionCard: React.FC<{
  imageUrl: string;
  title: string;
  onClick: () => void;
}> = ({ imageUrl, title, onClick }) => (
  <button
    onClick={onClick}
    className="
      bg-white/30 backdrop-blur-lg border border-white/50 
      rounded-3xl shadow-xl p-6 
      flex flex-col items-center gap-4 
      group hover:bg-white/50 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-2 
      transition-all duration-300 w-full"
    style={{ minHeight: '320px' }}
  >
    <div className="bg-sky-100/70 text-sky-900 text-xl font-semibold px-6 py-2 rounded-full">
      {title}
    </div>
    <img
      src={imageUrl}
      alt={title}
      className="w-full h-44 object-contain rounded-lg mt-2"
    />
  </button>
);

export const Landing: React.FC<LandingProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 md:px-12 lg:px-20 xl:px-32 py-12 relative overflow-hidden">
      
      <div className="relative z-10 w-full">
        {/* 상단 헤더 (로고) */}
        <header className="w-full max-w-7xl mx-auto flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="미추홀구청소년센터 로고" className="w-12 h-12" />
            <span className="text-2xl font-bold text-slate-900">
              미추홀구청소년센터
            </span>
          </div>
        </header>

        {/* 메인 콘텐츠 (타이틀 + 메인 로봇) */}
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-8 mb-16">
          
          {/* ✨✨✨
            ✨ 1. 타이틀 영역 수정
            ✨ (hover 효과, 글자 크기, 'AI' 애니메이션)
            ✨✨✨
          */}
          <div className="flex flex-col gap-4 text-center md:text-left items-center md:items-start transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-4">
              
              {/* "AI" 텍스트: text-9xl로 크기 증가, style로 애니메이션 추가 */}
              <div
                className="
                  bg-gradient-to-r from-blue-600 to-purple-500 
                  text-transparent bg-clip-text
                  font-black text-9xl
                "
                style={{
                  backgroundSize: '200% 200%',
                  animation: 'gradient-bg 3s ease infinite', // index.css에 정의된 애니메이션
                }}
              >
                AI
              </div>
              
              {/* "청소년 키오스크" 텍스트: text-7xl로 크기 증가 */}
              <h1 className="text-7xl font-black text-slate-900 leading-tight">
                청소년
                <br />
                키오스크
              </h1>
            </div>
            
            <p className="text-xl md:text-2xl font-semibold text-slate-700 mt-4">
              청소년 예약 관리시스템 »
            </p>
          </div>

          {/* 오른쪽 메인 로봇 이미지 (변경 없음) */}
          <div className="flex items-center justify-center relative">
            <div className="absolute w-64 h-64 bg-blue-400 rounded-full opacity-40 blur-3xl"></div>
            
            <div className="absolute top-0 right-0 md:right-10 bg-blue-500 text-white text-lg font-semibold px-6 py-3 rounded-full rounded-tr-none shadow-lg">
              안녕하세요!
            </div>
            
            <img
              src={mainBotUrl}
              alt="AI 키오S스크 메인 로봇"
              className="w-full max-w-md h-auto relative z-10 animate-float"
            />
          </div>
        </div>

        {/* 액션 카드 (하단 3개) (변경 없음) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 w-full max-w-7xl mx-auto">
          <ActionCard
            imageUrl={counselBotUrl}
            title="AI 상담"
            onClick={() => onStart('counselor')}
          />
          <ActionCard
            imageUrl={recommendBotUrl}
            title="프로그램 추천"
            onClick={() => onStart('recommend')}
          />
          <ActionCard
            imageUrl={facilityBotUrl}
            title="시설 예약"
            onClick={() => onStart('facilities')}
          />
        </div>
      </div>
    </div>
  );
};