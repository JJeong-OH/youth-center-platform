import React, { useState } from 'react';
import type { View } from './types/types';
import { Landing } from './components/Landing';
import { Header } from './components/Header';
import { AICounselor } from './components/AIcounselor';
import { FacilityReservation } from './components/FacilityReservation';
import { ProgramRecommendation } from './components/ProgramRecommendation';

function App() {
  const [currentView, setCurrentView] = useState<View>('landing');

  const handleViewChange = (view: View) => {
    setCurrentView(view);
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  if (currentView === 'landing') {
    return <Landing onStart={handleViewChange} />;
  }

  // 랜딩 페이지가 아닐 때의 디자인
  // '글래스모피즘'을 돋보이게 하기 위해, 다른 페이지들은
  // 깔끔한 단색 배경(bg-slate-50)을 유지합니다.
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Header onBack={handleBackToLanding} />
      <main className="flex-grow p-4 md:p-6 max-w-7xl mx-auto w-full">
        {/* 흰색 카드로 내부 컨텐츠를 표시합니다. */}
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200 h-full shadow-lg">
          {currentView === 'counselor' && <AICounselor />}
          {currentView === 'facilities' && <FacilityReservation />}
          {currentView === 'recommend' && <ProgramRecommendation />}
        </div>
      </main>
    </div>
  );
}

export default App;