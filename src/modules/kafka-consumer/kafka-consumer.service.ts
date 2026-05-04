import { Injectable, Logger } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { LogType } from '../../common/enums/log-type.enum';

@Injectable()
export class KafkaConsumerService {
  private readonly logger = new Logger(KafkaConsumerService.name);

  constructor(
    private readonly auditService: AuditService,
  ) {}

  async handleIncomingMessage(topic: string, message: any) {
    const event = message.value || message;
    this.logger.log(`📥 Log received via Kafka [${topic}]: ${event.eventType || event.action}`);

    // Forcer le logType en fonction du topic si manquant
    if (!event.logType) {
      if (topic === 'audit.logs') event.logType = LogType.AUDIT;
      else if (topic === 'security.logs') event.logType = LogType.SECURITY;
      else if (topic === 'technical.logs') event.logType = LogType.TECHNICAL;
    }

    await this.auditService.createLog(event);
  }
}

