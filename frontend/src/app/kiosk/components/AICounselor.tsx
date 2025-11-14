'use client';

import React, { useState, useRef, useEffect } from 'react';

// 메시지 타입을 정의합니다.
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

// AI 응답을 흉내 내는 가짜 함수 (나중에 Gemini API로 교체)
const getFakeAiResponse = (userMessage: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`"${userMessage}" 라고 말씀하셨네요. 저는 AI 상담사입니다. 무엇이든 편하게 이야기해주세요.`);
    }, 1000); // 1초 딜레이
  });
};

// AICounselor 컴포넌트 (default export)
export default function AICounselor() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 로봇 아이콘 SVG
  const RobotIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM9 9.75a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5H9Zm.75 4.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5Z" clipRule="evenodd" />
      <path d="M12 1.5a10.5 10.5 0 1 0 0 21 10.5 10.5 0 0 0 0-21ZM3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0Z" />
    </svg>
  );

  // 메시지 목록이 변경될 때마다 맨 아래로 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 첫 방문 시 환영 메시지
  useEffect(() => {
    setMessages([
      { id: 1, text: '안녕하세요! 저는 마음을 들어주는 AI 상담사입니다. 어떤 이야기든 편하게 해주세요.', sender: 'ai' }
    ]);
  }, []);

  // 메시지 전송 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // AI 응답 (지금은 가짜)
    const aiResponseText = await getFakeAiResponse(input);
    
    const aiMessage: Message = {
      id: Date.now() + 1,
      text: aiResponseText,
      sender: 'ai',
    };

    setMessages((prev) => [...prev, aiMessage]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* 채팅 메시지 영역 */}
      <div className="flex-grow overflow-y-auto space-y-4 p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center flex-shrink-0">
                <RobotIcon className="w-5 h-5" />
              </div>
            )}
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-purple-600 text-white rounded-br-none'
                  : 'bg-white border border-gray-200 text-slate-800 rounded-bl-none'
              }`}
            >
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        {/* 로딩 인디케이터 */}
        {isLoading && (
          <div className="flex items-end gap-2 justify-start">
            <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center flex-shrink-0">
              <RobotIcon className="w-5 h-5" />
            </div>
            <div className="p-3 rounded-2xl bg-white border border-gray-200 text-slate-500 rounded-bl-none">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-300"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 영역 */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isLoading ? "AI가 답변 중입니다..." : "메시지를 입력하세요..."}
            disabled={isLoading}
            className="flex-grow px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.941l18-8.25a.75.75 0 0 0 0-1.39l-18-8.25Z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}