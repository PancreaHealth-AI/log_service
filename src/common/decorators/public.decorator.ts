import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark an endpoint as public — bypasses JwtGatewayGuard and PermissionGuard.
 * Use sparingly. Intended only for endpoints that must be accessible without
 * a user token (e.g., health checks, internal service-to-service log ingestion).
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
