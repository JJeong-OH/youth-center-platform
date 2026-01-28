'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminUserDetailPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const userId = params.id;

  const [user, setUser] = useState<any>(null);
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

    fetchUserDetail();
  }, [userId, router]);

  const fetchUserDetail = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('회원 상세 조회 에러:', error);
    } finally {
      setLoading(false);
    }
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
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
            로딩중...
          </div>
        ) : !user ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
            회원을 찾을 수 없습니다.
          </div>
        ) : (
          <>
            {/* 헤더 */}
            <div style={{ marginBottom: '24px' }}>
              <button
                onClick={() => router.push('/admin/users')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginBottom: '12px',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                ← 회원 목록으로
              </button>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '4px'
              }}>
                {user.name} 님의 정보
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                margin: 0
              }}>
                ID: {user.userId}
              </p>
            </div>

            {/* 기본 정보 */}
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                marginBottom: '20px',
                color: '#1e293b',
                borderBottom: '2px solid #e2e8f0',
                paddingBottom: '12px'
              }}>
                기본 정보
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <InfoItem label="이메일" value={user.email} />
                <InfoItem label="역할" value={user.role} />
                <InfoItem label="가입일" value={new Date(user.createdAt).toLocaleDateString('ko-KR')} />
                <InfoItem label="전화번호" value={user.profile?.phoneNumber || '-'} />
                <InfoItem label="생년월일" value={user.profile?.dob ? new Date(user.profile.dob).toLocaleDateString('ko-KR') : '-'} />
                <InfoItem label="성별" value={user.profile?.gender === 'male' ? '남성' : user.profile?.gender === 'female' ? '여성' : '-'} />
              </div>
            </div>

            {/* 설문 결과 */}
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                marginBottom: '20px',
                color: '#1e293b',
                borderBottom: '2px solid #e2e8f0',
                paddingBottom: '12px'
              }}>
                설문 결과 ({user.testResults?.length || 0}개)
              </h3>
              {user.testResults && user.testResults.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {user.testResults.map((result: any) => (
                    <div
                      key={result.id}
                      style={{
                        padding: '16px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#f8fafc'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px', color: '#1e293b' }}>
                          {result.test_type}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {new Date(result.created_at).toLocaleString('ko-KR')}
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/survey/result/${result.id}`)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#475569',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}
                      >
                        결과 보기
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>
                  설문 결과가 없습니다.
                </p>
              )}
            </div>

            {/* 포트폴리오 */}
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                marginBottom: '20px',
                color: '#1e293b',
                borderBottom: '2px solid #e2e8f0',
                paddingBottom: '12px'
              }}>
                포트폴리오 ({user.portfolioItems?.length || 0}개)
              </h3>
              {user.portfolioItems && user.portfolioItems.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {user.portfolioItems.map((item: any) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '16px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        backgroundColor: '#f8fafc'
                      }}
                    >
                      <div style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        backgroundColor: '#dbeafe',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#1e40af',
                        marginBottom: '8px'
                      }}>
                        {item.category}
                      </div>
                      <div style={{ fontSize: '14px', color: '#1e293b', marginBottom: '8px' }}>
                        {item.content}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {new Date(item.created_at).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>
                  포트폴리오 항목이 없습니다.
                </p>
              )}
            </div>

            {/* 최근 AI 상담 */}
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                marginBottom: '20px',
                color: '#1e293b',
                borderBottom: '2px solid #e2e8f0',
                paddingBottom: '12px'
              }}>
                최근 AI 상담 내역
              </h3>
              {user.recentChats && user.recentChats.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {user.recentChats.map((chat: any) => (
                    <div
                      key={chat.id}
                      style={{
                        padding: '16px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        backgroundColor: '#f8fafc'
                      }}
                    >
                      <div style={{ fontWeight: '600', marginBottom: '4px', color: '#1e293b' }}>
                        주제: {chat.topic}
                      </div>
                      {chat.summary && (
                        <div style={{ fontSize: '14px', color: '#475569', marginBottom: '8px' }}>
                          {chat.summary}
                        </div>
                      )}
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {new Date(chat.started_at).toLocaleString('ko-KR')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>
                  상담 내역이 없습니다.
                </p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px', fontWeight: '600' }}>
        {label}
      </div>
      <div style={{ fontSize: '15px', fontWeight: '500', color: '#1e293b' }}>
        {value}
      </div>
    </div>
  );
}