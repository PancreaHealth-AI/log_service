import { IsOptional, IsString, IsEnum, IsDateString, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AuditAction } from '../../../common/enums/audit-action.enum';
import { Severity } from '../../../common/enums/severity.enum';
import { AuditStatus } from '../../../common/enums/audit-status.enum';

export class SearchLogsDto {
  @ApiPropertyOptional({ description: 'ID utilisateur' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ enum: AuditAction, description: 'Action' })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @ApiPropertyOptional({ description: 'Ressource' })
  @IsOptional()
  @IsString()
  resource?: string;

  @ApiPropertyOptional({ description: 'Date de début', format: 'date-time' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Date de fin', format: 'date-time' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ enum: Severity, description: 'Sévérité' })
  @IsOptional()
  @IsEnum(Severity)
  severity?: Severity;

  @ApiPropertyOptional({ enum: AuditStatus, description: 'Statut' })
  @IsOptional()
  @IsEnum(AuditStatus)
  status?: AuditStatus;

  @ApiPropertyOptional({ example: 1, description: 'Numéro de page' })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Nombre de résultats par page' })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
