import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { KafkaConsumerService } from './kafka-consumer.service';

@Controller()
export class KafkaEventsController {
  constructor(private readonly consumer: KafkaConsumerService) {}

  @EventPattern('auth.events')
  async authEvents(@Payload() message) {
    await this.consumer.handleIncomingMessage('auth.events', message);
  }

  @EventPattern('medical.events')
  async medicalEvents(@Payload() message) {
    await this.consumer.handleIncomingMessage('medical.events', message);
  }

  @EventPattern('access.events')
  async accessEvents(@Payload() message) {
    await this.consumer.handleIncomingMessage('access.events', message);
  }

  @EventPattern('system.events')
  async systemEvents(@Payload() message) {
    await this.consumer.handleIncomingMessage('system.events', message);
  }
}
