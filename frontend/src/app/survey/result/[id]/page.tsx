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
      <div className="container" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <p>결과를 불러오는 중...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container">
        <p>결과를 찾을 수 없습니다.</p>
      </div>
    );
  }

  // 육각형 그래프 데이터 변환
  const chartData = Object.entries(result.scores).map(([category, score]) => ({
    category: category,
    score: Number(score),
    fullMark: 5
  }));

  // 상위 3개 역량
  const topScores = Object.entries(result.scores)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 3);

  return (
    <div className="container">
      {/* 헤더 */}
      <header style={{ padding: '24px 0', borderBottom: '2px solid #eee' }}>
        <button
          onClick={() => router.push('/survey')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            marginBottom: '12px'
          }}
        >
          ← 뒤로가기
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '8px 0' }}>
          {result.testType} 결과
        </h1>
        <p style={{ fontSize: '14px', color: '#999', margin: 0 }}>
          {new Date(result.createdAt).toLocaleDateString('ko-KR')}
        </p>
      </header>

      {/* 육각형 그래프 */}
      <div style={{ padding: '32px 0' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>
          역량 분석
        </h2>
        
        <div style={{ width: '100%', height: '500px' }}>
          <ResponsiveContainer>
            <RadarChart 
              data={chartData}
              margin={{ top: 40, right: 60, bottom: 40, left: 60 }}
            >
              <PolarGrid stroke="#ddd" />
              <PolarAngleAxis 
                dataKey="category" 
                tick={{ 
                  fontSize: 13, 
                  fill: '#333',
                  fontWeight: '600'
                }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 5]} 
                tick={{ fontSize: 12 }} 
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
      <div style={{ padding: '24px 0', borderTop: '1px solid #eee' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
          🏆 당신의 강점 역량
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {topScores.map(([category, score], index) => (
            <div 
              key={category}
              style={{
                padding: '16px',
                backgroundColor: index === 0 ? '#fff9e6' : '#f5f5f5',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <span style={{ 
                  fontSize: '20px', 
                  marginRight: '8px' 
                }}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </span>
                <span style={{ fontWeight: '600', fontSize: '16px' }}>
                  {category}
                </span>
              </div>
              <span style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: '#5887FF'
              }}>
                {score}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI 분석 */}
      <div style={{ padding: '24px 0', borderTop: '1px solid #eee' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
          💬 분석 결과
        </h2>
        <div style={{
          padding: '20px',
          backgroundColor: '#f0f7ff',
          borderRadius: '12px',
          lineHeight: '1.8',
          color: '#333'
        }}>
          {result.analysis}
        </div>
      </div>

      {/* 전체 점수 상세 */}
      <div style={{ padding: '24px 0', borderTop: '1px solid #eee' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
          📊 전체 점수
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.entries(result.scores)
            .sort(([, a], [, b]) => (Number(b) - Number(a)))
            .map(([category, score]) => {
              const scoreValue = Number(score);
              return (
                <div 
                  key={category}
                  style={{
                    padding: '12px 16px',
                    border: '1px solid #eee',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ fontSize: '15px' }}>{category}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '100px',
                      height: '8px',
                      backgroundColor: '#eee',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${(scoreValue / 5) * 100}%`,
                        height: '100%',
                        backgroundColor: '#5887FF'
                      }} />
                    </div>
                    <span style={{ 
                      fontSize: '16px', 
                      fontWeight: 'bold',
                      minWidth: '40px',
                      textAlign: 'right'
                    }}>
                      {scoreValue.toFixed(1)}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div style={{ padding: '24px 0' }}>
        <button
          onClick={() => router.push('/survey')}
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: '12px' }}
        >
          다른 설문 진행하기
        </button>
        <button
          onClick={() => router.push('/')}
          className="btn btn-secondary"
          style={{ width: '100%' }}
        >
          메인으로 돌아가기
        </button>
      </div>
    </div>
  );
}