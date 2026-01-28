'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import logoImage from './assets/react.svg';
import robotAI from './assets/image1.png';
import robotProgram from './assets/image2.png';
import robotFacility from './assets/image3.png';
import robotSurvey from './assets/image.png';

interface User {
  userId: number;
  email: string;
  name: string;
  phoneNumber?: string;
}

interface Application {
  id: number;
  program_id: number;
  user_name: string;
  phone: string | null;
  status: string;
  created_at: string;
  program?: {
    title: string;
    department: string;
  };
}

interface Booking {
  id: number;
  facility_id: string;
  user_name: string;
  date: string;
  time_slot: string;
  phone: string | null;
  status: string;
  facility?: {
    name: string;
  };
}

const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:3001/api'
  : 'https://youth-center-platform.onrender.com/api';

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupDob, setSignupDob] = useState('');
  const [signupGender, setSignupGender] = useState('');
  
  const [isMinor, setIsMinor] = useState(false);
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('');
  const [guardianVerified, setGuardianVerified] = useState(false);
  
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSensitiveModal, setShowSensitiveModal] = useState(false);
  const [showThirdPartyModal, setShowThirdPartyModal] = useState(false);
  const [showMyPageModal, setShowMyPageModal] = useState(false);
  
  const [allAgreed, setAllAgreed] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [sensitiveInfoAgreed, setSensitiveInfoAgreed] = useState(false);
  const [thirdPartyAgreed, setThirdPartyAgreed] = useState(false);
  const [marketingAgreed, setMarketingAgreed] = useState(false);
  
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [myPageTab, setMyPageTab] = useState<'info' | 'programs' | 'bookings' | 'counseling'>('info');
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [isLoadingMyData, setIsLoadingMyData] = useState(false);

  const checkAge = (birthDate: string) => {
    if (!birthDate) return;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    setIsMinor(age < 14);
  };

  const handleAllAgree = (checked: boolean) => {
    setAllAgreed(checked);
    setTermsAgreed(checked);
    setPrivacyAgreed(checked);
    setSensitiveInfoAgreed(checked);
    setThirdPartyAgreed(checked);
    setMarketingAgreed(checked);
  };

  useEffect(() => {
    if (termsAgreed && privacyAgreed && sensitiveInfoAgreed && thirdPartyAgreed && marketingAgreed) {
      setAllAgreed(true);
    } else {
      setAllAgreed(false);
    }
  }, [termsAgreed, privacyAgreed, sensitiveInfoAgreed, thirdPartyAgreed, marketingAgreed]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    console.log('🔍 로그인 시도:', loginEmail);
    console.log('🔍 API URL:', API_URL);
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      
      console.log('🔍 응답 상태:', response.status);
      
      const data = await response.json();
      console.log('🔍 응답 데이터:', data);
      
      if (!response.ok) {
        throw new Error(data.message || '로그인에 실패했습니다.');
      }
      
      if (!data.accessToken) {
        console.error('❌ 토큰이 응답에 없음!');
        throw new Error('토큰을 받지 못했습니다.');
      }
      
      console.log('✅ 로그인 성공!');
      
      localStorage.setItem('accessToken', data.accessToken);
      setToken(data.accessToken);
      
      if (data.user) {
        setUser(data.user);
      }
      
      setLoginEmail('');
      setLoginPassword('');
    } catch (err: any) {
      console.error('❌ 로그인 에러:', err.message);
      setError(err.message || '로그인에 실패했습니다.');
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!termsAgreed || !privacyAgreed || !sensitiveInfoAgreed || !thirdPartyAgreed) {
        setError('필수 약관에 모두 동의해주세요.');
        return;
      }
    }
    
    if (currentStep === 2) {
      if (!signupName || !signupEmail || !signupPassword || !signupPhone || !signupDob || !signupGender) {
        setError('모든 필수 정보를 입력해주세요.');
        return;
      }
      
      if (isMinor && (!guardianName || !guardianPhone || !guardianRelation)) {
        setError('법정대리인 정보를 모두 입력해주세요.');
        return;
      }
    }
    
    setError('');
    setCurrentStep(currentStep + 1);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (isMinor && !guardianVerified) {
      setError('법정대리인 본인인증이 필요합니다.');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: signupName,
          email: signupEmail, 
          password: signupPassword,
          phoneNumber: signupPhone,
          dob: signupDob,
          gender: signupGender,
          isMinor,
          guardianName: isMinor ? guardianName : null,
          guardianPhone: isMinor ? guardianPhone : null,
          guardianRelation: isMinor ? guardianRelation : null,
          termsAgreed,
          privacyAgreed,
          sensitiveInfoAgreed,
          thirdPartyAgreed,
          marketingAgreed
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '회원가입에 실패했습니다.');
      }
      
      setSuccessMessage('회원가입이 완료되었습니다! 이제 로그인해주세요.');
      setIsSignupModalOpen(false);
      setCurrentStep(1);
      
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
      setSignupPhone('');
      setSignupDob('');
      setSignupGender('');
      setGuardianName('');
      setGuardianPhone('');
      setGuardianRelation('');
      setAllAgreed(false);
      setTermsAgreed(false);
      setPrivacyAgreed(false);
      setSensitiveInfoAgreed(false);
      setThirdPartyAgreed(false);
      setMarketingAgreed(false);
    } catch (err: any) {
      setError(err.message || '회원가입에 실패했습니다.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setToken(null);
    setUser(null);
    setShowMyPageModal(false);
  };

  const fetchMyPageData = async () => {
    if (!user) return;
    
    setIsLoadingMyData(true);
    
    try {
      const appsResponse = await fetch(`${API_URL}/kiosk/applications`);
      const appsData = await appsResponse.json();
      const myApps = Array.isArray(appsData) 
        ? appsData.filter((app: any) => app.user_name === user.name && app.status === 'pending')
        : [];
      setMyApplications(myApps);

      const bookingsResponse = await fetch(`${API_URL}/kiosk/bookings`);
      const bookingsData = await bookingsResponse.json();
      const myBooks = Array.isArray(bookingsData)
        ? bookingsData.filter((booking: any) => 
            booking.user_name === user.name && 
            booking.status === 'active' &&
            new Date(booking.date) >= new Date(new Date().setHours(0, 0, 0, 0))
          )
        : [];
      setMyBookings(myBooks);
    } catch (error) {
      console.error('마이페이지 데이터 로드 에러:', error);
    } finally {
      setIsLoadingMyData(false);
    }
  };

  const cancelApplication = async (appId: number) => {
    if (!confirm('신청을 취소하시겠습니까?')) return;

    try {
      const response = await fetch(`${API_URL}/kiosk/applications/${appId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.success) {
        alert('신청이 취소되었습니다.');
        fetchMyPageData();
      } else {
        alert('취소 실패: ' + result.message);
      }
    } catch (error) {
      alert('취소 중 오류가 발생했습니다.');
    }
  };

  const cancelBooking = async (bookingId: number) => {
    if (!confirm('예약을 취소하시겠습니까?')) return;

    try {
      const response = await fetch(`${API_URL}/kiosk/bookings/${bookingId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.success) {
        alert('예약이 취소되었습니다.');
        fetchMyPageData();
      } else {
        alert('취소 실패: ' + result.message);
      }
    } catch (error) {
      alert('취소 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    if (showMyPageModal && user) {
      fetchMyPageData();
    }
  }, [showMyPageModal, user]);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      setToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token && !user) {
      const fetchProfile = async () => {
        try {
          const storedToken = localStorage.getItem('accessToken');
          
          if (!storedToken) {
            console.warn('⚠️ localStorage에 토큰 없음');
            setIsLoading(false);
            return;
          }

          console.log('🔍 프로필 로드 시작');
          
          const response = await fetch(`${API_URL}/auth/profile`, {
            headers: { 
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json'
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ 프로필 로드 성공:', data);
            setUser(data);
          } else {
            console.warn('⚠️ 프로필 로드 실패 - 토큰 유지');
          }
        } catch (err: any) {
          console.warn('⚠️ 프로필 로드 에러 - 토큰 유지');
        } finally {
          setIsLoading(false);
        }
      };
      fetchProfile();
    } else if (token && user) {
      setIsLoading(false);
    }
  }, [token, user]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '20px',
        fontWeight: '600'
      }}>
        로딩 중...
      </div>
    );
  }

  if (!token) {
    return (
      <>
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '40px 30px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}></div>
              <h1 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#667eea',
                margin: '0 0 5px 0'
              }}>청소년 키오스크</h1>
              <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                미추홀구청소년센터
              </p>
            </div>
            
            {successMessage && (
              <div style={{
                padding: '12px',
                backgroundColor: '#d1fae5',
                color: '#065f46',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px',
                textAlign: 'center'
              }}>{successMessage}</div>
            )}
            
            {error && !isSignupModalOpen && (
              <div style={{
                padding: '12px',
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px',
                textAlign: 'center'
              }}>{error}</div>
            )}
            
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '8px'
                }}>이메일</label>
                <input 
                  type="email" 
                  value={loginEmail} 
                  onChange={(e) => setLoginEmail(e.target.value)} 
                  placeholder="이메일을 입력하세요" 
                  required 
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
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '8px'
                }}>비밀번호</label>
                <input 
                  type="password" 
                  value={loginPassword} 
                  onChange={(e) => setLoginPassword(e.target.value)} 
                  placeholder="비밀번호를 입력하세요" 
                  required 
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
              
              <button type="submit" style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '12px'
              }}>
                로그인
              </button>
            </form>
            
            <button 
              onClick={() => {
                setIsSignupModalOpen(true);
                setCurrentStep(1);
                setError('');
              }} 
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#f3f4f6',
                color: '#667eea',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              회원가입
            </button>
          </div>
        </div>

        {isSignupModalOpen && (
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
            padding: '20px',
            overflowY: 'auto'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '30px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative'
            }}>
              <button 
                onClick={() => {
                  setIsSignupModalOpen(false);
                  setCurrentStep(1);
                  setError('');
                }} 
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                &times;
              </button>
              
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '30px',
                gap: '8px'
              }}>
                {[1, 2, 3].map(step => (
                  <div key={step} style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: currentStep >= step ? '#667eea' : '#e5e7eb',
                    transition: 'all 0.3s'
                  }} />
                ))}
              </div>

              <h2 style={{
                fontSize: '22px',
                fontWeight: '700',
                color: '#333',
                marginBottom: '10px',
                textAlign: 'center'
              }}>
                {currentStep === 1 && '약관 동의'}
                {currentStep === 2 && '정보 입력'}
                {currentStep === 3 && '가입 완료'}
              </h2>
              
              <p style={{
                fontSize: '13px',
                color: '#666',
                marginBottom: '20px',
                textAlign: 'center',
                lineHeight: '1.5'
              }}>
                {currentStep === 1 && '서비스 이용을 위해 약관 동의가 필요합니다'}
                {currentStep === 2 && '회원 정보를 입력해주세요'}
                {currentStep === 3 && '마지막 확인 단계입니다'}
              </p>
              
              {error && (
                <div style={{
                  padding: '12px',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  fontSize: '14px',
                  textAlign: 'center'
                }}>{error}</div>
              )}

              {currentStep === 1 && (
                <div>
                  <div style={{
                    padding: '20px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      padding: '16px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      border: '2px solid #667eea'
                    }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '700'
                      }}>
                        <input
                          type="checkbox"
                          checked={allAgreed}
                          onChange={(e) => handleAllAgree(e.target.checked)}
                          style={{
                            marginRight: '12px',
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer'
                          }}
                        />
                        <span>전체 동의하기</span>
                      </label>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}>
                        <input
                          type="checkbox"
                          checked={termsAgreed}
                          onChange={(e) => setTermsAgreed(e.target.checked)}
                          style={{
                            marginRight: '8px',
                            marginTop: '2px',
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer'
                          }}
                        />
                        <span>
                          <strong style={{ color: '#ef4444' }}>[필수]</strong> 이용약관 동의
                          <button
                            type="button"
                            onClick={() => setShowTermsModal(true)}
                            style={{
                              marginLeft: '8px',
                              color: '#667eea',
                              textDecoration: 'underline',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '13px'
                            }}
                          >
                            상세보기
                          </button>
                        </span>
                      </label>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}>
                        <input
                          type="checkbox"
                          checked={privacyAgreed}
                          onChange={(e) => setPrivacyAgreed(e.target.checked)}
                          style={{
                            marginRight: '8px',
                            marginTop: '2px',
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer'
                          }}
                        />
                        <span>
                          <strong style={{ color: '#ef4444' }}>[필수]</strong> 개인정보 수집 및 이용 동의
                          <button
                            type="button"
                            onClick={() => setShowPrivacyModal(true)}
                            style={{
                              marginLeft: '8px',
                              color: '#667eea',
                              textDecoration: 'underline',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '13px'
                            }}
                          >
                            상세보기
                          </button>
                        </span>
                      </label>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}>
                        <input
                          type="checkbox"
                          checked={sensitiveInfoAgreed}
                          onChange={(e) => setSensitiveInfoAgreed(e.target.checked)}
                          style={{
                            marginRight: '8px',
                            marginTop: '2px',
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer'
                          }}
                        />
                        <span>
                          <strong style={{ color: '#ef4444' }}>[필수]</strong> 민감정보 처리 동의
                          <button
                            type="button"
                            onClick={() => setShowSensitiveModal(true)}
                            style={{
                              marginLeft: '8px',
                              color: '#667eea',
                              textDecoration: 'underline',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '13px'
                            }}
                          >
                            상세보기
                          </button>
                        </span>
                      </label>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}>
                        <input
                          type="checkbox"
                          checked={thirdPartyAgreed}
                          onChange={(e) => setThirdPartyAgreed(e.target.checked)}
                          style={{
                            marginRight: '8px',
                            marginTop: '2px',
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer'
                          }}
                        />
                        <span>
                          <strong style={{ color: '#ef4444' }}>[필수]</strong> 제3자 정보 제공 동의
                          <button
                            type="button"
                            onClick={() => setShowThirdPartyModal(true)}
                            style={{
                              marginLeft: '8px',
                              color: '#667eea',
                              textDecoration: 'underline',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '13px'
                            }}
                          >
                            상세보기
                          </button>
                        </span>
                      </label>
                    </div>

                    <div style={{
                      paddingTop: '16px',
                      borderTop: '1px solid #e5e7eb'
                    }}>
                      <div>
                        <label style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}>
                          <input
                            type="checkbox"
                            checked={marketingAgreed}
                            onChange={(e) => setMarketingAgreed(e.target.checked)}
                            style={{
                              marginRight: '8px',
                              marginTop: '2px',
                              width: '18px',
                              height: '18px',
                              cursor: 'pointer'
                            }}
                          />
                          <span>
                            <strong style={{ color: '#10b981' }}>[선택]</strong> 마케팅 정보 수신 동의
                            <div style={{
                              fontSize: '12px',
                              color: '#666',
                              marginTop: '4px'
                            }}>
                              프로그램 안내, 이벤트 정보를 이메일/SMS로 받을 수 있습니다.
                            </div>
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextStep}
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
                      opacity: (!termsAgreed || !privacyAgreed || !sensitiveInfoAgreed || !thirdPartyAgreed) ? 0.5 : 1
                    }}
                    disabled={!termsAgreed || !privacyAgreed || !sensitiveInfoAgreed || !thirdPartyAgreed}
                  >
                    다음 단계
                  </button>
                </div>
              )}

              {currentStep === 2 && (
                <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#333',
                      marginBottom: '8px'
                    }}>성명 *</label>
                    <input 
                      type="text" 
                      value={signupName} 
                      onChange={(e) => setSignupName(e.target.value)} 
                      placeholder="이름을 입력하세요"
                      required 
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#333',
                      marginBottom: '8px'
                    }}>이메일 *</label>
                    <input 
                      type="email" 
                      value={signupEmail} 
                      onChange={(e) => setSignupEmail(e.target.value)} 
                      placeholder="이메일을 입력하세요"
                      required 
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#333',
                      marginBottom: '8px'
                    }}>비밀번호 *</label>
                    <input 
                      type="password" 
                      value={signupPassword} 
                      onChange={(e) => setSignupPassword(e.target.value)} 
                      placeholder="8자 이상 입력하세요"
                      required
                      minLength={8}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#333',
                      marginBottom: '8px'
                    }}>전화번호 *</label>
                    <input 
                      type="text" 
                      value={signupPhone} 
                      onChange={(e) => setSignupPhone(e.target.value)} 
                      placeholder="010-1234-5678"
                      required 
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#333',
                      marginBottom: '8px'
                    }}>생년월일 *</label>
                    <input 
                      type="date" 
                      value={signupDob} 
                      onChange={(e) => {
                        setSignupDob(e.target.value);
                        checkAge(e.target.value);
                      }}
                      required 
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                    {isMinor && (
                      <div style={{
                        marginTop: '8px',
                        padding: '12px',
                        backgroundColor: '#fef3c7',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#92400e'
                      }}>
                        ⚠️ 만 14세 미만으로 법정대리인 동의가 필요합니다.
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#333',
                      marginBottom: '8px'
                    }}>성별 *</label>
                    <select
                      value={signupGender}
                      onChange={(e) => setSignupGender(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '10px',
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

                  {isMinor && (
                    <div style={{
                      padding: '20px',
                      backgroundColor: '#fef3c7',
                      borderRadius: '12px',
                      marginBottom: '20px'
                    }}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#92400e',
                        marginBottom: '16px'
                      }}>법정대리인 정보</h3>

                      <div style={{ marginBottom: '12px' }}>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#333',
                          marginBottom: '8px'
                        }}>법정대리인 성명 *</label>
                        <input 
                          type="text" 
                          value={guardianName} 
                          onChange={(e) => setGuardianName(e.target.value)} 
                          placeholder="법정대리인 이름"
                          required 
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#333',
                          marginBottom: '8px'
                        }}>법정대리인 전화번호 *</label>
                        <input 
                          type="text" 
                          value={guardianPhone} 
                          onChange={(e) => setGuardianPhone(e.target.value)} 
                          placeholder="010-1234-5678"
                          required 
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#333',
                          marginBottom: '8px'
                        }}>관계 *</label>
                        <select
                          value={guardianRelation}
                          onChange={(e) => setGuardianRelation(e.target.value)}
                          required
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        >
                          <option value="">선택하세요</option>
                          <option value="부">부</option>
                          <option value="모">모</option>
                          <option value="조부">조부</option>
                          <option value="조모">조모</option>
                          <option value="기타">기타 법정대리인</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => setGuardianVerified(true)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: guardianVerified ? '#10b981' : '#667eea',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          marginTop: '8px'
                        }}
                      >
                        {guardianVerified ? '✓ 본인인증 완료' : '법정대리인 본인인증'}
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      style={{
                        flex: 1,
                        padding: '14px',
                        backgroundColor: '#f3f4f6',
                        color: '#666',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      이전
                    </button>
                    <button
                      type="submit"
                      style={{
                        flex: 1,
                        padding: '14px',
                        backgroundColor: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      다음
                    </button>
                  </div>
                </form>
              )}

              {currentStep === 3 && (
                <div>
                  <div style={{
                    padding: '20px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    marginBottom: '20px'
                  }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#333',
                      marginBottom: '16px'
                    }}>입력하신 정보를 확인해주세요</h3>

                    <div style={{
                      fontSize: '14px',
                      lineHeight: '2',
                      color: '#555'
                    }}>
                      <p><strong>이름:</strong> {signupName}</p>
                      <p><strong>이메일:</strong> {signupEmail}</p>
                      <p><strong>전화번호:</strong> {signupPhone}</p>
                      <p><strong>생년월일:</strong> {signupDob}</p>
                      <p><strong>성별:</strong> {signupGender === 'male' ? '남성' : signupGender === 'female' ? '여성' : '기타'}</p>
                        
                      {isMinor && (
                        <>
                          <div style={{
                            marginTop: '16px',
                            paddingTop: '16px',
                            borderTop: '1px solid #e5e7eb'
                          }}>
                            <p style={{ color: '#92400e', fontWeight: '600' }}>법정대리인 정보</p>
                            <p><strong>성명:</strong> {guardianName}</p>
                            <p><strong>전화번호:</strong> {guardianPhone}</p>
                            <p><strong>관계:</strong> {guardianRelation}</p>
                            <p><strong>본인인증:</strong> {guardianVerified ? '✓ 완료' : '❌ 미완료'}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      style={{
                        flex: 1,
                        padding: '14px',
                        backgroundColor: '#f3f4f6',
                        color: '#666',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      이전
                    </button>
                    <button
                      type="button"
                      onClick={handleSignup}
                      style={{
                        flex: 1,
                        padding: '14px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      회원가입 완료
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {showTermsModal && (
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
              borderRadius: '16px',
              padding: '30px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                marginBottom: '20px',
                color: '#333'
              }}>이용약관</h2>

              <div style={{
                fontSize: '14px',
                lineHeight: '1.8',
                color: '#555'
              }}>
                <h3 style={{ fontWeight: '600', marginTop: '16px', marginBottom: '8px' }}>
                  제1조 (목적)
                </h3>
                <p>본 약관은 미추홀구청소년센터(이하 "센터")가 제공하는 서비스의 이용과 관련하여 센터와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>

                <h3 style={{ fontWeight: '600', marginTop: '16px', marginBottom: '8px' }}>
                  제2조 (서비스의 내용)
                </h3>
                <p>센터는 다음과 같은 서비스를 제공합니다.</p>
                <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                  <li>청소년 프로그램 신청 및 관리</li>
                  <li>시설 예약 및 이용</li>
                  <li>AI 기반 상담 서비스</li>
                  <li>역량검사 및 진로 추천</li>
                  <li>활동 포트폴리오 관리</li>
                </ul>

                <h3 style={{ fontWeight: '600', marginTop: '16px', marginBottom: '8px' }}>
                  제3조 (이용자의 의무)
                </h3>
                <ul style={{ paddingLeft: '20px' }}>
                  <li>이용자는 서비스 이용 시 관계 법령 및 본 약관을 준수해야 합니다.</li>
                  <li>허위 정보를 입력하거나 타인의 정보를 도용해서는 안 됩니다.</li>
                  <li>센터의 승인 없이 서비스를 영리 목적으로 사용할 수 없습니다.</li>
                </ul>

                <h3 style={{ fontWeight: '600', marginTop: '16px', marginBottom: '8px' }}>
                  제4조 (서비스의 중단)
                </h3>
                <p>센터는 다음의 경우 서비스 제공을 중단할 수 있습니다.</p>
                <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                  <li>시스템 점검, 보수, 교체 등이 필요한 경우</li>
                  <li>천재지변, 국가비상사태 등 불가항력적 사유</li>
                  <li>서비스 설비의 장애 또는 이용 폭주</li>
                </ul>

                <h3 style={{ fontWeight: '600', marginTop: '16px', marginBottom: '8px' }}>
                  제5조 (청소년 보호)
                </h3>
                <p>센터는 청소년 보호를 위해 다음 사항을 준수합니다.</p>
                <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                  <li>청소년 유해정보 차단</li>
                  <li>개인정보 보호 강화</li>
                  <li>상담 내용의 비밀 보장</li>
                  <li>만 14세 미만 법정대리인 동의 필수</li>
                </ul>

                <h3 style={{ fontWeight: '600', marginTop: '16px', marginBottom: '8px' }}>
                  제6조 (계약 해지 및 이용 제한)
                </h3>
                <ul style={{ paddingLeft: '20px' }}>
                  <li>이용자는 언제든지 회원 탈퇴를 요청할 수 있습니다.</li>
                  <li>센터는 이용자가 약관을 위반한 경우 서비스 이용을 제한할 수 있습니다.</li>
                </ul>

                <div style={{
                  marginTop: '20px',
                  padding: '16px',
                  backgroundColor: '#e0e7ff',
                  borderRadius: '8px',
                  fontSize: '13px'
                }}>
                  <strong>📌 시행일</strong>
                  <p style={{ marginTop: '8px' }}>
                    본 약관은 2025년 1월 1일부터 시행됩니다.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowTermsModal(false)}
                style={{
                  marginTop: '20px',
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                확인
              </button>
            </div>
          </div>
        )}

        {showPrivacyModal && (
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
              borderRadius: '16px',
              padding: '30px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                marginBottom: '20px',
                color: '#333'
              }}>개인정보 수집 및 이용 동의</h2>

              <div style={{
                fontSize: '14px',
                lineHeight: '1.8',
                color: '#555'
              }}>
                <h3 style={{ fontWeight: '600', marginTop: '16px', marginBottom: '8px' }}>
                  1. 개인정보의 수집 및 이용 목적
                </h3>
                <p>미추홀구청소년센터는 다음의 목적을 위하여 개인정보를 처리합니다.</p>
                <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                  <li>회원 가입 및 관리</li>
                  <li>프로그램 신청 및 운영</li>
                  <li>상담 서비스 제공</li>
                  <li>시설 이용 관리</li>
                  <li>역량검사 및 AI 기반 분석</li>
                  <li>맞춤형 서비스 제공</li>
                </ul>

                <h3 style={{ fontWeight: '600', marginTop: '16px', marginBottom: '8px' }}>
                  2. 수집하는 개인정보 항목
                </h3>
                <p><strong>필수항목:</strong> 성명, 생년월일, 성별, 이메일, 전화번호, 법정대리인 정보(만 14세 미만)</p>
                <p><strong>자동 수집:</strong> 서비스 이용 기록, 접속 로그, IP 주소</p>

                <h3 style={{ fontWeight: '600', marginTop: '16px', marginBottom: '8px' }}>
                  3. 보유 및 이용 기간
                </h3>
                <p>회원 탈퇴 시까지 보관하며, 법령에 따라 일부 정보는 별도 보관됩니다.</p>
              </div>

              <button
                onClick={() => setShowPrivacyModal(false)}
                style={{
                  marginTop: '20px',
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                확인
              </button>
            </div>
          </div>
        )}

        {showSensitiveModal && (
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
              borderRadius: '16px',
              padding: '30px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                marginBottom: '20px',
                color: '#333'
              }}>민감정보 처리 동의</h2>

              <div style={{
                fontSize: '14px',
                lineHeight: '1.8',
                color: '#555'
              }}>
                <p>상담 내역, 역량검사 결과 등 민감정보를 수집하며, 청소년 보호를 위해 특별 관리합니다.</p>
              </div>

              <button
                onClick={() => setShowSensitiveModal(false)}
                style={{
                  marginTop: '20px',
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                확인
              </button>
            </div>
          </div>
        )}

        {showThirdPartyModal && (
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
              borderRadius: '16px',
              padding: '30px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                marginBottom: '20px',
                color: '#333'
              }}>제3자 정보 제공 동의</h2>

              <div style={{
                fontSize: '14px',
                lineHeight: '1.8',
                color: '#555'
              }}>
                <p>진로교육센터, 청소년상담복지센터 등 연계 기관에 필요한 정보를 제공합니다.</p>
              </div>

              <button
                onClick={() => setShowThirdPartyModal(false)}
                style={{
                  marginTop: '20px',
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                확인
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e8f0fe 0%, #f3e8ff 100%)',
      overflowY: 'auto',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: '50px',
        right: '100px',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(102,126,234,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '100px',
        left: '50px',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px 20px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '60px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Image 
              src={logoImage}
              alt="Logo"
              width={80}
              height={80}
              style={{ objectFit: 'contain' }}
            />
            <div>
              <h1 style={{
                fontSize: '42px',
                fontWeight: '900',
                margin: 0,
                color: '#1a1a2e',
                lineHeight: '1.2'
              }}>청소년 키오스크<br/></h1>
              <p style={{
                fontSize: '16px',
                color: '#667eea',
                margin: '8px 0 0 0',
                fontWeight: '600'
              }}>미추홀구청소년센터</p>
            </div>
          </div>

          <div 
            onClick={() => {
              console.log('마이페이지 클릭!');
              setShowMyPageModal(true);
            }}
            style={{
              backgroundColor: 'white',
              padding: '16px 24px',
              borderRadius: '20px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              color: 'white',
              fontWeight: '700'
            }}>
              {user?.name ? user.name.charAt(0) : '?'}
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#999', marginBottom: '4px' }}>
                안녕하세요!
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a2e' }}>
                {user?.name || '회원'}님 →
              </div>
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '30px',
          marginBottom: '30px'
        }}>
          <Link href="/chat" style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '30px',
              padding: '40px',
              textAlign: 'center',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '3px solid transparent',
              minHeight: '350px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Image src={robotAI} alt="AI 상담" width={150} height={150} style={{ objectFit: 'contain', marginBottom: '20px' }} />
              <h3 style={{ fontSize: '28px', fontWeight: '700', color: '#667eea', margin: '0 0 12px 0' }}>
                AI 상담
              </h3>
              <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.6', margin: 0 }}>
                AI와 함께하는<br/>맞춤형 진로상담
              </p>
            </div>
          </Link>

          <Link href="/recommend" style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '30px',
              padding: '40px',
              textAlign: 'center',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '3px solid transparent',
              minHeight: '350px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Image src={robotProgram} alt="AI 프로그램 추천" width={150} height={150} style={{ objectFit: 'contain', marginBottom: '20px' }} />
              <h3 style={{ fontSize: '28px', fontWeight: '700', color: '#3b82f6', margin: '0 0 12px 0' }}>
                AI 프로그램 추천
              </h3>
              <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.6', margin: 0 }}>
                AI가 추천하는<br/>나만의 프로그램
              </p>
            </div>
          </Link>

          <Link href="/facilities" style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '30px',
              padding: '40px',
              textAlign: 'center',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '3px solid transparent',
              minHeight: '350px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Image src={robotFacility} alt="시설예약" width={150} height={150} style={{ objectFit: 'contain', marginBottom: '20px' }} />
              <h3 style={{ fontSize: '28px', fontWeight: '700', color: '#10b981', margin: '0 0 12px 0' }}>
                시설예약
              </h3>
              <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.6', margin: 0 }}>
                센터 시설<br/>간편 예약하기
              </p>
            </div>
          </Link>

          <Link href="/survey" style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '30px',
              padding: '40px',
              textAlign: 'center',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '3px solid transparent',
              minHeight: '350px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Image src={robotSurvey} alt="설문조사" width={150} height={150} style={{ objectFit: 'contain', marginBottom: '20px' }} />
              <h3 style={{ fontSize: '28px', fontWeight: '700', color: '#ec4899', margin: '0 0 12px 0' }}>
                설문조사
              </h3>
              <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.6', margin: 0 }}>
                여러분의 의견을<br/>들려주세요
              </p>
            </div>
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <Link href="/about" style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '25px',
              textAlign: 'center',
              boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '2px solid transparent'
            }}>
              <div style={{ fontSize: '50px', marginBottom: '10px' }}></div>
              <h4 style={{ fontSize: '20px', fontWeight: '700', color: '#667eea', margin: '0 0 5px 0' }}>
                센터소개
              </h4>
              <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>
                센터 정보 보기
              </p>
            </div>
          </Link>

          <Link href="/partners" style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '25px',
              textAlign: 'center',
              boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '2px solid transparent'
            }}>
              <div style={{ fontSize: '50px', marginBottom: '10px' }}></div>
              <h4 style={{ fontSize: '20px', fontWeight: '700', color: '#8b5cf6', margin: '0 0 5px 0' }}>
                기관연계
              </h4>
              <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>
                협력 기관 안내
              </p>
            </div>
          </Link>
        </div>
      </div>

      {showMyPageModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '0',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* 헤더 */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1a1a2e',
                margin: 0
              }}>
                마이페이지
              </h3>
              <button
                onClick={() => {
                  setShowMyPageModal(false);
                  setMyPageTab('info');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  color: '#999',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            {/* 탭 메뉴 */}
            <div style={{
              display: 'flex',
              borderBottom: '2px solid #f3f4f6',
              flexShrink: 0,
              overflowX: 'auto'
            }}>
              {[
                { key: 'info', label: '내 정보', icon: '👤' },
                { key: 'programs', label: '프로그램', icon: '📋' },
                { key: 'bookings', label: '시설예약', icon: '🏢' },
                { key: 'counseling', label: '상담내역', icon: '💬' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setMyPageTab(tab.key as any)}
                  style={{
                    flex: 1,
                    minWidth: '100px',
                    padding: '12px 8px',
                    backgroundColor: myPageTab === tab.key ? 'white' : 'transparent',
                    color: myPageTab === tab.key ? '#667eea' : '#999',
                    border: 'none',
                    borderBottom: myPageTab === tab.key ? '3px solid #667eea' : '3px solid transparent',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <div style={{ fontSize: '20px' }}>{tab.icon}</div>
                  <div style={{ fontSize: '11px', marginTop: '4px' }}>{tab.label}</div>
                </button>
              ))}
            </div>

            {/* 컨텐츠 영역 */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px'
            }}>
              {/* 내 정보 탭 */}
              {myPageTab === 'info' && (
                <div>
                  <div style={{
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>이름</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>{user?.name}</div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>이메일</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>{user?.email}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>전화번호</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>{user?.phoneNumber || '미등록'}</div>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: '14px',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    로그아웃
                  </button>
                </div>
              )}

              {/* 프로그램 신청 내역 */}
              {myPageTab === 'programs' && (
                <div>
                  {isLoadingMyData ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                      로딩 중...
                    </div>
                  ) : myApplications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                      신청한 프로그램이 없습니다.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {myApplications.map((app) => (
                        <div
                          key={app.id}
                          style={{
                            backgroundColor: '#f9fafb',
                            borderRadius: '12px',
                            padding: '16px',
                            border: '1px solid #e5e7eb'
                          }}
                        >
                          <h4 style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color: '#667eea',
                            marginBottom: '4px'
                          }}>
                            {app.program?.title || '프로그램'}
                          </h4>
                          <p style={{
                            fontSize: '13px',
                            color: '#666',
                            marginBottom: '12px'
                          }}>
                            {app.program?.department || '청소년센터'}
                          </p>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '12px',
                            color: '#999'
                          }}>
                            <span>신청일: {new Date(app.created_at).toLocaleDateString()}</span>
                            <button
                              onClick={() => cancelApplication(app.id)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#fee2e2',
                                color: '#dc2626',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 시설 예약 내역 */}
              {myPageTab === 'bookings' && (
                <div>
                  {isLoadingMyData ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                      로딩 중...
                    </div>
                  ) : myBookings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                      예약 내역이 없습니다.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {myBookings.map((booking) => (
                        <div
                          key={booking.id}
                          style={{
                            backgroundColor: '#f9fafb',
                            borderRadius: '12px',
                            padding: '16px',
                            border: '1px solid #e5e7eb'
                          }}
                        >
                          <h4 style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color: '#10b981',
                            marginBottom: '4px'
                          }}>
                            {booking.facility?.name || '시설'}
                          </h4>
                          <p style={{
                            fontSize: '13px',
                            color: '#666',
                            marginBottom: '12px'
                          }}>
                            {booking.date.split('T')[0]} / {booking.time_slot}
                          </p>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end'
                          }}>
                            <button
                              onClick={() => cancelBooking(booking.id)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#fee2e2',
                                color: '#dc2626',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 상담 내역 */}
              {myPageTab === 'counseling' && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  상담 내역 기능은 준비 중입니다.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}