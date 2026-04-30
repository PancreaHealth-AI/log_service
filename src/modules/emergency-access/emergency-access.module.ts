import { Module } from '@nestjs/common';
import { EmergencyAccessController } from './emergency-access.controller';
import { EmergencyAccessService } from './emergency-access.service';

@Module({
  controllers: [EmergencyAccessController],
  providers: [EmergencyAccessService],
})
export class EmergencyAccessModule {}
