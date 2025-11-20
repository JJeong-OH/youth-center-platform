import { Controller, Post, Get, Delete, Body, Param, Query } from '@nestjs/common';
import { KioskService } from './kiosk.service';
import { AiService } from '../ai/ai.service';

@Controller('kiosk')
export class KioskController {
  constructor(
    private readonly kioskService: KioskService,
    private readonly aiService: AiService,
  ) {}

  // ============= 인증 엔드포인트 =============

  @Post('auth/login')
  async kioskLogin(
    @Body()
    body: {
      name: string;
      dob: string;
      gender: string;
    },
  ) {
    try {
      return await this.kioskService.kioskLogin(
        body.name,
        body.dob,
        body.gender,
      );
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Post('auth/select')
  async selectUser(@Body() body: { userId: number }) {
    try {
      return await this.kioskService.selectUser(body.userId);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Post('auth/logout')
  async kioskLogout(@Body() body: { kioskLogId: number }) {
    try {
      return await this.kioskService.kioskLogout(body.kioskLogId);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // ============= AI 채팅 엔드포인트 =============

  @Post('ai/chat')
  async sendAIMessage(
    @Body()
    body: {
      message: string;
      sessionId: string;
      type: 'counselor' | 'recommender';
    },
  ) {
    try {
      // ✅ sessionId를 userId로 사용 (키오스크는 세션 기반)
      const response = await this.aiService.sendChatMessage(
        body.message,
        body.sessionId,
      );

      return {
        success: true,
        data: {
          text: response,
          functionCalls: [],
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: {
          text: '죄송합니다. 지금은 답변을 드릴 수 없어요. 잠시 후 다시 시도해주세요.',
          functionCalls: [],
        },
      };
    }
  }

  // ============= 시설/프로그램 정보 조회 =============

  @Get('facilities')
  async getFacilities() {
    try {
      return await this.kioskService.getFacilities();
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get('programs')
  async getPrograms() {
    try {
      return await this.kioskService.getPrograms();
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // ============= 시설 예약 =============

  @Get('bookings')
  async getBookings(@Query('status') status?: string) {
    try {
      return await this.kioskService.getBookings(status);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get('bookings/check')
  async checkBookingCount(
    @Query('facilityId') facilityId: string,
    @Query('date') date: string,
    @Query('phone') phone: string,
  ) {
    try {
      return await this.kioskService.checkBookingCount(facilityId, date, phone);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Post('bookings')
  async addBooking(
    @Body()
    body: {
      facilityId: string;
      userName: string;
      date: string;
      timeSlot: string;
      phone?: string;
      purpose?: string;
    },
  ) {
    try {
      const booking = await this.kioskService.addBooking(body);
      return {
        success: true,
        data: booking,
        message: '예약이 완료되었습니다!',
      };
    } catch (error) {
      if (error.code === 'P2002') {
        return {
          success: false,
          error: '해당 시간대는 이미 예약되어 있습니다.',
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Delete('bookings/:id')
  async deleteBooking(@Param('id') id: string) {
    try {
      return await this.kioskService.deleteBooking(parseInt(id));
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // ============= 프로그램 신청 =============

  @Get('applications')
  async getApplications(@Query('programId') programId?: string) {
    try {
      const pid = programId ? parseInt(programId) : undefined;
      return await this.kioskService.getApplications(pid);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Post('applications')
  async addApplication(
    @Body()
    body: {
      programId: number;
      userName: string;
      phone?: string;
      motivation?: string;
    },
  ) {
    try {
      const application = await this.kioskService.addApplication(body);
      return {
        success: true,
        data: application,
        message: '신청이 완료되었습니다!',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Delete('applications/:id')
  async deleteApplication(@Param('id') id: string) {
    try {
      return await this.kioskService.deleteApplication(parseInt(id));
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Post('applications/:id/approve')
  async approveApplication(@Param('id') id: string) {
    try {
      return await this.kioskService.approveApplication(parseInt(id));
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Post('applications/:id/reject')
  async rejectApplication(@Param('id') id: string) {
    try {
      return await this.kioskService.rejectApplication(parseInt(id));
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}