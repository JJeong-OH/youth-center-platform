'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Survey {
  id: number;
  userName: string;
  answers: any;
  scores: any;
  createdAt: string;
}

export default function AdminSurveysPage() {
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [totalSurveys, setTotalSurveys] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSurveyStats();
  }, []);

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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* 헤더 */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px',
        marginBottom: '32px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => router.push('/admin/dashboard')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              ← 대시보드
            </button>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                설문 통계
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                설문조사 참여 현황 및 결과
              </p>
            </div>
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
      </header>

      {/* 메인 컨텐츠 */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px 32px' }}>
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