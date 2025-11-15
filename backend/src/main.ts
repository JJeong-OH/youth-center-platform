import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // ✅ CORS 설정
  app.enableCors({
    origin: (origin, callback) => {
      // origin이 없으면 (Postman 등) 허용
      if (!origin) {
        callback(null, true);
        return;
      }
      
      // 허용할 도메인 목록
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://youth-admin.vercel.app',
      ];
      
      // 목록에 있거나 .vercel.app으로 끝나면 허용
      if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  app.setGlobalPrefix('api');
  
  // ✅ 정적 파일 서빙 (업로드된 이미지)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 Server is running on port ${port}`);
}
bootstrap();