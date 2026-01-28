import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AiService } from './ai.service';
import { AuthGuard } from '@nestjs/passport';
import { PrismaClient } from '@prisma/client';

@Controller('ai')
export class AiController {
  private prisma = new PrismaClient();

  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @UseGuards(AuthGuard('jwt'))
  async getAIChatResponse(
    @Body('message') message: string,
    @Req() req,
  ) {
    try {
      if (!message || message.trim() === '') {
        return {
          success: false,
          reply: '메시지를 입력해주세요.',
        };
      }

      const userId = req.user.userId.toString();
      
      console.log(`📨 [${userId}] 메시지 수신:`, message);

      const aiResponse = await this.aiService.sendChatMessage(message, userId);

      return { 
        success: true,
        reply: aiResponse 
      };
    } catch (error) {
      console.error('❌ 채팅 오류:', error);
      return {
        success: false,
        reply: '죄송합니다. 응답 중 오류가 발생했습니다. 다시 시도해주세요.',
        error: error.message
      };
    }
  }

  // ✅ 키오스크용 프로그램 추천
  @Post('recommend-programs')
  async recommendPrograms(
    @Body('message') message: string,
    @Body('sessionId') sessionId: string,
  ) {
    try {
      if (!message || message.trim() === '') {
        return {
          success: false,
          reply: '관심사를 입력해주세요.',
          recommendedPrograms: []
        };
      }

      console.log(`🎯 [${sessionId}] 추천 요청:`, message);

      // 1. 모든 활성 프로그램 가져오기
      const programs = await this.prisma.program.findMany({
        where: { isActive: true },
        select: {
          id: true,
          title: true,
          department: true,
          description: true,
          tags: true,
          targetAudience: true,
          fee: true,
        },
        orderBy: { order: 'asc' }
      });

      // 2. AI에게 추천 요청
      const recommendation = await this.aiService.recommendPrograms(
        message,
        programs,
        sessionId
      );

      return {
        success: true,
        ...recommendation
      };
    } catch (error) {
      console.error('❌ 추천 오류:', error);
      return {
        success: false,
        reply: '죄송합니다. 추천 중 오류가 발생했습니다.',
        recommendedPrograms: []
      };
    }
  }

  @Post('reset')
  @UseGuards(AuthGuard('jwt'))
  async resetChatSession(@Req() req) {
    try {
      const userId = req.user.userId.toString();
      this.aiService.clearChatSession(userId);
      
      return {
        success: true,
        message: '채팅 세션이 초기화되었습니다.'
      };
    } catch (error) {
      return {
        success: false,
        message: '세션 초기화 중 오류가 발생했습니다.'
      };
    }
  }
}