import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { CreateLogDto } from './dto/create-audit-log.dto';
import { SearchLogsDto } from './dto/search-logs.dto';
import { LogType } from '../../common/enums/log-type.enum';
import { SkipAudit } from '../../common/decorators/skip-audit.decorator';

@ApiTags('Logs')
@Controller('logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @SkipAudit()
  @Post()
  @ApiOperation({ summary: 'Créer un log (Audit, Security ou Technical)' })
  @ApiResponse({ status: 201, description: 'Log créé avec succès' })
  async createLog(@Body() dto: CreateLogDto) {
    return this.auditService.createLog(dto);
  }

  @Get('audit')
  @ApiOperation({ summary: 'Obtenir les logs d\'audit' })
  @ApiQuery({ name: 'userId', required: false, description: 'ID de l\'utilisateur' })
  @ApiQuery({ name: 'action', required: false, description: 'Action effectuée' })
  @ApiQuery({ name: 'resource', required: false, description: 'Ressource concernée' })
  @ApiQuery({ name: 'severity', required: false, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  @ApiQuery({ name: 'eventType', required: false, description: 'Type d\'événement métier' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Date de début (ISO)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Date de fin (ISO)' })
  @ApiResponse({ status: 200, description: 'Logs d\'audit récupérés' })
  async getAuditLogs(@Query() query: SearchLogsDto) {
    return this.auditService.searchLogs(LogType.AUDIT, query);
  }

  @Get('security')
  @ApiOperation({ summary: 'Obtenir les logs de sécurité' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'severity', required: false, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  @ApiQuery({ name: 'eventType', required: false })
  @ApiResponse({ status: 200, description: 'Logs de sécurité récupérés' })
  async getSecurityLogs(@Query() query: SearchLogsDto) {
    return this.auditService.searchLogs(LogType.SECURITY, query);
  }

  @Get('technical')
  @ApiOperation({ summary: 'Obtenir les logs techniques' })
  @ApiQuery({ name: 'service', required: false })
  @ApiQuery({ name: 'severity', required: false, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  @ApiResponse({ status: 200, description: 'Logs techniques récupérés' })
  async getTechnicalLogs(@Query() query: SearchLogsDto) {
    return this.auditService.searchLogs(LogType.TECHNICAL, query);
  }
}
