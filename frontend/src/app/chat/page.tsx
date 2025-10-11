'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatPage() {
  const greetingMessages = [
    '왔구나! 기다리고 있었어 :) 어떤 이야기 해볼까?',
    '헬로~ 나 불렀지? 뭐든 얘기해줘!',
    '불러줘서 고마워! 나는 미추야 :) 편하게 말 걸어줘.',
    '응, 나 여기 있어. 무슨 얘기든 괜찮아~',
    '좋아, 우리 얘기 한번 해보자! 어떤 고민이 있어?',
    '미추 소환 완료✨ 뭐가 궁금한지 말해줘!',
    '고민 있어? 아니면 그냥 수다? 다 좋아~',
    '너를 위해 대기 중이었지! 자, 말해봐~',
    '잘 왔어! 나랑 같이 이야기해보자 :)',
    '어떤 일이 있었는지 궁금한데? 천천히 말해줘~'
  ];

  const getRandomGreeting = () => {
    const index = Math.floor(Math.random() * greetingMessages.length);
    return greetingMessages[index];
  };

  // 초기에는 빈 배열로 시작
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // 클라이언트에서만 랜덤 인삿말 추가
    const initialMessage: Message = {
      id: 1,
      text: getRandomGreeting(),
      isUser: false,
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      const response = await fetch('http://localhost:3000/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: messageText })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'AI 응답 실패');
      }

      const aiMessage: Message = {
        id: messages.length + 2,
        text: data.reply || '응답을 받지 못했습니다.',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error: any) {
      console.error('AI 응답 오류:', error);

      const errorMessage: Message = {
        id: messages.length + 2,
        text: error.message === '로그인이 필요합니다.'
          ? '로그인이 필요합니다. 메인 페이지로 돌아가서 로그인해주세요.'
          : '죄송합니다. 응답 중 오류가 발생했습니다. 다시 시도해주세요.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-page-container">
      {/* 헤더 */}
      <div style={{
        backgroundColor: '#f9f9f9',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #ddd'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              fontSize: '24px'
            }}
          >
            ←
          </button>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>AI 상담사 미추</div>
            <div style={{ fontSize: '12px', color: '#999' }}>미추홀구청소년센터</div>
          </div>
        </div>
        <button
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            fontSize: '24px',
            color: '#666'
          }}
        >
          ☰
        </button>
      </div>

      {/* 채팅 영역 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        backgroundColor: '#b2c7d9'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              flexDirection: message.isUser ? 'row-reverse' : 'row',
              alignItems: 'flex-end',
              gap: '6px'
            }}
          >
            <div
              style={{
                maxWidth: '70%',
                padding: '10px 14px',
                borderRadius: '18px',
                backgroundColor: message.isUser ? '#fee500' : '#fff',
                color: '#000',
                fontSize: '15px',
                lineHeight: '1.4',
                wordBreak: 'break-word',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              {message.text}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#666',
              whiteSpace: 'nowrap'
            }}>
              {formatTime(message.timestamp)}
            </div>
          </div>
        ))}
        
        {/* 로딩 표시 */}
        {isLoading && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '6px'
          }}>
            <div style={{
              padding: '10px 14px',
              borderRadius: '18px',
              backgroundColor: '#fff',
              color: '#999',
              fontSize: '15px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              답변을 작성중입니다...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div style={{
        backgroundColor: '#fff',
        padding: '12px 16px',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        borderTop: '1px solid #ddd'
      }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
          placeholder="메시지를 입력하세요"
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '20px',
            border: '1px solid #ddd',
            fontSize: '15px',
            outline: 'none',
            opacity: isLoading ? 0.6 : 1
          }}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !inputText.trim()}
          style={{
            backgroundColor: isLoading || !inputText.trim() ? '#ccc' : '#fee500',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isLoading || !inputText.trim() ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.2s',
            fontSize: '20px'
          }}
          onMouseEnter={(e) => !isLoading && inputText.trim() && (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          ➤
        </button>
      </div>
    </div>
  );
}