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
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FacilitiesService } from './facilities.service';
import { AdminGuard } from '../admin/admin.guard';

@Controller('facilities')
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  // 이미지 업로드 설정
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

  @Get()
  async getAllFacilities(@Query('includeInactive') includeInactive?: string) {
    return this.facilitiesService.getAllFacilities(
      includeInactive === 'true',
    );
  }

  @Get(':id')
  async getFacilityById(@Param('id') id: string) {
    return this.facilitiesService.getFacilityById(id);
  }

  @Post()
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('image'))
  async createFacility(
    @Body() body: any,
    @UploadedFile() file?: any,
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
        floor: body.floor || null,
        order: body.order ? parseInt(body.order) : undefined, // ✅ 0 → undefined
      });
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('image'))
  async updateFacility(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFile() file?: any,
    @Req() req?: any,
  ) {
    try {
      // ✅ Content-Type이 JSON인지 확인
      const isJson = req?.headers['content-type']?.includes('application/json');
      
      const updateData: any = {};

      // ✅ undefined가 아닌 필드만 추가
      if (body.name !== undefined) {
        updateData.name = body.name;
      }
      if (body.description !== undefined) {
        updateData.description = body.description;
      }
      if (body.capacity !== undefined) {
        updateData.capacity = parseInt(body.capacity);
      }
      if (body.floor !== undefined) {
        updateData.floor = body.floor;
      }
      if (body.order !== undefined) {
        updateData.order = parseInt(body.order);
      }

      // ✅ 아이콘 처리
      if (file) {
        updateData.icon = `/uploads/facilities/${file.filename}`;
      } else if (body.icon !== undefined && !body.icon.startsWith('/uploads')) {
        updateData.icon = body.icon;
      }

      // ✅ isActive 처리
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