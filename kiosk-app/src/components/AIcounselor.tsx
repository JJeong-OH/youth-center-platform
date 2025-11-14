'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { sendMessageToCounselor } from '../services/geminiService';
import type { ChatMessage } from '../types/types';
import { UserIcon, ChatBotIcon, SendIcon, LoadingIcon, CheckCircleIcon, InfoIcon } from './Icons';

const FacilityBookingModal: React.FC<{ facilityName: string; onConfirm: () => void; onCancel: () => void; }> = ({ facilityName, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/30 max-w-sm w-full text-center text-slate-800">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">시설 예약 확인</h2>
            {/* ⬇️ facilityName을 props로 직접 받아서 사용 (수정됨) */}
            <p className="text-slate-600 mb-6">'{facilityName}' 시설을 오늘 날짜로 예약하시겠습니까?</p>
            <div className="flex justify-center gap-4">
                <button onClick={onCancel} className="px-6 py-2 rounded-lg bg-slate-300 hover:bg-slate-400 text-slate-800 font-semibold transition-colors">취소</button>
                <button onClick={onConfirm} className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors">확인</button>
            </div>
        </div>
    </div>
);

export const AICounselor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '안녕하세요! 무엇을 도와드릴까요? 고민이나 궁금한 점, 센터 시설 예약에 대해 편하게 물어보세요.' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // ⬇️ state에 facilityName을 추가합니다. (수정됨)
  const [bookingRequest, setBookingRequest] = useState<{ facilityId: string, userName: string, facilityName: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessageToCounselor(userMessage.text);
      if (response.functionCalls && response.functionCalls.length > 0) {
        const fc = response.functionCalls[0];
        // ⬇️ AI가 facilityName도 반환하는지 확인합니다. (수정됨)
        if (fc.name === 'bookFacility' && fc.args.facilityId && fc.args.userName && fc.args.facilityName) {
             // ⬇️ state에 facilityName도 저장합니다. (수정됨)
             setBookingRequest({ 
               facilityId: fc.args.facilityId, 
               userName: fc.args.userName,
               facilityName: fc.args.facilityName 
             });
        }
      }

      if (response.text) {
        const modelMessage: ChatMessage = { role: 'model', text: response.text };
        setMessages(prev => [...prev, modelMessage]);
      }
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = { role: 'model', text: '죄송합니다. 오류가 발생했어요. 잠시 후 다시 시도해주세요.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  const confirmBooking = () => {
    if (!bookingRequest) return;
    // ⬇️ YOUTH_FACILITIES.find() 코드를 삭제합니다. (수정됨)
    const systemMessage: ChatMessage = {
        role: 'system',
        // ⬇️ state에 저장된 facilityName을 바로 사용합니다. (수정됨)
        text: `${bookingRequest.userName}님의 '${bookingRequest.facilityName || '시설'}' 예약이 완료되었습니다. (예약일: 오늘)`
    };
    setMessages(prev => [...prev, systemMessage]);
    setBookingRequest(null);
  };

  const cancelBooking = () => {
    const systemMessage: ChatMessage = {
        role: 'system',
        text: '시설 예약이 취소되었습니다.'
    };
    setMessages(prev => [...prev, systemMessage]);
    setBookingRequest(null);
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl md:text-3xl font-bold text-indigo-600 mb-4 px-2">AI 고민 상담</h2>
      <div className="flex-grow overflow-y-auto p-2 space-y-6 custom-scrollbar">
        {messages.map((msg, index) => {
          if (msg.role === 'system') {
            return (
              <div key={index} className="flex items-center gap-3 text-sm text-slate-500 justify-center">
                 <div className="w-5 h-5"><InfoIcon /></div>
                 <span>{msg.text}</span>
              </div>
            )
          }
          return (
            <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 shadow-lg"><ChatBotIcon className="w-6 h-6 text-white"/></div>}
               <div className={`max-w-md md:max-w-lg px-5 py-3 rounded-2xl shadow-md ${
                  msg.role === 'user' ? 'bg-gradient-to-br from-pink-500 to-orange-400 text-white rounded-br-none' :
                  'bg-white rounded-bl-none text-slate-700'
                }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
              {msg.role === 'user' && <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center flex-shrink-0 shadow-lg"><UserIcon className="w-6 h-6 text-slate-600"/></div>}
            </div>
        )})}
         {isLoading && (
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 shadow-lg"><ChatBotIcon className="w-6 h-6 text-white"/></div>
                <div className="max-w-lg px-5 py-3 rounded-2xl bg-white rounded-bl-none flex items-center shadow-md">
                    <LoadingIcon className="w-6 h-6 text-indigo-500" />
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-4 p-2">
        <div className="flex items-center bg-white/50 backdrop-blur-lg rounded-xl p-2 border border-white/30 focus-within:ring-2 focus-within:ring-indigo-500 shadow-sm">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="메시지를 입력하세요..."
            className="w-full bg-transparent p-2 text-lg focus:outline-none placeholder-slate-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || input.trim() === ''}
            className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed transition-all duration-200 transform active:scale-95 shadow-md"
          >
            <SendIcon className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
      {bookingRequest && (
        <FacilityBookingModal
            // ⬇️ YOUTH_FACILITIES.find() 대신 state의 facilityName을 직접 전달합니다. (수정됨)
            facilityName={bookingRequest.facilityName}
            onConfirm={confirmBooking}
            onCancel={cancelBooking}
        />
      )}
    </div>
  );
};