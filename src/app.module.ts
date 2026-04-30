import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ElasticsearchModule } from './infrastructure/elasticsearch/elasticsearch.module';
import { AuditModule } from './modules/audit/audit.module';
import { EmergencyAccessModule } from './modules/emergency-access/emergency-access.module';
import { SecurityAlertsModule } from './modules/security-alerts/security-alerts.module';
import { ReportsModule } from './modules/reports/reports.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { KafkaConsumerModule } from './modules/kafka-consumer/kafka-consumer.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLoggingInterceptor } from './common/interceptors/audit-logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ElasticsearchModule,
    AuditModule,
    EmergencyAccessModule,
    SecurityAlertsModule,
    ReportsModule,
    StatisticsModule,
    KafkaConsumerModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLoggingInterceptor,
    },
  ],
})
export class AppModule {}
