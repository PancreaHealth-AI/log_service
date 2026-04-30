import { IsBoolean, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReviewEmergencyAccessDto {
  @ApiProperty({ description: 'Approuver ou rejeter' })
  @IsBoolean()
  approved: boolean;

  @ApiProperty({ description: 'ID du validateur' })
  @IsString()
  reviewerId: string;
}
