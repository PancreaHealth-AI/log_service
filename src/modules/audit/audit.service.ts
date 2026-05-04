import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '../../infrastructure/elasticsearch/elasticsearch.service';
import { CreateLogDto } from './dto/create-audit-log.dto';
import { SearchLogsDto } from './dto/search-logs.dto';
import { v4 as uuid } from 'uuid';
import { elasticsearchConfig } from '../../config/elasticsearch.config';
import { LogType } from '../../common/enums/log-type.enum';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private readonly config = elasticsearchConfig();

  constructor(private readonly elastic: ElasticsearchService) {}

  async createLog(dto: CreateLogDto) {
    const logId = uuid();
    const timestamp = dto.timestamp || new Date().toISOString();
    
    const doc = {
      ...dto,
      id: logId,
      timestamp,
    };

    // Déterminer l'index cible
    let index = this.getTargetIndex(doc);

    try {
      await this.elastic.index({ index, document: doc, id: logId });
    } catch (error) {
      this.logger.error(
        `❌ Échec de l'indexation du log [${logId}] dans Elasticsearch: ${error.message}`
      );
    }
    return doc;
  }

  private getTargetIndex(doc: any): string {
    // Règle spéciale EMERGENCY ACCESS
    if (doc.action === 'EMERGENCY_ACCESS' && doc.severity === 'CRITICAL') {
      return this.config.indices.audit_logs;
    }

    switch (doc.logType) {
      case LogType.SECURITY:
        return this.config.indices.security_logs;
      case LogType.TECHNICAL:
        return this.config.indices.technical_logs;
      case LogType.AUDIT:
      default:
        return this.config.indices.audit_logs;
    }
  }

  async searchLogs(type: LogType, searchDto: SearchLogsDto) {
    const { userId, action, resource, target, severity, eventType, service, startDate, endDate, page = 1, limit = 20 } = searchDto;
    
    const index = this.getIndexByType(type);
    const must: any[] = [];

    if (userId) must.push({ term: { 'userId': userId } });
    if (action) must.push({ term: { 'action': action } });
    if (resource) must.push({ term: { 'resource': resource } });
    if (target) must.push({ term: { 'target': target } });
    if (severity) must.push({ term: { 'severity': severity } });
    if (eventType) must.push({ term: { 'eventType': eventType } });
    if (service) must.push({ term: { 'service': service } });

    if (startDate || endDate) {
      const range: any = {};
      if (startDate) range.gte = startDate;
      if (endDate) range.lte = endDate;
      must.push({ range: { timestamp: range } });
    }

    const query = must.length > 0 ? { bool: { must } } : { match_all: {} };
    const from = (page - 1) * limit;

    const result = await this.elastic.search({
      index,
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

  private getIndexByType(type: LogType): string {
    switch (type) {
      case LogType.SECURITY: return this.config.indices.security_logs;
      case LogType.TECHNICAL: return this.config.indices.technical_logs;
      default: return this.config.indices.audit_logs;
    }
  }

  async getLogById(id: string) {
    // Comme on ne sait pas dans quel index il est, on pourrait chercher dans tous, 
    // mais ici on va supposer qu'on cherche dans l'index d'audit par défaut ou passer l'index.
    // Pour simplifier, on cherche dans audit_logs.
    const result = await this.elastic.getById(this.config.indices.audit_logs, id);
    return (result as any)._source;
  }
}
