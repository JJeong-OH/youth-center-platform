'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Facility {
  id: string;
  name: string;
  icon: string;
  description: string | null;
  capacity: number | null;
  isActive: boolean;
  order: number;
}

export default function FacilitiesPage() {
  const router = useRouter();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    icon: '🏢',
    description: '',
    capacity: '',
    order: '0',
  });

  const fetchFacilities = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:3001/api/facilities?includeInactive=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setFacilities(data.facilities || []);
    } catch (error) {
      console.error('시설 조회 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const openCreateModal = () => {
    setEditingFacility(null);
    setFormData({
      name: '',
      icon: '🏢',
      description: '',
      capacity: '',
      order: '0',
    });
    setShowModal(true);
  };

  const openEditModal = (facility: Facility) => {
    setEditingFacility(facility);
    setFormData({
      name: facility.name,
      icon: facility.icon,
      description: facility.description || '',
      capacity: facility.capacity?.toString() || '',
      order: facility.order.toString(),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      alert('로그인이 필요합니다.');
      router.push('/admin/login');
      return;
    }
    
    const url = editingFacility
      ? `http://localhost:3001/api/facilities/${editingFacility.id}`
      : 'http://localhost:3001/api/facilities';
    
    const method = editingFacility ? 'PUT' : 'POST';
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          icon: formData.icon,
          description: formData.description,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          order: parseInt(formData.order),
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        alert(editingFacility ? '시설이 수정되었습니다.' : '시설이 추가되었습니다.');
        setShowModal(false);
        fetchFacilities();
      } else {
        alert('저장 실패: ' + (data.message || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('Failed to save facility:', error);
      alert('저장 실패');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch(`http://localhost:3001/api/facilities/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        alert('시설이 삭제되었습니다.');
        fetchFacilities();
      } else {
        alert('삭제 실패: ' + (data.message || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('Failed to delete facility:', error);
      alert('삭제 실패');
    }
  };

  const toggleActive = async (facility: Facility) => {
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch(`http://localhost:3001/api/facilities/${facility.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !facility.isActive }),
      });
      
      if (response.ok) {
        fetchFacilities();
      }
    } catch (error) {
      console.error('Failed to toggle active:', error);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* 헤더 */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px',
        marginBottom: '32px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => router.push('/admin/dashboard')}
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
              ← 대시보드
            </button>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                시설 관리
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                시설 정보 및 예약 관리
              </p>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            style={{
              padding: '10px 20px',
              backgroundColor: '#1e3a8a',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1e40af';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#1e3a8a';
            }}
          >
            ➕ 시설 추가
          </button>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 32px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              데이터 로딩 중...
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <tr>
                  <th style={tableHeaderStyle}>순서</th>
                  <th style={tableHeaderStyle}>아이콘</th>
                  <th style={tableHeaderStyle}>시설명</th>
                  <th style={tableHeaderStyle}>수용인원</th>
                  <th style={tableHeaderStyle}>설명</th>
                  <th style={tableHeaderStyle}>상태</th>
                  <th style={tableHeaderStyle}>관리</th>
                </tr>
              </thead>
              <tbody>
                {facilities.map((facility) => (
                  <tr key={facility.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={tableCellStyle}>{facility.order}</td>
                    <td style={tableCellStyle}><span style={{ fontSize: '32px' }}>{facility.icon}</span></td>
                    <td style={tableCellStyle}>
                      <strong style={{ color: '#1e293b' }}>{facility.name}</strong>
                    </td>
                    <td style={tableCellStyle}>{facility.capacity || '-'}명</td>
                    <td style={tableCellStyle}>{facility.description || '-'}</td>
                    <td style={tableCellStyle}>
                      <button
                        onClick={() => toggleActive(facility)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: '1px solid',
                          borderColor: facility.isActive ? '#059669' : '#dc2626',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '12px',
                          backgroundColor: facility.isActive ? '#d1fae5' : '#fee2e2',
                          color: facility.isActive ? '#065f46' : '#991b1b'
                        }}
                      >
                        {facility.isActive ? '활성화' : '비활성화'}
                      </button>
                    </td>
                    <td style={tableCellStyle}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => openEditModal(facility)}
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
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(facility.id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* 모달 */}
      {showModal && (
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '32px',
            width: '500px',
            maxWidth: '90%',
            border: '1px solid #e2e8f0'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#1e293b', borderBottom: '2px solid #1e3a8a', paddingBottom: '12px' }}>
              {editingFacility ? '시설 수정' : '시설 추가'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>시설명 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>아이콘 (이모지)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '24px',
                    backgroundColor: '#f8fafc'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>수용인원</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>순서</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>설명</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  style={{
                    ...inputStyle,
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#1e3a8a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  {editingFacility ? '수정' : '추가'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
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