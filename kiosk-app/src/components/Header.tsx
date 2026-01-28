import React from 'react';
import { HomeIcon, LogoIcon } from './Icons';

interface HeaderProps {
  onBack: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onBack }) => {
  return (
    <header className="flex items-center justify-between p-4 border-b border-white/30 bg-white/60 backdrop-blur-xl sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-3">
        <LogoIcon className="w-10 h-10 text-indigo-600" />
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-purple-800 to-slate-900 text-transparent bg-clip-text">
          미추홀구청소년센터
        </h1>
      </div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/50 hover:bg-white/80 text-slate-700 font-semibold transition-all duration-200"
        aria-label="메인 화면으로 가기"
      >
        <HomeIcon className="w-6 h-6" />
        <span>메인 화면</span>
      </button>
    </header>
  );
};