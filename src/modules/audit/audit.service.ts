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
    const logId = uuid();
    const doc = {
      id: logId,
      ...dto,
      timestamp: dto.timestamp || new Date().toISOString(),
      service_name: dto.service_name || 'external',
      status: dto.status || AuditStatus.SUCCESS,
      severity: dto.severity || 'INFO',
    };

    // Indexer dans l'index principal
    await this.elastic.index({ index: this.index, document: doc, id: logId });

    // Si c'est critique, créer une alerte de sécurité automatique
    if (doc.severity === 'CRITICAL' || doc.severity === 'ERROR') {
      await this.elastic.index({
        index: 'security_alerts',
        document: {
          id: uuid(),
          log_id: logId,
          timestamp: doc.timestamp,
          severity: doc.severity,
          action: doc.action,
          user_id: doc.user_id,
          status: 'ACTIVE',
          description: `Alerte automatique : ${doc.action} sur ${doc.resource}`,
          metadata: doc.metadata,
        },
      });
    }

    return doc;
  }

  async searchLogs(searchDto: SearchLogsDto) {
    const { userId, action, resource, dateFrom, dateTo, severity, status, page = 1, limit = 20 } = searchDto;
    const must: any[] = [];
    if (userId) must.push({ term: { 'user_id': userId } });
    if (action) must.push({ term: { 'action': action } });
    if (resource) must.push({ term: { 'resource': resource } });
    if (severity) must.push({ term: { 'severity': severity } });
    if (status) must.push({ term: { 'status': status } });
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
