import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AuditAction } from '../../../common/enums/audit-action.enum';

export class GenerateReportDto {
  @ApiPropertyOptional({ description: 'ID utilisateur' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ enum: AuditAction, description: 'Action' })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @ApiPropertyOptional({ description: 'Date de début', format: 'date-time' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Date de fin', format: 'date-time' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ enum: ['json', 'csv'], default: 'json', description: 'Format du rapport' })
  @IsOptional()
  @IsString()
  format?: 'json' | 'csv' = 'json';
}
