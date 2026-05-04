import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { KafkaConsumerService } from './kafka-consumer.service';

@Controller()
export class KafkaEventsController {
  constructor(private readonly consumer: KafkaConsumerService) {}

  @EventPattern('audit.logs')
  async handleAuditLogs(@Payload() message) {
    await this.consumer.handleIncomingMessage('audit.logs', message);
  }

  @EventPattern('security.logs')
  async handleSecurityLogs(@Payload() message) {
    await this.consumer.handleIncomingMessage('security.logs', message);
  }

  @EventPattern('technical.logs')
  async handleTechnicalLogs(@Payload() message) {
    await this.consumer.handleIncomingMessage('technical.logs', message);
  }
}
