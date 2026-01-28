import { Module } from '@nestjs/common';
import { FacilitiesController } from './facilities.controller';
import { FacilitiesService } from './facilities.service';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [AdminModule], // ✅ AdminModule에서 JwtModule을 가져옴
  controllers: [FacilitiesController],
  providers: [FacilitiesService],
  exports: [FacilitiesService],
})
export class FacilitiesModule {}