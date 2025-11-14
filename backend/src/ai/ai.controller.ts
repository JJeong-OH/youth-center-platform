// backend/src/ai/ai.controller.ts
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AiService } from './ai.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @UseGuards(AuthGuard('jwt')) // JWT 인증 필수
  async getAIChatResponse(
    @Body('message') message: string,
    @Req() req,
  ) {
    try {
      // 사용자 정보 가져오기
      const userName = req.user.name;

      // AI에게 역할과 사용자 정보를 함께 전달
      const prompt = `당신은 청소년의 고민을 들어주는 따뜻한 AI 상담사 '미추'입니다. 
상대방의 이름은 '${userName}'입니다. 
'${userName}'님의 다음 메시지에 대해 친절하고 공감하는 답변을 해주세요: "${message}"

답변은 3-5문장 정도로 간결하게 작성해주세요.`;

      const aiResponse = await this.aiService.generateText(prompt);

      return { 
        success: true,
        reply: aiResponse 
      };
    } catch (error) {
      console.error('채팅 오류:', error);
      return {
        success: false,
        reply: '죄송합니다. 응답 중 오류가 발생했습니다. 다시 시도해주세요.',
        error: error.message
      };
    }
  }
}