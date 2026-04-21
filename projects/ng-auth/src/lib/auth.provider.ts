import { APP_INITIALIZER, EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { OAuthStorage, provideOAuthClient } from 'angular-oauth2-oidc';
import { AUTH_CONFIG } from './auth.config';
import { AuthService } from './auth.service';
import { InMemoryOAuthStorage } from './auth.storage';
import { authInterceptor } from './auth.interceptor';
import { AuthProviderConfig } from './auth.models';

/**
 * Configure authentication for the application.
 *
 * Usage in app.config.ts:
 * ```typescript
 * import { provideAuth } from '@socoti/ng-auth';
 *
 * export const appConfig = {
 *   providers: [
 *     provideAuth({
 *       issuer: environment.zitadel.issuer,
 *       clientId: environment.zitadel.clientId,
 *       scope: environment.zitadel.scope,
 *       apiUrl: environment.apiUrl,
 *     }),
 *   ],
 * };
 * ```
 */
export function provideAuth(config: AuthProviderConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    // Config injection
    { provide: AUTH_CONFIG, useValue: config },

    // In-memory token storage (no localStorage/sessionStorage/cookies)
    { provide: OAuthStorage, useClass: InMemoryOAuthStorage },

    // OAuth client
    provideOAuthClient(),

    // HTTP client with auth interceptor
    provideHttpClient(withInterceptors([authInterceptor])),

    // Initialize auth on app startup
    {
      provide: APP_INITIALIZER,
      useFactory: (authService: AuthService) => () => authService.init(),
      deps: [AuthService],
      multi: true,
    },
  ]);
}
