import { GoogleGenAI, Type, Chat } from '@google/genai';
import type { FunctionDeclaration } from '@google/genai';
import { YOUTH_PROGRAMS, YOUTH_FACILITIES } from '../constants/constants';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const applyForProgramFunctionDeclaration: FunctionDeclaration = {
  name: 'applyForProgram',
  parameters: {
    type: Type.OBJECT,
    description: '청소년 센터 프로그램에 사용자를 등록합니다.',
    properties: {
      programId: {
        type: Type.STRING,
        description: '등록할 프로그램의 ID입니다. (예: prog_001)',
      },
      userName: {
        type: Type.STRING,
        description: '신청하는 사용자의 이름입니다.',
      },
    },
    required: ['programId', 'userName'],
  },
};

const bookFacilityFunctionDeclaration: FunctionDeclaration = {
  name: 'bookFacility',
  parameters: {
    type: Type.OBJECT,
    description: '청소년 센터의 시설을 예약합니다. 예약은 당일만 가능합니다.',
    properties: {
      facilityId: {
        type: Type.STRING,
        description: '예약할 시설의 ID입니다. (예: fac_001)',
      },
      userName: {
        type: Type.STRING,
        description: '예약하는 사용자의 이름입니다.',
      },
    },
    required: ['facilityId', 'userName'],
  },
};

const programsList = YOUTH_PROGRAMS.map(p => `- ${p.name} (ID: ${p.id}, 카테고리: ${p.category}): ${p.description}`).join('\n');
const facilitiesList = YOUTH_FACILITIES.map(f => `- ${f.name} (ID: ${f.id}): ${f.description}`).join('\n');

const counselorSystemInstruction = `당신은 청소년센터의 친절하고 이해심 많은 AI 상담사입니다. 당신의 역할은 청소년들의 고민을 들어주고, 공감하며, 긍정적인 방향으로 나아갈 수 있도록 돕는 것입니다. 절대로 성적인, 폭력적인, 또는 부적절한 주제에 대해 이야기해서는 안 됩니다. 항상 청소년의 눈높이에 맞춰 안전하고 건전한 대화를 이끌어주세요.
또한, 센터의 시설 예약도 도와줄 수 있습니다. 사용자가 시설을 예약하고 싶어하면, 'bookFacility' 함수를 사용해야 합니다. 이때, 사용자의 이름을 물어본 후 함수를 호출하세요.
프로그램 추천이나 신청에 대해서는 "프로그램 추천" 메뉴에서 도와드릴 수 있다고 안내해주세요.
사용 가능한 시설 목록은 다음과 같습니다:\n${facilitiesList}`;

const recommenderSystemInstruction = `당신은 청소년센터의 활기찬 프로그램 추천 AI입니다. 당신의 목표는 사용자의 관심사를 파악하여 가장 적합한 프로그램을 추천하는 것입니다.
사용자와 대화하며 흥미, 취미, 배우고 싶은 것 등을 물어보세요. 대화를 바탕으로 아래 목록에서 가장 적절한 프로그램을 추천해주세요.
중요: 프로그램을 추천할 때는 반드시 프로그램 이름과 함께 괄호 안에 ID를 포함해야 합니다. 예: '코딩 동아리 "코드브레이커" (ID: prog_001)'. 당신의 답변에 ID가 포함되면, 화면 오른쪽의 프로그램 목록이 자동으로 필터링되어 해당 프로그램만 표시됩니다.
사용자는 오른쪽 목록의 '신청하기' 버튼을 누르거나, 대화를 통해 직접 신청할 수 있습니다.
사용자가 대화를 통해 특정 프로그램에 가입하고 싶어하면, 반드시 'applyForProgram' 함수를 사용해야 합니다. 이때, 사용자의 이름을 물어본 후 함수를 호출하세요.
사용 가능한 프로그램 목록은 다음과 같습니다:\n${programsList}`;

let counselorChat: Chat | null = null;
let recommenderChat: Chat | null = null;

const getCounselorChat = (): Chat => {
  if (!counselorChat) {
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

const getRecommenderChat = (): Chat => {
  if (!recommenderChat) {
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
    try {
        const chatInstance = getCounselorChat();
        const result = await chatInstance.sendMessage({ message });
        return result;
    } catch (error) {
        return handleGeminiError(error);
    }
};

export const sendMessageToRecommender = async (message: string) => {
    try {
        const chatInstance = getRecommenderChat();
        const result = await chatInstance.sendMessage({ message });
        return result;
    } catch (error) {
        return handleGeminiError(error);
    }
};