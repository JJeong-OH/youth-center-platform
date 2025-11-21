'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { sendMessageToRecommender } from '../services/geminiService';
import { getPrograms, getApplications, addApplication as addApplicationService, deleteApplication as deleteApplicationService } from '../services/googleSheetsService';
import type { ChatMessage, Program, ProgramApplication } from '../types/types';
import { UserIcon, ChatBotIcon, SendIcon, LoadingIcon, CheckCircleIcon, XCircleIcon, InfoIcon, SparklesIcon, TicketIcon, ClipboardListIcon, PhoneIcon } from './Icons';
import { BackButton } from './BackButton';

const ProgramApplicationModal: React.FC<{
  program: Program | null;
  onConfirm: (details: { userName: string; phoneNumber: string; pin: string }) => Promise<void>;
  onCancel: () => void;
}> = ({ program, onConfirm, onCancel }) => {
    const [userName, setUserName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [pin, setPin] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!program) return null;

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (userName.trim().length < 2 || !/^[가-힣]{2,}$/.test(userName.trim())) {
            newErrors.userName = '유효한 한글 이름(2자 이상)을 입력해주세요.';
        }
        if (!/^\d{10,11}$/.test(phoneNumber.replace(/-/g, ''))) {
            newErrors.phoneNumber = '유효한 전화번호 10-11자리를 입력해주세요.';
        }
        if (!/^\d{4}$/.test(pin)) {
            newErrors.pin = '신청내역 확인에 사용할 비밀번호 4자리를 입력해주세요.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleConfirm = async () => {
        if (validate()) {
            setIsSubmitting(true);
            try {
                await onConfirm({ 
                    userName: userName.trim(),
                    phoneNumber: phoneNumber.replace(/-/g, ''),
                    pin
                });
            } finally {
                setIsSubmitting(false);
            }
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/30 max-w-sm w-full text-slate-800">
                <SparklesIcon className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">프로그램 신청</h2>
                <p className="text-slate-600 mb-6">'{program.title}' 프로그램에 신청하시려면 아래 정보를 입력해주세요.</p>
                <div className="space-y-3">
                    <div>
                        <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="이름 (한글 2자 이상)" className={`w-full bg-white/70 rounded-lg p-3 border ${errors.userName ? 'border-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-indigo-500 focus:outline-none`} />
                        {errors.userName && <p className="text-red-600 text-sm mt-1">{errors.userName}</p>}
                    </div>
                    <div>
                        <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="전화번호 ('-' 제외)" className={`w-full bg-white/70 rounded-lg p-3 border ${errors.phoneNumber ? 'border-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-indigo-500 focus:outline-none`} />
                        {errors.phoneNumber && <p className="text-red-600 text-sm mt-1">{errors.phoneNumber}</p>}
                    </div>
                    <div>
                        <input type="password" value={pin} maxLength={4} onChange={(e) => setPin(e.target.value)} placeholder="비밀번호 4자리 설정" className={`w-full bg-white/70 rounded-lg p-3 border ${errors.pin ? 'border-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-indigo-500 focus:outline-none`} />
                        {errors.pin && <p className="text-red-600 text-sm mt-1">{errors.pin}</p>}
                    </div>
                </div>
                <div className="flex justify-center gap-4 mt-6">
                    <button onClick={onCancel} disabled={isSubmitting} className="px-6 py-2 rounded-lg bg-slate-300 hover:bg-slate-400 text-slate-800 font-semibold transition-colors disabled:bg-slate-200">취소</button>
                    <button onClick={handleConfirm} disabled={isSubmitting} className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors disabled:bg-indigo-400">
                        {isSubmitting ? '확인 중...' : '확인'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ApplicationSuccessModal: React.FC<{
  application: ProgramApplication;
  onClose: () => void;
}> = ({ application, onClose }) => {
    const userName = application.userName || 
                     (application as any).applicant_name || 
                     (application as any).user_name || 
                     '신청자';
    
    const isWaiting = (application as any).isWaiting;
    const waitingNumber = (application as any).waitingNumber;
    
    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/30 max-w-sm w-full text-center text-slate-800">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">신청 완료!</h2>
                <p className="text-slate-600 mb-6">
                    <span className="font-bold">{userName}</span>님, <br/>
                    프로그램 신청이 성공적으로 완료되었습니다.
                </p>
                
                {isWaiting && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                        <p className="text-orange-800 font-semibold text-sm">
                            ⏳ 현재 정원이 마감되어 대기 {waitingNumber}번으로 등록되었습니다.
                        </p>
                    </div>
                )}
                
                <div className="text-left bg-slate-50/80 p-4 rounded-lg border border-slate-200/80 space-y-2 mb-8">
                    <p className="flex items-center gap-2">
                        <TicketIcon className="w-5 h-5 text-indigo-500"/>
                        <strong>신청번호:</strong> {application.id}
                    </p>
                </div>
                <div className="flex justify-center">
                    <button 
                        onClick={onClose} 
                        className="px-8 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProgramCard: React.FC<{ program: Program, onApply: (program: Program) => void }> = ({ program, onApply }) => (
    <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/30 p-4 flex flex-col transition-all duration-300 hover:shadow-xl hover:border-white">
        <h3 className="text-base font-bold text-slate-800 line-clamp-2">{program.title}</h3>
        <p className="text-xs font-semibold text-indigo-500 my-1">{program.department || '청소년센터'}</p>
        <p className="text-slate-600 mt-1 flex-grow text-xs line-clamp-2">{program.description}</p>
        
        <div className="mt-2 flex flex-wrap gap-1">
            {program.targetAudience && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {program.targetAudience}
                </span>
            )}
            {program.fee !== undefined && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    {program.fee === 0 ? '무료' : `${program.fee.toLocaleString()}원`}
                </span>
            )}
        </div>
        
        <button 
          onClick={() => onApply(program)}
          className="mt-3 w-full px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity duration-200 transform active:scale-95 shadow-md"
        >
          신청하기
        </button>
    </div>
);

const AIRecommendView: React.FC<{
    programs: Program[];
    applications: ProgramApplication[];
    onNewApplication: (app: ProgramApplication) => void;
}> = ({ programs, applications, onNewApplication }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: '안녕! 😊 어떤 활동에 관심이 있어? 편하게 얘기해줘!' },
    ]);
    const [input, setInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [manualApplicationTarget, setManualApplicationTarget] = useState<Program | null>(null);
    const [recommendedProgramIds, setRecommendedProgramIds] = useState<number[]>([]);
    const [applicationSuccessInfo, setApplicationSuccessInfo] = useState<ProgramApplication | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const prevMessageCount = useRef(1);

    useEffect(() => {
        if (messages.length > prevMessageCount.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
        prevMessageCount.current = messages.length;
    }, [messages]);

    const handleConfirmApplication = useCallback(async (programId: number, details: { userName: string; phoneNumber: string; pin: string }) => {
        const program = programs.find(p => p.id === programId);
        if (!program) return;
        
        try {
            const alreadyApplied = applications.some(
                app => Number(app.programId) === programId && app.phone === details.phoneNumber
            );
            
            if (alreadyApplied) {
                const systemMessage: ChatMessage = {
                    role: 'system',
                    text: `이미 이 전화번호(${details.phoneNumber})로 '${program.title}' 프로그램을 신청하셨습니다.`
                };
                setMessages(prev => [...prev, systemMessage]);
                setManualApplicationTarget(null);
                return;
            }

            const newApplicationData = {
                programId,
                userName: details.userName,
                phone: details.phoneNumber,
            };
            
            const newApplication = await addApplicationService(newApplicationData);
            
            const appWithUserName = {
                ...newApplication,
                userName: details.userName
            };
            
            onNewApplication(appWithUserName);

            const systemMessage: ChatMessage = {
                role: 'system',
                text: `${details.userName}님의 '${program.title}' 신청이 완료되었습니다.`
            };
            setMessages(prev => [...prev, systemMessage]);

            setManualApplicationTarget(null);
            setApplicationSuccessInfo(appWithUserName);
        } catch (error: any) {
            console.error("Failed to submit application", error);
            const systemMessage: ChatMessage = { 
                role: 'system', 
                text: error.message || `'${program.title}' 프로그램 신청 중 오류가 발생했습니다.`
            };
            setMessages(prev => [...prev, systemMessage]);
            setManualApplicationTarget(null);
        }
    }, [programs, applications, onNewApplication]);

    const handleSendMessage = useCallback(async () => {
        if (input.trim() === '' || isChatLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsChatLoading(true);

        try {
            const response = await sendMessageToRecommender(userMessage.text, programs);
            
            if (response.functionCalls && response.functionCalls.length > 0) {
                const systemMessage: ChatMessage = {
                    role: 'system',
                    text: `AI가 프로그램 신청을 도와드리려 합니다. 오른쪽 카드에서 '신청하기'를 눌러 계속 진행해주세요.`
                };
                setMessages(prev => [...prev, systemMessage]);
            }

            if (response.text) {
                const modelMessage: ChatMessage = { role: 'model', text: response.text };
                setMessages(prev => [...prev, modelMessage]);

                const idMatches = response.text.match(/ID:\s*(\d+)/g);
                const foundProgramIds = idMatches?.map((match: string) => {
                    const idMatch = match.match(/\d+/);
                    return idMatch ? Number(idMatch[0]) : null;
                }).filter((id: number | null): id is number => id !== null) || [];
                
                if (foundProgramIds.length > 0) {
                    setRecommendedProgramIds(prev => [...new Set([...prev, ...foundProgramIds])]);
                }
            }
        } catch (error) {
            console.error(error);
            const errorMessage: ChatMessage = { role: 'model', text: '죄송합니다. 오류가 발생했어요. 잠시 후 다시 시도해주세요.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsChatLoading(false);
        }
    }, [input, isChatLoading, programs]);

    const cancelApplication = () => {
        setManualApplicationTarget(null);
    };
    
    const programsToDisplay = recommendedProgramIds.length > 0
        ? programs.filter(p => recommendedProgramIds.includes(p.id))
        : programs;

    return (
        <div 
            style={{ 
                display: 'flex', 
                flexDirection: 'row',
                height: '100%',
                gap: '16px',
                paddingBottom: '100px',
                overflow: 'hidden'
            }}
        >
            {/* 채팅 영역 - 40% */}
            <div style={{ 
                width: '40%',
                minWidth: '280px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                maxHeight: 'calc(100vh - 280px)'
            }}>
                <h3 className="text-lg font-bold text-slate-800 mb-3 px-2 flex items-center gap-2" style={{ flexShrink: 0 }}>
                    <SparklesIcon className="w-5 h-5" />
                    AI 추천 채팅
                </h3>
                <div style={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    backgroundColor: 'rgba(255,255,255,0.5)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.3)',
                    overflow: 'hidden'
                }}>
                    {/* 메시지 영역 */}
                    <div 
                        style={{ 
                            flex: 1,
                            overflowY: 'auto',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                        }}
                    >
                        {messages.map((msg, index) => (
                            msg.role === 'system' ? (
                                <div key={index} className="flex items-center gap-2 text-xs text-slate-500 justify-center">
                                    <InfoIcon className="w-4 h-4"/>
                                    <span>{msg.text}</span>
                                </div>
                            ) : (
                                <div key={index} className={`flex items-start gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                    {msg.role === 'model' && (
                                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 shadow">
                                            <ChatBotIcon className="w-4 h-4 text-white"/>
                                        </div>
                                    )}
                                    <div className={`max-w-[85%] px-3 py-2 rounded-xl shadow text-sm ${
                                        msg.role === 'user' 
                                            ? 'bg-gradient-to-br from-pink-500 to-orange-400 text-white rounded-br-none' 
                                            : 'bg-white rounded-bl-none text-slate-700'
                                    }`}>
                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center flex-shrink-0 shadow">
                                            <UserIcon className="w-4 h-4 text-slate-600"/>
                                        </div>
                                    )}
                                </div>
                            )
                        ))}
                        {isChatLoading && (
                            <div className="flex items-start gap-2">
                                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 shadow">
                                    <ChatBotIcon className="w-4 h-4 text-white"/>
                                </div>
                                <div className="px-3 py-2 rounded-xl bg-white rounded-bl-none shadow">
                                    <LoadingIcon className="w-5 h-5 text-indigo-500" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    
                    {/* 입력창 */}
                    <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.3)', flexShrink: 0 }}>
                        <div className="flex items-center bg-white/50 backdrop-blur-lg rounded-lg p-1.5 border border-white/30 focus-within:ring-2 focus-within:ring-indigo-500 shadow-sm">
                            <input
                                type="text" 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="관심사를 알려주세요..."
                                className="w-full bg-transparent p-2 text-sm focus:outline-none placeholder-slate-500"
                                disabled={isChatLoading}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={isChatLoading || input.trim() === ''}
                                className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed transition-all duration-200 transform active:scale-95 shadow"
                            >
                                <SendIcon className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* 프로그램 목록 영역 - 60% */}
            <div style={{ 
                width: '60%',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                maxHeight: 'calc(100vh - 280px)',
                overflow: 'hidden'
            }}>
                <h3 className="text-lg font-bold text-slate-800 mb-3 px-2" style={{ flexShrink: 0 }}>
                    {recommendedProgramIds.length > 0 ? '✨ 추천 프로그램' : '전체 프로그램 보기'}
                </h3>
                {/* 프로그램 스크롤 영역 */}
                <div style={{ 
                    flex: 1,
                    overflowY: 'auto',
                    paddingRight: '8px'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '12px',
                        paddingBottom: '20px'
                    }}>
                        {programsToDisplay.map(program => (
                            <ProgramCard 
                                key={program.id} 
                                program={program} 
                                onApply={setManualApplicationTarget}
                            />
                        ))}
                    </div>
                </div>
            </div>
            
            {/* 모달들 */}
            {manualApplicationTarget && (
                <ProgramApplicationModal
                    program={manualApplicationTarget}
                    onConfirm={(details) => handleConfirmApplication(manualApplicationTarget.id, details)}
                    onCancel={cancelApplication}
                />
            )}
            {applicationSuccessInfo && (
                <ApplicationSuccessModal 
                    application={applicationSuccessInfo}
                    onClose={() => setApplicationSuccessInfo(null)}
                />
            )}
        </div>
    );
};

const CheckApplicationView: React.FC<{
    programs: Program[];
    applications: ProgramApplication[];
    onCancelApplication: (applicationId: string) => void;
}> = ({ programs, applications, onCancelApplication }) => {
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [userApplications, setUserApplications] = useState<ProgramApplication[] | null>(null);

    const maskPhoneNumber = (phone: string | undefined): string => {
        if (!phone) return '';
        const cleaned = phone.replace(/-/g, '');
        if (cleaned.length > 7) {
            return `${cleaned.slice(0, 3)}-****-${cleaned.slice(-4)}`;
        }
        return cleaned;
    };

    const handleCheck = useCallback(() => {
        const foundApps = applications.filter(b => b.phone === phone.replace(/-/g, ''));
        if (foundApps.length > 0) {
            setUserApplications(foundApps);
            setError('');
        } else {
            setUserApplications(null);
            setError('일치하는 신청 정보를 찾을 수 없습니다. 전화번호를 확인해주세요.');
        }
    }, [applications, phone]);
    
    const handleLogout = () => {
        setUserApplications(null);
        setPhone('');
        setError('');
    };

    useEffect(() => {
        if (userApplications) {
            handleCheck();
        }
    }, [applications, userApplications, handleCheck]);

    if (userApplications) {
        return (
            <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                padding: '8px',
                paddingBottom: '140px',
                maxHeight: 'calc(100vh - 280px)'
            }}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800">나의 신청 내역</h3>
                    <button onClick={handleLogout} className="text-sm font-semibold hover:underline text-slate-600">다른 정보로 조회</button>
                </div>
                {userApplications.length === 0 ? (
                    <p className="text-center text-slate-500 mt-8">신청한 프로그램이 없습니다.</p>
                ) : (
                    <div className="space-y-4 pr-2">
                        {userApplications.map(app => {
                            const program = programs.find(p => p.id === Number(app.programId));
                            return (
                                <div key={app.id} className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-5">
                                    <h4 className="font-bold text-lg text-indigo-600">{program?.title || '프로그램'}</h4>
                                    <p className="text-sm text-slate-500 font-semibold mb-3">{program?.department || ''}</p>
                                    
                                    <div className="space-y-2 text-sm border-t border-slate-200/80 pt-3">
                                        <p className="flex items-center gap-2 text-slate-700">
                                            <UserIcon className="w-5 h-5 text-slate-400 flex-shrink-0"/>
                                            <span><strong>신청자:</strong> {app.userName}</span>
                                        </p>
                                        <p className="flex items-center gap-2 text-slate-700">
                                            <PhoneIcon className="w-5 h-5 text-slate-400 flex-shrink-0"/>
                                            <span><strong>연락처:</strong> {maskPhoneNumber(app.phone)}</span>
                                        </p>
                                        <p className="flex items-center gap-2 text-slate-700">
                                            <TicketIcon className="w-5 h-5 text-slate-400 flex-shrink-0"/>
                                            <span><strong>신청번호:</strong> {app.id}</span>
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => onCancelApplication(String(app.id))}
                                        className="mt-4 w-full px-4 py-2 text-sm rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors font-semibold"
                                    >
                                        신청 취소
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }
    
    return (
        <div className="flex-grow flex items-center justify-center">
            <div className="w-full max-w-sm bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-8">
                <h3 className="text-xl font-bold text-slate-700 mb-2">신청 현황 확인</h3>
                <p className="text-slate-500 mb-6">신청 시 입력한 전화번호를 입력해주세요.</p>
                <div className="space-y-4">
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="전화번호 ('-' 제외)" className="w-full bg-white/70 rounded-lg p-3 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                {error && <p className="text-red-600 text-sm mt-4 font-semibold">{error}</p>}
                <button onClick={handleCheck} className="w-full mt-6 px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors">신청 현황 확인</button>
            </div>
        </div>
    );
};

export const ProgramRecommendation: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [applications, setApplications] = useState<ProgramApplication[]>([]);
    const [viewMode, setViewMode] = useState<'recommend' | 'check'>('recommend');
    const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsDataLoading(true);
            try {
                const [programsData, applicationsData] = await Promise.all([
                    getPrograms(),
                    getApplications()
                ]);
                
                setPrograms(programsData || []);
                setApplications(applicationsData || []);
            } catch (error) {
                console.error("Failed to fetch data", error);
                showNotification('error', '데이터를 불러오는데 실패했습니다.');
            } finally {
                setIsDataLoading(false);
            }
        };
        fetchData();
    }, []);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    const handleNewApplication = (newApp: ProgramApplication) => {
        setApplications(prev => [...prev, newApp]);
    };

    const handleCancelApplication = async (applicationId: string) => {
        const appToCancel = applications.find(a => String(a.id) === applicationId);
        if (!appToCancel) return;

        const result = await deleteApplicationService(Number(applicationId));
        if (result.success) {
            const program = programs.find(p => p.id === Number(appToCancel.programId));
            setApplications(prev => prev.filter(a => String(a.id) !== applicationId));
            showNotification('error', `'${program?.title}' 프로그램 신청이 취소되었습니다.`);
        } else {
            showNotification('error', '신청 취소에 실패했습니다. 다시 시도해주세요.');
        }
    };

    const renderView = () => {
        if (isDataLoading) {
            return (
                <div className="flex-grow flex items-center justify-center h-full">
                    <LoadingIcon className="w-10 h-10 text-indigo-500" />
                </div>
            );
        }
        
        switch(viewMode) {
            case 'recommend':
                return <AIRecommendView programs={programs} applications={applications} onNewApplication={handleNewApplication} />;
            case 'check':
                return <CheckApplicationView programs={programs} applications={applications} onCancelApplication={handleCancelApplication} />;
            default:
                return null;
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* 헤더 - 고정 */}
            <div className="flex items-center justify-between mb-4 px-2" style={{ flexShrink: 0 }}>
                <h2 className="text-xl md:text-2xl font-bold text-indigo-600">프로그램 추천/신청</h2>
                <div className="flex items-center p-1 rounded-xl bg-white/70 border border-white/30 shadow-sm">
                    <button 
                        onClick={() => setViewMode('recommend')}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors duration-200 flex items-center gap-1 ${viewMode === 'recommend' ? 'bg-indigo-500 text-white shadow' : 'text-slate-600 hover:bg-white/50'}`}
                    >
                        <SparklesIcon className="w-4 h-4" />
                        AI 추천
                    </button>
                    <button
                        onClick={() => setViewMode('check')}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors duration-200 flex items-center gap-1 ${viewMode === 'check' ? 'bg-indigo-500 text-white shadow' : 'text-slate-600 hover:bg-white/50'}`}
                    >
                        <ClipboardListIcon className="w-4 h-4" />
                        신청 확인
                    </button>
                </div>
            </div>

            {/* 알림 */}
            {notification && (
                <div className={`px-4 py-3 rounded-xl mb-4 flex items-center gap-3 text-sm ${notification.type === 'success' ? 'bg-green-100 border border-green-300 text-green-800' : 'bg-red-100 border border-red-300 text-red-800'}`} style={{ flexShrink: 0 }}>
                    {notification.type === 'success' ? <CheckCircleIcon className="w-5 h-5"/> : <XCircleIcon className="w-5 h-5"/>}
                    <p>{notification.message}</p>
                </div>
            )}
            
            {/* 콘텐츠 영역 */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
                {renderView()}
            </div>

            {/* 뒤로가기 버튼 */}
            {onBack && <BackButton onClick={onBack} label="← 메인으로 돌아가기" />}
        </div>
    );
};