'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function SurveyResultPage() {
  const router = useRouter();
  const params = useParams();
  const resultId = params.id;

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [resultId]);

  const fetchResult = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/survey/result/${resultId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.result);
      } else {
        alert('결과를 불러올 수 없습니다.');
        router.push('/survey');
      }
    } catch (error) {
      console.error('결과 조회 에러:', error);
      alert('결과를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        결과를 불러오는 중...
      </div>
    );
  }

  if (!result) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        결과를 찾을 수 없습니다.
      </div>
    );
  }

  const chartData = Object.entries(result.scores).map(([category, score]) => ({
    category: category,
    score: Number(score),
    fullMark: 5
  }));

  const topScores = Object.entries(result.scores)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 3);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* 헤더 */}
      <div style={{
        backgroundColor: '#667eea',
        color: 'white',
        padding: '16px 20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        flexShrink: 0
      }}>
        <h1 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0' }}>
          {result.testType} 결과
        </h1>
        <p style={{ fontSize: '12px', opacity: 0.8, margin: 0 }}>
          {new Date(result.createdAt).toLocaleDateString('ko-KR')}
        </p>
      </div>

      {/* 컨텐츠 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px'
      }}>
        {/* 육각형 그래프 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '16px'
        }}>
          <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '16px', textAlign: 'center', color: '#333' }}>
            역량 분석
          </h2>
          
          <div style={{ width: '100%', height: '350px' }}>
            <ResponsiveContainer>
              <RadarChart 
                data={chartData}
                margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
              >
                <PolarGrid stroke="#ddd" />
                <PolarAngleAxis 
                  dataKey="category" 
                  tick={{ 
                    fontSize: 11, 
                    fill: '#333',
                    fontWeight: '600'
                  }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 5]} 
                  tick={{ fontSize: 10 }} 
                />
                <Radar 
                  name="점수" 
                  dataKey="score" 
                  stroke="#5887FF" 
                  fill="#5887FF" 
                  fillOpacity={0.6}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 상위 역량 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '16px'
        }}>
          <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '12px', color: '#333' }}>
            🏆 당신의 강점 역량
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topScores.map(([category, score], index) => (
              <div 
                key={category}
                style={{
                  padding: '14px',
                  backgroundColor: index === 0 ? '#fff9e6' : '#f9f9f9',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <span style={{ 
                    fontSize: '18px', 
                    marginRight: '8px' 
                  }}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </span>
                  <span style={{ fontWeight: '600', fontSize: '15px', color: '#333' }}>
                    {category}
                  </span>
                </div>
                <span style={{ 
                  fontSize: '20px', 
                  fontWeight: '700',
                  color: '#5887FF'
                }}>
                  {Number(score).toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI 분석 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '16px'
        }}>
          <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '12px', color: '#333' }}>
            💬 분석 결과
          </h2>
          <div style={{
            padding: '16px',
            backgroundColor: '#f0f7ff',
            borderRadius: '12px',
            lineHeight: '1.7',
            color: '#333',
            fontSize: '14px'
          }}>
            {result.analysis}
          </div>
        </div>

        {/* 전체 점수 상세 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '16px'
        }}>
          <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '12px', color: '#333' }}>
            📊 전체 점수
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(result.scores)
              .sort(([, a], [, b]) => (Number(b) - Number(a)))
              .map(([category, score]) => {
                const scoreValue = Number(score);
                return (
                  <div 
                    key={category}
                    style={{
                      padding: '12px',
                      backgroundColor: '#f9f9f9',
                      borderRadius: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>{category}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '80px',
                        height: '6px',
                        backgroundColor: '#e5e5e5',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${(scoreValue / 5) * 100}%`,
                          height: '100%',
                          backgroundColor: '#5887FF'
                        }} />
                      </div>
                      <span style={{ 
                        fontSize: '15px', 
                        fontWeight: '700',
                        minWidth: '35px',
                        textAlign: 'right',
                        color: '#5887FF'
                      }}>
                        {scoreValue.toFixed(1)}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div style={{
        backgroundColor: 'white',
        padding: '12px 16px',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <button
          onClick={() => router.push('/survey')}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          다른 설문 진행하기
        </button>
        <button
          onClick={() => router.push('/')}
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'center',
            padding: '8px',
            color: '#667eea',
            fontSize: '14px',
            fontWeight: '600',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          ← 홈으로
        </button>
      </div>
    </div>
  );
}