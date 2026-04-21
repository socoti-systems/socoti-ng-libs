import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { AUTH_CONFIG, createOAuthConfig } from './auth.config';
import { AuthUser, UserProfile, MenuItem, AppInfo, AuthProviderConfig } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly oauthService = inject(OAuthService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly config = inject(AUTH_CONFIG);

  // Private signals
  private readonly _user = signal<AuthUser | null>(null);
  private readonly _profile = signal<UserProfile | null>(null);
  private readonly _menu = signal<MenuItem[]>([]);
  private readonly _apps = signal<AppInfo[]>([]);
  private readonly _authenticated = signal(false);
  private readonly _loading = signal(true);

  // Public readonly signals
  readonly user = this._user.asReadonly();
  readonly profile = this._profile.asReadonly();
  readonly menu = this._menu.asReadonly();
  readonly apps = this._apps.asReadonly();
  readonly authenticated = this._authenticated.asReadonly();
  readonly loading = this._loading.asReadonly();

  // Computed
  readonly roles = computed(() => this._user()?.roles ?? []);
  readonly systemRole = computed(() => this._profile()?.system_role ?? 'user');
  readonly isAdmin = computed(() => this.systemRole() === 'admin' || this.isSuperAdmin());
  readonly isSuperAdmin = computed(() => this.systemRole() === 'super_admin');
  readonly isInternalUser = computed(() => ['manager', 'support', 'super_admin'].includes(this.systemRole()));

  /**
   * Initialize auth: configure OIDC, try silent login, load profile.
   * Called once at app startup via APP_INITIALIZER.
   */
  async init(): Promise<void> {
    try {
      this.oauthService.configure(createOAuthConfig(this.config));
      this.setupEvents();
      await this.oauthService.loadDiscoveryDocumentAndTryLogin();

      if (this.oauthService.hasValidAccessToken()) {
        this.extractUserFromClaims();
        this._authenticated.set(true);
        this.oauthService.setupAutomaticSilentRefresh();
        await this.loadBackendData();
      }
    } catch (err) {
      console.error('Auth init error:', err);
    } finally {
      this._loading.set(false);
    }
  }

  /** Redirect to Zitadel login page. */
  login(): void {
    this.oauthService.initCodeFlow();
  }

  /** Process OIDC callback after Zitadel login. */
  async handleCallback(): Promise<boolean> {
    try {
      await this.oauthService.loadDiscoveryDocumentAndTryLogin();
      if (this.oauthService.hasValidAccessToken()) {
        this.extractUserFromClaims();
        this._authenticated.set(true);
        await this.loadBackendData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Callback error:', err);
      return false;
    }
  }

  /** Logout and redirect to login page. */
  logout(): void {
    this.oauthService.logOut();
    this._user.set(null);
    this._profile.set(null);
    this._menu.set([]);
    this._apps.set([]);
    this._authenticated.set(false);
    this.router.navigate([this.config.loginRoute ?? '/login']);
  }

  /** Get current access token (for manual use). */
  getToken(): string | null {
    return this.oauthService.getAccessToken() || null;
  }

  /** Check if user has a specific role. */
  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  /** Force redirect to login. Used by interceptor on unrecoverable 401. */
  forceLogin(): void {
    this._authenticated.set(false);
    this.router.navigate([this.config.loginRoute ?? '/login']);
  }

  /** Try silent refresh. Returns true if successful. */
  async trySilentRefresh(): Promise<boolean> {
    try {
      await this.oauthService.silentRefresh();
      return this.oauthService.hasValidAccessToken();
    } catch {
      return false;
    }
  }

  /** Update menu externally (used by context services). */
  updateMenu(menu: MenuItem[]): void {
    this._menu.set(menu);
  }

  // --- Private ---

  private setupEvents(): void {
    this.oauthService.events.subscribe((event) => {
      if (event.type === 'token_received') {
        this.extractUserFromClaims();
        this._authenticated.set(true);
      }
      if (event.type === 'silent_refresh_error') {
        console.warn('Silent refresh failed — session may have expired');
        this.forceLogin();
      }
    });
  }

  private extractUserFromClaims(): void {
    const claims = this.oauthService.getIdentityClaims();
    if (!claims) return;

    this._user.set({
      id: (claims['sub'] as string) ?? '',
      email: (claims['email'] as string) ?? (claims['preferred_username'] as string) ?? '',
      name: (claims['name'] as string) ?? '',
      orgId: (claims['urn:zitadel:iam:org:id'] as string) ?? '',
      roles: this.extractRoles(claims),
    });
  }

  private extractRoles(claims: Record<string, unknown>): string[] {
    const rolesObj = claims['urn:zitadel:iam:org:project:roles'] as Record<string, unknown>;
    return rolesObj ? Object.keys(rolesObj) : [];
  }

  private async loadBackendData(): Promise<void> {
    // Load profile if endpoint configured
    if (this.config.profileEndpoint) {
      try {
        const resp = await this.http.get<{ success: boolean; data: UserProfile }>(
          `${this.config.apiUrl}${this.config.profileEndpoint}`
        ).toPromise();
        if (resp?.data) this._profile.set(resp.data);
      } catch {
        // Use token claims as fallback
        this._profile.set({
          id: this._user()?.id ?? '',
          email: this._user()?.email ?? '',
          display_name: this._user()?.name ?? null,
          system_role: 'user',
          created_at: new Date().toISOString(),
        });
      }
    }

    // Load menu if endpoint configured
    if (this.config.menuEndpoint) {
      try {
        const resp = await this.http.get<{ success: boolean; data: { menu: MenuItem[]; apps: AppInfo[] | null } }>(
          `${this.config.apiUrl}${this.config.menuEndpoint}`
        ).toPromise();
        if (resp?.data) {
          this._menu.set(resp.data.menu ?? []);
          this._apps.set(resp.data.apps ?? []);
        }
      } catch {
        // No menu available
      }
    }
  }
}
