'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
  userId: number;
  email: string;
  name: string;
}

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  // 로그인 폼
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // 회원가입 폼
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupDob, setSignupDob] = useState('');
  const [signupGender, setSignupGender] = useState('');

  // UI 제어
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '로그인에 실패했습니다.');
      }
      
      localStorage.setItem('accessToken', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      setLoginEmail('');
      setLoginPassword('');
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await fetch('http://localhost:3000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: signupName,
          email: signupEmail, 
          password: signupPassword,
          phoneNumber: signupPhone,
          dob: signupDob,
          gender: signupGender
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '회원가입에 실패했습니다.');
      }
      
      setSuccessMessage('회원가입 성공! 이제 로그인해주세요.');
      setIsSignupModalOpen(false);
      
      // 폼 초기화
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
      setSignupPhone('');
      setSignupDob('');
      setSignupGender('');
    } catch (err: any) {
      setError(err.message || '회원가입에 실패했습니다.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (token && !user) {
      const fetchProfile = async () => {
        try {
          const response = await fetch('http://localhost:3000/auth/profile', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          
          if (!response.ok) {
            throw new Error('프로필 가져오기 실패');
          }
          
          const data = await response.json();
          setUser(data);
        } catch (err: any) {
          console.error('프로필 가져오기 실패:', err);
          localStorage.removeItem('accessToken');
          setToken(null);
        }
      };
      fetchProfile();
    }
  }, [token, user]);

  if (!user) {
    return (
      <>
        <div className="container">
          <header className="header">
            <p className="subtitle">미추홀구청소년센터</p>
            <h1 className="title">AI와 함께 성장하는 나</h1>
          </header>
          
          <main>
            {successMessage && (
              <p className="success-message">{successMessage}</p>
            )}
            
            {error && !isSignupModalOpen && (
              <p className="error-message">{error}</p>
            )}
            
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="email">이메일</label>
                <input 
                  type="email" 
                  id="email" 
                  value={loginEmail} 
                  onChange={(e) => setLoginEmail(e.target.value)} 
                  placeholder="이메일을 입력하세요" 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">비밀번호</label>
                <input 
                  type="password" 
                  id="password" 
                  value={loginPassword} 
                  onChange={(e) => setLoginPassword(e.target.value)} 
                  placeholder="비밀번호를 입력하세요" 
                  required 
                />
              </div>
              
              <button type="submit" className="btn btn-primary full-width-btn">
                로그인
              </button>
            </form>
            
            <button 
              onClick={() => {
                setIsSignupModalOpen(true);
                setError('');
              }} 
              className="btn btn-secondary full-width-btn"
            >
              회원가입
            </button>
          </main>
        </div>

        {isSignupModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button 
                onClick={() => {
                  setIsSignupModalOpen(false);
                  setError('');
                }} 
                className="close-modal-btn"
              >
                &times;
              </button>
              
              <div className="modal-header">
                <h2>회원가입</h2>
              </div>
              
              <div className="modal-body">
                {error && <p className="error-message">{error}</p>}
                
                <form onSubmit={handleSignup}>
                  <div className="form-group">
                    <label htmlFor="signupName">성명</label>
                    <input 
                      type="text" 
                      id="signupName" 
                      value={signupName} 
                      onChange={(e) => setSignupName(e.target.value)} 
                      placeholder="이름을 입력하세요"
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="signupEmail">이메일</label>
                    <input 
                      type="email" 
                      id="signupEmail" 
                      value={signupEmail} 
                      onChange={(e) => setSignupEmail(e.target.value)} 
                      placeholder="이메일을 입력하세요"
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="signupPassword">비밀번호</label>
                    <input 
                      type="password" 
                      id="signupPassword" 
                      value={signupPassword} 
                      onChange={(e) => setSignupPassword(e.target.value)} 
                      placeholder="비밀번호를 입력하세요"
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="signupPhone">전화번호</label>
                    <input 
                      type="text" 
                      id="signupPhone" 
                      value={signupPhone} 
                      onChange={(e) => setSignupPhone(e.target.value)} 
                      placeholder="010-1234-5678"
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="signupDob">생년월일</label>
                    <input 
                      type="date" 
                      id="signupDob" 
                      value={signupDob} 
                      onChange={(e) => setSignupDob(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="signupGender">성별</label>
                    <select
                      id="signupGender"
                      value={signupGender}
                      onChange={(e) => setSignupGender(e.target.value)}
                      required
                    >
                      <option value="">선택하세요</option>
                      <option value="male">남성</option>
                      <option value="female">여성</option>
                      <option value="other">기타</option>
                    </select>
                  </div>
                  
                  <button type="submit" className="btn btn-primary full-width-btn">
                    회원가입 완료
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="container">
      <header className="header" style={{ 
        textAlign: 'right', 
        marginBottom: '16px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <h1 className="title" style={{ fontSize: '20px', margin: 0 }}>
          미추홀 AI
        </h1>
        <div>
          <span style={{ marginRight: '12px', fontWeight: '500' }}>
            안녕하세요, {user.name}님
          </span>
          <button 
            onClick={handleLogout} 
            style={{ 
              border: 'none', 
              background: 'none', 
              color: 'var(--primary-blue)', 
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            로그아웃
          </button>
        </div>
      </header>
      
      <main>
        <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
          로그인 후 보여질 메인 대시보드입니다.
        </p>
        
        <div className="button-grid">
          <Link href="/chat" className="btn btn-primary">
            AI 상담
          </Link>
          <button className="btn btn-secondary">프로그램 추천</button>
          <button className="btn btn-green">나의 포트폴리오</button>
          <button className="btn btn-purple">나의 역량 검사</button>
        </div>
        
        <div className="button-grid">
          <button className="btn btn-dark">센터 소개</button>
          <button className="btn btn-yellow">기관연계</button>
        </div>
      </main>
    </div>
  );
}