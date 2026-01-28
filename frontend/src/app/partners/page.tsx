'use client';

import { useRouter } from 'next/navigation';

export default function PartnersPage() {
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
          기관연계
        </h1>
      </div>

      {/* 컨텐츠 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '20px'
      }}>
        {/* 소개 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '16px'
        }}>
          <p style={{ 
            fontSize: '14px', 
            lineHeight: '1.7', 
            color: '#555',
            margin: 0
          }}>
            미추홀구청소년센터는 다양한 기관과의 협력을 통해 
            청소년들에게 더 폭넓은 경험과 기회를 제공합니다.
          </p>
        </div>

        {/* 교육 기관 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '16px'
        }}>
          <h2 style={{ 
            fontSize: '16px', 
            fontWeight: '700', 
            marginBottom: '16px', 
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '20px' }}></span>
            교육 기관
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <PartnerCard
              name="인천교육청"
              desc="진로교육 프로그램 운영, 교육자료 제공"
              tags={['진로교육', '학습지원']}
              color="#667eea"
            />
            <PartnerCard
              name="인천대학교"
              desc="대학생 멘토링, 진로탐색 프로그램"
              tags={['멘토링', '진로체험']}
              color="#667eea"
            />
            <PartnerCard
              name="평생학습관"
              desc="특강 및 워크샵, 자격증 교육"
              tags={['특강', '자격증']}
              color="#667eea"
            />
          </div>
        </div>

        {/* 상담·복지 기관 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '16px'
        }}>
          <h2 style={{ 
            fontSize: '16px', 
            fontWeight: '700', 
            marginBottom: '16px', 
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '20px' }}></span>
            상담·복지 기관
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <PartnerCard
              name="청소년상담복지센터"
              desc="심리상담, 위기청소년 지원"
              tags={['심리상담', '위기지원']}
              color="#10b981"
            />
            <PartnerCard
              name="학교밖청소년지원센터"
              desc="학업 복귀 지원, 자립 프로그램"
              tags={['학업지원', '자립']}
              color="#10b981"
            />
            <PartnerCard
              name="청소년회복지원시설"
              desc="보호 및 치료, 사회복귀 지원"
              tags={['보호', '치료']}
              color="#10b981"
            />
          </div>
        </div>

        {/* 문화·예술 기관 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '16px'
        }}>
          <h2 style={{ 
            fontSize: '16px', 
            fontWeight: '700', 
            marginBottom: '16px', 
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '20px' }}></span>
            문화·예술 기관
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <PartnerCard
              name="인천문화재단"
              desc="문화예술교육, 공연 관람 지원"
              tags={['예술교육', '공연']}
              color="#ec4899"
            />
            <PartnerCard
              name="시립박물관"
              desc="역사·문화 체험학습"
              tags={['체험학습', '전시']}
              color="#ec4899"
            />
            <PartnerCard
              name="청소년미디어센터"
              desc="영상제작, 미디어교육"
              tags={['영상', '미디어']}
              color="#ec4899"
            />
          </div>
        </div>

        {/* 기업·직업체험 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '16px'
        }}>
          <h2 style={{ 
            fontSize: '16px', 
            fontWeight: '700', 
            marginBottom: '16px', 
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '20px' }}></span>
            기업·직업체험
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <PartnerCard
              name="인천경제자유구역청"
              desc="기업탐방, 직업체험 프로그램"
              tags={['기업탐방', '직업체험']}
              color="#f59e0b"
            />
            <PartnerCard
              name="중소벤처기업진흥공단"
              desc="창업교육, 창업멘토링"
              tags={['창업', '멘토링']}
              color="#f59e0b"
            />
            <PartnerCard
              name="청년일자리센터"
              desc="취업상담, 직업훈련 연계"
              tags={['취업', '직업훈련']}
              color="#f59e0b"
            />
          </div>
        </div>

        {/* 국제교류 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '16px'
        }}>
          <h2 style={{ 
            fontSize: '16px', 
            fontWeight: '700', 
            marginBottom: '16px', 
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '20px' }}></span>
            국제교류
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <PartnerCard
              name="한국국제교류재단"
              desc="해외교류 프로그램, 문화체험"
              tags={['해외교류', '문화체험']}
              color="#8b5cf6"
            />
            <PartnerCard
              name="아시아청소년네트워크"
              desc="국제 청소년 교류"
              tags={['국제교류', '네트워킹']}
              color="#8b5cf6"
            />
          </div>
        </div>

        {/* 협력 문의 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}></div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: '#333' }}>
            협력 기관을 모집합니다
          </h3>
          <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', marginBottom: '16px' }}>
            청소년들에게 더 나은 기회를 제공하기 위해<br />
            함께할 기관을 찾고 있습니다.
          </p>
          <div style={{
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#667eea',
            color: 'white',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600'
          }}>
            admin@youth.com
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

function PartnerCard({ 
  name, 
  desc, 
  tags, 
  color 
}: { 
  name: string; 
  desc: string; 
  tags: string[];
  color: string;
}) {
  return (
    <div style={{
      padding: '16px',
      backgroundColor: '#f9f9f9',
      borderRadius: '12px',
      borderLeft: `4px solid ${color}`
    }}>
      <div style={{ 
        fontSize: '15px', 
        fontWeight: '700', 
        color: '#333', 
        marginBottom: '6px' 
      }}>
        {name}
      </div>
      <div style={{ 
        fontSize: '13px', 
        color: '#666', 
        lineHeight: '1.5',
        marginBottom: '10px'
      }}>
        {desc}
      </div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {tags.map((tag, index) => (
          <span
            key={index}
            style={{
              padding: '4px 10px',
              backgroundColor: 'white',
              color: color,
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '600',
              border: `1px solid ${color}`
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}