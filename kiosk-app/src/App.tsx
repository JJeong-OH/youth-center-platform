import { useState } from 'react';
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

  // ✅ 예약확인 버튼 핸들러
  const handleCheckReservation = () => {
    setCurrentView('facilities');
    // 필요시 FacilityReservation 컴포넌트에 viewMode='check' 전달 가능
  };

  if (currentView === 'landing') {
    return (
      <Landing 
        onStart={handleViewChange} 
        onCheckReservation={handleCheckReservation}  // ✅ 추가
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Header onBack={handleBackToLanding} />
      <main className="flex-grow p-4 md:p-6 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200 h-full shadow-lg">
          {currentView === 'counselor' && <AICounselor onBack={handleBackToLanding} />}
          {currentView === 'facilities' && <FacilityReservation onBack={handleBackToLanding} />}
          {currentView === 'recommend' && <ProgramRecommendation onBack={handleBackToLanding} />}
        </div>
      </main>
    </div>
  );
}

export default App;