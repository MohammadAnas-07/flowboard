import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route (or controller) as exempt from the global AuthGuard.
 * Used for /health, /, and the guest-login endpoint.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
