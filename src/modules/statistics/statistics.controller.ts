import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';

@ApiTags('Statistics')
@Controller('audit/statistics')
export class StatisticsController {
  constructor(private readonly service: StatisticsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtenir les statistiques d\'audit' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filtrer par ID utilisateur' })
  @ApiResponse({ status: 200, description: 'Statistiques calculées' })
  async getStatistics(@Query('userId') userId?: string) {
    return this.service.getStats(userId);
  }
}
