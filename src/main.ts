import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { Transport } from '@nestjs/microservices';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ── Kafka Microservice (resilient: failure here must NOT crash the service) ──
  // The logs_service CONSUMES Kafka events from other services.
  // If Kafka is unavailable at startup, the HTTP API must still be reachable.
  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
        retry: {
          initialRetryTime: 3000,
          retries: 0, // We manage reconnection ourselves — don't block startup
        },
      },
      consumer: {
        groupId: 'audit-consumer-group',
      },
    },
  });

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Audit & Log Service API')
    .setDescription('Microservice pour audit, logs, alertes de sécurité et rapports')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Logs', 'Gestion des logs d\'audit, sécurité et techniques')
    .addTag('Emergency Access', 'Accès d\'urgence')
    .addTag('Security Alerts', 'Alertes de sécurité')
    .addTag('Reports', 'Génération de rapports')
    .addTag('Statistics', 'Statistiques')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // ── Start Kafka consumer in background — non-blocking ──
  // If Kafka is down, only event consumption is degraded; the HTTP API stays alive.
  void app
    .startAllMicroservices()
    .then(() => {
      logger.log('📡 Kafka Microservice consumer started successfully');
    })
    .catch((err: any) => {
      logger.warn(
        JSON.stringify({
          technicalEvent: 'KAFKA_STARTUP_FAILURE',
          status: 'DEGRADED',
          error: err?.message || String(err),
          reason:
            'Kafka unavailable at startup — HTTP API remains operational. ' +
            'Consumer will retry automatically on reconnection.',
        }),
      );
    });

  const port = process.env.PORT || 3008;
  await app.listen(port);

  logger.log(`🚀 logs_service started on port ${port}`);
  logger.log(`📚 Swagger docs: http://klodit.app:${port}/api-docs`);
}

bootstrap().catch((err) => {
  logger.error(
    JSON.stringify({
      technicalEvent: 'SERVICE_STARTUP_FAILURE',
      status: 'CRITICAL',
      error: err?.message || String(err),
    }),
  );
  process.exit(1);
});
