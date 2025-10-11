'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSurveysPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSurveyStats();
  }, []);

  const fetchSurveyStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:3000/admin/surveys/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setStats(data);
      }
    } catch (error) {
      console.error('설문 통계 조회 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>로딩중...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* 헤더 */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => router.push('/admin/dashboard')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              marginBottom: '8px'
            }}
          >
            ← 대시보드
          </button>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            설문 통계
          </h1>
        </div>

        {/* 전체 통계 */}
        <div style={{
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '12px',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>📊</div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            총 설문 참여 수
          </div>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#5887FF' }}>
            {stats?.totalSurveys || 0}
          </div>
        </div>

        {/* 타입별 통계 */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
            설문 타입별 통계
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {stats?.typeStats && Object.entries(stats.typeStats).map(([type, count]: any) => (
              <div
                key={type}
                style={{
                  padding: '20px',
                  border: '2px solid #eee',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                  {type}
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#5887FF' }}>
                  {count}
                </div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  참여
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 최근 설문 목록 */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
            최근 설문 결과
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats?.recentSurveys?.map((survey: any) => (
              <div
                key={survey.id}
                style={{
                  padding: '16px',
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                    {survey.userName}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {survey.testType}
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  {new Date(survey.createdAt).toLocaleString('ko-KR')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}