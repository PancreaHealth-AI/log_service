import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { CreateLogDto } from './dto/create-audit-log.dto';
import { SearchLogsDto } from './dto/search-logs.dto';
import { LogType } from '../../common/enums/log-type.enum';
import { SkipAudit } from '../../common/decorators/skip-audit.decorator';
import { Permission } from '../../common/decorators/permission.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Logs')
@ApiBearerAuth()
@Controller('logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * Log ingestion endpoint — @Public() because other microservices
   * POST to this endpoint using service-level credentials or via the API Gateway.
   * The @SkipAudit() prevents an infinite loop (the interceptor would otherwise
   * log its own log-ingestion call).
   */
  @Public()
  @SkipAudit()
  @Post()
  @ApiOperation({ summary: 'Ingest a log entry (Audit, Security or Technical)' })
  @ApiResponse({ status: 201, description: 'Log ingested successfully' })
  async createLog(@Body() dto: CreateLogDto) {
    return this.auditService.createLog(dto);
  }

  @Get('audit')
  @Permission('log_audit.read')
  @ApiOperation({ summary: 'Retrieve audit logs' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'action', required: false, description: 'Filter by action' })
  @ApiQuery({ name: 'resource', required: false, description: 'Filter by resource' })
  @ApiQuery({ name: 'severity', required: false, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  @ApiQuery({ name: 'eventType', required: false })
  @ApiQuery({ name: 'startDate', required: false, description: 'ISO date' })
  @ApiQuery({ name: 'endDate', required: false, description: 'ISO date' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved' })
  async getAuditLogs(@Query() query: SearchLogsDto) {
    return this.auditService.searchLogs(LogType.AUDIT, query);
  }

  @Get('security')
  @Permission('log_audit.read')
  @ApiOperation({ summary: 'Retrieve security logs' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'severity', required: false, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  @ApiQuery({ name: 'eventType', required: false })
  @ApiResponse({ status: 200, description: 'Security logs retrieved' })
  async getSecurityLogs(@Query() query: SearchLogsDto) {
    return this.auditService.searchLogs(LogType.SECURITY, query);
  }

  @Get('technical')
  @Permission('log_audit.read')
  @ApiOperation({ summary: 'Retrieve technical logs' })
  @ApiQuery({ name: 'service', required: false })
  @ApiQuery({ name: 'severity', required: false, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  @ApiResponse({ status: 200, description: 'Technical logs retrieved' })
  async getTechnicalLogs(@Query() query: SearchLogsDto) {
    return this.auditService.searchLogs(LogType.TECHNICAL, query);
  }

  @Get(':id')
  @Permission('log_details.read')
  @ApiOperation({ summary: 'Retrieve a specific log by ID' })
  @ApiResponse({ status: 200, description: 'Log retrieved' })
  async getLogById(@Param('id') id: string) {
    return this.auditService.getLogById(id);
  }
}
