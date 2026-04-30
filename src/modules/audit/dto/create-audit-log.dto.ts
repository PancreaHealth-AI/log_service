import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditAction } from '../../../common/enums/audit-action.enum';
import { Severity } from '../../../common/enums/severity.enum';
import { AuditStatus } from '../../../common/enums/audit-status.enum';

export class CreateAuditLogDto {
  @ApiProperty({ description: 'ID de l\'utilisateur' })
  @IsString()
  user_id: string;

  @ApiProperty({ enum: AuditAction, description: 'Action auditée' })
  @IsEnum(AuditAction)
  action: AuditAction;

  @ApiProperty({ description: 'Ressource affectée' })
  @IsString()
  resource: string;

  @ApiPropertyOptional({ description: 'Nom du service' })
  @IsOptional()
  @IsString()
  service_name?: string;

  @ApiPropertyOptional({ enum: AuditStatus, description: 'Statut du log' })
  @IsOptional()
  @IsEnum(AuditStatus)
  status?: AuditStatus;

  @ApiPropertyOptional({ description: 'Timestamp du log' })
  @IsOptional()
  @IsString()
  timestamp?: string;

  @ApiPropertyOptional({ description: 'Adresse IP' })
  @IsOptional()
  @IsString()
  ip_address?: string;

  @ApiPropertyOptional({ description: 'User Agent' })
  @IsOptional()
  @IsString()
  user_agent?: string;

  @ApiPropertyOptional({ enum: Severity, description: 'Niveau de sévérité' })
  @IsOptional()
  @IsEnum(Severity)
  severity?: Severity;

  @ApiPropertyOptional({ description: 'Métadonnées additionnelles', type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
