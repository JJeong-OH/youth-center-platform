// backend/src/kiosk/kiosk.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KioskController } from './kiosk.controller';
import { KioskService } from './kiosk.service';
import { AiModule } from '../ai/ai.module';  // ← 이것만 추가!

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET is not defined in .env file');
        }
        return {
          secret: secret,
          signOptions: { expiresIn: '30m' },
        };
      },
      inject: [ConfigService],
    }),
    AiModule,  // ← 이것만 추가!
  ],
  controllers: [KioskController],
  providers: [KioskService],
  exports: [KioskService],
})
export class KioskModule {}