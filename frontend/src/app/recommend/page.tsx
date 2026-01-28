'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Program {
  id: number;
  title: string;
  department: string | null;
  description: string | null;
  targetAudience: string | null;
  fee: number;
}

interface User {
  userId: number;
  email: string;
  name: string;
  phoneNumber?: string;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  programs?: Program[];
}

const API_URL = 'http://localhost:3001/api';

export default function RecommendPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [user, setUser] = useState<User | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '안녕! 😊 어떤 활동에 관심이 있어? 편하게 얘기해줘!' }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/');
      return;
    }

    fetch(`${API_URL}/auth/profile`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.ok ? res.json() : null)
    .then(data => data && setUser(data))
    .catch(() => console.warn('프로필 로드 실패'));

    fetch(`${API_URL}/kiosk/programs`)
      .then(res => res.json())
      .then(data => {
        const programList = Array.isArray(data) ? data : (data.programs || []);
        setPrograms(programList);
      })
      .catch(() => {});
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isSending) return;

    const userMessage = input.trim();
    setInput('');
    setIsSending(true);
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await fetch(`${API_URL}/kiosk/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionId: `mobile-${Date.now()}`,
          type: 'recommender',
          programs: programs
        })
      });

      if (!response.ok) throw new Error('AI 응답 실패');

      const data = await response.json();
      const aiResponse = data.data?.text || '응답을 생성할 수 없습니다.';
      const recommendedIds = data.data?.recommendedPrograms || [];

      if (recommendedIds.length > 0) {
        const recommendedPrograms = programs.filter(p => recommendedIds.includes(p.id));
        setMessages(prev => [
          ...prev, 
          { role: 'assistant', content: aiResponse },
          { role: 'assistant', content: '', programs: recommendedPrograms }
        ]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: '오류가 발생했습니다.' 
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const submitApplication = async () => {
    if (!selectedProgram || !user) return;

    try {
      const response = await fetch(`${API_URL}/kiosk/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: selectedProgram.id,
          userName: user.name,
          phone: user.phoneNumber?.replace(/-/g, '') || ''
        })
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      setSelectedProgram(null);
      setShowSuccessModal(true);
      setMessages(prev => [...prev, {
        role: 'system',
        content: `✅ '${selectedProgram.title}' 신청 완료!`
      }]);
    } catch (error: any) {
      alert(error.message || '신청 실패');
    }
  };

  return (
    <div style={{
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div style={{
        backgroundColor: '#667eea',
        color: 'white',
        padding: '16px 20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        flexShrink: 0
      }}>
        <h1 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
          🎯 AI 프로그램 추천
        </h1>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '16px',
        paddingBottom: '16px'
      }}>
        {messages.map((msg, idx) => (
          <div key={idx}>
            {!msg.programs && msg.content && (
              <div style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '12px'
              }}>
                {msg.role === 'system' ? (
                  <div style={{
                    padding: '8px',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#0369a1',
                    fontWeight: '500',
                    maxWidth: '280px',
                    margin: '0 auto',
                    wordBreak: 'break-word'
                  }}>
                    {msg.content}
                  </div>
                ) : (
                  <div style={{
                    maxWidth: msg.role === 'user' ? '240px' : '280px',
                    padding: '12px 16px',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    backgroundColor: msg.role === 'user' ? '#667eea' : 'white',
                    color: msg.role === 'user' ? 'white' : '#333',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    {msg.content}
                  </div>
                )}
              </div>
            )}

            {msg.programs && msg.programs.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                {msg.programs.map(prog => (
                  <div key={prog.id} style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '12px',
                    marginBottom: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    maxWidth: '280px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#1a1a2e',
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {prog.title}
                    </div>
                    <div style={{
                      fontSize: '10px',
                      fontWeight: '600',
                      color: '#667eea',
                      marginBottom: '6px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {prog.department || '청소년센터'}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#666',
                      lineHeight: '1.4',
                      marginBottom: '8px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      wordBreak: 'break-word'
                    }}>
                      {prog.description}
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '4px',
                      marginBottom: '8px',
                      flexWrap: 'wrap'
                    }}>
                      {prog.targetAudience && (
                        <span style={{
                          fontSize: '9px',
                          padding: '3px 6px',
                          borderRadius: '8px',
                          backgroundColor: '#dbeafe',
                          color: '#1e40af',
                          fontWeight: '600',
                          whiteSpace: 'nowrap'
                        }}>
                          {prog.targetAudience}
                        </span>
                      )}
                      <span style={{
                        fontSize: '9px',
                        padding: '3px 6px',
                        borderRadius: '8px',
                        backgroundColor: '#dcfce7',
                        color: '#166534',
                        fontWeight: '600',
                        whiteSpace: 'nowrap'
                      }}>
                        {prog.fee === 0 ? '무료' : `${prog.fee.toLocaleString()}원`}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedProgram(prog)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        backgroundColor: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      신청하기
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {isSending && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: '12px'
          }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '18px 18px 18px 4px',
              backgroundColor: 'white',
              fontSize: '14px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              ...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '12px 16px',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="메시지 입력..."
            disabled={isSending}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '24px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={isSending || !input.trim()}
            style={{
              padding: '12px 20px',
              backgroundColor: isSending || !input.trim() ? '#e5e7eb' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '24px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isSending || !input.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            전송
          </button>
        </div>
        <Link href="/" style={{
          display: 'block',
          textAlign: 'center',
          padding: '8px',
          color: '#667eea',
          textDecoration: 'none',
          fontSize: '13px',
          fontWeight: '600'
        }}>
          ← 홈으로
        </Link>
      </div>

      {selectedProgram && user && (
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
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '400px'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>
              신청 확인
            </h3>
            <div style={{
              padding: '16px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              <p style={{ marginBottom: '8px' }}><strong>신청자:</strong> {user.name}</p>
              <p style={{ marginBottom: '12px' }}><strong>연락처:</strong> {user.phoneNumber}</p>
              <p style={{ 
                fontSize: '15px',
                fontWeight: '600',
                color: '#667eea',
                paddingTop: '12px',
                borderTop: '1px solid #e5e7eb'
              }}>
                '{selectedProgram.title}'
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setSelectedProgram(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#f3f4f6',
                  color: '#666',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={submitApplication}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                신청
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
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
            borderRadius: '16px',
            padding: '32px',
            width: '100%',
            maxWidth: '350px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
              신청 완료!
            </h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
              프로그램 신청이 완료되었습니다.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}