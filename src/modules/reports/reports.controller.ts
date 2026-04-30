import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { GenerateReportDto } from '../audit/dto/generate-report.dto';

@ApiTags('Reports')
@Controller('audit')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Post('reports/generate')
  @ApiOperation({ summary: 'Générer un rapport d\'audit' })
  @ApiBody({ type: GenerateReportDto })
  @ApiResponse({ status: 200, description: 'Rapport généré' })
  async generateReport(@Body() dto: GenerateReportDto) {
    return this.service.generate(dto);
  }

  @Post('export')
  @ApiOperation({ summary: 'Exporter les données personnelles (RGPD)' })
  @ApiBody({ type: GenerateReportDto })
  @ApiResponse({ status: 200, description: 'Export RGPD effectué' })
  async exportData(@Body() dto: GenerateReportDto) {
    return this.service.exportGdpr(dto);
  }
}
