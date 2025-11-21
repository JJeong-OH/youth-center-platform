import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class FacilitiesService {
  // 전체 시설 조회
  async getAllFacilities(includeInactive = false) {
    const facilities = await prisma.facility.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { order: 'asc' },
    });

    return {
      success: true,
      facilities,
    };
  }

  // 시설 1개 조회
  async getFacilityById(id: string) {
    const facility = await prisma.facility.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            date: {
              gte: new Date(),
            },
          },
          orderBy: { date: 'asc' },
        },
      },
    });

    if (!facility) {
      return {
        success: false,
        message: '시설을 찾을 수 없습니다.',
      };
    }

    return {
      success: true,
      facility,
    };
  }

  // 시설 생성
  async createFacility(data: {
    name: string;
    icon?: string;
    description?: string;
    capacity?: number;
    floor?: string;
    order?: number;
  }) {
    const facility = await prisma.facility.create({
      data: {
        name: data.name,
        icon: data.icon || '🏢',
        description: data.description,
        capacity: data.capacity,
        floor: data.floor,
        order: data.order || 0,
        isActive: true,
      },
    });

    return {
      success: true,
      facility,
      message: '시설이 생성되었습니다.',
    };
  }

  // 시설 수정
  async updateFacility(
    id: string,
    data: {
      name?: string;
      icon?: string;
      description?: string;
      capacity?: number;
      floor?: string;
      order?: number;
      isActive?: boolean;
    },
  ) {
    try {
      const facility = await prisma.facility.update({
        where: { id },
        data,
      });

      return {
        success: true,
        facility,
        message: '시설이 수정되었습니다.',
      };
    } catch (error) {
      return {
        success: false,
        message: '시설을 찾을 수 없습니다.',
      };
    }
  }

  // ✅ 시설 삭제 (Hard Delete로 변경!)
  async deleteFacility(id: string) {
    try {
      // 먼저 관련 예약 내역 삭제
      await prisma.booking.deleteMany({
        where: { facilityId: id },
      });

      // 시설 삭제
      await prisma.facility.delete({
        where: { id },
      });

      return {
        success: true,
        message: '시설이 완전히 삭제되었습니다.',
      };
    } catch (error) {
      console.error('시설 삭제 에러:', error);
      return {
        success: false,
        message: '시설을 삭제할 수 없습니다. 관련 데이터를 확인해주세요.',
      };
    }
  }

  // 시설 비활성화 (Soft Delete)
  async deactivateFacility(id: string) {
    try {
      const facility = await prisma.facility.update({
        where: { id },
        data: { isActive: false },
      });

      return {
        success: true,
        message: '시설이 비활성화되었습니다.',
      };
    } catch (error) {
      return {
        success: false,
        message: '시설을 찾을 수 없습니다.',
      };
    }
  }

  // 시설 완전 삭제 (기존 유지)
  async hardDeleteFacility(id: string) {
    try {
      await prisma.booking.deleteMany({
        where: { facilityId: id },
      });

      await prisma.facility.delete({
        where: { id },
      });

      return {
        success: true,
        message: '시설이 완전히 삭제되었습니다.',
      };
    } catch (error) {
      return {
        success: false,
        message: '시설을 삭제할 수 없습니다.',
      };
    }
  }
}