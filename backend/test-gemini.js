const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = 'AIzaSyAksRD0RozXX23XkhvlxQeebn-MFY77g0E';

async function testModels() {
  const genAI = new GoogleGenerativeAI(API_KEY);
  
  const modelsToTest = [
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.5-pro-latest',
    'gemini-1.5-flash-latest',
  ];
  
  console.log('🔍 모델 테스트 시작...\n');
  
  for (const modelName of modelsToTest) {
    try {
      console.log(`테스트: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('안녕');
      const response = result.response;
      const text = response.text();
      console.log(`  ✅ 성공! 응답: ${text.substring(0, 30)}...\n`);
    } catch (error) {
      console.log(`  ❌ 실패: ${error.message}\n`);
    }
  }
}

testModels();