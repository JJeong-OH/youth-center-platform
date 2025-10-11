'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KioskHomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('kioskUser');
    const token = sessionStorage.getItem('kioskToken');

    if (!storedUser || !token) {
      router.push('/kiosk/login');
      return;
    }

    setUser(JSON.parse(storedUser));
  }, [router]);

  const handleLogout = async () => {
    const kioskLogId = sessionStorage.getItem('kioskLogId');
    
    if (kioskLogId) {
      try {
        await fetch('http://localhost:3000/kiosk/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kioskLogId: parseInt(kioskLogId) }),
        });
      } catch (err) {
        console.error('로그아웃 에러:', err);
      }
    }

    sessionStorage.clear();
    router.push('/kiosk/login');
  };

  if (!user) {
    return (
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <p>로딩중...</p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* 헤더 */}
      <div style={{
        padding: '24px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
            환영합니다!
          </p>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '4px 0 0 0' }}>
            {user.name} 님
          </h1>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 'bold',
            backgroundColor: '#f5f5f5',
            color: '#666',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          로그아웃
        </button>
      </div>

      {/* 메뉴 */}
      <div style={{ 
        flex: 1, 
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <MenuButton 
          title="시설 예약" 
          icon="🏢"
          description="노래방, 체육관, 탁구장 등"
          onClick={() => alert('시설 예약 기능 준비중')}
        />
        
        <MenuButton 
          title="프로그램 조회" 
          icon="📚"
          description="진행중인 프로그램 확인"
          onClick={() => alert('프로그램 조회 기능 준비중')}
        />
        
        <MenuButton 
          title="내 포트폴리오" 
          icon="📊"
          description="나의 활동 내역 보기"
          onClick={() => alert('포트폴리오 기능 준비중')}
        />
      </div>
    </div>
  );
}

function MenuButton({ 
  title, 
  icon, 
  description, 
  onClick 
}: { 
  title: string; 
  icon: string; 
  description: string; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '24px',
        border: '2px solid #ddd',
        borderRadius: '16px',
        backgroundColor: 'white',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#5887FF';
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(88,135,255,0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#ddd';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>
        {icon}
      </div>
      <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>
        {title}
      </div>
      <div style={{ fontSize: '14px', color: '#999' }}>
        {description}
      </div>
    </button>
  );
}