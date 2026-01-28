'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface Facility {
  id: string;
  name: string;
  icon: string;
  capacity?: number;
  isActive: boolean;
}

interface Booking {
  id: number;
  facility_id: string;
  user_name: string;
  date: string;
  time_slot: string;
  phone: string | null;
  status: string;
  source: string;
  created_at: string;
  facility: {  // ✅ 여기!
    name: string;
  } | null;  // ✅ null 추가!
}

export default function BookingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState<any>(null);
  
  const [selectedFacility, setSelectedFacility] = useState<string>('all');
  const [filters, setFilters] = useState({
    status: 'all',
    source: 'all',
    search: '',
    dateFrom: '',
    dateTo: '',
  });

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

    fetchFacilities();
    fetchBookings();
  }, [router]);

  const fetchFacilities = async () => {
    try {
      const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:3001'
        : 'https://youth-center-platform.onrender.com';
        
      const response = await fetch(`${API_URL}/api/facilities`);
      const data = await response.json();
      
      if (data.success && Array.isArray(data.facilities)) {
        const activeFacilities = data.facilities.filter((f: Facility) => f.isActive);
        setFacilities(activeFacilities);
      }
    } catch (error) {
      console.error('실습실 목록 로드 실패:', error);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:3001'
        : 'https://youth-center-platform.onrender.com';
        
      const response = await fetch(`${API_URL}/api/kiosk/bookings`);
      const data = await response.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('예약 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...bookings];

    if (selectedFacility !== 'all') {
      filtered = filtered.filter(b => b.facility_id === selectedFacility);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(b => b.status === filters.status);
    }

    if (filters.source !== 'all') {
      filtered = filtered.filter(b => b.source === filters.source);
    }

    if (filters.search) {
      filtered = filtered.filter(b => 
        b.user_name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(b => 
        new Date(b.date) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(b => 
        new Date(b.date) <= new Date(filters.dateTo)
      );
    }

    setFilteredBookings(filtered);
  }, [filters, bookings, selectedFacility]);

  const getStatsForFacility = (facilityId: string) => {
    const facilityBookings = facilityId === 'all' 
      ? bookings 
      : bookings.filter(b => b.facility_id === facilityId);

    return {
      total: facilityBookings.length,
      active: facilityBookings.filter(b => b.status === 'active').length,
      completed: facilityBookings.filter(b => b.status === 'completed').length,
      cancelled: facilityBookings.filter(b => b.status === 'cancelled').length,
      kiosk: facilityBookings.filter(b => b.source === 'kiosk').length,
      mobile: facilityBookings.filter(b => b.source === 'mobile').length,
    };
  };

  const currentStats = getStatsForFacility(selectedFacility);

  const resetFilters = () => {
    setFilters({
      status: 'all',
      source: 'all',
      search: '',
      dateFrom: '',
      dateTo: '',
    });
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
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#0f172a',
            marginBottom: '4px'
          }}>
            예약 관리
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#64748b',
            margin: 0
          }}>
            시설 예약 현황 및 관리
          </p>
        </div>

        {/* 시설 탭 - DB 기반 동적 생성 */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '24px',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          flexWrap: 'wrap'
        }}>
          {/* 전체 보기 버튼 */}
          <button
            onClick={() => setSelectedFacility('all')}
            style={{
              flex: '0 0 auto',
              minWidth: '120px',
              padding: '16px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              backgroundColor: selectedFacility === 'all' ? '#3b82f6' : 'transparent',
              color: selectedFacility === 'all' ? 'white' : '#475569',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            <div>전체</div>
            <div style={{ fontSize: '20px', marginTop: '4px' }}>
              {getStatsForFacility('all').total}건
            </div>
          </button>

          {/* DB에서 가져온 실습실 동적 렌더링 */}
          {facilities.map((facility) => {
            const stats = getStatsForFacility(facility.id);
            return (
              <button
                key={facility.id}
                onClick={() => setSelectedFacility(facility.id)}
                style={{
                  flex: '0 0 auto',
                  minWidth: '120px',
                  padding: '16px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: selectedFacility === facility.id ? '#3b82f6' : 'transparent',
                  color: selectedFacility === facility.id ? 'white' : '#475569',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {/* 아이콘 (이미지 또는 이모지) */}
                {facility.icon.startsWith('/') || facility.icon.startsWith('http') ? (
                  <img 
                    src={facility.icon} 
                    alt={facility.name}
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                ) : (
                  <span style={{ fontSize: '24px' }}>{facility.icon}</span>
                )}
                
                <div>{facility.name}</div>
                <div style={{ fontSize: '20px', marginTop: '4px' }}>
                  {stats.total}건
                </div>
                
                {/* 수용 인원 */}
                {facility.capacity && (
                  <div style={{ 
                    fontSize: '11px', 
                    opacity: 0.7,
                    marginTop: '2px'
                  }}>
                    {facility.capacity}명
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 통계 카드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <StatCard title="전체 예약" value={currentStats.total} color="#3b82f6" />
          <StatCard title="키오스크" value={currentStats.kiosk} color="#8b5cf6" />
          <StatCard title="모바일" value={currentStats.mobile} color="#ec4899" />
          <StatCard title="진행 중" value={currentStats.active} color="#10b981" />
          <StatCard title="완료" value={currentStats.completed} color="#6b7280" />
          <StatCard title="취소" value={currentStats.cancelled} color="#ef4444" />
        </div>

        {/* 필터 */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#0f172a' }}>필터</h3>
            <button
              onClick={resetFilters}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                color: '#475569'
              }}
            >
              초기화
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '12px'
          }}>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              style={selectStyle}
            >
              <option value="all">전체 상태</option>
              <option value="active">진행 중</option>
              <option value="completed">완료</option>
              <option value="cancelled">취소</option>
            </select>

            <select
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              style={selectStyle}
            >
              <option value="all">전체 출처</option>
              <option value="kiosk">키오스크</option>
              <option value="mobile">모바일</option>
            </select>

            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="이름 검색"
              style={inputStyle}
            />

            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              style={inputStyle}
            />

            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ marginTop: '12px', fontSize: '13px', color: '#64748b' }}>
            검색 결과: <span style={{ fontWeight: '600', color: '#0f172a' }}>{filteredBookings.length}건</span>
          </div>
        </div>

        {/* 테이블 */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
              데이터 로딩 중...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
              예약 내역이 없습니다.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <tr>
                    <th style={tableHeaderStyle}>예약번호</th>
                    {selectedFacility === 'all' && <th style={tableHeaderStyle}>시설</th>}
                    <th style={tableHeaderStyle}>예약자</th>
                    <th style={tableHeaderStyle}>날짜</th>
                    <th style={tableHeaderStyle}>시간</th>
                    <th style={tableHeaderStyle}>연락처</th>
                    <th style={tableHeaderStyle}>출처</th>
                    <th style={tableHeaderStyle}>상태</th>
                    <th style={tableHeaderStyle}>등록일</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={tableCellStyle}>#{booking.id}</td>
                      {selectedFacility === 'all' && (
  <td style={tableCellStyle}>
    <strong style={{ color: '#0f172a' }}>
      {booking.facility?.name || '삭제된 시설'}  {/* ✅ 옵셔널 체이닝 */}
    </strong>
  </td>
)}
                      <td style={tableCellStyle}>
                        <strong style={{ color: '#0f172a' }}>{booking.user_name}</strong>
                      </td>
                      <td style={tableCellStyle}>
                        {new Date(booking.date).toLocaleDateString('ko-KR')}
                      </td>
                      <td style={tableCellStyle}>{booking.time_slot}</td>
                      <td style={tableCellStyle}>{booking.phone || '-'}</td>
                      <td style={tableCellStyle}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: booking.source === 'kiosk' ? '#ede9fe' : '#fce7f3',
                          color: booking.source === 'kiosk' ? '#7c3aed' : '#db2777'
                        }}>
                          {booking.source === 'kiosk' ? '키오스크' : '모바일'}
                        </span>
                      </td>
                      <td style={tableCellStyle}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: booking.status === 'active' ? '#d1fae5' : booking.status === 'completed' ? '#f3f4f6' : '#fee2e2',
                          color: booking.status === 'active' ? '#065f46' : booking.status === 'completed' ? '#374151' : '#991b1b'
                        }}>
                          {booking.status === 'active' ? '진행중' : booking.status === 'completed' ? '완료' : '취소'}
                        </span>
                      </td>
                      <td style={tableCellStyle}>
                        {new Date(booking.created_at).toLocaleDateString('ko-KR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      borderLeft: `4px solid ${color}`,
      border: '1px solid #e2e8f0'
    }}>
      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: '600' }}>
        {title}
      </div>
      <div style={{ fontSize: '24px', fontWeight: '700', color }}>
        {value}
      </div>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  padding: '10px 12px',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  fontSize: '14px',
  backgroundColor: '#f8fafc',
  color: '#475569'
};

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  fontSize: '14px',
  backgroundColor: '#f8fafc'
};

const tableHeaderStyle: React.CSSProperties = {
  padding: '16px',
  textAlign: 'left',
  fontSize: '13px',
  fontWeight: '600',
  color: '#64748b',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px'
};

const tableCellStyle: React.CSSProperties = {
  padding: '16px',
  fontSize: '14px',
  color: '#475569'
};