import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '../../infrastructure/elasticsearch/elasticsearch.service';
import { elasticsearchConfig } from '../../config/elasticsearch.config';

@Injectable()
export class StatisticsService {
  private readonly config = elasticsearchConfig();

  constructor(private readonly elastic: ElasticsearchService) {}

  async getStats(userId?: string) {
    const aggs = {
      actions: { terms: { field: 'action', size: 10 } },
      services: { terms: { field: 'service', size: 10 } },
      severity: { terms: { field: 'severity' } },
    };

    let query: any = { match_all: {} };
    if (userId) {
      query = { term: { 'userId': userId } };
    }

    const result = await this.elastic.search({
      index: this.config.indices.audit_logs,
      query,
      size: 0,
      aggs,
    });

    return (result as any).aggregations || {};
  }
}

