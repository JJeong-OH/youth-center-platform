import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class KioskService {
  constructor(private readonly jwtService: JwtService) {}

  maskPhoneNumber(phone: string): string {
    if (!phone) return '';
    const cleaned = phone.replace(/-/g, '');
    if (cleaned.length === 11) {
      const part1 = cleaned.substring(0, 3);
      const part2 = cleaned.substring(3, 7);
      const part3 = cleaned.substring(9, 11);
      return `${part1}-${part2}-**${part3}`;
    }
    return phone;
  }

  async kioskLogin(name: string, dob: string, gender: string) {
    const users = await prisma.user.findMany({
      where: { name: name },
      include: { profiles: true },
    });

    const matchedUsers = users.filter((user) => {
      const profile = user.profiles[0];
      if (!profile) return false;
      const userDob = profile.grade || '';
      return userDob.includes(dob);
    });

    if (matchedUsers.length === 0) {
      throw new NotFoundException(
        '일치하는 회원 정보가 없습니다. 회원가입을 먼저 진행해주세요.',
      );
    }

    if (matchedUsers.length > 1) {
      return {
        success: true,
        needSelection: true,
        candidates: matchedUsers.map((user) => ({
          userId: user.id,
          name: user.name,
          maskedPhone: this.maskPhoneNumber(user.profiles[0]?.phone || ''),
          grade: user.profiles[0]?.grade,
        })),
      };
    }

    const user = matchedUsers[0];

    const kioskToken = this.jwtService.sign(
      { userId: user.id, name: user.name, type: 'kiosk' },
      { expiresIn: '30m' },
    );

    return {
      success: true,
      needSelection: false,
      user: {
        userId: user.id,
        name: user.name,
        email: user.email,
      },
      kioskToken: kioskToken,
    };
  }

  async selectUser(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profiles: true },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const kioskToken = this.jwtService.sign(
      { userId: user.id, name: user.name, type: 'kiosk' },
      { expiresIn: '30m' },
    );

    return {
      success: true,
      user: {
        userId: user.id,
        name: user.name,
        email: user.email,
      },
      kioskToken: kioskToken,
    };
  }

  async getFacilities() {
    return await prisma.facility.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async getPrograms() {
    return await prisma.program.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBookings(status?: string) {
    try {
      const whereClause: any = {};
      
      if (status && status !== 'all') {
        whereClause.status = status;
      }

      const bookings = await prisma.booking.findMany({
        where: whereClause,
        include: {
          facility: {
            select: {
              id: true,
              name: true,
              icon: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      console.log('✅ 예약 목록 조회:', bookings.length, '건');

      return bookings.map(b => ({
        id: b.id,
        facility_id: b.facilityId,
        user_name: b.userName,
        date: b.date,
        time_slot: b.timeSlot,
        phone: b.phone,
        status: b.status,
        source: b.source,
        created_at: b.createdAt,
        facility: {
          id: b.facility.id,
          name: b.facility.name,
          icon: b.facility.icon
        }
      }));
    } catch (error) {
      console.error('❌ 예약 목록 조회 실패:', error);
      throw error;
    }
  }

  // ✅ 기존 예약 개수 확인
  async checkBookingCount(facilityId: string, date: string, phone: string) {
    try {
      const count = await prisma.booking.count({
        where: {
          facilityId,
          date: new Date(date),
          phone,
          status: 'active',
        },
      });

      return {
        success: true,
        count,
        remaining: Math.max(0, 2 - count),
      };
    } catch (error) {
      console.error('❌ 예약 개수 확인 실패:', error);
      throw error;
    }
  }

  // ✅ 예약 생성 (검증 추가)
  async addBooking(data: {
    facilityId: string;
    userName: string;
    date: string;
    timeSlot: string;
    phone?: string;
  }) {
    try {
      console.log('📥 예약 생성 요청:', data);

      const normalizedTimeSlot = data.timeSlot.replace(/\s/g, '');

      // ✅ 1. 같은 날, 같은 실습실에 이미 예약한 개수 확인
      if (data.phone) {
        const existingBookings = await prisma.booking.count({
          where: {
            facilityId: data.facilityId,
            date: new Date(data.date),
            phone: data.phone,
            status: 'active',
          },
        });

        // ✅ 2. 이미 2개 이상 예약했으면 거부
        if (existingBookings >= 2) {
          throw new BadRequestException(
            '같은 날, 같은 실습실은 1인당 최대 2시간까지만 예약 가능합니다.'
          );
        }
      }

      // ✅ 3. 해당 시간대에 이미 예약이 있는지 확인
      const conflictBooking = await prisma.booking.findFirst({
        where: {
          facilityId: data.facilityId,
          date: new Date(data.date),
          timeSlot: normalizedTimeSlot,
          status: 'active',
        },
      });

      if (conflictBooking) {
        throw new BadRequestException('해당 시간대는 이미 예약되었습니다.');
      }

      // ✅ 4. 예약 생성
      const booking = await prisma.booking.create({
        data: {
          facilityId: data.facilityId,
          userName: data.userName,
          date: new Date(data.date),
          timeSlot: normalizedTimeSlot,
          phone: data.phone || null,
          status: 'active',
          source: 'kiosk',
        },
        include: {
          facility: {
            select: {
              id: true,
              name: true,
              icon: true
            }
          }
        }
      });

      console.log('✅ 예약 생성 완료:', booking);

      return {
        id: booking.id,
        facility_id: booking.facilityId,
        user_name: booking.userName,
        date: booking.date,
        time_slot: booking.timeSlot,
        phone: booking.phone,
        status: booking.status,
        source: booking.source,
        created_at: booking.createdAt,
        facility: {
          id: booking.facility.id,
          name: booking.facility.name,
          icon: booking.facility.icon
        }
      };
    } catch (error) {
      console.error('❌ 예약 생성 실패:', error);
      throw error;
    }
  }

  async deleteBooking(bookingId: number) {
    await prisma.booking.delete({
      where: { id: bookingId },
    });
    return { success: true, message: '예약이 취소되었습니다.' };
  }

  async getApplications(programId?: number) {
    try {
      const whereClause: any = {};
      
      if (programId) {
        whereClause.program_id = programId;
      }

      const applications = await prisma.programApplication.findMany({
        where: whereClause,
        include: {
          program: true,
        },
        orderBy: { applied_at: 'asc' },
      });

      console.log(`✅ 신청 목록 조회${programId ? ` (프로그램 ID: ${programId})` : ''}:`, applications.length, '건');

      const result = applications.map((app, index) => {
        const program = app.program;
        const capacity = program.capacity || 0;
        const approvedCount = applications.filter(a => a.program_id === app.program_id && a.status === 'approved').length;
        
        let waitingNumber: number | null = null;
        let isWaiting = false;

        if (app.status === 'pending' && capacity > 0) {
          const pendingBeforeThis = applications.filter(
            a => a.program_id === app.program_id && 
                 a.status === 'pending' && 
                 new Date(a.applied_at) < new Date(app.applied_at)
          ).length;

          if (approvedCount >= capacity) {
            isWaiting = true;
            waitingNumber = pendingBeforeThis + 1;
          }
        }

        return {
          id: app.id,
          program_id: app.program_id,
          applicant_name: app.applicant_name,
          phone: app.phone,
          status: app.status,
          applied_at: app.applied_at,
          program: app.program,
          isWaiting,
          waitingNumber,
          programCapacity: capacity,
          approvedCount,
        };
      });

      return result;
    } catch (error) {
      console.error('❌ 신청 목록 조회 실패:', error);
      throw error;
    }
  }

  async addApplication(data: {
    programId: number;
    userName: string;
    phone?: string;
  }) {
    try {
      console.log('📥 프로그램 신청 요청:', data);

      const program = await prisma.program.findUnique({
        where: { id: data.programId }
      });

      if (!program) {
        throw new Error('프로그램을 찾을 수 없습니다.');
      }

      if (data.phone) {
        const existingApplication = await prisma.programApplication.findFirst({
          where: {
            program_id: data.programId,
            phone: data.phone,
          }
        });

        if (existingApplication) {
          throw new Error('이미 이 전화번호로 신청한 프로그램입니다.');
        }
      }

      const approvedCount = await prisma.programApplication.count({
        where: {
          program_id: data.programId,
          status: 'approved',
        }
      });

      const capacity = program.capacity || 0;
      
      let status = 'pending';
      if (capacity > 0 && approvedCount >= capacity) {
        status = 'pending';
        console.log(`⏳ 정원 초과: 대기자로 등록 (현재 ${approvedCount}/${capacity})`);
      }

      const application = await prisma.programApplication.create({
        data: {
          program_id: data.programId,
          user_id: null,
          applicant_name: data.userName,
          phone: data.phone,
          status: status,
        },
        include: {
          program: true,
        },
      });

      console.log('✅ 프로그램 신청 완료:', application);

      let waitingNumber: number | null = null;
      let isWaiting = false;
      
      if (capacity > 0 && approvedCount >= capacity) {
        const waitingCount = await prisma.programApplication.count({
          where: {
            program_id: data.programId,
            status: 'pending',
            applied_at: {
              lt: application.applied_at
            }
          }
        });
        isWaiting = true;
        waitingNumber = waitingCount + 1;
      }

      return {
        id: application.id,
        program_id: application.program_id,
        applicant_name: application.applicant_name,
        phone: application.phone,
        status: application.status,
        applied_at: application.applied_at,
        program: application.program,
        isWaiting,
        waitingNumber,
        programCapacity: capacity,
        approvedCount: approvedCount + (status === 'approved' ? 1 : 0),
      };
    } catch (error) {
      console.error('❌ 프로그램 신청 실패:', error);
      throw error;
    }
  }

  async deleteApplication(applicationId: number) {
    await prisma.programApplication.delete({
      where: { id: applicationId },
    });
    return { success: true, message: '신청이 취소되었습니다.' };
  }

  async approveApplication(applicationId: number) {
    try {
      const application = await prisma.programApplication.findUnique({
        where: { id: applicationId },
        include: { program: true }
      });

      if (!application) {
        throw new Error('신청을 찾을 수 없습니다.');
      }

      const capacity = application.program.capacity || 0;
      const approvedCount = await prisma.programApplication.count({
        where: {
          program_id: application.program_id,
          status: 'approved',
        }
      });

      if (capacity > 0 && approvedCount >= capacity) {
        throw new Error('정원이 마감되었습니다.');
      }

      const updated = await prisma.programApplication.update({
        where: { id: applicationId },
        data: { status: 'approved' },
        include: { program: true }
      });

      return {
        success: true,
        data: updated,
        message: '신청이 승인되었습니다.'
      };
    } catch (error) {
      console.error('❌ 신청 승인 실패:', error);
      throw error;
    }
  }

  async rejectApplication(applicationId: number) {
    try {
      const updated = await prisma.programApplication.update({
        where: { id: applicationId },
        data: { status: 'rejected' },
        include: { program: true }
      });

      return {
        success: true,
        data: updated,
        message: '신청이 거절되었습니다.'
      };
    } catch (error) {
      console.error('❌ 신청 거절 실패:', error);
      throw error;
    }
  }

  async kioskLogout(kioskLogId?: number) {
    if (kioskLogId) {
      console.log('키오스크 로그아웃:', kioskLogId);
    }
    return {
      success: true,
      message: '로그아웃되었습니다.',
    };
  }
}