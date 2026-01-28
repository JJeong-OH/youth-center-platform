import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

// ❌ 이 줄 삭제
// const prisma = new PrismaClient();

@Injectable()
export class AdminService {
  // ✅ PrismaClient를 클래스 속성으로 선언
  private prisma = new PrismaClient();

  constructor(private jwtService: JwtService) {}

  // 관리자 로그인
  async login(email: string, password: string) {
    console.log('🔍 로그인 시도:', email);
    console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    console.log('🔍 찾은 사용자:', user ? {
      id: user.id,
      email: user.email,
      role: user.role,
      roleMatch: user.role === 'ADMIN'
    } : null);

    if (!user) {
      console.log('❌ 사용자 없음');
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    if (user.role !== 'ADMIN') {
      console.log('❌ 관리자 권한 없음. role:', user.role);
      throw new UnauthorizedException('관리자 권한이 없습니다.');
    }

    console.log('🔍 비밀번호 검증 중...');
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log('🔍 비밀번호 검증 결과:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ 비밀번호 불일치');
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    console.log('✅ 로그인 성공!');

    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      success: true,
      token,
      admin: {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  // 대시보드 통계
  async getDashboardStats() {
    const totalUsers = await this.prisma.user.count();

    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );
    const newUsersThisMonth = await this.prisma.user.count({
      where: {
        created_at: {
          gte: startOfMonth,
        },
      },
    });

    const totalSurveys = await this.prisma.testResult.count();
    const totalPrograms = await this.prisma.program.count({
      where: { isActive: true },
    });
    const totalBookings = await this.prisma.booking.count();

    const recentSurveys = await this.prisma.testResult.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      stats: {
        totalUsers,
        newUsersThisMonth,
        totalSurveys,
        totalPrograms,
        totalBookings,
      },
      recentSurveys: recentSurveys.map((s) => ({
        id: s.id,
        userName: s.user?.name,
        createdAt: s.created_at,
      })),
    };
  }

  // 전체 회원 목록
async getAllUsers(page: number = 1, limit: number = 20) {
  try {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,  // ✅ id 선택
          name: true,
          email: true,
          phone_number: true,  // ✅ 전화번호 추가
          role: true,
          created_at: true,
          _count: {
            select: {
              test_results: true,
              bookings: true,
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      }),
      this.prisma.user.count()
    ]);

    return {
      success: true,
      users: users.map(user => ({
        userId: user.id,  // ✅ id를 userId로 매핑
        name: user.name,
        email: user.email,
        phoneNumber: user.phone_number,  // ✅ phone_number를 phoneNumber로 매핑
        role: user.role,
        createdAt: user.created_at,
        surveyCount: user._count.test_results,
        bookingCount: user._count.bookings,
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        limit
      }
    };
  } catch (error) {
    throw new Error('회원 목록 조회에 실패했습니다.');
  }
}

  // 회원 상세 정보
  async getUserDetail(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profiles: true,
        test_results: {
          orderBy: { created_at: 'desc' },
        },
        chat_histories: {
          orderBy: { created_at: 'desc' },
          take: 5,
        },
        bookings: {
          include: {
            facility: true,
          },
        },
      },
    });

    if (!user) {
      return { success: false, message: '회원을 찾을 수 없습니다.' };
    }

    return {
      success: true,
      user: {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
        profile: user.profiles[0] || null,
        testResults: user.test_results,
        recentChats: user.chat_histories,
        bookings: user.bookings,
      },
    };
  }

  // 설문 결과 통계
  async getSurveyStats() {
    const surveys = await this.prisma.testResult.findMany({
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return {
      success: true,
      totalSurveys: surveys.length,
      surveys: surveys.map((survey) => ({
        id: survey.id,
        userName: survey.user.name,
        answers: survey.answers,
        scores: survey.scores,
        createdAt: survey.created_at,
      })),
    };
  }

  // 통합 사용자 통계 조회
  async getIntegratedUserStats() {
    try {
      const members = await this.prisma.user.findMany({
        where: { role: 'USER' },
        select: {
          id: true,
          name: true,
          email: true,
          created_at: true,
          profiles: {
            select: {
              phone: true,
            },
            take: 1,
          },
        },
      });

      const guestPhones = await this.prisma.programApplication.findMany({
        where: {
          user_id: null,
          phone: { not: null },
        },
        select: {
          phone: true,
          applicant_name: true,
        },
        distinct: ['phone'],
      });

      const integratedUsers: any[] = [];

      for (const member of members) {
        const phone = member.profiles[0]?.phone || null;

        const programCount = await this.prisma.programApplication.count({
          where: {
            OR: [{ user_id: member.id }, { phone: phone }],
          },
        });

        const facilityCount = await this.prisma.booking.count({
          where: {
            OR: [{ userId: member.id }, { phone: phone }],
          },
        });

        const programs = await this.prisma.programApplication.findMany({
          where: {
            OR: [{ user_id: member.id }, { phone: phone }],
          },
          include: {
            program: {
              select: { title: true },
            },
          },
          orderBy: { applied_at: 'desc' },
        });

        const facilities = await this.prisma.booking.findMany({
          where: {
            OR: [{ userId: member.id }, { phone: phone }],
          },
          include: {
            facility: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        integratedUsers.push({
          type: 'member',
          id: member.id,
          name: member.name,
          phone: phone,
          email: member.email,
          joinDate: member.created_at,
          programCount,
          facilityCount,
          programs: programs.map((p) => ({
            id: p.id,
            title: p.program.title,
            date: p.applied_at,
            status: p.status,
          })),
          facilities: facilities.map((f) => ({
            id: f.id,
            name: f.facility.name,
            date: f.createdAt,
            status: f.status,
          })),
        });
      }

      for (const guest of guestPhones) {
        if (!guest.phone) continue;

        const isMember = members.some(
          (m) => m.profiles[0]?.phone === guest.phone && m.profiles[0]?.phone != null,
        );
        if (isMember) continue;

        const programCount = await this.prisma.programApplication.count({
          where: { phone: guest.phone },
        });

        const facilityCount = await this.prisma.booking.count({
          where: { phone: guest.phone },
        });

        const programs = await this.prisma.programApplication.findMany({
          where: { phone: guest.phone },
          include: {
            program: {
              select: { title: true },
            },
          },
          orderBy: { applied_at: 'desc' },
        });

        const facilities = await this.prisma.booking.findMany({
          where: { phone: guest.phone },
          include: {
            facility: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        const latestApplication = await this.prisma.programApplication.findFirst({
          where: { phone: guest.phone },
          orderBy: { applied_at: 'desc' },
        });

        integratedUsers.push({
          type: 'guest',
          id: null,
          name:
            guest.applicant_name ||
            latestApplication?.applicant_name ||
            '비회원',
          phone: guest.phone,
          email: null,
          joinDate: latestApplication?.applied_at || null,
          programCount,
          facilityCount,
          programs: programs.map((p) => ({
            id: p.id,
            title: p.program.title,
            date: p.applied_at,
            status: p.status,
          })),
          facilities: facilities.map((f) => ({
            id: f.id,
            name: f.facility.name,
            date: f.createdAt,
            status: f.status,
          })),
        });
      }

      integratedUsers.sort(
        (a, b) =>
          b.programCount + b.facilityCount - (a.programCount + a.facilityCount),
      );

      return {
        success: true,
        totalUsers: integratedUsers.length,
        members: integratedUsers.filter((u) => u.type === 'member').length,
        guests: integratedUsers.filter((u) => u.type === 'guest').length,
        users: integratedUsers,
      };
    } catch (error) {
      console.error('❌ 통합 사용자 통계 조회 실패:', error);
      throw error;
    }
  }

  // 특정 사용자 상세 조회
  async getUserDetailByPhone(phone: string) {
    try {
      const profile = await this.prisma.profile.findFirst({
        where: { phone },
        include: {
          user: true,
        },
      });

      const member = profile?.user || null;

      const programs = await this.prisma.programApplication.findMany({
        where: {
          OR: [{ user_id: member?.id }, { phone }],
        },
        include: {
          program: true,
        },
        orderBy: { applied_at: 'desc' },
      });

      const facilities = await this.prisma.booking.findMany({
        where: {
          OR: [{ userId: member?.id }, { phone: phone }],
        },
        include: {
          facility: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        user: {
          type: member ? 'member' : 'guest',
          info: member || { phone },
          programs,
          facilities,
          stats: {
            totalPrograms: programs.length,
            approvedPrograms: programs.filter((p) => p.status === 'approved')
              .length,
            totalFacilities: facilities.length,
            approvedFacilities: facilities.filter(
              (f) => f.status === 'approved' || f.status === 'active',
            ).length,
          },
        },
      };
    } catch (error) {
      console.error('❌ 사용자 상세 조회 실패:', error);
      throw error;
    }
  }
async deleteUser(userId: number) {
  try {
    await this.prisma.user.delete({
      where: { id: userId }  // ✅ userId가 아니라 id를 사용!
    });
    
    return {
      success: true,
      message: '회원이 삭제되었습니다.'
    };
  } catch (error) {
    throw new Error('회원 삭제에 실패했습니다.');
  }
}
// ✅ 프로그램 수정 함수 (맨 아래 추가)
async updateProgram(programId: number, updateData: any) {
  try {
    const updatedProgram = await this.prisma.program.update({
      where: { id: programId },
      data: updateData
    });
    
    return {
      success: true,
      program: updatedProgram,
      message: '프로그램이 수정되었습니다.'
    };
  } catch (error) {
    throw new Error('프로그램 수정에 실패했습니다.');
  }
}
  
}