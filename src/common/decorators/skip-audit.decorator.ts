import { SetMetadata } from '@nestjs/common';

export const SKIP_AUDIT = 'skipAudit';
export const SkipAudit = () => SetMetadata(SKIP_AUDIT, true);
