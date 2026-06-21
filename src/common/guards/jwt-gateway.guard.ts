import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtGatewayGuard implements CanActivate {
  private readonly logger = new Logger(JwtGatewayGuard.name);
  private publicKey: string;

  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
    @InjectRedis()
    private readonly redis: Redis,
  ) {
    const keyPath = this.configService.get<string>('JWT_PUBLIC_KEY_PATH');
    if (!keyPath) {
      throw new Error('JWT_PUBLIC_KEY_PATH is not defined in configuration');
    }
    this.publicKey = fs.readFileSync(keyPath, 'utf8');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') {
      return true;
    }

    // Allow @Public() endpoints through without authentication
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();

    const token = this.extractToken(request);
    if (!token) {
      this.logger.warn(
        JSON.stringify({
          securityEvent: 'MISSING_TOKEN',
          status: 'FAILED',
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          path: request.url,
          method: request.method,
          reason: 'Authorization header absent or malformed',
        }),
      );
      throw new UnauthorizedException('Token manquant');
    }

    try {
      const payload = jwt.verify(token, this.publicKey, {
        algorithms: ['RS256'],
      }) as any;

      const sessionId = payload.sessionId;

      // CHECK REDIS BLACKLIST
      const blacklistKey = `blacklist:session:${sessionId}`;
      let isRevoked: string | null = null;
      try {
        isRevoked = await this.redis.get(blacklistKey);
      } catch (redisErr: any) {
        this.logger.error(
          JSON.stringify({
            technicalEvent: 'REDIS_QUERY_FAILURE',
            status: 'FAILED',
            operation: 'get',
            key: blacklistKey,
            error: redisErr.message,
          }),
        );
        // On Redis failure, allow request through to avoid blocking all traffic
      }

      if (isRevoked) {
        this.logger.warn(
          JSON.stringify({
            securityEvent: 'INVALID_TOKEN',
            status: 'FAILED',
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
            path: request.url,
            method: request.method,
            reason: 'Session revoked / blacklisted in Redis',
            sessionId,
          }),
        );
        throw new UnauthorizedException('Session révoquée');
      }

      request.user = {
        sub: payload.sub,
        username: payload.username,
        email: payload.email,
        sessionId: payload.sessionId,
        role: payload.role ?? null,
        assignedId: payload.assignedId ?? null,
        scope: payload.scope ?? null,
        scopeId: payload.scopeId ?? null,
        hospitalId: payload.hospitalId ?? null,
        departmentId: payload.departmentId ?? null,
        serviceId: payload.serviceId ?? null,
      };

      return true;
    } catch (error: any) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      const isExpired = error instanceof jwt.TokenExpiredError;
      const securityEvent = isExpired ? 'EXPIRED_TOKEN' : 'INVALID_TOKEN';

      this.logger.warn(
        JSON.stringify({
          securityEvent,
          status: 'FAILED',
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          path: request.url,
          method: request.method,
          reason: error.message || String(error),
        }),
      );

      throw new UnauthorizedException('Token invalide ou expiré');
    }
  }

  private extractToken(request: any): string | null {
    const authHeader = request.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }
    return null;
  }
}