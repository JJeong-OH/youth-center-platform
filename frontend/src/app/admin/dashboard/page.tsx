'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  newUsersThisMonth: number;
  totalSurveys: number;
  totalPrograms: number;
  totalBookings: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState<any>(null);

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

    fetchDashboard();
  }, [router]);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:3001/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('대시보드 조회 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    router.push('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: '대시보드', icon: '■' },
    { path: '/admin/users', label: '회원 관리', icon: '■' },
    { path: '/admin/integrated-users', label: '통합 회원 관리', icon: '■' }, // ✅ 추가
    { path: '/admin/programs', label: '프로그램 관리', icon: '■' },
    { path: '/admin/facilities', label: '시설 관리', icon: '■' },
    { path: '/admin/bookings', label: '예약 관리', icon: '■' },
    { path: '/admin/surveys', label: '설문 통계', icon: '■' },
  ];

  const StatCard = ({ title, value, subtitle }: any) => (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '28px',
      flex: 1,
      minWidth: '220px'
    }}>
      <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>
        {title}
      </div>
      <div style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
        {value?.toLocaleString() || 0}
      </div>
      {subtitle && (
        <div style={{ fontSize: '13px', color: '#94a3b8' }}>
          {subtitle}
        </div>
      )}
    </div>
  );

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
        {/* 로고 */}
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

        {/* 메뉴 */}
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

        {/* 관리자 정보 & 로그아웃 */}
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
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
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
        padding: '32px 40px'
      }}>
        {/* 페이지 헤더 */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#0f172a',
            marginBottom: '4px'
          }}>
            대시보드
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#64748b',
            margin: 0
          }}>
            시스템 전체 현황을 확인하세요
          </p>
        </div>

        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '80px',
            color: '#94a3b8',
            fontSize: '15px'
          }}>
            데이터 로딩 중...
          </div>
        ) : (
          <>
            {/* 통계 카드 */}
            <div style={{
              display: 'flex',
              gap: '20px',
              marginBottom: '32px',
              flexWrap: 'wrap'
            }}>
              <StatCard
                title="전체 회원"
                value={stats?.totalUsers}
                subtitle="명"
              />
              <StatCard
                title="신규 회원"
                value={stats?.newUsersThisMonth}
                subtitle="이번 달"
              />
              <StatCard
                title="설문 참여"
                value={stats?.totalSurveys}
                subtitle="건"
              />
              <StatCard
                title="활성 프로그램"
                value={stats?.totalPrograms}
                subtitle="개"
              />
              <StatCard
                title="시설 예약"
                value={stats?.totalBookings}
                subtitle="건"
              />
            </div>

            {/* 빠른 접근 */}
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '16px'
              }}>
                빠른 접근
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '20px'
              }}>
                {[
                  { href: '/admin/users', title: '회원 관리', desc: '회원 정보 조회 및 관리' },
                  { href: '/admin/integrated-users', title: '통합 회원 관리', desc: '회원/비회원 활동 통합' }, // ✅ 추가
                  { href: '/admin/programs', title: '프로그램 관리', desc: '프로그램 등록 및 수정' },
                  { href: '/admin/facilities', title: '시설 관리', desc: '시설 정보 및 예약' },
                  { href: '/admin/bookings', title: '예약 관리', desc: '시설 예약 현황' },
                  { href: '/admin/surveys', title: '설문 통계', desc: '설문 결과 분석' }
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      textDecoration: 'none',
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '24px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#0f172a',
                      marginBottom: '8px'
                    }}>
                      {item.title}
                    </h4>
                    <p style={{
                      fontSize: '14px',
                      color: '#64748b',
                      margin: 0,
                      lineHeight: '1.5'
                    }}>
                      {item.desc}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}