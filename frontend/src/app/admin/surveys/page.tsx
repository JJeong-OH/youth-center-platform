'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface Survey {
  id: number;
  userName: string;
  answers: any;
  scores: any;
  createdAt: string;
}

export default function AdminSurveysPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [totalSurveys, setTotalSurveys] = useState(0);
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState<any>(null);

  const menuItems = [
    { path: '/admin/dashboard', label: '대시보드', icon: '■' },
    { path: '/admin/users', label: '회원 관리', icon: '■' },
    { path: '/admin/integrated-users', label: '통합 회원 관리', icon: '■' },
    { path: '/admin/programs', label: '프로그램 관리', icon: '■' },
    { path: '/admin/facilities', label: '시설 관리', icon: '■' },
    { path: '/admin/bookings', label: '예약 관리', icon: '■' },
    { path: '/admin/surveys', label: '설문 통계', icon: '■' },
  ];

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const info = localStorage.getItem('adminInfo');
    
    if (!token) {
      router.push('/admin/login');
      return;
    }

    if (info) {
      setAdminInfo(JSON.parse(info));
    }

    fetchSurveyStats();
  }, [router]);

  const fetchSurveyStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:3001/api/admin/surveys/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setSurveys(data.surveys);
        setTotalSurveys(data.totalSurveys);
      }
    } catch (error) {
      console.error('설문 통계 조회 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    router.push('/admin/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* 사이드바 */}
      <aside style={{
        width: '260px',
        backgroundColor: '#1e293b',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0
      }}>
        <div style={{
          padding: '28px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h1 style={{
            fontSize: '20px',
            fontWeight: '700',
            margin: 0,
            color: 'white'
          }}>
            청소년센터
          </h1>
          <p style={{
            fontSize: '13px',
            color: '#94a3b8',
            margin: '4px 0 0 0'
          }}>
            관리자 시스템
          </p>
        </div>

        <nav style={{ flex: 1, padding: '16px 0' }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 24px',
                  color: isActive ? 'white' : '#94a3b8',
                  textDecoration: 'none',
                  fontSize: '15px',
                  fontWeight: isActive ? '600' : '500',
                  backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#94a3b8';
                  }
                }}
              >
                <span style={{ fontSize: '10px', opacity: 0.5 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'white', marginBottom: '2px' }}>
              {adminInfo?.name || '관리자'}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              {adminInfo?.email}
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            로그아웃
          </button>
        </div>
      </aside>

      {/* 메인 컨텐츠 */}
      <main style={{
        marginLeft: '260px',
        flex: 1,
        padding: '32px 40px',
        width: 'calc(100vw - 260px)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '32px' 
        }}>
          <div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: '4px'
            }}>
              설문 통계
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              margin: 0
            }}>
              설문조사 참여 현황 및 결과
            </p>
          </div>
          <div style={{
            padding: '12px 24px',
            backgroundColor: '#1e3a8a',
            color: 'white',
            borderRadius: '6px',
            fontWeight: '700'
          }}>
            총 {totalSurveys}건
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              데이터 로딩 중...
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <tr>
                    <th style={tableHeaderStyle}>번호</th>
                    <th style={tableHeaderStyle}>참여자</th>
                    <th style={tableHeaderStyle}>참여일시</th>
                    <th style={tableHeaderStyle}>점수</th>
                  </tr>
                </thead>
                <tbody>
                  {surveys.map((survey, index) => (
                    <tr key={survey.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={tableCellStyle}>{totalSurveys - index}</td>
                      <td style={tableCellStyle}>
                        <strong style={{ color: '#1e293b' }}>{survey.userName}</strong>
                      </td>
                      <td style={tableCellStyle}>{formatDate(survey.createdAt)}</td>
                      <td style={tableCellStyle}>
                        {survey.scores && Object.keys(survey.scores).length > 0 ? (
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {Object.entries(survey.scores).slice(0, 3).map(([key, value]: [string, any]) => (
                              <span key={key} style={{
                                padding: '4px 8px',
                                backgroundColor: '#f1f5f9',
                                borderRadius: '4px',
                                fontSize: '12px',
                                color: '#475569'
                              }}>
                                {key}: {value}점
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const tableHeaderStyle: React.CSSProperties = {
  padding: '16px',
  textAlign: 'left',
  fontSize: '13px',
  fontWeight: '700',
  color: '#475569',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px'
};

const tableCellStyle: React.CSSProperties = {
  padding: '16px',
  fontSize: '14px',
  color: '#64748b'
};