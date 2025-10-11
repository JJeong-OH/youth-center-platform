'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProgramsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [allPrograms, setAllPrograms] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchRecommendations();
    fetchAllPrograms();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/program/recommended', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setRecommendations(data);
      }
    } catch (error) {
      console.error('추천 조회 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPrograms = async () => {
    try {
      const response = await fetch('http://localhost:3000/program/all');
      const data = await response.json();
      
      if (data.success) {
        setAllPrograms(data.programs);
      }
    } catch (error) {
      console.error('프로그램 목록 조회 에러:', error);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <p>로딩중...</p>
      </div>
    );
  }

  return (
    <div className="container">
      {/* 헤더 */}
      <header className="header" style={{ marginBottom: '24px' }}>
        <button
          onClick={() => router.push('/')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            marginBottom: '16px'
          }}
        >
          ← 뒤로가기
        </button>
        <p className="subtitle">미추홀구청소년센터</p>
        <h1 className="title">프로그램 추천</h1>
      </header>

      {/* 추천 프로그램 */}
      {recommendations && recommendations.success ? (
        <div style={{ marginBottom: '32px' }}>
          {/* 추천 메시지 */}
          <div style={{
            padding: '20px',
            backgroundColor: '#e8f0ff',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#5887FF'
            }}>
              🎯 {recommendations.message}
            </h2>
            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
              설문조사 결과를 바탕으로 추천드립니다.
            </p>
          </div>

          {/* 상위 역량별 추천 */}
          {recommendations.topCategories.map((item: any, index: number) => (
            <div 
              key={item.category}
              style={{
                marginBottom: '24px',
                padding: '20px',
                border: '2px solid #eee',
                borderRadius: '16px',
                backgroundColor: 'white'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </span>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold',
                    margin: 0
                  }}>
                    {item.category}
                  </h3>
                </div>
                <span style={{
                  padding: '6px 12px',
                  backgroundColor: '#5887FF',
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {item.score.toFixed(1)}점
                </span>
              </div>

              {/* 프로그램 목록 */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '8px'
              }}>
                {item.programs.map((program: string) => (
                  <div
                    key={program}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>📚</span>
                    <span style={{ fontSize: '15px' }}>{program}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          padding: '32px',
          textAlign: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: '12px',
          marginBottom: '32px'
        }}>
          <p style={{ fontSize: '16px', marginBottom: '16px' }}>
            아직 설문조사를 진행하지 않으셨네요.
          </p>
          <button
            onClick={() => router.push('/survey')}
            className="btn btn-primary"
          >
            설문조사 하러 가기
          </button>
        </div>
      )}

      {/* 전체 프로그램 보기 */}
      <div style={{ 
        padding: '24px 0',
        borderTop: '2px solid #eee'
      }}>
        <button
          onClick={() => setShowAll(!showAll)}
          style={{
            width: '100%',
            padding: '16px',
            border: '2px solid #5887FF',
            borderRadius: '12px',
            backgroundColor: 'white',
            color: '#5887FF',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginBottom: showAll ? '24px' : '0'
          }}
        >
          {showAll ? '▲ 전체 프로그램 숨기기' : '▼ 전체 프로그램 보기'}
        </button>

        {showAll && (
          <div>
            {allPrograms.length > 0 ? (
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {allPrograms.map((program) => (
                  <div
                    key={program.id}
                    style={{
                      padding: '20px',
                      border: '1px solid #eee',
                      borderRadius: '12px',
                      backgroundColor: 'white'
                    }}
                  >
                    <h4 style={{ 
                      fontSize: '18px',
                      fontWeight: 'bold',
                      marginBottom: '8px'
                    }}>
                      {program.title}
                    </h4>
                    {program.description && (
                      <p style={{ 
                        fontSize: '14px',
                        color: '#666',
                        marginBottom: '12px',
                        lineHeight: '1.5'
                      }}>
                        {program.description}
                      </p>
                    )}
                    {program.tags && program.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {program.tags.map((tag: string) => (
                          <span
                            key={tag}
                            style={{
                              padding: '4px 12px',
                              backgroundColor: '#e8f0ff',
                              color: '#5887FF',
                              borderRadius: '12px',
                              fontSize: '12px'
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ 
                textAlign: 'center',
                color: '#999',
                padding: '32px'
              }}>
                등록된 프로그램이 없습니다.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}