'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SurveyPage() {
  const router = useRouter();

  return (
    <div className="container">
      {/* 헤더 */}
      <header className="header" style={{ marginBottom: '32px' }}>
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
        <h1 className="title">역량 검사</h1>
      </header>

      {/* 설문 선택 */}
      <main>
        <p style={{ 
          marginBottom: '32px', 
          color: '#666',
          fontSize: '16px',
          lineHeight: '1.6'
        }}>
          자신의 강점과 관심사를 발견하고 성장할 수 있는 설문조사입니다.
          <br />원하는 설문을 선택해주세요.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 청소년활동 분야 설문 */}
          <SurveyCard
            title="청소년활동 분야"
            description="자기개발, 사회참여, 문화예술 등 7개 분야의 관심도를 측정합니다."
            questions="35문항 (약 5분 소요)"
            icon="📊"
            color="#5887FF"
            onClick={() => router.push('/survey/test?type=청소년활동분야')}
          />

          {/* 핵심역량 진단 설문 */}
          <SurveyCard
            title="핵심역량 진단"
            description="비판적사고, 창의력, 협업 등 7가지 핵심역량을 진단합니다."
            questions="35문항 (약 5분 소요)"
            icon="🎯"
            color="#E89248"
            onClick={() => router.push('/survey/test?type=핵심역량진단')}
          />
        </div>

        {/* 내 결과 보기 */}
        <div style={{ marginTop: '40px' }}>
          <Link 
            href="/survey/my-results"
            style={{
              display: 'block',
              padding: '16px',
              textAlign: 'center',
              backgroundColor: '#f5f5f5',
              borderRadius: '12px',
              textDecoration: 'none',
              color: '#333',
              fontWeight: '600'
            }}
          >
            📋 내 설문 결과 보기
          </Link>
        </div>
      </main>
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
        padding: '24px',
        border: `2px solid ${color}`,
        borderRadius: '16px',
        backgroundColor: 'white',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s',
        width: '100%'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 8px 20px ${color}30`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ fontSize: '48px', marginBottom: '12px' }}>
        {icon}
      </div>
      <h2 style={{ 
        fontSize: '22px', 
        fontWeight: 'bold', 
        marginBottom: '8px',
        color: color
      }}>
        {title}
      </h2>
      <p style={{ 
        fontSize: '15px', 
        color: '#666', 
        marginBottom: '12px',
        lineHeight: '1.5'
      }}>
        {description}
      </p>
      <div style={{ 
        fontSize: '13px', 
        color: '#999',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        ⏱️ {questions}
      </div>
    </button>
  );
}