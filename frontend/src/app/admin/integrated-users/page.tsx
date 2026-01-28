'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface IntegratedUser {
  type: 'member' | 'guest';
  id: number | null;
  name: string;
  phone: string;
  email: string | null;
  joinDate: string | null;
  programCount: number;
  facilityCount: number;
  programs: Array<{
    id: number;
    title: string;
    date: string;
    status: string;
  }>;
  facilities: Array<{
    id: number;
    name: string;
    date: string;
    status: string;
  }>;
}

export default function IntegratedUsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [users, setUsers] = useState<IntegratedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<IntegratedUser | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'member' | 'guest'>('all');
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

    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:3001/api/admin/integrated-users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('사용자 조회 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.includes(searchTerm) || user.phone.includes(searchTerm);
    const matchesType = filterType === 'all' || user.type === filterType;
    return matchesSearch && matchesType;
  });

  const openDetailModal = (user: IntegratedUser) => {
    setSelectedUser(user);
    setShowDetailModal(true);
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
            통합 회원 관리
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#64748b',
            margin: 0
          }}>
            회원 및 비회원 활동 통합 현황
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>전체 사용자</p>
            <p style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: '8px 0 0 0' }}>
              {users.length}명
            </p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>회원</p>
            <p style={{ fontSize: '28px', fontWeight: '700', color: '#10b981', margin: '8px 0 0 0' }}>
              {users.filter(u => u.type === 'member').length}명
            </p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>비회원</p>
            <p style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b', margin: '8px 0 0 0' }}>
              {users.filter(u => u.type === 'guest').length}명
            </p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>총 활동 수</p>
            <p style={{ fontSize: '28px', fontWeight: '700', color: '#6366f1', margin: '8px 0 0 0' }}>
              {users.reduce((sum, u) => sum + u.programCount + u.facilityCount, 0)}건
            </p>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '16px 24px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="이름 또는 전화번호 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              style={{
                padding: '10px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="all">전체</option>
              <option value="member">회원만</option>
              <option value="guest">비회원만</option>
            </select>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              데이터 로딩 중...
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <tr>
                    <th style={tableHeaderStyle}>구분</th>
                    <th style={tableHeaderStyle}>이름</th>
                    <th style={tableHeaderStyle}>전화번호</th>
                    <th style={tableHeaderStyle}>이메일</th>
                    <th style={tableHeaderStyle}>프로그램</th>
                    <th style={tableHeaderStyle}>시설 예약</th>
                    <th style={tableHeaderStyle}>총 활동</th>
                    <th style={tableHeaderStyle}>가입일</th>
                    <th style={tableHeaderStyle}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr key={`${user.type}-${user.phone}-${index}`} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={tableCellStyle}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: user.type === 'member' ? '#d1fae5' : '#fef3c7',
                          color: user.type === 'member' ? '#065f46' : '#92400e'
                        }}>
                          {user.type === 'member' ? '회원' : '비회원'}
                        </span>
                      </td>
                      <td style={tableCellStyle}>
                        <strong style={{ color: '#1e293b' }}>{user.name}</strong>
                      </td>
                      <td style={tableCellStyle}>{user.phone}</td>
                      <td style={tableCellStyle}>{user.email || '-'}</td>
                      <td style={tableCellStyle}>
                        <span style={{ fontWeight: '600', color: '#6366f1' }}>{user.programCount}건</span>
                      </td>
                      <td style={tableCellStyle}>
                        <span style={{ fontWeight: '600', color: '#10b981' }}>{user.facilityCount}건</span>
                      </td>
                      <td style={tableCellStyle}>
                        <span style={{ fontWeight: '700', color: '#1e293b' }}>
                          {user.programCount + user.facilityCount}건
                        </span>
                      </td>
                      <td style={tableCellStyle}>
                        {user.joinDate ? new Date(user.joinDate).toLocaleDateString('ko-KR') : '-'}
                      </td>
                      <td style={tableCellStyle}>
                        <button
                          onClick={() => openDetailModal(user)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#475569',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          상세보기
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {showDetailModal && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '32px',
            width: '900px',
            maxWidth: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '24px',
              borderBottom: '2px solid #1e3a8a',
              paddingBottom: '12px'
            }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#1e293b' }}>
                  사용자 상세 정보
                </h2>
                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                  {selectedUser.name} ({selectedUser.phone})
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                닫기
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: '#1e293b' }}>
                프로그램 신청 내역 ({selectedUser.programCount}건)
              </h3>
              {selectedUser.programs.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '14px' }}>신청 내역이 없습니다.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead style={{ backgroundColor: '#f8fafc' }}>
                      <tr>
                        <th style={{ ...tableHeaderStyle, fontSize: '12px' }}>프로그램명</th>
                        <th style={{ ...tableHeaderStyle, fontSize: '12px' }}>신청일</th>
                        <th style={{ ...tableHeaderStyle, fontSize: '12px' }}>상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUser.programs.map((program) => (
                        <tr key={program.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ ...tableCellStyle, padding: '12px' }}>{program.title}</td>
                          <td style={{ ...tableCellStyle, padding: '12px' }}>
                            {new Date(program.date).toLocaleDateString('ko-KR')}
                          </td>
                          <td style={{ ...tableCellStyle, padding: '12px' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '600',
                              backgroundColor: program.status === 'approved' ? '#d1fae5' : 
                                             program.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                              color: program.status === 'approved' ? '#065f46' : 
                                     program.status === 'rejected' ? '#991b1b' : '#92400e'
                            }}>
                              {program.status === 'approved' ? '승인' : 
                               program.status === 'rejected' ? '거절' : '대기'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: '#1e293b' }}>
                시설 예약 내역 ({selectedUser.facilityCount}건)
              </h3>
              {selectedUser.facilities.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '14px' }}>예약 내역이 없습니다.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead style={{ backgroundColor: '#f8fafc' }}>
                      <tr>
                        <th style={{ ...tableHeaderStyle, fontSize: '12px' }}>시설명</th>
                        <th style={{ ...tableHeaderStyle, fontSize: '12px' }}>예약일</th>
                        <th style={{ ...tableHeaderStyle, fontSize: '12px' }}>상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUser.facilities.map((facility) => (
                        <tr key={facility.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ ...tableCellStyle, padding: '12px' }}>{facility.name}</td>
                          <td style={{ ...tableCellStyle, padding: '12px' }}>
                            {new Date(facility.date).toLocaleDateString('ko-KR')}
                          </td>
                          <td style={{ ...tableCellStyle, padding: '12px' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '600',
                              backgroundColor: facility.status === 'approved' ? '#d1fae5' : 
                                             facility.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                              color: facility.status === 'approved' ? '#065f46' : 
                                     facility.status === 'rejected' ? '#991b1b' : '#92400e'
                            }}>
                              {facility.status === 'approved' ? '승인' : 
                               facility.status === 'rejected' ? '거절' : '대기'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const tableHeaderStyle: React.CSSProperties = {
  padding: '16px',
  textAlign: 'left',
  fontSize: '13px',
  fontWeight: '700',
  color: '#475569',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px'
};

const tableCellStyle: React.CSSProperties = {
  padding: '16px',
  fontSize: '14px',
  color: '#64748b'
};
