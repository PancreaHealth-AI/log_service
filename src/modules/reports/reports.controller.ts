import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { GenerateReportDto } from '../audit/dto/generate-report.dto';

@ApiTags('Logs')
@Controller('logs/reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Générer un rapport d\'activité' })
  @ApiResponse({ status: 200, description: 'Rapport généré' })
  async generate(@Body() dto: GenerateReportDto) {
    return this.service.generate(dto);
  }

  @Post('export')
  @ApiOperation({ summary: 'Exporter les données personnelles (RGPD)' })
  @ApiResponse({ status: 200, description: 'Données exportées' })
  async export(@Body() dto: GenerateReportDto) {
    return this.service.exportGdpr(dto);
  }
}
