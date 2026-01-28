'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  userId: number;
  email: string;
  name: string;
  phoneNumber?: string;
  dob?: string;
  gender?: string;
}

const API_URL = 'http://localhost:3001/api';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 수정 폼
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      router.push('/');
      return;
    }

    fetchProfile(token);
  }, [router]);

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('프로필 가져오기 실패');
      }

      const userData = await response.json();
      setUser(userData);
      
      // 폼에 기존 데이터 채우기
      setName(userData.name || '');
      setPhoneNumber(userData.phoneNumber || '');
      setDob(userData.dob ? userData.dob.split('T')[0] : '');
      setGender(userData.gender || '');
    } catch (error) {
      console.error('프로필 조회 에러:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (name.trim().length < 2) {
      newErrors.name = '이름을 2자 이상 입력해주세요.';
    }
    
    if (phoneNumber && !/^\d{10,11}$/.test(phoneNumber.replace(/-/g, ''))) {
      newErrors.phoneNumber = '유효한 전화번호를 입력해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          phoneNumber: phoneNumber.replace(/-/g, ''),
          dob: dob || null,
          gender: gender || null
        })
      });

      if (!response.ok) {
        throw new Error('정보 수정 실패');
      }

      setSuccessMessage('정보가 수정되었습니다!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // 프로필 새로고침
      fetchProfile(token);
    } catch (error) {
      console.error('정보 수정 에러:', error);
      alert('정보 수정에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e8f0fe 0%, #f3e8ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '24px', color: '#667eea' }}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e8f0fe 0%, #f3e8ff 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Link href="/" style={{
          textDecoration: 'none',
          color: '#667eea',
          fontSize: '16px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px'
        }}>
          ← 홈으로 돌아가기
        </Link>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '900',
            color: '#1a1a2e',
            margin: '0 0 8px 0'
          }}>
            내 정보 관리
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '32px'
          }}>
            회원 정보를 수정할 수 있습니다.
          </p>

          {successMessage && (
            <div style={{
              padding: '12px',
              backgroundColor: '#d1fae5',
              color: '#065f46',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              ✓ {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px'
              }}>
                이메일
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#f9fafb',
                  color: '#999',
                  boxSizing: 'border-box'
                }}
              />
              <p style={{
                fontSize: '12px',
                color: '#999',
                marginTop: '4px'
              }}>
                이메일은 변경할 수 없습니다.
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px'
              }}>
                이름 *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `2px solid ${errors.name ? '#dc2626' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
              {errors.name && (
                <p style={{
                  color: '#dc2626',
                  fontSize: '13px',
                  marginTop: '4px'
                }}>
                  {errors.name}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px'
              }}>
                전화번호
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="010-1234-5678"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `2px solid ${errors.phoneNumber ? '#dc2626' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
              {errors.phoneNumber && (
                <p style={{
                  color: '#dc2626',
                  fontSize: '13px',
                  marginTop: '4px'
                }}>
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px'
              }}>
                생년월일
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px'
              }}>
                성별
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">선택하세요</option>
                <option value="male">남성</option>
                <option value="female">여성</option>
              </select>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              저장하기
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}   