# Changelog

## @socoti/ng-auth

### 0.1.0 (2026-04-21)

- Initial release
- Zitadel OIDC authentication with `angular-oauth2-oidc`
- In-memory token storage (signals, no localStorage/sessionStorage/cookies)
- Silent refresh for session recovery on page reload
- Auto-redirect to login on 401 or expired session
- `provideAuth()` function for easy setup in `app.config.ts`
- Guards: `authGuard`, `noAuthGuard`, `roleGuard()`, `adminGuard`, `internalGuard`, `superAdminGuard`
- HTTP interceptor with automatic token attachment and 401 retry
- Signals-based state: `user`, `profile`, `authenticated`, `loading`, `roles`, `menu`
- Optional backend profile and menu loading
- TypeScript strict mode
