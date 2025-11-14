import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class SurveyService {
  // 설문조사 결과 저장
  async submitSurvey(userId: number, answers: any, aiAnalysis?: string) {
    const scores = this.calculateScores(answers);

    const result = await prisma.testResult.create({
      data: {
        answers: answers,
        scores: scores,
        user_id: userId,
      },
    });

    return {
      success: true,
      testResultId: result.id,
      scores: scores,
      analysis: aiAnalysis || this.generateBasicAnalysis(scores),
    };
  }

  // 점수 계산
  calculateScores(answers: any): any {
    const scores: any = {};

    for (const category in answers) {
      const categoryAnswers = answers[category];
      const sum = categoryAnswers.reduce((a: number, b: number) => a + b, 0);
      const average = sum / categoryAnswers.length;
      scores[category] = Math.round(average * 10) / 10;
    }

    return scores;
  }

  // 기본 분석 생성
  generateBasicAnalysis(scores: any): string {
    const sortedScores = Object.entries(scores)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 3);

    const topCategories = sortedScores.map(([category]) => category).join(', ');

    return `당신의 강점 역량은 ${topCategories}입니다. 이러한 강점을 활용하여 더욱 성장할 수 있습니다.`;
  }

  // 사용자의 설문 결과 조회
  async getUserSurveyResults(userId: number) {
    const results = await prisma.testResult.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });

    return {
      success: true,
      results: results.map((r) => ({
        id: r.id,
        createdAt: r.created_at,
        scores: r.scores,
      })),
    };
  }

  // 특정 설문 결과 상세 조회
  async getSurveyResult(resultId: number) {
    const result = await prisma.testResult.findUnique({
      where: { id: resultId },
    });

    if (!result) {
      return { success: false, message: '결과를 찾을 수 없습니다.' };
    }

    return {
      success: true,
      result: {
        id: result.id,
        answers: result.answers,
        scores: result.scores,
        createdAt: result.created_at,
      },
    };
  }

  // 성장 추적
  async getGrowthTracking(userId: number) {
    const results = await prisma.testResult.findMany({
      where: {
        user_id: userId,
      },
      orderBy: { created_at: 'asc' },
    });

    const tracking = results.map((r) => ({
      date: r.created_at,
      scores: r.scores,
    }));

    return {
      success: true,
      tracking: tracking,
    };
  }
}