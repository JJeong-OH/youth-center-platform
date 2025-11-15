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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FacilitiesService } from './facilities.service';
import { AdminGuard } from '../admin/admin.guard';

@Controller('facilities')
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  // ✅ 이미지 업로드 설정
  private getMulterOptions() {
    return {
      storage: diskStorage({
        destination: './uploads/facilities',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `facility-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(
            new BadRequestException('이미지 파일만 업로드 가능합니다.'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    };
  }

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

  // ✅ 시설 생성 (이미지 업로드 포함)
  @Post()
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('image'))
  async createFacility(
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      const icon = file 
        ? `/uploads/facilities/${file.filename}` 
        : (body.icon || '🏢');

      return await this.facilitiesService.createFacility({
        name: body.name,
        icon,
        description: body.description,
        capacity: body.capacity ? parseInt(body.capacity) : undefined,
        order: body.order ? parseInt(body.order) : 0,
      });
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // ✅ 시설 수정 (이미지 업로드 포함)
  @Put(':id')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('image'))
  async updateFacility(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      const updateData: any = {
        name: body.name,
        description: body.description,
        capacity: body.capacity ? parseInt(body.capacity) : undefined,
        order: body.order ? parseInt(body.order) : 0,
      };

      // 새 이미지가 업로드되면 경로 업데이트
      if (file) {
        updateData.icon = `/uploads/facilities/${file.filename}`;
      } else if (body.icon && !body.icon.startsWith('/uploads')) {
        // 이모지인 경우
        updateData.icon = body.icon;
      }

      // isActive 처리
      if (body.isActive !== undefined) {
        updateData.isActive = body.isActive === 'true' || body.isActive === true;
      }

      return await this.facilitiesService.updateFacility(id, updateData);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // 시설 삭제 (soft delete)
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

  // 시설 완전 삭제
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