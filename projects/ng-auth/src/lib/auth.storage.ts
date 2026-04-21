import { OAuthStorage } from 'angular-oauth2-oidc';

/**
 * In-memory storage for OAuth tokens.
 * Tokens live only in memory — never in localStorage, sessionStorage, or cookies.
 *
 * When the user refreshes the page (F5), the token is lost.
 * The library uses silent refresh via iframe to recover the session from Zitadel
 * without showing the login page (as long as Zitadel session is still active).
 *
 * This is more secure than browser storage because:
 * - XSS attacks cannot steal tokens from storage APIs
 * - Tokens are not persisted to disk
 * - Each tab has its own isolated token
 */
export class InMemoryOAuthStorage implements OAuthStorage {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, data: string): void {
    this.store.set(key, data);
  }
}
