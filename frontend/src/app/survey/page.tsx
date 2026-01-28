'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SurveyPage() {
  const router = useRouter();

  return (
    <div style={{
      height: '100vh',
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
        <h1 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
          📊 역량 검사
        </h1>
      </div>

      {/* 컨텐츠 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '16px'
        }}>
          <p style={{ 
            marginBottom: '0',
            color: '#666',
            fontSize: '15px',
            lineHeight: '1.6'
          }}>
            자신의 강점과 관심사를 발견하고 성장할 수 있는 설문조사입니다.
            <br />원하는 설문을 선택해주세요.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
          <SurveyCard
            title="청소년활동 분야"
            description="자기개발, 사회참여, 문화예술 등 7개 분야의 관심도를 측정합니다."
            questions="35문항 (약 5분 소요)"
            icon=""
            color="#5887FF"
            onClick={() => router.push('/survey/test?type=청소년활동분야')}
          />

          <SurveyCard
            title="핵심역량 진단"
            description="비판적사고, 창의력, 협업 등 7가지 핵심역량을 진단합니다."
            questions="35문항 (약 5분 소요)"
            icon=""
            color="#E89248"
            onClick={() => router.push('/survey/test?type=핵심역량진단')}
          />
        </div>

        <div style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <Link 
            href="/survey/my-results"
            style={{
              display: 'block',
              textAlign: 'center',
              textDecoration: 'none',
              color: '#667eea',
              fontWeight: '600',
              fontSize: '15px'
            }}
          >
            📋 내 설문 결과 보기
          </Link>
        </div>
      </div>

      {/* 홈 버튼 */}
      <div style={{
        backgroundColor: 'white',
        padding: '12px 16px',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        flexShrink: 0
      }}>
        <button
          onClick={() => router.push('/')}
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'center',
            padding: '12px',
            color: '#667eea',
            textDecoration: 'none',
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

function SurveyCard({ 
  title, 
  description, 
  questions, 
  icon, 
  color, 
  onClick 
}: {
  title: string;
  description: string;
  questions: string;
  icon: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '20px',
        border: 'none',
        borderRadius: '16px',
        backgroundColor: 'rgba(255,255,255,0.95)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s',
        width: '100%',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 8px 20px ${color}30`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      }}
    >
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>
        {icon}
      </div>
      <h2 style={{ 
        fontSize: '18px', 
        fontWeight: '700', 
        marginBottom: '8px',
        color: color,
        margin: 0
      }}>
        {title}
      </h2>
      <p style={{ 
        fontSize: '13px', 
        color: '#666', 
        marginBottom: '12px',
        lineHeight: '1.5',
        margin: '8px 0'
      }}>
        {description}
      </p>
      <div style={{ 
        fontSize: '12px', 
        color: '#999',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        margin: 0
      }}>
        ⏱️ {questions}
      </div>
    </button>
  );
}