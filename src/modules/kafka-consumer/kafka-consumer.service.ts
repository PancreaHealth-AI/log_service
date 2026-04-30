import { Injectable, Inject, OnModuleDestroy, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { AuditService } from '../audit/audit.service';
import { kafkaConfig } from '../../config/kafka.config';

@Injectable()
export class KafkaConsumerService implements OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private subscribed = false;

  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
    private readonly auditService: AuditService,
  ) {}

  async startListening() {
    try {
      const config = kafkaConfig();
      for (const topic of config.topics) {
        this.kafkaClient.subscribeToResponseOf(topic);
        this.logger.log(`Subscribed to topic: ${topic}`);
      }
      await this.kafkaClient.connect();
      this.subscribed = true;
    } catch (err) {
      this.logger.error(
        `Kafka connection failed, service continues without Kafka`,
        err.stack,
      );
    }
  }

  async onModuleDestroy() {
    if (this.subscribed) await this.kafkaClient.close();
  }

  async handleIncomingMessage(topic: string, message: any) {
    const event = message.value || message; // selon serialisation
    await this.auditService.createLog({
      user_id: event.userId,
      action: event.action,
      resource: event.resource,
      ip_address: event.ip_address,
      user_agent: event.user_agent,
      metadata: event.metadata,
      service_name: event.service_name || 'kafka-ingest',
      timestamp: event.timestamp || new Date().toISOString(),
    });
  }
}
