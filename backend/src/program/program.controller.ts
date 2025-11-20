import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
  Request,
  Param,
  Query,
} from '@nestjs/common';
import { ProgramService } from './program.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../admin/admin.guard';

@Controller('program')
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  // 맞춤 프로그램 추천
  @Get('recommended')
  @UseGuards(AuthGuard('jwt'))
  async getRecommended(@Request() req) {
    try {
      return await this.programService.getRecommendedPrograms(req.user.userId);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // 전체 프로그램 목록 (관리자용 - includeInactive)
  @Get('all')
  async getAllPrograms(@Query('includeInactive') includeInactive?: string) {
    try {
      return await this.programService.getAllPrograms(
        includeInactive === 'true',
      );
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // 프로그램 1개 조회
  @Get(':id')
  async getProgramById(@Param('id') id: string) {
    try {
      return await this.programService.getProgramById(parseInt(id));
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // 프로그램 생성 (관리자용)
  @Post('create')
  @UseGuards(AdminGuard)
  async createProgram(
    @Body()
    body: {
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
    },
  ) {
    try {
      return await this.programService.createProgram(body);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // 프로그램 수정 (관리자용)
  @Put(':id')
  @UseGuards(AdminGuard)
  async updateProgram(
    @Param('id') id: string,
    @Body()
    body: {
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
      return await this.programService.updateProgram(parseInt(id), body);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // 프로그램 삭제 (관리자용 - soft delete)
  @Delete(':id')
  @UseGuards(AdminGuard)
  async deleteProgram(@Param('id') id: string) {
    try {
      return await this.programService.deleteProgram(parseInt(id));
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // 프로그램 완전 삭제 (관리자용)
  @Delete(':id/hard')
  @UseGuards(AdminGuard)
  async hardDeleteProgram(@Param('id') id: string) {
    try {
      return await this.programService.hardDeleteProgram(parseInt(id));
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}