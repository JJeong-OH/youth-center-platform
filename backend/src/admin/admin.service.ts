import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

const prisma = new PrismaClient();

@Injectable()
export class AdminService {
  constructor(private jwtService: JwtService) {}

  // 관리자 로그인
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.role !== 'ADMIN') {
      throw new UnauthorizedException('관리자 권한이 없습니다.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

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
    // 전체 회원 수
    const totalUsers = await prisma.user.count();

    // 이번 달 신규 회원
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );
    const newUsersThisMonth = await prisma.user.count({
      where: {
        created_at: {
          gte: startOfMonth,
        },
      },
    });

    // 설문 참여 수
    const totalSurveys = await prisma.testResult.count();

    // 프로그램 수
    const totalPrograms = await prisma.program.count({
      where: { isActive: true },
    });

    // 예약 수 (스키마 기준 'Booking' 모델 사용)
    const totalBookings = await prisma.booking.count();

    // 최근 설문 결과 (5개)
    const recentSurveys = await prisma.testResult.findMany({
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
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          profiles: true,
          test_results: true,
          bookings: true,
        },
      }),
      prisma.user.count(),
    ]);

    return {
      success: true,
      users: users.map((u) => ({
        userId: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.created_at,
        surveyCount: u.test_results.length,
        bookingCount: u.bookings.length,
        profile: u.profiles[0] || null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 회원 상세 정보
  async getUserDetail(userId: number) {
    const user = await prisma.user.findUnique({
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
    const surveys = await prisma.testResult.findMany({
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

  // ✅ 통합 사용자 통계 조회 (수정 완료)
  async getIntegratedUserStats() {
    try {
      // 1. 회원 데이터 (phone을 가져오기 위해 profiles 관계 포함)
      const members = await prisma.user.findMany({
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
            take: 1, // 사용자는 프로필을 하나만 가진다고 가정
          },
        },
      });

      // 2. 비회원 데이터 (전화번호 기준 그룹화)
      const guestPhones = await prisma.programApplication.findMany({
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

      // 3. 각 사용자별 활동 데이터 집계
      const integratedUsers: any[] = []; // 'never[]' 에러 해결

      // 회원 데이터 처리
      for (const member of members) {
        // phone 번호를 profiles에서 추출
        const phone = member.profiles[0]?.phone || null;

        const programCount = await prisma.programApplication.count({
          where: {
            OR: [{ user_id: member.id }, { phone: phone }],
          },
        });

        // 스키마 수정: 'facilityBooking' -> 'booking', 'user_phone' -> 'phone'
        const facilityCount = await prisma.booking.count({
          where: {
            OR: [{ userId: member.id }, { phone: phone }],
          },
        });

        const programs = await prisma.programApplication.findMany({
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

        // 스키마 수정: 'facilityBooking' -> 'booking', 'user_phone' -> 'phone'
        const facilities = await prisma.booking.findMany({
          where: {
            OR: [{ userId: member.id }, { phone: phone }],
          },
          include: {
            facility: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: 'desc' }, // 스키마 기준 'booking_date'가 없으므로 'createdAt'으로 변경
        });

        integratedUsers.push({
          type: 'member',
          id: member.id,
          name: member.name,
          phone: phone, // phone 변수 사용
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
            date: f.createdAt, // 스키마 기준 'booking_date'가 없으므로 'createdAt'으로 변경
            status: f.status,
          })),
        });
      }

      // 비회원 데이터 처리
      for (const guest of guestPhones) {
        if (!guest.phone) continue;

        // 이미 회원으로 등록된 전화번호는 제외
        const isMember = members.some(
          (m) => m.profiles[0]?.phone === guest.phone && m.profiles[0]?.phone != null,
        );
        if (isMember) continue;

        const programCount = await prisma.programApplication.count({
          where: { phone: guest.phone },
        });

        // 스키마 수정: 'facilityBooking' -> 'booking', 'user_phone' -> 'phone'
        const facilityCount = await prisma.booking.count({
          where: { phone: guest.phone }, // 스키마 기준 'user_phone'이 아닌 'phone'
        });

        const programs = await prisma.programApplication.findMany({
          where: { phone: guest.phone },
          include: {
            program: {
              select: { title: true },
            },
          },
          orderBy: { applied_at: 'desc' },
        });

        // 스키마 수정: 'facilityBooking' -> 'booking', 'user_phone' -> 'phone'
        const facilities = await prisma.booking.findMany({
          where: { phone: guest.phone }, // 스키마 기준 'user_phone'이 아닌 'phone'
          include: {
            facility: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: 'desc' }, // 스키마 기준 'booking_date'가 없으므로 'createdAt'으로 변경
        });

        // 가장 최근 신청 정보 가져오기
        const latestApplication = await prisma.programApplication.findFirst({
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
            date: f.createdAt, // 스키마 기준 'booking_date'가 없으므로 'createdAt'으로 변경
            status: f.status,
          })),
        });
      }

      // 활동 많은 순으로 정렬
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

  // ✅ 특정 사용자 상세 조회 (수정 완료)
  async getUserDetailByPhone(phone: string) {
    try {
      // 스키마 수정: 'User'가 아닌 'Profile'에서 'phone'으로 검색
      const profile = await prisma.profile.findFirst({
        where: { phone },
        include: {
          user: true, // 연결된 'User' 정보를 가져옴
        },
      });

      const member = profile?.user || null; // 'member'는 'user' 객체

      const programs = await prisma.programApplication.findMany({
        where: {
          OR: [{ user_id: member?.id }, { phone }],
        },
        include: {
          program: true,
        },
        orderBy: { applied_at: 'desc' },
      });

      // 스키마 수정: 'facilityBooking' -> 'booking', 'user_phone' -> 'phone'
      const facilities = await prisma.booking.findMany({
        where: {
          OR: [{ userId: member?.id }, { phone: phone }],
        },
        include: {
          facility: true,
        },
        orderBy: { createdAt: 'desc' }, // 스키마 기준 'booking_date'가 없으므로 'createdAt'으로 변경
      });

      return {
        success: true,
        user: {
          type: member ? 'member' : 'guest',
          info: member || { phone }, // 'member'가 null이 아니면 'user' 객체 전체를 반환
          programs,
          facilities,
          stats: {
            totalPrograms: programs.length,
            approvedPrograms: programs.filter((p) => p.status === 'approved')
              .length,
            totalFacilities: facilities.length,
            approvedFacilities: facilities.filter(
              (f) => f.status === 'approved' || f.status === 'active', // 스키마의 booking status가 'active'이므로 둘 다 허용
            ).length,
          },
        },
      };
    } catch (error) {
      console.error('❌ 사용자 상세 조회 실패:', error);
      throw error;
    }
  }
}