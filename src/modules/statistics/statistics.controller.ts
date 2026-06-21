import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { Permission } from 'src/common/decorators/permission.decorator';

@ApiTags('Logs')
@ApiBearerAuth()
@Controller('logs/statistics')
export class StatisticsController {
  constructor(private readonly service: StatisticsService) {}

  @Get()
  @Permission('log_statistics.read')
  @ApiOperation({ summary: 'Obtenir les statistiques d\'activité' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filtrer par ID utilisateur' })
  @ApiResponse({ status: 200, description: 'Statistiques calculées' })
  async getStatistics(@Query('userId') userId?: string) {
    return this.service.getStats(userId);
  }
}
