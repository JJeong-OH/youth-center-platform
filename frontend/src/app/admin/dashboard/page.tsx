'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchDashboard();
  }, []);

  const checkAuth = () => {
    const adminInfo = localStorage.getItem('adminInfo');
    if (!adminInfo) {
      router.push('/admin/login');
      return;
    }
    setAdmin(JSON.parse(adminInfo));
  };

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:3000/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setStats(data);
      } else {
        throw new Error('인증 실패');
      }
    } catch (error) {
      console.error('대시보드 조회 에러:', error);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminInfo');
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div style={{ 
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* 헤더 */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>
              관리자 대시보드
            </h1>
            <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
              안녕하세요, {admin?.name} 관리자님
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
          >
            로그아웃
          </button>
        </div>

        {/* 통계 카드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <StatCard
            title="전체 회원"
            value={stats?.stats.totalUsers || 0}
            icon="👥"
            color="#5887FF"
          />
          <StatCard
            title="이번 달 신규"
            value={stats?.stats.newUsersThisMonth || 0}
            icon="✨"
            color="#E89248"
          />
          <StatCard
            title="설문 참여"
            value={stats?.stats.totalSurveys || 0}
            icon="📋"
            color="#4caf50"
          />
          <StatCard
            title="활성 프로그램"
            value={stats?.stats.totalPrograms || 0}
            icon="📚"
            color="#9c27b0"
          />
          <StatCard
            title="오늘 키오스크"
            value={stats?.stats.kioskLogsToday || 0}
            icon="🏢"
            color="#ff9800"
          />
        </div>

        {/* 빠른 메뉴 */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
            빠른 메뉴
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px'
          }}>
            <MenuButton href="/admin/users" icon="👥" label="회원 관리" />
            <MenuButton href="/admin/programs" icon="📚" label="프로그램 관리" />
            <MenuButton href="/admin/surveys" icon="📊" label="설문 통계" />
            <MenuButton href="/" icon="🏠" label="메인으로" />
          </div>
        </div>

        {/* 최근 설문 결과 */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
            최근 설문 결과
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stats?.recentSurveys?.map((survey: any) => (
              <div
                key={survey.id}
                style={{
                  padding: '12px',
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <span style={{ fontWeight: '600', marginRight: '8px' }}>
                    {survey.userName}
                  </span>
                  <span style={{ color: '#666', fontSize: '14px' }}>
                    {survey.testType}
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: '#999' }}>
                  {new Date(survey.createdAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '12px',
      borderLeft: `4px solid ${color}`
    }}>
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
        {title}
      </div>
      <div style={{ fontSize: '28px', fontWeight: 'bold', color: color }}>
        {value}
      </div>
    </div>
  );
}

function MenuButton({ href, icon, label }: any) {
  return (
    <Link
      href={href}
      style={{
        padding: '16px',
        border: '2px solid #eee',
        borderRadius: '12px',
        textAlign: 'center',
        textDecoration: 'none',
        transition: 'all 0.2s',
        display: 'block'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#5887FF';
        e.currentTarget.style.backgroundColor = '#f8f9ff';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#eee';
        e.currentTarget.style.backgroundColor = 'white';
      }}
    >
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
        {label}
      </div>
    </Link>
  );
}