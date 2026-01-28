import { Module } from '@nestjs/common';
import { ProgramController } from './program.controller';
import { ProgramService } from './program.service';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [AdminModule], // ✅ AdminModule에서 JwtModule을 가져옴
  controllers: [ProgramController],
  providers: [ProgramService],
  exports: [ProgramService],
})
export class ProgramModule {}