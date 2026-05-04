import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';

@ApiTags('Logs')
@Controller('logs/statistics')
export class StatisticsController {
  constructor(private readonly service: StatisticsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtenir les statistiques d\'activité' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filtrer par ID utilisateur' })
  @ApiResponse({ status: 200, description: 'Statistiques calculées' })
  async getStatistics(@Query('userId') userId?: string) {
    return this.service.getStats(userId);
  }
}
