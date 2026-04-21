import { InjectionToken } from '@angular/core';
import { AuthConfig } from 'angular-oauth2-oidc';
import { AuthProviderConfig } from './auth.models';

/** Injection token for the auth configuration. */
export const AUTH_CONFIG = new InjectionToken<AuthProviderConfig>('AUTH_CONFIG');

/** Creates an angular-oauth2-oidc AuthConfig from our provider config. */
export function createOAuthConfig(config: AuthProviderConfig): AuthConfig {
  return {
    issuer: config.issuer,
    clientId: config.clientId,
    redirectUri: `${window.location.origin}/callback`,
    postLogoutRedirectUri: window.location.origin,
    scope: config.scope,
    responseType: 'code',
    showDebugInformation: config.debug ?? false,
    requireHttps: !config.debug,
    // Silent refresh: recover session from Zitadel without showing login
    useSilentRefresh: true,
    silentRefreshRedirectUri: `${window.location.origin}/assets/silent-refresh.html`,
    sessionChecksEnabled: false,
    timeoutFactor: 0.75,
  };
}
