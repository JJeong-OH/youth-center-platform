'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { allQuestions } from '../data/questions';

function SurveyTestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const testType = searchParams.get('type') || '청소년활동분야';
  
  const [currentCategory, setCurrentCategory] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = (allQuestions as any)[testType];
  const categories = Object.keys(questions);
  const currentCategoryName = categories[currentCategory];
  const currentQuestions = questions[currentCategoryName];
  const totalQuestions = categories.reduce((sum, cat) => sum + questions[cat].length, 0);
  const answeredQuestions = Object.values(answers).flat().length;

  const handleAnswer = (score: number) => {
    const newAnswers = { ...answers };
    if (!newAnswers[currentCategoryName]) {
      newAnswers[currentCategoryName] = [];
    }
    newAnswers[currentCategoryName][currentQuestion] = score;
    setAnswers(newAnswers);

    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentCategory < categories.length - 1) {
      setCurrentCategory(currentCategory + 1);
      setCurrentQuestion(0);
    } else {
      submitSurvey(newAnswers);
    }
  };

  const submitSurvey = async (finalAnswers: any) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch('http://localhost:3000/survey/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          testType: testType,
          answers: finalAnswers
        })
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/survey/result/${data.testResultId}`);
      } else {
        alert('제출 실패: ' + data.message);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('제출 에러:', error);
      alert('제출 중 오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentCategory > 0) {
      setCurrentCategory(currentCategory - 1);
      setCurrentQuestion(questions[categories[currentCategory - 1]].length - 1);
    }
  };

  if (isSubmitting) {
    return (
      <div style={{
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>제출 중...</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

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
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <h1 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>
            {testType}
          </h1>
          <span style={{ fontSize: '13px' }}>
            {answeredQuestions} / {totalQuestions}
          </span>
        </div>
        
        {/* 프로그레스 바 */}
        <div style={{ 
          width: '100%', 
          height: '6px', 
          backgroundColor: 'rgba(255,255,255,0.3)', 
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            width: `${(answeredQuestions / totalQuestions) * 100}%`,
            height: '100%',
            backgroundColor: 'white',
            transition: 'width 0.3s'
          }} />
        </div>
      </div>

      {/* 컨텐츠 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '20px'
      }}>
        {/* 카테고리 표시 */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <div style={{ 
            display: 'inline-block',
            padding: '8px 16px',
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#667eea',
            marginBottom: '8px'
          }}>
            {currentCategoryName}
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: '8px 0 0 0' }}>
            {currentQuestion + 1} / {currentQuestions.length}
          </p>
        </div>

        {/* 질문 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px'
        }}>
          <h2 style={{ 
            fontSize: '17px', 
            fontWeight: '600',
            lineHeight: '1.6',
            margin: 0,
            color: '#333',
            wordBreak: 'keep-all'
          }}>
            {currentQuestions[currentQuestion]}
          </h2>
        </div>

        {/* 답변 버튼 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {[
            { score: 5, label: '매우 그렇다', color: '#4caf50' },
            { score: 4, label: '그렇다', color: '#8bc34a' },
            { score: 3, label: '보통이다', color: '#ffc107' },
            { score: 2, label: '그렇지 않다', color: '#ff9800' },
            { score: 1, label: '전혀 그렇지 않다', color: '#f44336' }
          ].map(({ score, label, color }) => {
            const isSelected = answers[currentCategoryName]?.[currentQuestion] === score;
            return (
              <button
                key={score}
                onClick={() => handleAnswer(score)}
                style={{
                  padding: '16px',
                  border: 'none',
                  borderRadius: '12px',
                  backgroundColor: isSelected ? color : 'rgba(255,255,255,0.95)',
                  color: isSelected ? 'white' : '#333',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: isSelected ? '700' : '500',
                  transition: 'all 0.2s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <span>{label}</span>
                <span style={{ 
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.3)' : color,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '14px'
                }}>
                  {score}
                </span>
              </button>
            );
          })}
        </div>

        {/* 이전 버튼 */}
        {(currentCategory > 0 || currentQuestion > 0) && (
          <button
            onClick={handlePrevious}
            style={{
              width: '100%',
              padding: '14px',
              border: 'none',
              borderRadius: '12px',
              backgroundColor: 'rgba(255,255,255,0.95)',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              color: '#666',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            ← 이전 문항
          </button>
        )}
      </div>
    </div>
  );
}

export default function SurveyTestPage() {
  return (
    <Suspense fallback={
      <div style={{
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        로딩중...
      </div>
    }>
      <SurveyTestContent />
    </Suspense>
  );
}