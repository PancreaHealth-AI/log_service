import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService as NestElastic } from '@nestjs/elasticsearch';
import { elasticsearchConfig } from '../../config/elasticsearch.config';

@Injectable()
export class IndexManager {
  private readonly logger = new Logger(IndexManager.name);
  private readonly config = elasticsearchConfig();

  constructor(private readonly esClient: NestElastic) {}

  async createIndicesIfNotExist() {
    try {
      const indices = Object.values(this.config.indices);
      
      for (const index of indices) {
        const exists = await this.esClient.indices.exists({ index });
        if (!exists) {
          await this.esClient.indices.create({
            index,
            settings: { number_of_shards: 1, number_of_replicas: 0 },
            mappings: {
              properties: {
                logType: { type: 'keyword' },
                eventType: { type: 'keyword' },
                action: { type: 'keyword' },
                userId: { type: 'keyword' },
                resource: { type: 'keyword' },
                resourceId: { type: 'keyword' },
                target: { type: 'keyword' },
                severity: { type: 'keyword' },
                service: { type: 'keyword' },
                timestamp: { type: 'date' },
                metadata: { type: 'object', enabled: true },
              },
            },
          } as any);
          this.logger.log(`Created index: ${index}`);
        }
      }
    } catch (error) {
      this.logger.error(
        '⚠️ Impossible de se connecter à Elasticsearch au démarrage. Le service continue mais les logs ne seront pas indexés.',
        error.message,
      );
    }
  }
}
