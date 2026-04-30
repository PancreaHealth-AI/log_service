import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '../../infrastructure/elasticsearch/elasticsearch.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { SearchLogsDto } from './dto/search-logs.dto';
import { v4 as uuid } from 'uuid';
import { AuditStatus } from '../../common/enums/audit-status.enum';
import { elasticsearchConfig } from '../../config/elasticsearch.config';

@Injectable()
export class AuditService {
  private readonly index = elasticsearchConfig().indices.audit_logs;

  constructor(private readonly elastic: ElasticsearchService) {}

  async createLog(dto: CreateAuditLogDto) {
    const doc = {
      id: uuid(),
      ...dto,
      timestamp: dto.timestamp || new Date().toISOString(),
      service_name: dto.service_name || 'external',
      status: dto.status || AuditStatus.SUCCESS,
      severity: dto.severity || 'INFO',
    };
    await this.elastic.index({ index: this.index, document: doc });
    return doc;
  }

  async searchLogs(searchDto: SearchLogsDto) {
    const { userId, action, resource, dateFrom, dateTo, severity, status, page = 1, limit = 20 } = searchDto;
    const must: any[] = [];
    if (userId) must.push({ term: { user_id: userId } });
    if (action) must.push({ term: { action } });
    if (resource) must.push({ term: { resource } });
    if (severity) must.push({ term: { severity } });
    if (status) must.push({ term: { status } });
    if (dateFrom || dateTo) {
      const range: any = {};
      if (dateFrom) range.gte = dateFrom;
      if (dateTo) range.lte = dateTo;
      must.push({ range: { timestamp: range } });
    }
    const query = { bool: { must } };
    const from = (page - 1) * limit;
    const result = await this.elastic.search({
      index: this.index,
      query,
      size: limit,
      from,
    });
    const hits = (result as any).hits?.hits || [];
    return {
      total: (result as any).hits?.total?.value || 0,
      page,
      limit,
      data: hits.map((h: any) => h._source),
    };
  }

  async getLogById(id: string) {
    const result = await this.elastic.getById(this.index, id);
    return (result as any)._source;
  }
}
