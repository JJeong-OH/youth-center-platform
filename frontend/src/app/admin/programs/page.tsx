'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Program {
  id: number;
  title: string;
  department: string | null;
  startDate: string | null;
  endDate: string | null;
  targetAudience: string | null;
  capacity: number | null;
  fee: number;
  recruitStatus: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
}

interface Applicant {
  id: number;
  program_id: number;
  applicant_name: string;
  phone: string | null;
  status: string;
  applied_at: string;
  isWaiting: boolean;
  waitingNumber: number | null;
  programCapacity: number;
  approvedCount: number;
}

export default function ProgramsPage() {
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [selectedProgramForApplicants, setSelectedProgramForApplicants] = useState<Program | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    startDate: '',
    endDate: '',
    targetAudience: '',
    capacity: '',
    fee: '0',
    recruitStatus: '모집중',
    description: '',
    imageUrl: '',
    order: '0',
  });

  const fetchPrograms = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:3001/api/program/all?includeInactive=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setPrograms(data.programs || []);
    } catch (error) {
      console.error('프로그램 조회 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const openCreateModal = () => {
    setEditingProgram(null);
    setFormData({
      title: '',
      department: '',
      startDate: '',
      endDate: '',
      targetAudience: '',
      capacity: '',
      fee: '0',
      recruitStatus: '모집중',
      description: '',
      imageUrl: '',
      order: '0',
    });
    setShowModal(true);
  };

  const openEditModal = (program: Program) => {
    setEditingProgram(program);
    setFormData({
      title: program.title,
      department: program.department || '',
      startDate: program.startDate ? program.startDate.split('T')[0] : '',
      endDate: program.endDate ? program.endDate.split('T')[0] : '',
      targetAudience: program.targetAudience || '',
      capacity: program.capacity?.toString() || '',
      fee: program.fee.toString(),
      recruitStatus: program.recruitStatus,
      description: program.description || '',
      imageUrl: program.imageUrl || '',
      order: program.order.toString(),
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
    
    const url = editingProgram
      ? `http://localhost:3001/api/program/${editingProgram.id}`
      : 'http://localhost:3001/api/program/create';
    
    const method = editingProgram ? 'PUT' : 'POST';
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          department: formData.department,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          targetAudience: formData.targetAudience,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          fee: parseInt(formData.fee),
          recruitStatus: formData.recruitStatus,
          description: formData.description,
          imageUrl: formData.imageUrl,
          order: parseInt(formData.order),
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(editingProgram ? '프로그램이 수정되었습니다.' : '프로그램이 추가되었습니다.');
        setShowModal(false);
        fetchPrograms();
      } else {
        alert('저장 실패: ' + data.message);
      }
    } catch (error) {
      console.error('Failed to save program:', error);
      alert('저장 실패');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      alert('로그인이 필요합니다.');
      router.push('/admin/login');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3001/api/program/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        alert('프로그램이 삭제되었습니다.');
        fetchPrograms();
      } else {
        alert('삭제 실패: ' + (data.message || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('Failed to delete program:', error);
      alert('삭제 실패');
    }
  };

  const toggleActive = async (program: Program) => {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      alert('로그인이 필요합니다.');
      router.push('/admin/login');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3001/api/program/${program.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !program.isActive }),
      });
      
      if (response.ok) {
        fetchPrograms();
      }
    } catch (error) {
      console.error('Failed to toggle active:', error);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const fetchApplicants = async (programId: number) => {
    setLoadingApplicants(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:3001/api/kiosk/applications?programId=${programId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      console.log('📋 신청자 목록:', data);
      
      setApplicants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('신청자 조회 에러:', error);
      setApplicants([]);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const openApplicantsModal = (program: Program) => {
    setSelectedProgramForApplicants(program);
    setShowApplicantsModal(true);
    fetchApplicants(program.id);
  };

  const closeApplicantsModal = () => {
    setShowApplicantsModal(false);
    setSelectedProgramForApplicants(null);
    setApplicants([]);
  };

  const handleApproveApplication = async (applicationId: number) => {
    if (!confirm('이 신청을 승인하시겠습니까?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:3001/api/kiosk/applications/${applicationId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('신청이 승인되었습니다.');
        if (selectedProgramForApplicants) {
          fetchApplicants(selectedProgramForApplicants.id);
        }
      } else {
        alert('승인 실패: ' + data.message);
      }
    } catch (error) {
      console.error('승인 에러:', error);
      alert('승인 실패');
    }
  };

  const handleRejectApplication = async (applicationId: number) => {
    if (!confirm('이 신청을 거절하시겠습니까?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:3001/api/kiosk/applications/${applicationId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('신청이 거절되었습니다.');
        if (selectedProgramForApplicants) {
          fetchApplicants(selectedProgramForApplicants.id);
        }
      } else {
        alert('거절 실패: ' + data.message);
      }
    } catch (error) {
      console.error('거절 에러:', error);
      alert('거절 실패');
    }
  };

  // ✅ 삭제 핸들러 추가
  const handleDeleteApplication = async (applicationId: number) => {
    if (!confirm('이 신청을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:3001/api/kiosk/applications/${applicationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success || response.ok) {
        alert('신청이 삭제되었습니다.');
        if (selectedProgramForApplicants) {
          fetchApplicants(selectedProgramForApplicants.id);
        }
      } else {
        alert('삭제 실패: ' + (data.message || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('삭제 에러:', error);
      alert('삭제 실패');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px',
        marginBottom: '32px'
      }}>
        <div style={{
          maxWidth: '1400px',
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
                프로그램 관리
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                프로그램 등록, 수정 및 삭제
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
            ➕ 프로그램 추가
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px 32px' }}>
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
                    <th style={tableHeaderStyle}>순서</th>
                    <th style={tableHeaderStyle}>프로그램명</th>
                    <th style={tableHeaderStyle}>주최부서</th>
                    <th style={tableHeaderStyle}>사업기간</th>
                    <th style={tableHeaderStyle}>참여대상</th>
                    <th style={tableHeaderStyle}>정원</th>
                    <th style={tableHeaderStyle}>참가비</th>
                    <th style={tableHeaderStyle}>모집상태</th>
                    <th style={tableHeaderStyle}>상태</th>
                    <th style={tableHeaderStyle}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.map((program) => (
                    <tr key={program.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={tableCellStyle}>{program.order}</td>
                      <td style={tableCellStyle}>
                        <strong style={{ color: '#1e293b' }}>{program.title}</strong>
                      </td>
                      <td style={tableCellStyle}>{program.department || '-'}</td>
                      <td style={tableCellStyle}>
                        {formatDate(program.startDate)} ~ {formatDate(program.endDate)}
                      </td>
                      <td style={tableCellStyle}>{program.targetAudience || '-'}</td>
                      <td style={tableCellStyle}>{program.capacity || '-'}명</td>
                      <td style={tableCellStyle}>{program.fee.toLocaleString()}원</td>
                      <td style={tableCellStyle}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: program.recruitStatus === '모집중' ? '#dbeafe' : '#fee2e2',
                          color: program.recruitStatus === '모집중' ? '#1e40af' : '#991b1b'
                        }}>
                          {program.recruitStatus}
                        </span>
                      </td>
                      <td style={tableCellStyle}>
                        <button
                          onClick={() => toggleActive(program)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: '1px solid',
                            borderColor: program.isActive ? '#059669' : '#dc2626',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '12px',
                            backgroundColor: program.isActive ? '#d1fae5' : '#fee2e2',
                            color: program.isActive ? '#065f46' : '#991b1b'
                          }}
                        >
                          {program.isActive ? '활성화' : '비활성화'}
                        </button>
                      </td>
                      <td style={tableCellStyle}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => openApplicantsModal(program)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            신청현황
                          </button>
                          <button
                            onClick={() => openEditModal(program)}
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
                            onClick={() => handleDelete(program.id)}
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
            </div>
          )}
        </div>
      </main>

      {/* 프로그램 추가/수정 모달 */}
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
          zIndex: 1000,
          overflowY: 'auto',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '32px',
            width: '800px',
            maxWidth: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid #e2e8f0'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#1e293b', borderBottom: '2px solid #1e3a8a', paddingBottom: '12px' }}>
              {editingProgram ? '프로그램 수정' : '프로그램 추가'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>프로그램명 *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>주최부서</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>참여대상</label>
                  <input
                    type="text"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    placeholder="예: 중고등학생"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>시작일</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>종료일</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>모집인원</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="정원"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>참가비 (원)</label>
                  <input
                    type="number"
                    value={formData.fee}
                    onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>모집상태</label>
                  <select
                    value={formData.recruitStatus}
                    onChange={(e) => setFormData({ ...formData, recruitStatus: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="모집중">모집중</option>
                    <option value="마감">마감</option>
                    <option value="대기">대기</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>표시 순서</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>이미지 URL</label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                    style={inputStyle}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>상세 설명</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    style={{
                      ...inputStyle,
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
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
                  {editingProgram ? '수정' : '추가'}
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

      {/* 신청자 목록 모달 */}
      {showApplicantsModal && selectedProgramForApplicants && (
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
          zIndex: 1001,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '32px',
            width: '1000px',
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
                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#1e293b', marginBottom: '4px' }}>
                  프로그램 신청자 목록
                </h2>
                <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>
                  {selectedProgramForApplicants.title}
                </p>
                {selectedProgramForApplicants.capacity && applicants.length > 0 && (
                  <p style={{ fontSize: '13px', margin: '6px 0 0 0', fontWeight: '600' }}>
                    <span style={{ color: '#059669' }}>
                      정원: {applicants.filter(a => a.status === 'approved').length} / {selectedProgramForApplicants.capacity}명
                    </span>
                    {applicants.filter(a => a.isWaiting).length > 0 && (
                      <span style={{ color: '#f59e0b', marginLeft: '12px' }}>
                        (대기: {applicants.filter(a => a.isWaiting).length}명)
                      </span>
                    )}
                  </p>
                )}
              </div>
              <button
                onClick={closeApplicantsModal}
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

            {loadingApplicants ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                로딩 중...
              </div>
            ) : applicants.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                아직 신청자가 없습니다.
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '16px', fontSize: '14px', color: '#64748b' }}>
                  총 <span style={{ fontWeight: '700', color: '#1e293b' }}>{applicants.length}명</span>이 신청했습니다.
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <tr>
                        <th style={tableHeaderStyle}>번호</th>
                        <th style={tableHeaderStyle}>신청자</th>
                        <th style={tableHeaderStyle}>연락처</th>
                        <th style={tableHeaderStyle}>상태</th>
                        <th style={tableHeaderStyle}>신청일시</th>
                        <th style={tableHeaderStyle}>관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applicants.map((applicant, index) => {
                        const isWaiting = applicant.isWaiting;
                        const waitingNum = applicant.waitingNumber;
                        
                        return (
                          <tr key={applicant.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={tableCellStyle}>{index + 1}</td>
                            <td style={tableCellStyle}>
                              <strong style={{ color: '#1e293b' }}>{applicant.applicant_name}</strong>
                              {isWaiting && (
                                <div style={{ 
                                  fontSize: '11px', 
                                  color: '#f59e0b', 
                                  marginTop: '2px',
                                  fontWeight: '600'
                                }}>
                                  대기 {waitingNum}번
                                </div>
                              )}
                            </td>
                            <td style={tableCellStyle}>{applicant.phone || '-'}</td>
                            <td style={tableCellStyle}>
                              <span style={{
                                padding: '4px 12px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600',
                                backgroundColor: applicant.status === 'pending' ? '#fef3c7' : 
                                               applicant.status === 'approved' ? '#d1fae5' : '#fee2e2',
                                color: applicant.status === 'pending' ? '#92400e' : 
                                       applicant.status === 'approved' ? '#065f46' : '#991b1b'
                              }}>
                                {applicant.status === 'pending' ? (isWaiting ? '대기중' : '검토중') : 
                                 applicant.status === 'approved' ? '승인' : '거절'}
                              </span>
                            </td>
                            <td style={tableCellStyle}>
                              {new Date(applicant.applied_at).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td style={tableCellStyle}>
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {applicant.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleApproveApplication(applicant.id)}
                                      style={{
                                        padding: '4px 8px',
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '11px',
                                        fontWeight: '600'
                                      }}
                                    >
                                      승인
                                    </button>
                                    <button
                                      onClick={() => handleRejectApplication(applicant.id)}
                                      style={{
                                        padding: '4px 8px',
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '11px',
                                        fontWeight: '600'
                                      }}
                                    >
                                      거절
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => handleDeleteApplication(applicant.id)}
                                  style={{
                                    padding: '4px 8px',
                                    backgroundColor: '#64748b',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                    fontWeight: '600'
                                  }}
                                >
                                  삭제
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
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