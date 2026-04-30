import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ElasticsearchService as NestElastic } from '@nestjs/elasticsearch';
import { IndexManager } from './index.manager';
import { elasticsearchConfig } from '../../config/elasticsearch.config';

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly logger = new Logger(ElasticsearchService.name);
  constructor(
    private readonly esClient: NestElastic,
    private readonly indexManager: IndexManager,
  ) {}

  async onModuleInit() {
    await this.indexManager.createIndicesIfNotExist();
  }

  async index(params: { index: string; document: any; id?: string }) {
    return this.esClient.index({
      index: params.index,
      id: params.id,
      body: params.document,
    });
  }

  async search(params: { index: string; query: any; size?: number; from?: number }) {
    return this.esClient.search({
      index: params.index,
      size: params.size || 20,
      from: params.from || 0,
      body: {
        query: params.query,
      },
    } as any);
  }

  async getById(index: string, id: string) {
    return this.esClient.get({ index, id });
  }

  async update(index: string, id: string, doc: any) {
    return this.esClient.update({ index, id, body: { doc } });
  }
}
