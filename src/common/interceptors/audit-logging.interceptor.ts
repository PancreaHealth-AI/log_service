import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap, catchError } from 'rxjs';
import { ElasticsearchService } from '../../infrastructure/elasticsearch/elasticsearch.service';
import { SKIP_AUDIT } from '../decorators/skip-audit.decorator';
import { LogType } from '../enums/log-type.enum';
import { Severity } from '../enums/severity.enum';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuditLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLoggingInterceptor.name);
  constructor(
    private readonly reflector: Reflector,
    private readonly elastic: ElasticsearchService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const skip = this.reflector.get<boolean>(SKIP_AUDIT, context.getHandler());
    if (skip) return next.handle();

    const request = context.switchToHttp().getRequest();
    const { method, url, headers, ip, body } = request;
    const userId = headers['x-user-id'] || 'anonymous';
    const service = 'audit-service';

    const start = Date.now();
    return next.handle().pipe(
      tap((data) => {
        this.logToElastic({
          logType: LogType.AUDIT,
          eventType: 'INTERNAL_API_CALL',
          action: `${method} ${url}`,
          userId,
          resource: this.extractResource(url),
          severity: Severity.LOW,
          service,
          metadata: { method, url, ip, duration: Date.now() - start },
        });
      }),
      catchError((error) => {
        this.logToElastic({
          logType: LogType.TECHNICAL,
          eventType: 'INTERNAL_API_ERROR',
          action: `${method} ${url}`,
          userId,
          resource: this.extractResource(url),
          severity: Severity.HIGH,
          service,
          metadata: { method, url, error: error.message, ip, duration: Date.now() - start },
        });
        throw error;
      }),
    );
  }

  private extractResource(url: string): string {
    if (url.includes('audit')) return 'audit_logs';
    if (url.includes('security')) return 'security_logs';
    if (url.includes('technical')) return 'technical_logs';
    return 'logs';
  }

  private async logToElastic(doc: any) {
    try {
      const logId = uuid();
      await this.elastic.index({
        index: doc.logType === LogType.TECHNICAL ? 'technical_logs' : 'audit_logs',
        document: {
          ...doc,
          id: logId,
          timestamp: new Date().toISOString(),
        },
        id: logId,
      });
    } catch (err) {
      this.logger.error('Failed to write self-audit log', err);
    }
  }
}
