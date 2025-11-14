'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Facility {
  id: string;
  name: string;
  icon: string;
  description: string | null;
  capacity: number | null;
  isActive: boolean;
}

export default function KioskFacilityPage() {
  const router = useRouter();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/kiosk/facilities');
      const data = await response.json();
      
      if (data.success !== false) {
        setFacilities(Array.isArray(data) ? data : data.facilities || []);
      }
    } catch (error) {
      console.error('시설 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFacility = (facility: Facility) => {
    localStorage.setItem('selectedFacility', JSON.stringify(facility));
    router.push('/kiosk/facility/booking');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <button
            onClick={() => router.push('/kiosk')}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '16px',
              marginBottom: '20px'
            }}
          >
            ← 뒤로가기
          </button>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '16px'
          }}>
            시설 선택
          </h1>
          <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.9)' }}>
            예약하실 시설을 선택해주세요
          </p>
        </div>

        {/* 시설 목록 */}
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            color: 'white',
            fontSize: '24px'
          }}>
            로딩 중...
          </div>
        ) : facilities.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '20px',
            color: 'white',
            fontSize: '20px'
          }}>
            현재 예약 가능한 시설이 없습니다.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '30px'
          }}>
            {facilities.map((facility) => (
              <button
                key={facility.id}
                onClick={() => handleSelectFacility(facility)}
                style={{
                  background: 'white',
                  border: 'none',
                  borderRadius: '24px',
                  padding: '40px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
                }}
              >
                <div style={{
                  fontSize: '80px',
                  marginBottom: '20px',
                  textAlign: 'center'
                }}>
                  {facility.icon}
                </div>
                <h3 style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                  color: '#1f2937'
                }}>
                  {facility.name}
                </h3>
                {facility.description && (
                  <p style={{
                    fontSize: '16px',
                    color: '#6b7280',
                    lineHeight: '1.6',
                    marginBottom: '16px'
                  }}>
                    {facility.description}
                  </p>
                )}
                {facility.capacity && (
                  <div style={{
                    display: 'inline-block',
                    backgroundColor: '#f3f4f6',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: '#374151',
                    fontWeight: '600'
                  }}>
                    👥 수용인원: {facility.capacity}명
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}