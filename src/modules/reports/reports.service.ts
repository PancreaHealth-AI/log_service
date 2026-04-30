import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '../../infrastructure/elasticsearch/elasticsearch.service';
import { GenerateReportDto } from '../audit/dto/generate-report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly elastic: ElasticsearchService) {}

  async generate(dto: GenerateReportDto) {
    const must: any[] = [];
    if (dto.userId) must.push({ term: { user_id: dto.userId } });
    if (dto.action) must.push({ term: { action: dto.action } });
    if (dto.dateFrom || dto.dateTo) {
      const range: any = {};
      if (dto.dateFrom) range.gte = dto.dateFrom;
      if (dto.dateTo) range.lte = dto.dateTo;
      must.push({ range: { timestamp: range } });
    }
    const query = { bool: { must } };
    const result = await this.elastic.search({
      index: 'audit_logs',
      query,
      size: 10000,
    });
    const hits = (result as any).hits?.hits || [];
    const data = hits.map((h: any) => h._source);
    return { reportType: 'audit', total: data.length, data };
  }

  async exportGdpr(dto: GenerateReportDto) {
    // Logique identique ou avec filtres spécifiques aux données personnelles
    return this.generate(dto);
  }
}
