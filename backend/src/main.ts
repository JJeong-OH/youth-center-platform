import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ✅ CORS 설정 - 배포된 도메인 추가
  app.enableCors({
    origin: [
      'http://localhost:3000',           // 로컬 프론트엔드
      'http://localhost:5173',           // 로컬 키오스크
      'https://youth-admin.vercel.app',  // Vercel 관리자
      'https://*.vercel.app',            // 모든 Vercel 앱
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // ✅ 글로벌 prefix
  app.setGlobalPrefix('api');
  
  // ✅ 환경 변수에서 PORT 가져오기
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 Server is running on http://localhost:${port}`);
}
bootstrap();