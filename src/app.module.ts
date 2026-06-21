import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ElasticsearchModule } from './infrastructure/elasticsearch/elasticsearch.module';
import { ElasticsearchService } from './infrastructure/elasticsearch/elasticsearch.service';
import { AuditModule } from './modules/audit/audit.module';
import { ReportsModule } from './modules/reports/reports.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { KafkaConsumerModule } from './modules/kafka-consumer/kafka-consumer.module';
import { AuditLoggingInterceptor } from './common/interceptors/audit-logging.interceptor';
import { JwtGatewayGuard } from './common/guards/jwt-gateway.guard';
import { PermissionGuard } from './common/guards/permission.guard';
import { RbacGrpcClient } from './common/grpc/rbac-grpc.client';
import { EmergencyAccessModule } from './modules/emergency-access/emergency-access.module';
import { SecurityAlertsModule } from './modules/security-alerts/security-alerts.module';

@Module({
  imports: [
    // ── Core Config ──────────────────────────────────────────────────────────
    ConfigModule.forRoot({ isGlobal: true }),

    // ── Redis (required by JwtGatewayGuard for session blacklist) ────────────
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'single' as const,
        url: `redis://${configService.get<string>('REDIS_HOST', 'localhost')}:${configService.get<number>('REDIS_PORT', 6379)}`,
        options: {
          password: configService.get<string>('REDIS_PASSWORD') || undefined,
          db: configService.get<number>('REDIS_DB', 0),
        },
      }),
    }),

    // ── Infrastructure ───────────────────────────────────────────────────────
    ElasticsearchModule,

    // ── Feature Modules ──────────────────────────────────────────────────────
    AuditModule,
    EmergencyAccessModule,
    SecurityAlertsModule,
    ReportsModule,
    StatisticsModule,

    // ── Kafka Consumer (non-blocking startup — see main.ts) ──────────────────
    KafkaConsumerModule,
  ],
  providers: [
    // ── gRPC RBAC client (needed by PermissionGuard) ─────────────────────────
    RbacGrpcClient,

    // ── Global JWT authentication guard ─────────────────────────────────────
    {
      provide: APP_GUARD,
      useClass: JwtGatewayGuard,
    },

    // ── Global permission authorization guard ────────────────────────────────
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },

    // ── Global audit logging interceptor (self-observability of the service) ──
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLoggingInterceptor,
    },
  ],
})
export class AppModule {}
