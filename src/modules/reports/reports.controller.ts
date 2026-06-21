import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { GenerateReportDto } from '../audit/dto/generate-report.dto';
import { Permission } from '../../common/decorators/permission.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('logs/reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Post('generate')
  @Permission('log_audit_generate.export')
  @ApiOperation({ summary: 'Generate an activity report' })
  @ApiResponse({ status: 200, description: 'Report generated' })
  async generate(@Body() dto: GenerateReportDto) {
    return this.service.generate(dto);
  }

  @Post('export')
  @Permission('log_audit.export')
  @ApiOperation({ summary: 'Export personal data (GDPR)' })
  @ApiResponse({ status: 200, description: 'Data exported' })
  async export(@Body() dto: GenerateReportDto) {
    return this.service.exportGdpr(dto);
  }
}
