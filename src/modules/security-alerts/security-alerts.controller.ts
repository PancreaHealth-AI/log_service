import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { SecurityAlertsService } from './security-alerts.service';
import { InvestigateAlertDto } from '../audit/dto/investigate-alert.dto';

@ApiTags('Security Alerts')
@Controller('audit/security-alerts')
export class SecurityAlertsController {
  constructor(private readonly service: SecurityAlertsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtenir toutes les alertes de sécurité actives' })
  @ApiResponse({ status: 200, description: 'Alertes actives' })
  async getActiveAlerts() {
    return this.service.getActive();
  }

  @Post(':id/investigate')
  @ApiOperation({ summary: 'Enquêter sur une alerte' })
  @ApiParam({ name: 'id', description: 'ID de l\'alerte' })
  @ApiBody({ type: InvestigateAlertDto })
  @ApiResponse({ status: 200, description: 'Enquête lancée' })
  async investigate(@Param('id') id: string, @Body() dto: InvestigateAlertDto) {
    return this.service.investigate(id, dto);
  }

  @Post(':id/resolve')
  @ApiOperation({ summary: 'Résoudre une alerte' })
  @ApiParam({ name: 'id', description: 'ID de l\'alerte' })
  @ApiResponse({ status: 200, description: 'Alerte résolue' })
  async resolve(@Param('id') id: string) {
    return this.service.resolve(id);
  }
}
