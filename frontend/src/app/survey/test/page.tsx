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

  // 답변 저장
  const handleAnswer = (score: number) => {
    const newAnswers = { ...answers };
    if (!newAnswers[currentCategoryName]) {
      newAnswers[currentCategoryName] = [];
    }
    newAnswers[currentCategoryName][currentQuestion] = score;
    setAnswers(newAnswers);

    // 다음 문항으로
    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentCategory < categories.length - 1) {
      // 다음 카테고리로
      setCurrentCategory(currentCategory + 1);
      setCurrentQuestion(0);
    } else {
      // 설문 완료
      submitSurvey(newAnswers);
    }
  };

  // 설문 제출
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

  // 이전 문항
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
      <div className="container" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>제출 중...</h2>
          <p style={{ color: '#666' }}>잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* 헤더 */}
      <div style={{ padding: '20px 0', borderBottom: '2px solid #eee' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
            {testType}
          </h1>
          <span style={{ fontSize: '14px', color: '#666' }}>
            {answeredQuestions} / {totalQuestions}
          </span>
        </div>
        
        {/* 프로그레스 바 */}
        <div style={{ 
          width: '100%', 
          height: '8px', 
          backgroundColor: '#eee', 
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            width: `${(answeredQuestions / totalQuestions) * 100}%`,
            height: '100%',
            backgroundColor: '#5887FF',
            transition: 'width 0.3s'
          }} />
        </div>
      </div>

      {/* 카테고리 표시 */}
      <div style={{ 
        padding: '24px 0',
        textAlign: 'center',
        borderBottom: '1px solid #eee'
      }}>
        <div style={{ 
          display: 'inline-block',
          padding: '8px 16px',
          backgroundColor: '#e8f0ff',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#5887FF',
          marginBottom: '8px'
        }}>
          {currentCategoryName}
        </div>
        <p style={{ fontSize: '13px', color: '#999', margin: '8px 0 0 0' }}>
          {currentQuestion + 1} / {currentQuestions.length}
        </p>
      </div>

      {/* 질문 */}
      <div style={{ padding: '32px 0' }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: '600',
          lineHeight: '1.6',
          marginBottom: '32px',
          minHeight: '80px'
        }}>
          {currentQuestions[currentQuestion]}
        </h2>

        {/* 답변 버튼 (5점 척도) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                  padding: '20px',
                  border: isSelected ? `3px solid ${color}` : '2px solid #ddd',
                  borderRadius: '12px',
                  backgroundColor: isSelected ? `${color}10` : 'white',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: isSelected ? 'bold' : '500',
                  transition: 'all 0.2s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = color;
                    e.currentTarget.style.backgroundColor = `${color}05`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#ddd';
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                <span>{label}</span>
                <span style={{ 
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  {score}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 이전 버튼 */}
      {(currentCategory > 0 || currentQuestion > 0) && (
        <div style={{ paddingBottom: '24px' }}>
          <button
            onClick={handlePrevious}
            style={{
              width: '100%',
              padding: '16px',
              border: '2px solid #ddd',
              borderRadius: '12px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              color: '#666'
            }}
          >
            ← 이전 문항
          </button>
        </div>
      )}
    </div>
  );
}

export default function SurveyTestPage() {
  return (
    <Suspense fallback={<div>로딩중...</div>}>
      <SurveyTestContent />
    </Suspense>
  );
}