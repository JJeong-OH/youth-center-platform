// backend/src/ai/ai.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private model;
  
  // 키오스크 채팅용 (대화 히스토리 저장)
  private chatSessions: Map<string, any> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.genAI = new GoogleGenerativeAI(
      configService.getOrThrow<string>('GEMINI_API_KEY'),
    );
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async listModels() {
    console.log('--- 사용 가능한 AI 모델 목록 ---');
    // @ts-ignore
    const result = await this.genAI.listModels();
    for await (const m of result) {
      if (m.supportedGenerationMethods.includes('generateContent')) {
        console.log(m.name);
      }
    }
    console.log('------------------------------');
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('AI 응답 성공:', text.substring(0, 50) + '...');
      return text;
    } catch (error) {
      console.error('Gemini API 오류:', error);
      throw new Error('AI 응답 생성 중 오류가 발생했습니다.');
    }
  }

  // ============= 키오스크 채팅 메서드 추가 =============

  async sendChatMessage(
    message: string,
    sessionId: string,
    systemPrompt: string,
  ): Promise<string> {
    try {
      // 세션별 채팅 가져오기 또는 생성
      let chat = this.chatSessions.get(sessionId);
      
      if (!chat) {
        // 새 채팅 세션 시작
        chat = this.model.startChat({
          history: [
            {
              role: 'user',
              parts: [{ text: systemPrompt }],
            },
            {
              role: 'model',
              parts: [{ text: '네, 이해했습니다. 도와드릴게요!' }],
            },
          ],
        });
        this.chatSessions.set(sessionId, chat);
        console.log(`새 채팅 세션 생성: ${sessionId}`);
      }

      // 메시지 전송
      const result = await chat.sendMessage(message);
      const response = await result.response;
      const text = response.text();
      
      console.log(`[${sessionId}] AI 응답:`, text.substring(0, 50) + '...');
      return text;
    } catch (error) {
      console.error('Gemini 채팅 오류:', error);
      throw new Error('AI 채팅 중 오류가 발생했습니다.');
    }
  }

  // 세션 정리
  clearChatSession(sessionId: string) {
    this.chatSessions.delete(sessionId);
    console.log(`채팅 세션 삭제: ${sessionId}`);
  }

  // 모든 세션 정리
  clearAllChatSessions() {
    this.chatSessions.clear();
    console.log('모든 채팅 세션 삭제');
  }
}