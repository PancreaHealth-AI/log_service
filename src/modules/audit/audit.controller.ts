import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { SearchLogsDto } from './dto/search-logs.dto';
import { SkipAudit } from '../../common/decorators/skip-audit.decorator';

@ApiTags('Audit')
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @SkipAudit()
  @Post('logs')
  @ApiOperation({ summary: 'Créer un log d\'audit' })
  @ApiResponse({ status: 201, description: 'Log créé avec succès' })
  @ApiBody({ type: CreateAuditLogDto })
  async createLog(@Body() dto: CreateAuditLogDto) {
    return this.auditService.createLog(dto);
  }

  @Post('logs/search')
  @ApiOperation({ summary: 'Rechercher des logs d\'audit' })
  @ApiResponse({ status: 200, description: 'Logs trouvés' })
  @ApiBody({ type: SearchLogsDto })
  async searchLogs(@Body() searchDto: SearchLogsDto) {
    return this.auditService.searchLogs(searchDto);
  }

  @Get('logs/:id')
  @ApiOperation({ summary: 'Obtenir un log par ID' })
  @ApiParam({ name: 'id', description: 'ID du log' })
  @ApiResponse({ status: 200, description: 'Log trouvé' })
  async getLogById(@Param('id') id: string) {
    return this.auditService.getLogById(id);
  }
}
