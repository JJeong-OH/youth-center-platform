'use client';

import { useRouter } from 'next/navigation';

export default function AboutPage() {
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
          센터소개
        </h1>
      </div>

      {/* 컨텐츠 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '20px'
      }}>
        {/* 센터 소개 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '16px'
        }}>
          <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '12px', color: '#667eea' }}>
            미추홀구청소년센터
          </h2>
          <p style={{ 
            fontSize: '14px', 
            lineHeight: '1.7', 
            color: '#555',
            margin: 0
          }}>
            미추홀구청소년센터는 청소년들의 건강한 성장과 꿈을 응원하는 공간입니다. 
            다양한 프로그램과 활동을 통해 청소년들이 자신의 잠재력을 발견하고 
            미래를 준비할 수 있도록 지원합니다.
          </p>
        </div>

        {/* 운영 정보 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '16px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#333' }}>
            📅 운영 정보
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <InfoRow label="운영시간" value="평일 09:00 - 18:00" />
            <InfoRow label="휴관일" value="주말 및 공휴일" />
            <InfoRow label="대상" value="청소년 (만 9세 ~ 24세)" />
            <InfoRow label="이용료" value="무료" />
          </div>
        </div>

        {/* 연락처 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '16px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#333' }}>
            연락처
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <InfoRow label="주소" value="인천광역시 미추홀구 경인로 00" />
            <InfoRow label="전화" value="032-123-4567" />
            <InfoRow label="팩스" value="032-123-4568" />
            <InfoRow label="이메일" value="info@youth-center.or.kr" />
          </div>
        </div>

        {/* 주요 시설 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '16px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#333' }}>
            주요 시설
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <FacilityCard icon="💻" name="멀티미디어실" desc="영상편집, 음악제작 등" />
            <FacilityCard icon="🎨" name="창작공방" desc="미술, 공예 활동" />
            <FacilityCard icon="⚽" name="체육관" desc="농구, 배드민턴 등" />
            <FacilityCard icon="📚" name="학습실" desc="자기주도학습 공간" />
            <FacilityCard icon="🎭" name="다목적홀" desc="공연, 발표회" />
            <FacilityCard icon="💬" name="상담실" desc="진로·심리 상담" />
          </div>
        </div>

        {/* 주요 프로그램 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '16px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#333' }}>
            주요 프로그램
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <ProgramCard 
              title="자기개발 프로그램" 
              desc="리더십, 자기계발, 시간관리 등"
              color="#667eea"
            />
            <ProgramCard 
              title="문화예술 프로그램" 
              desc="음악, 미술, 연극, 영화제작 등"
              color="#ec4899"
            />
            <ProgramCard 
              title="진로탐색 프로그램" 
              desc="직업체험, 진로상담, 멘토링 등"
              color="#f59e0b"
            />
            <ProgramCard 
              title="봉사활동 프로그램" 
              desc="지역사회 참여, 환경보호 등"
              color="#10b981"
            />
          </div>
        </div>

        {/* 찾아오시는 길 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '16px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#333' }}>
            찾아오시는 길
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#667eea', marginBottom: '4px' }}>
                지하철
              </div>
              <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                1호선 주안역 3번 출구 도보 10분
              </div>
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#667eea', marginBottom: '4px' }}>
                버스
              </div>
              <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                간선: 15, 24, 45번<br />
                지선: 103, 205번
              </div>
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#667eea', marginBottom: '4px' }}>
                🚗 주차
              </div>
              <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                지하 주차장 이용 가능 (2시간 무료)
              </div>
            </div>
          </div>
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <span style={{ 
        fontSize: '13px', 
        fontWeight: '600', 
        color: '#667eea',
        minWidth: '70px'
      }}>
        {label}
      </span>
      <span style={{ 
        fontSize: '13px', 
        color: '#666',
        lineHeight: '1.5'
      }}>
        {value}
      </span>
    </div>
  );
}

function FacilityCard({ icon, name, desc }: { icon: string; name: string; desc: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      backgroundColor: '#f9f9f9',
      borderRadius: '10px'
    }}>
      <div style={{ fontSize: '28px' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '2px' }}>
          {name}
        </div>
        <div style={{ fontSize: '12px', color: '#999' }}>
          {desc}
        </div>
      </div>
    </div>
  );
}

function ProgramCard({ title, desc, color }: { title: string; desc: string; color: string }) {
  return (
    <div style={{
      padding: '14px',
      backgroundColor: '#f9f9f9',
      borderRadius: '10px',
      borderLeft: `4px solid ${color}`
    }}>
      <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '4px' }}>
        {title}
      </div>
      <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.5' }}>
        {desc}
      </div>
    </div>
  );
}