'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Program {
  id: number;
  title: string;
  department?: string;
  targetAudience?: string;
  fee: number;
  description?: string;
  imageUrl?: string;
}

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function KioskProgramsPage() {
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [recommendedIds, setRecommendedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // AI 채팅 상태
  const [showAI, setShowAI] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/kiosk/programs');
      const data = await response.json();
      
      if (data.success) {
        setPrograms(data.data);
        setFilteredPrograms(data.data);
      }
    } catch (error) {
      console.error('프로그램 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // AI 채팅 열기
  const handleOpenAI = () => {
    setShowAI(true);
    if (messages.length === 0) {
      const greeting: Message = {
        id: 1,
        text: '안녕하세요! 어떤 활동에 관심이 있으신가요? 대화를 통해 프로그램을 추천해드릴게요! 😊',
        isUser: false,
        timestamp: new Date()
      };
      setMessages([greeting]);
    }
  };

  // AI 메시지 전송
  const handleSendAI = async () => {
    if (!inputText.trim() || isAILoading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputText;
    setInputText('');
    setIsAILoading(true);

    try {
      const sessionId = `kiosk_recommend_${Date.now()}`;
      
      const response = await fetch('http://localhost:3001/api/ai/recommend-programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: messageText,
          sessionId: sessionId
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.reply || 'AI 추천 실패');
      }

      const aiMessage: Message = {
        id: messages.length + 2,
        text: data.reply || '응답을 받지 못했습니다.',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // 추천된 프로그램 필터링
      if (data.recommendedPrograms && data.recommendedPrograms.length > 0) {
        setRecommendedIds(data.recommendedPrograms);
        const recommended = programs.filter(p => 
          data.recommendedPrograms.includes(p.id)
        );
        setFilteredPrograms(recommended);
      }

    } catch (error: any) {
      console.error('AI 추천 오류:', error);

      const errorMessage: Message = {
        id: messages.length + 2,
        text: '죄송합니다. 추천 중 오류가 발생했습니다. 다시 시도해주세요.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAILoading(false);
    }
  };

  // 전체 프로그램 보기
  const handleShowAll = () => {
    setFilteredPrograms(programs);
    setRecommendedIds([]);
  };

  // 프로그램 신청
  const handleApply = (program: Program) => {
    // 신청 페이지로 이동
    router.push(`/kiosk/programs/${program.id}/apply`);
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        로딩 중...
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh',
      fontFamily: 'sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      {/* 왼쪽: AI 채팅 */}
      <div style={{ 
        width: showAI ? '45%' : '0%',
        transition: 'width 0.3s',
        overflow: 'hidden',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {showAI && (
          <>
            {/* AI 채팅 헤더 */}
            <div style={{
              padding: '20px',
              borderBottom: '2px solid #667eea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '32px' }}>🤖</span>
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px', color: '#667eea' }}>
                    AI 추천 채팅
                  </h2>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                    관심사를 알려주세요!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAI(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#999'
                }}
              >
                ✕
              </button>
            </div>

            {/* 채팅 영역 */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              backgroundColor: '#f5f5f5'
            }}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    flexDirection: message.isUser ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',
                    gap: '10px'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '15px',
                      borderRadius: '20px',
                      backgroundColor: message.isUser ? '#667eea' : '#fff',
                      color: message.isUser ? '#fff' : '#000',
                      fontSize: '16px',
                      lineHeight: '1.5',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {isAILoading && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div style={{
                    padding: '15px',
                    borderRadius: '20px',
                    backgroundColor: '#fff',
                    color: '#999',
                    fontSize: '16px'
                  }}>
                    추천하는 중...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* 입력 영역 */}
            <div style={{
              padding: '20px',
              borderTop: '1px solid #ddd',
              backgroundColor: '#fff',
              display: 'flex',
              gap: '10px',
              alignItems: 'center'
            }}>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isAILoading && handleSendAI()}
                placeholder="관심사를 입력하세요..."
                disabled={isAILoading}
                style={{
                  flex: 1,
                  padding: '15px',
                  borderRadius: '25px',
                  border: '2px solid #667eea',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleSendAI}
                disabled={isAILoading || !inputText.trim()}
                style={{
                  padding: '15px 30px',
                  borderRadius: '25px',
                  border: 'none',
                  backgroundColor: isAILoading || !inputText.trim() ? '#ccc' : '#667eea',
                  color: '#fff',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: isAILoading || !inputText.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                ➤
              </button>
            </div>
          </>
        )}
      </div>

      {/* 오른쪽: 프로그램 목록 */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '40px',
        overflowY: 'auto'
      }}>
        {/* 헤더 */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: '48px', 
            margin: '0 0 10px 0', 
            color: '#fff',
            fontWeight: 'bold'
          }}>
            프로그램 추천/신청
          </h1>
          <div style={{ 
            display: 'flex', 
            gap: '15px',
            marginTop: '20px'
          }}>
            <button
              onClick={handleOpenAI}
              style={{
                padding: '15px 30px',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#fff',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: '2px solid #fff',
                borderRadius: '15px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              🤖 AI 추천/신청
            </button>
            <button
              onClick={handleShowAll}
              style={{
                padding: '15px 30px',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#667eea',
                backgroundColor: '#fff',
                border: '2px solid #fff',
                borderRadius: '15px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}
            >
              📋 신청 현황 확인
            </button>
          </div>
        </div>

        {/* 프로그램 섹션 */}
        <div>
          <h2 style={{ 
            fontSize: '32px', 
            color: '#fff', 
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            {recommendedIds.length > 0 ? (
              <>
                🎯 AI 추천 프로그램
                <span style={{ 
                  fontSize: '18px', 
                  fontWeight: 'normal',
                  opacity: 0.8 
                }}>
                  ({filteredPrograms.length}개)
                </span>
              </>
            ) : (
              '전체 프로그램 보기'
            )}
          </h2>

          {/* 프로그램 그리드 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px'
          }}>
            {filteredPrograms.map((program) => (
              <div
                key={program.id}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '20px',
                  padding: '25px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px'
                }}
              >
                {/* 프로그램 제목 */}
                <div>
                  <h3 style={{ 
                    fontSize: '24px', 
                    margin: '0 0 10px 0',
                    color: '#333'
                  }}>
                    {program.title}
                  </h3>
                  <div style={{ 
                    display: 'flex',
                    gap: '10px',
                    flexWrap: 'wrap'
                  }}>
                    {program.department && (
                      <span style={{
                        padding: '5px 12px',
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2',
                        borderRadius: '12px',
                        fontSize: '14px'
                      }}>
                        {program.department}
                      </span>
                    )}
                    <span style={{
                      padding: '5px 12px',
                      backgroundColor: program.fee === 0 ? '#e8f5e9' : '#fff3e0',
                      color: program.fee === 0 ? '#388e3c' : '#f57c00',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      {program.fee === 0 ? '무료' : `${program.fee.toLocaleString()}원`}
                    </span>
                  </div>
                </div>

                {/* 프로그램 설명 */}
                {program.description && (
                  <p style={{
                    fontSize: '16px',
                    color: '#666',
                    lineHeight: '1.6',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {program.description}
                  </p>
                )}

                {/* 신청 버튼 */}
                <button
                  onClick={() => handleApply(program)}
                  style={{
                    padding: '15px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#fff',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    marginTop: 'auto'
                  }}
                >
                  신청하기
                </button>
              </div>
            ))}
          </div>

          {filteredPrograms.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              color: '#fff',
              fontSize: '20px'
            }}>
              프로그램이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}