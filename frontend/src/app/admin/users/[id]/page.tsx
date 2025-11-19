'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetail();
  }, [userId]);

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

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>로딩중...</div>;
  }

  if (!user) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>회원을 찾을 수 없습니다.</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* 헤더 */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => router.push('/admin/users')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              marginBottom: '12px'
            }}
          >
            ← 회원 목록
          </button>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
            {user.name} 님의 정보
          </h1>
          <p style={{ color: '#666', margin: 0 }}>ID: {user.userId}</p>
        </div>

        {/* 기본 정보 */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
            기본 정보
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
            설문 결과 ({user.testResults?.length || 0}개)
          </h2>
          {user.testResults && user.testResults.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {user.testResults.map((result: any) => (
                <div
                  key={result.id}
                  style={{
                    padding: '16px',
                    border: '1px solid #eee',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      {result.test_type}
                    </div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {new Date(result.created_at).toLocaleString('ko-KR')}
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/survey/result/${result.id}`)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '13px' }}
                  >
                    결과 보기
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
              설문 결과가 없습니다.
            </p>
          )}
        </div>

        {/* 포트폴리오 */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
            포트폴리오 ({user.portfolioItems?.length || 0}개)
          </h2>
          {user.portfolioItems && user.portfolioItems.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {user.portfolioItems.map((item: any) => (
                <div
                  key={item.id}
                  style={{
                    padding: '16px',
                    border: '1px solid #eee',
                    borderRadius: '8px'
                  }}
                >
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    backgroundColor: '#e8f0ff',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#5887FF',
                    marginBottom: '8px'
                  }}>
                    {item.category}
                  </div>
                  <div style={{ fontSize: '14px' }}>{item.content}</div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                    {new Date(item.created_at).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
              포트폴리오 항목이 없습니다.
            </p>
          )}
        </div>

        {/* 최근 AI 상담 */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
            최근 AI 상담 내역
          </h2>
          {user.recentChats && user.recentChats.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {user.recentChats.map((chat: any) => (
                <div
                  key={chat.id}
                  style={{
                    padding: '16px',
                    border: '1px solid #eee',
                    borderRadius: '8px'
                  }}
                >
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                    주제: {chat.topic}
                  </div>
                  {chat.summary && (
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                      {chat.summary}
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {new Date(chat.started_at).toLocaleString('ko-KR')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
              상담 내역이 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '15px', fontWeight: '500' }}>
        {value}
      </div>
    </div>
  );
}