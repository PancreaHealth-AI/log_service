import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SecurityAlertsService } from './security-alerts.service';
import { InvestigateAlertDto } from '../audit/dto/investigate-alert.dto';
import { Permission } from '../../common/decorators/permission.decorator';

@ApiTags('Security Alerts')
@ApiBearerAuth()
@Controller('audit/security-alerts')
export class SecurityAlertsController {
  constructor(private readonly service: SecurityAlertsService) {}

  @Get()
  @Permission('log_security.read')
  @ApiOperation({ summary: 'Get all active security alerts' })
  @ApiResponse({ status: 200, description: 'Active alerts list' })
  async getActiveAlerts() {
    return this.service.getActive();
  }

  @Post(':id/investigate')
  @Permission('log_security_investigate.excute')
  @ApiOperation({ summary: 'Investigate a security alert' })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiBody({ type: InvestigateAlertDto })
  @ApiResponse({ status: 200, description: 'Investigation started' })
  async investigate(@Param('id') id: string, @Body() dto: InvestigateAlertDto) {
    return this.service.investigate(id, dto);
  }

  @Post(':id/resolve')
  @Permission('log_security_resolve.excute')
  @ApiOperation({ summary: 'Resolve a security alert' })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiResponse({ status: 200, description: 'Alert resolved' })
  async resolve(@Param('id') id: string) {
    return this.service.resolve(id);
  }
}
