import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacGrpcClient } from '../grpc/rbac-grpc.client';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  private readonly logger = new Logger(PermissionGuard.name);

  constructor(
    private reflector: Reflector,
    private rbacClient: RbacGrpcClient,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') {
      return true;
    }

    // Allow @Public() endpoints through without authorization check
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.sub) {
      this.logger.warn(
        JSON.stringify({
          securityEvent: 'UNAUTHORIZED_ACCESS',
          status: 'FAILED',
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          path: request.url,
          method: request.method,
          reason: 'User not authenticated — missing user context in request',
        }),
      );
      throw new UnauthorizedException('Utilisateur non authentifié');
    }

    const permissionCode = this.reflector.get<string>(
      'permission',
      context.getHandler(),
    );

    if (!permissionCode) {
      return true;
    }

    const assignmentId = user.assignedId;
    if (!assignmentId) {
      this.logger.warn(
        JSON.stringify({
          securityEvent: 'UNAUTHORIZED_ACCESS',
          status: 'FAILED',
          userId: user.sub,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          path: request.url,
          method: request.method,
          reason: 'No active role assignment in token',
        }),
      );
      throw new UnauthorizedException('Aucun rôle actif dans le token');
    }

    const cacheKey = `perm:${user.sub}:${assignmentId}:${permissionCode}`;

    // 1. Redis cache check with fault tolerance
    let cached: string | null = null;
    try {
      cached = await this.redis.get(cacheKey);
    } catch (err: any) {
      this.logger.error(
        JSON.stringify({
          technicalEvent: 'REDIS_QUERY_FAILURE',
          status: 'FAILED',
          error: err.message,
          operation: 'get',
          key: cacheKey,
        }),
      );
    }

    if (cached !== null) {
      const allowed = cached === 'true';
      if (!allowed) {
        this.logger.warn(
          JSON.stringify({
            securityEvent: 'INSUFFICIENT_PERMISSIONS',
            status: 'FAILED',
            userId: user.sub,
            resource: 'permission',
            target: permissionCode,
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
            assignmentId,
            permissionCode,
            fromCache: true,
          }),
        );
      }
      return allowed;
    }

    // 2. gRPC RBAC check
    const hasPermission = await this.rbacClient.checkPermission(
      user.sub,
      permissionCode,
      assignmentId,
    );

    // 3. Store in Redis cache (15 minutes) with fault tolerance
    try {
      await this.redis.set(cacheKey, hasPermission ? 'true' : 'false', 'EX', 900);
    } catch (err: any) {
      this.logger.error(
        JSON.stringify({
          technicalEvent: 'REDIS_QUERY_FAILURE',
          status: 'FAILED',
          error: err.message,
          operation: 'set',
          key: cacheKey,
        }),
      );
    }

    if (!hasPermission) {
      this.logger.warn(
        JSON.stringify({
          securityEvent: 'INSUFFICIENT_PERMISSIONS',
          status: 'FAILED',
          userId: user.sub,
          resource: 'permission',
          target: permissionCode,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          assignmentId,
          permissionCode,
          fromCache: false,
        }),
      );
    }

    return hasPermission;
  }
}
