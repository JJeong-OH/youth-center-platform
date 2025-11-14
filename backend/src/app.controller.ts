import { Controller, Get } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Controller()
export class AppController {
  @Get()
  async getStatus(): Promise<object> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        server: 'Youth-Backend 서버가 성공적으로 실행 중입니다!',
        database: '연결 성공 (Connection Successful)',
      };
    } catch (error) {
      return {
        server: 'Youth-Backend 서버는 실행 중이지만,',
        database: '연결 실패 (Connection Failed)',
        error: error.message,
      };
    }
  }
}