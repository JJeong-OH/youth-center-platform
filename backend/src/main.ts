import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ✅ CORS 설정 수정
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
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 Server is running on port ${port}`);
}
bootstrap();