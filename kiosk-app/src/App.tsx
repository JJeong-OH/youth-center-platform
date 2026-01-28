import { useState } from 'react';
import type { View } from './types/types';
import { Landing } from './components/Landing';
import { Header } from './components/Header';
import { AICounselor } from './components/AIcounselor';
import { FacilityReservation } from './components/FacilityReservation';
import { ProgramRecommendation } from './components/ProgramRecommendation';

function App() {
  const [currentView, setCurrentView] = useState<View>('landing');
  // ✅ 시설 예약의 탭 모드 state 추가
  const [facilityViewMode, setFacilityViewMode] = useState<'new' | 'check'>('new');

  const handleViewChange = (view: View) => {
    setCurrentView(view);
    // 일반적인 경우는 '신규 예약' 탭으로
    if (view === 'facilities') {
      setFacilityViewMode('new');
    }
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setFacilityViewMode('new');
  };

  const handleCheckReservation = () => {
    setCurrentView('facilities');
    setFacilityViewMode('check');  
  };

  if (currentView === 'landing') {
    return (
      <Landing 
        onStart={handleViewChange} 
        onCheckReservation={handleCheckReservation}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Header onBack={handleBackToLanding} />
      <main className="flex-grow p-4 md:p-6 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200 h-full shadow-lg">
          {currentView === 'counselor' && <AICounselor onBack={handleBackToLanding} />}
          {currentView === 'facilities' && (
            <FacilityReservation 
              onBack={handleBackToLanding} 
              initialViewMode={facilityViewMode}  
            />
          )}
          {currentView === 'recommend' && <ProgramRecommendation onBack={handleBackToLanding} />}
        </div>
      </main>
    </div>
  );
}

export default App;