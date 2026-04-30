import { Module, Global } from '@nestjs/common';
import { ElasticsearchModule as NestElasticModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchService } from './elasticsearch.service';
import { IndexManager } from './index.manager';
import { elasticsearchConfig } from '../../config/elasticsearch.config';

@Global()
@Module({
  imports: [
    NestElasticModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        node: config.get('ELASTICSEARCH_NODE') || 'http://localhost:9200',
        auth: {
          username: config.get('ELASTICSEARCH_USER') || '',
          password: config.get('ELASTICSEARCH_PASS') || '',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [ElasticsearchService, IndexManager],
  exports: [ElasticsearchService, IndexManager],
})
export class ElasticsearchModule {}
