import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // 관리자 로그인
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    try {
      return await this.adminService.login(body.email, body.password);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // 대시보드 통계
  @Get('dashboard')
  @UseGuards(AdminGuard)
  async getDashboard() {
    try {
      return await this.adminService.getDashboardStats();
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // 전체 회원 목록
  @Get('users')
  @UseGuards(AdminGuard)
  async getUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    try {
      return await this.adminService.getAllUsers(
        parseInt(page),
        parseInt(limit),
      );
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // 회원 상세
  @Get('users/:id')
  @UseGuards(AdminGuard)
  async getUserDetail(@Param('id') id: string) {
    try {
      return await this.adminService.getUserDetail(parseInt(id));
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // 설문 통계
  @Get('surveys/stats')
  @UseGuards(AdminGuard)
  async getSurveyStats() {
    try {
      return await this.adminService.getSurveyStats();
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // ✅ 통합 사용자 통계
  @Get('integrated-users')
  @UseGuards(AdminGuard)
  async getIntegratedUsers() {
    try {
      return await this.adminService.getIntegratedUserStats();
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // ✅ 사용자 상세 조회 (전화번호 기준)
  @Get('user-detail/:phone')
  @UseGuards(AdminGuard)
  async getUserDetailByPhone(@Param('phone') phone: string) {
    try {
      return await this.adminService.getUserDetailByPhone(phone);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}