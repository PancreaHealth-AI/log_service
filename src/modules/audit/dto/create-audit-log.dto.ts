import { IsString, IsOptional, IsEnum, IsObject, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LogType } from '../../../common/enums/log-type.enum';
import { Severity } from '../../../common/enums/severity.enum';

export class CreateLogDto {
  @ApiProperty({ enum: LogType, description: 'Type global du log' })
  @IsEnum(LogType)
  logType: LogType;

  @ApiProperty({ description: 'Événement métier précis' })
  @IsString()
  eventType: string;

  @ApiProperty({ description: 'Action principale' })
  @IsString()
  action: string;

  @ApiProperty({ description: 'ID de l\'utilisateur acteur' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Entité concernée' })
  @IsString()
  resource: string;

  @ApiPropertyOptional({ description: 'ID de la ressource' })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiPropertyOptional({ description: 'Cible de l\'action' })
  @IsOptional()
  @IsString()
  target?: string;

  @ApiProperty({ enum: Severity, description: 'Niveau de criticité' })
  @IsEnum(Severity)
  severity: Severity;

  @ApiProperty({ description: 'Nom du service émetteur' })
  @IsString()
  service: string;

  @ApiPropertyOptional({ description: 'Timestamp du log (ISO)' })
  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @ApiPropertyOptional({ description: 'Données supplémentaires', type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
