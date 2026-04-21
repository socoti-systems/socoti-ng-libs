/**
 * User extracted from Zitadel JWT claims.
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  orgId: string;
  roles: string[];
}

/**
 * User profile loaded from the backend API.
 */
export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  system_role: SystemRole;
  created_at: string;
}

export type SystemRole = 'user' | 'admin' | 'manager' | 'support' | 'super_admin';

/**
 * Menu item received from IAM backend.
 */
export interface MenuItem {
  code: string;
  name: string;
  icon?: string;
  url?: string;
  children?: MenuItem[];
}

/**
 * Application info from IAM.
 */
export interface AppInfo {
  code: string;
  name: string;
  app_type: 'internal' | 'commercial';
  base_url?: string;
}

/**
 * Configuration for provideAuth().
 */
export interface AuthProviderConfig {
  /** Zitadel OIDC issuer URL */
  issuer: string;
  /** Zitadel client ID */
  clientId: string;
  /** OIDC scopes */
  scope: string;
  /** Backend API base URL (for interceptor to add Bearer token) */
  apiUrl: string;
  /** Route for login page (default: '/login') */
  loginRoute?: string;
  /** Route after successful login (default: '/dashboard') */
  defaultRoute?: string;
  /** Enable debug logging (default: false) */
  debug?: boolean;
  /** Backend endpoint to load user profile (default: null — no backend profile) */
  profileEndpoint?: string;
  /** Backend endpoint to load menu (default: null — no backend menu) */
  menuEndpoint?: string;
}
