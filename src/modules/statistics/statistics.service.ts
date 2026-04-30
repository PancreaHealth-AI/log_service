import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '../../infrastructure/elasticsearch/elasticsearch.service';

@Injectable()
export class StatisticsService {
  constructor(private readonly elastic: ElasticsearchService) {}

  async getStats(userId?: string) {
    const aggs = {
      actions: { terms: { field: 'action', size: 10 } },
      services: { terms: { field: 'service_name', size: 10 } },
      severity: { terms: { field: 'severity' } },
      status: { terms: { field: 'status' } },
    };
    const query: any = { match_all: {} };
    if (userId) {
      query.bool = { must: [{ term: { user_id: userId } }] };
    }
    const result = await this.elastic.search({
      index: 'audit_logs',
      query,
      size: 0,
      body: { aggs }, // Elasticsearch typings
    } as any);
    return (result as any).aggregations || {};
  }
}
