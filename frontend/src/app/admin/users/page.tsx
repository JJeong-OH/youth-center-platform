'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const fetchUsers = async (page: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:3000/admin/users?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('회원 목록 조회 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>로딩중...</div>;
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
            <button
              onClick={() => router.push('/admin/dashboard')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                marginBottom: '8px'
              }}
            >
              ← 대시보드
            </button>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
              회원 관리
            </h1>
          </div>
          <div style={{ color: '#666' }}>
            총 {pagination?.total || 0}명
          </div>
        </div>

        {/* 회원 테이블 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <th style={tableHeaderStyle}>ID</th>
                <th style={tableHeaderStyle}>이름</th>
                <th style={tableHeaderStyle}>이메일</th>
                <th style={tableHeaderStyle}>역할</th>
                <th style={tableHeaderStyle}>설문</th>
                <th style={tableHeaderStyle}>포트폴리오</th>
                <th style={tableHeaderStyle}>가입일</th>
                <th style={tableHeaderStyle}>상세</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.userId} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={tableCellStyle}>{user.userId}</td>
                  <td style={tableCellStyle}>
                    <strong>{user.name}</strong>
                  </td>
                  <td style={tableCellStyle}>{user.email}</td>
                  <td style={tableCellStyle}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: user.role === 'ADMIN' ? '#fee' : '#efe',
                      color: user.role === 'ADMIN' ? '#c33' : '#383'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={tableCellStyle}>{user.surveyCount}회</td>
                  <td style={tableCellStyle}>{user.portfolioCount}개</td>
                  <td style={tableCellStyle}>
                    {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td style={tableCellStyle}>
                    <Link
                      href={`/admin/users/${user.userId}`}
                      className="btn btn-primary"
                      style={{
                        padding: '6px 12px',
                        fontSize: '13px',
                        textDecoration: 'none',
                        display: 'inline-block'
                      }}
                    >
                      상세보기
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {pagination && pagination.totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '24px'
          }}>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              이전
            </button>
            
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: page === currentPage ? '#5887FF' : 'white',
                  color: page === currentPage ? 'white' : '#333',
                  cursor: 'pointer',
                  fontWeight: page === currentPage ? 'bold' : 'normal'
                }}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
              disabled={currentPage === pagination.totalPages}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: currentPage === pagination.totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === pagination.totalPages ? 0.5 : 1
              }}
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const tableHeaderStyle: React.CSSProperties = {
  padding: '16px 12px',
  textAlign: 'left',
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#495057'
};

const tableCellStyle: React.CSSProperties = {
  padding: '16px 12px',
  fontSize: '14px',
  color: '#333'
};