import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class ProgramService {
  // 역량-프로그램 매핑 (기존 로직 유지)
  private categoryProgramMap: any = {
    자기개발분야: ['자기관리 캠프', '리더십 프로그램', '독서토론 동아리'],
    사회참여분야: ['청소년의회', '봉사활동', '지역사회 프로젝트'],
    문화예술분야: ['미술 워크샵', '음악 프로그램', '연극 동아리'],
    '과학·정보분야': ['메이커 활동', '코딩 교실', 'AI 체험'],
    인문사회분야: ['역사탐방', '철학토론', '국제교류'],
    진로체험분야: ['직업체험', '멘토링', '진로 캠프'],
    '건강/스포츠활동': ['스포츠 클럽', '등산 프로그램', '요가 수업'],
    비판적사고: ['토론 프로그램', '논리적 사고력 향상', '미디어 리터러시'],
    창의력: ['창작 활동', '메이커 스페이스', '디자인 씽킹'],
    협업: ['팀 프로젝트', '협동 게임', '리더십 훈련'],
    의사소통: ['스피치 교육', '발표 훈련', '토론 동아리'],
    사회정서: ['감정코칭', '공감 워크샵', '사회성 향상'],
    진로개발: ['진로탐색', '직업체험', '자기계발'],
    디지털역량: ['코딩 교육', '영상 제작', '디지털 콘텐츠 제작'],
  };

  // 사용자 맞춤 프로그램 추천 (기존 로직)
  async getRecommendedPrograms(userId: number) {
    const latestResult = await prisma.testResult.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });

    if (!latestResult) {
      return {
        success: false,
        message: '설문조사를 먼저 진행해주세요.',
      };
    }

    const scores = this.calculateScores(latestResult.answers);

    const topCategories = Object.entries(scores)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    const recommendations = topCategories.map((category) => ({
      category: category,
      score: scores[category],
      programs: this.categoryProgramMap[category] || [],
    }));

    const programTitles = recommendations.flatMap((r) => r.programs);

    const dbPrograms = await prisma.program.findMany({
      where: {
        title: { in: programTitles },
        isActive: true,
      },
    });

    return {
      success: true,
      topCategories: recommendations,
      programs: dbPrograms,
      message: `${topCategories[0]}에 강점을 보이시네요! 관련 프로그램을 추천드립니다.`,
    };
  }

// 전체 프로그램 목록 (includeInactive 파라미터 추가)
async getAllPrograms(includeInactive = false) {
  const programs = await prisma.program.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: { order: 'asc' },
  });

  return {
    success: true,
    programs: programs,
  };
}

  // 프로그램 1개 조회
  async getProgramById(id: number) {
    const program = await prisma.program.findUnique({
      where: { id },
    });

    if (!program) {
      return {
        success: false,
        message: '프로그램을 찾을 수 없습니다.',
      };
    }

    return {
      success: true,
      program,
    };
  }

  // 프로그램 생성 (관리자용 - 확장)
  async createProgram(data: {
    title: string;
    department?: string;
    startDate?: string;
    endDate?: string;
    targetAudience?: string;
    capacity?: number;
    fee?: number;
    recruitStatus?: string;
    description?: string;
    imageUrl?: string;
    tags?: string[];
    order?: number;
  }) {
    const program = await prisma.program.create({
      data: {
        title: data.title,
        department: data.department,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        targetAudience: data.targetAudience,
        capacity: data.capacity,
        fee: data.fee || 0,
        recruitStatus: data.recruitStatus || '모집중',
        description: data.description,
        imageUrl: data.imageUrl,
        tags: data.tags || [],
        order: data.order || 0,
        isActive: true,
      },
    });

    return {
      success: true,
      program: program,
      message: '프로그램이 생성되었습니다.',
    };
  }

  // 프로그램 수정
  async updateProgram(
    id: number,
    data: {
      title?: string;
      department?: string;
      startDate?: string;
      endDate?: string;
      targetAudience?: string;
      capacity?: number;
      fee?: number;
      recruitStatus?: string;
      description?: string;
      imageUrl?: string;
      tags?: string[];
      order?: number;
      isActive?: boolean;
    },
  ) {
    try {
      const program = await prisma.program.update({
        where: { id },
        data: {
          ...data,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined,
        },
      });

      return {
        success: true,
        program,
        message: '프로그램이 수정되었습니다.',
      };
    } catch (error) {
      return {
        success: false,
        message: '프로그램을 찾을 수 없습니다.',
      };
    }
  }

  // 프로그램 삭제 (soft delete)
  async deleteProgram(id: number) {
    try {
      const program = await prisma.program.update({
        where: { id },
        data: { isActive: false },
      });

      return {
        success: true,
        message: '프로그램이 삭제되었습니다.',
      };
    } catch (error) {
      return {
        success: false,
        message: '프로그램을 찾을 수 없습니다.',
      };
    }
  }

  // 프로그램 완전 삭제
  async hardDeleteProgram(id: number) {
    try {
      await prisma.program.delete({
        where: { id },
      });

      return {
        success: true,
        message: '프로그램이 완전히 삭제되었습니다.',
      };
    } catch (error) {
      return {
        success: false,
        message: '프로그램을 삭제할 수 없습니다.',
      };
    }
  }

  // 점수 계산 (helper)
  private calculateScores(answers: any): any {
    const scores: any = {};
    for (const category in answers) {
      const categoryAnswers = answers[category];
      const sum = categoryAnswers.reduce((a: number, b: number) => a + b, 0);
      const average = sum / categoryAnswers.length;
      scores[category] = Math.round(average * 10) / 10;
    }
    return scores;
  }
}