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

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
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

      const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:3001'
        : 'https://youth-center-platform.onrender.com';

      const response = await fetch(`${API_URL}/api/ai/chat`, {
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

  return (
    <div style={{
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* 헤더 */}
      <div style={{
        backgroundColor: '#667eea',
        color: 'white',
        padding: '16px 20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        flexShrink: 0
      }}>
        <h1 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
          💬 AI 상담사 미추
        </h1>
      </div>

      {/* 채팅 영역 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '16px',
        paddingBottom: '16px'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              justifyContent: message.isUser ? 'flex-end' : 'flex-start',
              marginBottom: '12px'
            }}
          >
            <div style={{
              maxWidth: message.isUser ? '240px' : '280px',
              padding: '12px 16px',
              borderRadius: message.isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              backgroundColor: message.isUser ? '#667eea' : 'white',
              color: message.isUser ? 'white' : '#333',
              fontSize: '14px',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              {message.text}
            </div>
          </div>
        ))}
        
        {isLoading && (
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

      {/* 입력창 */}
      <div style={{
        backgroundColor: 'white',
        padding: '12px 16px',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder="메시지 입력..."
            disabled={isLoading}
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
            onClick={handleSend}
            disabled={isLoading || !inputText.trim()}
            style={{
              padding: '12px 20px',
              backgroundColor: isLoading || !inputText.trim() ? '#e5e7eb' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '24px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isLoading || !inputText.trim() ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            전송
          </button>
        </div>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'center',
            padding: '8px',
            color: '#667eea',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: '600',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          ← 홈으로
        </button>
      </div>
    </div>
  );
}