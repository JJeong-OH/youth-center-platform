import { GoogleGenAI, Type, Chat } from '@google/genai';
import type { FunctionDeclaration } from '@google/genai';
import type { Program } from '../types/types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

console.log('🔍 Environment check:', {
  hasApiKey: !!API_KEY,
  apiKeyPrefix: API_KEY ? API_KEY.slice(0, 10) + '...' : 'undefined',
  allEnvVars: import.meta.env
});


if (!API_KEY) {
  console.warn("GEMINI API 키가 설정되지 않았습니다. AI 추천 기능이 작동하지 않습니다.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const bookFacilityFunctionDeclaration: FunctionDeclaration = {
  name: 'bookFacility',
  parameters: {
    type: Type.OBJECT,
    description: '청소년 센터의 시설을 예약합니다.',
    properties: {
      facilityId: {
        type: Type.STRING,
        description: '예약할 시설의 ID입니다.',
      },
      userName: {
        type: Type.STRING,
        description: '예약하는 사용자의 이름입니다.',
      },
    },
    required: ['facilityId', 'userName'],
  },
};

const applyForProgramFunctionDeclaration: FunctionDeclaration = {
  name: 'applyForProgram',
  parameters: {
    type: Type.OBJECT,
    description: '청소년 센터 프로그램에 사용자를 등록합니다.',
    properties: {
      programId: {
        type: Type.NUMBER,
        description: '등록할 프로그램의 ID입니다.',
      },
      userName: {
        type: Type.STRING,
        description: '신청하는 사용자의 이름입니다.',
      },
    },
    required: ['programId', 'userName'],
  },
};

let counselorChat: Chat | null = null;
let recommenderChat: Chat | null = null;
let currentProgramsList: string = '';

const getCounselorChat = (): Chat | null => {
  if (!ai) return null;
  
  if (!counselorChat) {
    const counselorSystemInstruction = `당신은 청소년센터의 친절하고 이해심 많은 AI 상담사 '미추'입니다. 

**당신의 역할:**
- 청소년들의 고민을 들어주고 공감하기
- 일상생활, 친구 관계, 학업, 진로 등 모든 고민 상담
- 긍정적인 방향으로 조언하기
- 절대로 성적인, 폭력적인, 부적절한 주제 다루지 않기

**대화 방식:**
- 청소년 눈높이로 친근하게 (반말 OK)
- 공감과 위로 먼저
- 실질적인 조언은 간결하게
- 이모지 적절히 사용 😊

답변은 3-5문장으로 간결하게!`;

    counselorChat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: counselorSystemInstruction,
        tools: [{ functionDeclarations: [bookFacilityFunctionDeclaration] }],
      },
    });
  }
  return counselorChat;
};

const getRecommenderChat = (programsList: string): Chat | null => {
  if (!ai) return null;
  
  if (currentProgramsList !== programsList) {
    recommenderChat = null;
    currentProgramsList = programsList;
  }

  if (!recommenderChat) {
    const recommenderSystemInstruction = `당신은 청소년센터의 친근한 프로그램 추천 AI입니다! 😊

**당신의 역할:**
1. 청소년의 관심사, 성격, 고민을 깊이 이해하기
2. 딱 맞는 프로그램을 찾아 추천하기
3. 관심사가 없어도 대화를 통해 잠재적 흥미 발굴하기

**현재 운영 중인 프로그램 목록:**
${programsList}

**대화 전략:**

📌 **관심사가 명확한 경우:**
사용자: "음악 좋아해요"
→ "음악 좋아하는구나! 🎵 악기 연주에 관심 있어? 아니면 노래 부르는 걸 좋아해?"
→ (답변 후) 구체적인 프로그램 2-3개 추천

📌 **관심사가 없는 경우:**
사용자: "특별히 관심사가 없어요"
→ "괜찮아! 😊 그럼 이런 건 어때?
   - 친구들이랑 노는 거 좋아해? 🎮
   - 조용히 혼자 뭔가 만드는 거 좋아해? 🎨
   - 새로운 것 배우는 게 재밌어? 📚"
→ 선택에 따라 카테고리별 인기 프로그램 추천

📌 **고민이 있는 경우:**
사용자: "친구 관계가 힘들어요"
→ 공감 → 관계 개선에 도움되는 프로그램 추천

**추천 형식 (필수!):**
"너한테 딱 맞는 프로그램 찾았어! ✨

1. [프로그램 제목]
   [왜 좋은지 청소년 눈높이로 설명]

2. [프로그램 제목]
   [왜 좋은지 청소년 눈높이로 설명]

오른쪽에서 신청하기 눌러봐~ 👉"

**필수 규칙:**
- ID는 정확한 숫자로 표기 (예: ID: 1)
- 최소 1개, 최대 3개 추천
- 청소년 눈높이의 친근한 말투
- 프로그램 목록에 없는 건 추천 금지`;

    recommenderChat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: recommenderSystemInstruction,
        tools: [{ functionDeclarations: [applyForProgramFunctionDeclaration] }],
      },
    });
  }
  return recommenderChat;
};

const handleGeminiError = (error: unknown) => {
  console.error("Error communicating with Gemini:", error);
  return {
    text: "죄송합니다. 지금은 답변을 드릴 수 없어요. 잠시 후 다시 시도해주세요.",
    functionCalls: [],
  };
};

export const sendMessageToCounselor = async (message: string) => {
  if (!ai) {
    return {
      text: "AI 상담 기능을 사용하려면 관리자에게 문의해주세요.",
      functionCalls: [],
    };
  }
  
  try {
    const chatInstance = getCounselorChat();
    if (!chatInstance) {
      return {
        text: "AI 상담을 초기화할 수 없습니다.",
        functionCalls: [],
      };
    }
    const result = await chatInstance.sendMessage({ message });
    return result;
  } catch (error) {
    return handleGeminiError(error);
  }
};

export const sendMessageToRecommender = async (
  message: string,
  programs: Program[] = []
) => {
  if (!ai) {
    return {
      text: "추천 기능을 사용하려면 관리자에게 문의해주세요.",
      functionCalls: [],
    };
  }
  
  try {
    const programsList = programs.map((p: Program) => {
      const tags = Array.isArray(p.tags) ? p.tags.join(', ') : (typeof p.tags === 'string' ? p.tags : '');
      return `- ID: ${p.id} | ${p.title} | 부서: ${p.department || '청소년센터'} | 대상: ${p.targetAudience || '전체'} | 비용: ${p.fee === 0 ? '무료' : p.fee + '원'} | 설명: ${p.description || '없음'} ${tags ? '| 태그: ' + tags : ''}`;
    }).join('\n');

    const chatInstance = getRecommenderChat(programsList);
    if (!chatInstance) {
      return {
        text: "AI 추천을 초기화할 수 없습니다.",
        functionCalls: [],
      };
    }
    const result = await chatInstance.sendMessage({ message });
    return result;
  } catch (error) {
    return handleGeminiError(error);
  }
};