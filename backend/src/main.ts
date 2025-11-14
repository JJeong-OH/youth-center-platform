import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ 1. 실전용 CORS 설정
  // Vercel에 배포하면 'https://kiosk-app-abc.vercel.app' 같은 주소가 생깁니다.
  // 그 주소들을 여기에 넣어줘야 합니다.
  //
  // !! 중요 !!
  // 지금은 Vercel 주소를 모르니, 일단 'true'로 설정해두겠습니다.
  // 'true'는 요청한 도메인(Vercel 주소)을 자동으로 origin에 추가해줍니다.
  app.enableCors({
    origin: true, // ⬅️ 수정됨
    credentials: true,
  });

  // ✅ 2. 글로벌 prefix 설정 (유지)
  app.setGlobalPrefix('api');

  // ✅ 3. 실전용 Port 설정
  // Render 같은 서버는 3001번을 쓰지 않고, 'PORT'라는 환경 변수를 줍니다.
  // process.env.PORT를 사용하도록 수정해야 합니다.
  const PORT = process.env.PORT || 3001; // ⬅️ 수정됨
  await app.listen(PORT);

  console.log(`🚀 Server is running on port ${PORT}`);
}
bootstrap();