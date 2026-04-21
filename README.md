# Socoti Angular Libraries

Workspace de librerias Angular compartidas para los frontends de Socoti.

## Librerias disponibles

| Paquete | Version | Descripcion |
|---------|---------|-------------|
| `@socoti/ng-auth` | 0.1.0 | Autenticacion Zitadel OIDC con tokens en memoria |

## Requisitos

- Node.js 20+
- pnpm 10+
- Angular CLI 21+

## Desarrollo local

```bash
# Instalar dependencias
pnpm install

# Build de una libreria
pnpm ng build ng-auth

# Build con watch (para desarrollo en paralelo con un proyecto consumidor)
pnpm ng build ng-auth --watch

# Tests
pnpm ng test ng-auth
```

## Usar una libreria en tu proyecto (desarrollo local)

Para desarrollo local sin publicar, usa `pnpm link`:

```bash
# 1. Build la libreria
cd socoti-ng-libs
pnpm ng build ng-auth

# 2. Link global
cd dist/ng-auth
pnpm link --global

# 3. En tu proyecto consumidor (ej: nexara/frontend)
cd nexara/frontend
pnpm link --global @socoti/ng-auth
```

## Publicar en GitHub Packages

### Configuracion inicial (una sola vez)

1. Crear archivo `.npmrc` en la raiz del workspace:
```
@socoti:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

2. Exportar tu GitHub token:
```bash
export GITHUB_TOKEN=ghp_tuTokenAqui
```

### Publicar una libreria

```bash
# Build produccion
pnpm ng build ng-auth --configuration=production

# Publicar
cd dist/ng-auth
pnpm publish
```

### Instalar en un proyecto consumidor

1. Crear `.npmrc` en el proyecto:
```
@socoti:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

2. Instalar:
```bash
pnpm add @socoti/ng-auth
```

## Agregar una nueva libreria al workspace

```bash
# Generar la libreria
pnpm ng generate library ng-mi-libreria --prefix=socoti

# Actualizar package.json de la libreria con nombre @socoti/ng-mi-libreria
# Implementar codigo en projects/ng-mi-libreria/src/lib/
# Build: pnpm ng build ng-mi-libreria
# Publicar: cd dist/ng-mi-libreria && pnpm publish
```

## Uso de @socoti/ng-auth

### Configurar en app.config.ts

```typescript
import { provideAuth } from '@socoti/ng-auth';

export const appConfig = {
  providers: [
    provideAuth({
      issuer: 'https://iam-socoti-svsyoy.us1.zitadel.cloud',
      clientId: '369460743118038572',
      scope: 'openid profile email offline_access urn:zitadel:iam:org:project:roles urn:zitadel:iam:user:resourceowner',
      apiUrl: 'http://localhost:8085/api/v1',
      loginRoute: '/login',
      defaultRoute: '/dashboard',
    }),
  ],
};
```

### Proteger rutas

```typescript
import { authGuard, noAuthGuard } from '@socoti/ng-auth';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
  { path: 'callback', component: CallbackComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
];
```

### Usar en componentes

```typescript
import { AuthService } from '@socoti/ng-auth';

export class MiComponente {
  private auth = inject(AuthService);
  user = this.auth.user;           // Signal<AuthUser | null>
  authenticated = this.auth.authenticated; // Signal<boolean>
}
```

### Tokens seguros

Los tokens se almacenan **solo en memoria** (signals). No se usan localStorage, sessionStorage ni cookies.
Al refrescar la pagina, se usa silent refresh con Zitadel para recuperar la sesion sin mostrar login.
Si la sesion de Zitadel expiro, se redirige automaticamente a la pagina de login.

### Silent refresh

Crear el archivo `src/assets/silent-refresh.html` en cada proyecto consumidor:

```html
<html>
<body>
  <script>
    (window.opener || window.parent).postMessage(location.hash || ('?' + location.search.slice(1)), location.origin);
  </script>
</body>
</html>
```
