import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { AdminGuard } from '../admin/admin.guard';

@Controller('facilities') // ✅ 'api/facilities' → 'facilities'로 변경
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  // 전체 시설 조회
  @Get()
  async getAllFacilities(@Query('includeInactive') includeInactive?: string) {
    return this.facilitiesService.getAllFacilities(
      includeInactive === 'true',
    );
  }

  // 시설 1개 조회
  @Get(':id')
  async getFacilityById(@Param('id') id: string) {
    return this.facilitiesService.getFacilityById(id);
  }

  // 시설 생성 (관리자용)
  @Post()
  @UseGuards(AdminGuard)
  async createFacility(
    @Body()
    body: {
      name: string;
      icon?: string;
      description?: string;
      capacity?: number;
      order?: number;
    },
  ) {
    try {
      return await this.facilitiesService.createFacility(body);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // 시설 수정 (관리자용)
  @Put(':id')
  @UseGuards(AdminGuard)
  async updateFacility(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      icon?: string;
      description?: string;
      capacity?: number;
      order?: number;
      isActive?: boolean;
    },
  ) {
    try {
      return await this.facilitiesService.updateFacility(id, body);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // 시설 삭제 (관리자용 - soft delete)
  @Delete(':id')
  @UseGuards(AdminGuard)
  async deleteFacility(@Param('id') id: string) {
    try {
      return await this.facilitiesService.deleteFacility(id);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // 시설 완전 삭제 (관리자용)
  @Delete(':id/hard')
  @UseGuards(AdminGuard)
  async hardDeleteFacility(@Param('id') id: string) {
    try {
      return await this.facilitiesService.hardDeleteFacility(id);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}