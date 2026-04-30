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
import { AuditAction } from '../enums/audit-action.enum';
import { Severity } from '../enums/severity.enum';
import { AuditStatus } from '../enums/audit-status.enum';
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
    const userAgent = headers['user-agent'] || '';
    const action = this.mapAction(method, url);

    if (!action || this.isLogCreationEndpoint(url, method)) {
      return next.handle();
    }

    const start = Date.now();
    return next.handle().pipe(
      tap((data) => {
        this.logToElastic({
          userId,
          action,
          resource: this.extractResource(url),
          endpoint: url,
          status: AuditStatus.SUCCESS,
          severity: Severity.INFO,
          metadata: { method, body },
          ipAddress: ip,
          userAgent,
          durationMs: Date.now() - start,
        });
      }),
      catchError((error) => {
        this.logToElastic({
          userId,
          action,
          resource: this.extractResource(url),
          endpoint: url,
          status: AuditStatus.FAILED,
          severity: Severity.ERROR,
          metadata: { error: error.message, body },
          ipAddress: ip,
          userAgent,
          durationMs: Date.now() - start,
        });
        throw error;
      }),
    );
  }

  private mapAction(method: string, url: string): AuditAction | null {
    if (url.startsWith('/audit/logs/search')) return AuditAction.SEARCH_LOGS;
    if (url.startsWith('/audit/logs') && method === 'GET') return AuditAction.VIEW_LOG;
    if (url.startsWith('/audit/emergency-access/review')) return AuditAction.REVIEW_EMERGENCY_ACCESS;
    if (url.startsWith('/audit/security-alerts') && url.includes('investigate')) return AuditAction.INVESTIGATE_ALERT;
    if (url.startsWith('/audit/security-alerts') && url.includes('resolve')) return AuditAction.RESOLVE_ALERT;
    if (url.startsWith('/audit/reports/generate')) return AuditAction.GENERATE_REPORT;
    if (url.startsWith('/audit/export')) return AuditAction.EXPORT_DATA;
    if (url.startsWith('/audit/statistics')) return AuditAction.ACCESS_STATISTICS;
    if (url.startsWith('/audit/emergency-access') && method === 'GET') return AuditAction.VIEW_LOG;
    return null;
  }

  private extractResource(url: string): string {
    if (url.includes('logs')) return 'audit_logs';
    if (url.includes('emergency')) return 'emergency_access';
    if (url.includes('security-alerts')) return 'security_alerts';
    if (url.includes('reports')) return 'reports';
    if (url.includes('export')) return 'export';
    if (url.includes('statistics')) return 'statistics';
    return 'unknown';
  }

  private isLogCreationEndpoint(url: string, method: string): boolean {
    return url === '/audit/logs' && method === 'POST';
  }

  private async logToElastic(data: any) {
    try {
      await this.elastic.index({
        index: 'audit_logs',
        document: {
          id: uuid(),
          timestamp: new Date().toISOString(),
          service_name: 'audit-service',
          ...data,
        },
      });
    } catch (err) {
      this.logger.error('Failed to write self-audit log', err);
    }
  }
}
