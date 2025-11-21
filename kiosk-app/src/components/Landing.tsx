import React from 'react';
import type { View } from '../types/types';

import logoUrl from '/src/assets/react.svg';
import mainBotUrl from '/src/assets/image.png';
import counselBotUrl from '/src/assets/image1.png';
import recommendBotUrl from '/src/assets/image2.png';
import facilityBotUrl from '/src/assets/image3.png';

interface LandingProps {
  onStart: (view: View) => void;
  onCheckReservation?: () => void;  
}

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

export const Landing: React.FC<LandingProps> = ({ onStart, onCheckReservation }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 md:px-12 lg:px-20 xl:px-32 py-12 relative overflow-hidden">
      
      <div className="relative z-10 w-full">
        {/* 상단 헤더 */}
        <header className="w-full max-w-7xl mx-auto flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="미추홀구청소년센터 로고" className="w-12 h-12" />
            <span className="text-2xl font-bold text-slate-900">
              미추홀구청소년센터
            </span>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-8 mb-16">
          <div className="flex flex-col gap-4 text-center md:text-left items-center md:items-start transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-4">
              <div
                className="
                  bg-gradient-to-r from-blue-600 to-purple-500 
                  text-transparent bg-clip-text
                  font-black text-9xl
                "
                style={{
                  backgroundSize: '200% 200%',
                  animation: 'gradient-bg 3s ease infinite',
                }}
              >
                AI
              </div>
              
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

          <div className="flex items-center justify-center relative">
            <div className="absolute w-64 h-64 bg-blue-400 rounded-full opacity-40 blur-3xl"></div>
            
            <div className="absolute top-0 right-0 md:right-10 bg-blue-500 text-white text-lg font-semibold px-6 py-3 rounded-full rounded-tr-none shadow-lg">
              안녕하세요!
            </div>
            
            <img
              src={mainBotUrl}
              alt="AI 키오스크 메인 로봇"
              className="w-full max-w-md h-auto relative z-10 animate-float"
            />
          </div>
        </div>

        {/* 액션 카드 3개 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 w-full max-w-7xl mx-auto mb-32">
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

        {/* ✅ 예약확인 버튼 추가 */}
        {onCheckReservation && (
          <div style={{
            position: 'fixed',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            width: '90%',
            maxWidth: '600px'
          }}>
            <button
              onClick={onCheckReservation}
              style={{
                width: '100%',
                padding: '24px 32px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontSize: '24px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
              }}
            >
              <span style={{ fontSize: '28px' }}>📋</span>
              <span>예약 확인하기</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};