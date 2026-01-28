// Gemini API 직접 호출 (간단 버전)
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

interface Program {
  id: number;
  title: string;
  department: string | null;
  description: string | null;
  targetAudience: string | null;
  fee: number;
}

export async function getAIRecommendation(userMessage: string, programs: Program[]) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API 키가 설정되지 않았습니다.');
  }

  const programsList = programs.map(p => 
    `- ID: ${p.id} | ${p.title} | 부서: ${p.department || '청소년센터'} | 대상: ${p.targetAudience || '전체'} | 비용: ${p.fee === 0 ? '무료' : p.fee + '원'}`
  ).join('\n');

  const systemPrompt = `당신은 청소년센터의 친근한 프로그램 추천 AI입니다! 😊

**현재 운영 중인 프로그램 목록:**
${programsList}

**대화 전략:**
1. 청소년의 관심사, 성격, 고민을 깊이 이해하기
2. 딱 맞는 프로그램을 찾아 추천하기
3. 관심사가 없어도 대화를 통해 잠재적 흥미 발굴하기

**추천 형식 (필수!):**
"너한테 딱 맞는 프로그램 찾았어! ✨

1. **[프로그램 제목]** (ID: [숫자])
   [왜 좋은지 청소년 눈높이로 설명]

아래 카드에서 '신청하기'를 눌러봐~ 👇"

**필수 규칙:**
- ID는 정확한 숫자로 표기 (예: ID: 1)
- 최소 1개, 최대 3개 추천
- 청소년 눈높이의 친근한 말투
- 프로그램 목록에 없는 건 추천 금지`;

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        { parts: [{ text: systemPrompt }] },
        { parts: [{ text: userMessage }] }
      ]
    })
  });

  const data = await response.json();
  const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '죄송합니다. 응답을 생성할 수 없습니다.';

  // ID 추출
  const idMatches = aiResponse.match(/ID:\s*(\d+)/g);
  const programIds = idMatches?.map((match: string) => {
    const idMatch = match.match(/\d+/);
    return idMatch ? Number(idMatch[0]) : null;
  }).filter((id: number | null): id is number => id !== null) || [];

  return {
    text: aiResponse,
    recommendedProgramIds: programIds
  };
}