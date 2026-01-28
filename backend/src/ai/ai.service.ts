import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private model;
  
  private chatSessions: Map<string, any> = new Map();

  constructor(private readonly configService: ConfigService) {
    const apiKey = configService.get<string>('GEMINI_API_KEY');
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash'
    });
    
    console.log('✅ Gemini AI 초기화 완료 (gemini-2.5-flash)');
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      console.log('✅ AI 응답 성공:', text.substring(0, 50) + '...');
      return text;
    } catch (error) {
      console.error('❌ Gemini API 오류:', error);
      throw new Error('AI 응답 생성 중 오류가 발생했습니다.');
    }
  }

  async sendChatMessage(
    message: string,
    userId: string,
  ): Promise<string> {
    try {
      let chat = this.chatSessions.get(userId);
      
      if (!chat) {
        const systemPrompt = `당신은 청소년의 고민을 들어주는 따뜻한 AI 상담사 '미추'입니다.
청소년의 눈높이에 맞춰 친절하고 공감하는 답변을 해주세요.
답변은 3-5문장 정도로 간결하게 작성해주세요.
절대로 성적인, 폭력적인, 또는 부적절한 주제에 대해 이야기하지 마세요.`;

        chat = this.model.startChat({
          history: [
            {
              role: 'user',
              parts: [{ text: systemPrompt }],
            },
            {
              role: 'model',
              parts: [{ text: '안녕! 나는 미추야. 무슨 고민이든 편하게 얘기해줘 😊' }],
            },
          ],
          generationConfig: {
            temperature: 0.9,
            topP: 0.95,
            maxOutputTokens: 500,
          },
        });
        
        this.chatSessions.set(userId, chat);
        console.log(`✅ 새 채팅 세션 생성: ${userId}`);
      }

      const result = await chat.sendMessage(message);
      const response = result.response;
      const text = response.text();
      
      console.log(`✅ [${userId}] AI 응답:`, text.substring(0, 50) + '...');
      return text;
    } catch (error) {
      console.error('❌ Gemini 채팅 오류:', error);
      throw new Error('AI 채팅 중 오류가 발생했습니다.');
    }
  }

  // ✅ 프로그램 추천 메서드
  async recommendPrograms(
    userMessage: string,
    programs: any[],
    sessionId: string,
  ): Promise<{ reply: string; recommendedPrograms: number[] }> {
    try {
      // 프로그램 목록을 텍스트로 변환
      const programList = programs.map((p, index) => {
        const tags = Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags ? JSON.stringify(p.tags) : '없음');
        return `${index + 1}. [ID:${p.id}] ${p.title}
   - 부서: ${p.department || '미정'}
   - 대상: ${p.targetAudience || '전체'}
   - 설명: ${p.description || '설명 없음'}
   - 태그: ${tags}
   - 비용: ${p.fee === 0 ? '무료' : p.fee + '원'}`;
      }).join('\n\n');

      const prompt = `당신은 청소년센터의 친절한 프로그램 추천 AI입니다.

사용자의 관심사: "${userMessage}"

아래는 사용 가능한 프로그램 목록입니다:

${programList}

작업:
1. 사용자의 관심사를 분석하세요
2. 가장 적합한 프로그램 2-3개를 추천하세요
3. 각 프로그램이 왜 적합한지 친근하게 설명하세요

응답 형식 (반드시 이 형식을 지켜주세요):
PROGRAM_IDS: [프로그램ID1, 프로그램ID2, 프로그램ID3]

안녕하세요! 😊 여러분의 관심사를 듣고 딱 맞는 프로그램을 찾아봤어요!

**추천 프로그램:**

1. **프로그램이름1**
   이유를 친근하게 설명...

2. **프로그램이름2**
   이유를 친근하게 설명...

3. **프로그램이름3**
   이유를 친근하게 설명...

더 궁금한 게 있으면 물어봐주세요! 🎉`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      console.log(`✅ [${sessionId}] AI 추천:`, text.substring(0, 100) + '...');

      // 프로그램 ID 추출
      const idsMatch = text.match(/PROGRAM_IDS:\s*\[([\d,\s]+)\]/);
      const recommendedIds = idsMatch 
        ? idsMatch[1].split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
        : [];

      // PROGRAM_IDS 라인 제거
      const cleanedText = text.replace(/PROGRAM_IDS:\s*\[[\d,\s]+\]\n\n?/, '');

      return {
        reply: cleanedText,
        recommendedPrograms: recommendedIds
      };
    } catch (error) {
      console.error('❌ 프로그램 추천 오류:', error);
      throw new Error('프로그램 추천 중 오류가 발생했습니다.');
    }
  }

  clearChatSession(userId: string) {
    this.chatSessions.delete(userId);
    console.log(`🗑️ 채팅 세션 삭제: ${userId}`);
  }

  clearAllChatSessions() {
    this.chatSessions.clear();
    console.log('🗑️ 모든 채팅 세션 삭제');
  }
}