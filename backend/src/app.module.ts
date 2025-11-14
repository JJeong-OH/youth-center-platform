import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from './ai/ai.module';
import { KioskModule } from './kiosk/kiosk.module'; 
import { SurveyModule } from './survey/survey.module'; 
import { ProgramModule } from './program/program.module';
import { FacilitiesModule } from './facilities/facilities.module'; // ✅ 추가
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    AiModule,
    KioskModule,
    ProgramModule,
    FacilitiesModule, // ✅ 추가
    SurveyModule,
    AdminModule
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}