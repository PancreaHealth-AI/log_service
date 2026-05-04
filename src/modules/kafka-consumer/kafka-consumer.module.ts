import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KafkaConsumerService } from './kafka-consumer.service';
import { KafkaEventsController } from './kafka-events.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_CLIENT',
        useFactory: (config: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'audit-log-consumer',
              brokers: config.get('KAFKA_BROKERS')?.split(',') || ['localhost:9092'],
              retry: {
                initialRetryTime: 3000,
                retries: 8,
                maxRetryTime: 30000,
              },
            },
            consumer: {
              groupId: 'audit-consumer-group',
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    AuditModule,
  ],
  controllers: [KafkaEventsController],
  providers: [KafkaConsumerService],
})
export class KafkaConsumerModule {}

