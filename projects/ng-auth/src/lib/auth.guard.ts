import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { AUTH_CONFIG } from './auth.config';
import { SystemRole } from './auth.models';

/** Requires authentication. Redirects to login if not authenticated. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const config = inject(AUTH_CONFIG);

  if (auth.loading()) return true;
  if (auth.authenticated()) return true;

  router.navigate([config.loginRoute ?? '/login']);
  return false;
};

/** Only allows non-authenticated users (login page). */
export const noAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const config = inject(AUTH_CONFIG);

  if (auth.loading()) return true;
  if (!auth.authenticated()) return true;

  router.navigate([config.defaultRoute ?? '/dashboard']);
  return false;
};

/** Creates a guard that requires specific system roles. */
export function roleGuard(allowedRoles: SystemRole[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const config = inject(AUTH_CONFIG);

    if (auth.loading()) return true;
    if (!auth.authenticated()) {
      router.navigate([config.loginRoute ?? '/login']);
      return false;
    }

    if (allowedRoles.includes(auth.systemRole())) return true;

    router.navigate([config.defaultRoute ?? '/dashboard']);
    return false;
  };
}

// Pre-built guards
export const adminGuard: CanActivateFn = roleGuard(['admin', 'super_admin']);
export const internalGuard: CanActivateFn = roleGuard(['manager', 'support', 'super_admin']);
export const superAdminGuard: CanActivateFn = roleGuard(['super_admin']);
