import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService as NestElastic } from '@nestjs/elasticsearch';
import { elasticsearchConfig } from '../../config/elasticsearch.config';

@Injectable()
export class IndexManager {
  private readonly logger = new Logger(IndexManager.name);
  private readonly config = elasticsearchConfig();

  constructor(private readonly esClient: NestElastic) {}

  async createIndicesIfNotExist() {
    const indices = [
      this.config.indices.audit_logs,
      this.config.indices.technical_logs,
      this.config.indices.security_alerts,
    ];
    for (const index of indices) {
      const exists = await this.esClient.indices.exists({ index });
      if (!exists) {
        await this.esClient.indices.create({
          index,
          settings: { number_of_shards: 1, number_of_replicas: 0 },
          mappings: {
            properties: {
              user_id: { type: 'keyword' },
              action: { type: 'keyword' },
              resource: { type: 'keyword' },
              service_name: { type: 'keyword' },
              status: { type: 'keyword' },
              timestamp: { type: 'date' },
              metadata: { type: 'object', enabled: true },
              ip_address: { type: 'ip' },
              user_agent: { type: 'text' },
              severity: { type: 'keyword' },
            },
          },
        } as any);
        this.logger.log(`Created index: ${index}`);
      }
    }
  }
}
