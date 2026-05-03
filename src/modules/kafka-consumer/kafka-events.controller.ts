import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { KafkaConsumerService } from './kafka-consumer.service';

@Controller()
export class KafkaEventsController {
  constructor(private readonly consumer: KafkaConsumerService) {}

  @EventPattern('logs-auth')
  async authEvents(@Payload() message) {
    await this.consumer.handleIncomingMessage('logs-auth', message);
  }

  @EventPattern('logs-medical')
  async medicalEvents(@Payload() message) {
    await this.consumer.handleIncomingMessage('logs-medical', message);
  }

  @EventPattern('logs-access')
  async accessEvents(@Payload() message) {
    await this.consumer.handleIncomingMessage('logs-access', message);
  }

  @EventPattern('logs-system')
  async systemEvents(@Payload() message) {
    await this.consumer.handleIncomingMessage('logs-system', message);
  }
}
