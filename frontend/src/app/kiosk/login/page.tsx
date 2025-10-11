'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Candidate {
  userId: number;
  name: string;
  maskedPhone: string;
  dob: string;
  gender: string;
}

export default function KioskLoginPage() {
  const router = useRouter();
  
  const [step, setStep] = useState<'input' | 'select'>('input');
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [gender, setGender] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !year || !month || !day || !gender) {
      setError('모든 항목을 입력해주세요.');
      return;
    }

    const dob = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    try {
      const response = await fetch('http://localhost:3000/kiosk/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, dob, gender }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || '로그인에 실패했습니다.');
        return;
      }

      // 동명이인 있음
      if (data.needSelection) {
        setCandidates(data.candidates);
        setStep('select');
        return;
      }

      // 바로 로그인 성공
      sessionStorage.setItem('kioskToken', data.kioskToken);
      sessionStorage.setItem('kioskUser', JSON.stringify(data.user));
      sessionStorage.setItem('kioskLogId', data.kioskLogId.toString());
      router.push('/kiosk/home');
    } catch (err: any) {
      setError('서버 연결에 실패했습니다.');
    }
  };

  const handleSelectUser = async (userId: number) => {
    try {
      const response = await fetch('http://localhost:3000/kiosk/auth/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || '선택에 실패했습니다.');
        return;
      }

      sessionStorage.setItem('kioskToken', data.kioskToken);
      sessionStorage.setItem('kioskUser', JSON.stringify(data.user));
      sessionStorage.setItem('kioskLogId', data.kioskLogId.toString());
      router.push('/kiosk/home');
    } catch (err: any) {
      setError('서버 연결에 실패했습니다.');
    }
  };

  // Step 1: 정보 입력
  if (step === 'input') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 헤더 */}
        <div style={{
          padding: '30px 24px',
          textAlign: 'center',
          borderBottom: '1px solid #eee'
        }}>
          <p style={{ color: '#666', fontSize: '14px', margin: '0 0 8px 0' }}>
            미추홀구청소년수련관
          </p>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            키오스크 로그인
          </h1>
        </div>

        {/* 폼 */}
        <div style={{ flex: 1, padding: '32px 24px', overflowY: 'auto' }}>
          {error && (
            <div style={{
              backgroundColor: '#fee',
              color: '#c33',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* 이름 */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '8px',
                fontSize: '16px'
              }}>
                이름
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '18px',
                  border: '2px solid #ddd',
                  borderRadius: '12px',
                  outline: 'none'
                }}
              />
            </div>

            {/* 생년월일 */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '8px',
                fontSize: '16px'
              }}>
                생년월일
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="년"
                  min="1900"
                  max="2025"
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '18px',
                    border: '2px solid #dd  d',
                    borderRadius: '12px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <input
                  type="number"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  placeholder="월"
                  min="1"
                  max="12"
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '18px',
                    border: '2px solid #ddd',
                    borderRadius: '12px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <input
                  type="number"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  placeholder="일"
                  min="1"
                  max="31"
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '18px',
                    border: '2px solid #ddd',
                    borderRadius: '12px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* 성별 */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '12px',
                fontSize: '16px'
              }}>
                성별
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  style={{
                    flex: 1,
                    padding: '20px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    border: gender === 'male' ? '3px solid #5887FF' : '2px solid #ddd',
                    borderRadius: '12px',
                    backgroundColor: gender === 'male' ? '#e8f0ff' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  남성
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  style={{
                    flex: 1,
                    padding: '20px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    border: gender === 'female' ? '3px solid #5887FF' : '2px solid #ddd',
                    borderRadius: '12px',
                    backgroundColor: gender === 'female' ? '#e8f0ff' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  여성
                </button>
              </div>
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '20px',
                fontSize: '20px',
                fontWeight: 'bold',
                backgroundColor: '#5887FF',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer'
              }}
            >
              다음으로 →
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Step 2: 동명이인 선택
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* 헤더 */}
      <div style={{
        padding: '30px 24px',
        textAlign: 'center',
        borderBottom: '1px solid #eee'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
          본인 확인
        </h1>
        <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
          일치하는 회원이 {candidates.length}명 있습니다
        </p>
      </div>

      {/* 후보 목록 */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c33',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {candidates.map((candidate) => (
            <button
              key={candidate.userId}
              onClick={() => handleSelectUser(candidate.userId)}
              style={{
                padding: '24px',
                border: '2px solid #ddd',
                borderRadius: '12px',
                backgroundColor: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#5887FF';
                e.currentTarget.style.backgroundColor = '#f8f9ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#ddd';
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                {candidate.name}
              </div>
              <div style={{ fontSize: '16px', color: '#666' }}>
                📞 {candidate.maskedPhone}
              </div>
              <div style={{ fontSize: '14px', color: '#999', marginTop: '4px' }}>
                {candidate.gender === 'male' ? '남성' : '여성'} / {candidate.dob}
              </div>
            </button>
          ))}
        </div>

        {/* 뒤로 가기 */}
        <button
          onClick={() => {
            setStep('input');
            setCandidates([]);
            setError('');
          }}
          style={{
            width: '100%',
            padding: '16px',
            marginTop: '24px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: '#f5f5f5',
            color: '#666',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer'
          }}
        >
          ← 뒤로 가기
        </button>
      </div>
    </div>
  );
}