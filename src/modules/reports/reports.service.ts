import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '../../infrastructure/elasticsearch/elasticsearch.service';
import { GenerateReportDto } from '../audit/dto/generate-report.dto';
import { elasticsearchConfig } from '../../config/elasticsearch.config';

@Injectable()
export class ReportsService {
  private readonly config = elasticsearchConfig();

  constructor(private readonly elastic: ElasticsearchService) {}

  async generate(dto: GenerateReportDto) {
    const must: any[] = [];
    if (dto.userId) must.push({ term: { 'userId': dto.userId } });
    if (dto.action) must.push({ term: { 'action': dto.action } });
    if (dto.dateFrom || dto.dateTo) {
      const range: any = {};
      if (dto.dateFrom) range.gte = dto.dateFrom;
      if (dto.dateTo) range.lte = dto.dateTo;
      must.push({ range: { timestamp: range } });
    }
    const query = { bool: { must } };
    const result = await this.elastic.search({
      index: this.config.indices.audit_logs,
      query,
      size: 10000,
    });
    const hits = (result as any).hits?.hits || [];
    const data = hits.map((h: any) => h._source);
    return { reportType: 'audit', total: data.length, data };
  }

  async exportGdpr(dto: GenerateReportDto) {
    return this.generate(dto);
  }
}

