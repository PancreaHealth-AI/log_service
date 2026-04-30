import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InvestigateAlertDto {
  @ApiProperty({ description: 'ID de l\'enquêteur' })
  @IsString()
  investigatorId: string;

  @ApiProperty({ description: 'Notes d\'enquête' })
  @IsString()
  notes: string;
}
