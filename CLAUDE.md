# CLAUDE.md — Socoti Angular Libraries

## Proyecto

Workspace de librerias Angular compartidas para todos los frontends de Socoti.

## Librerias

- `@socoti/ng-auth` — Autenticacion con Zitadel OIDC (tokens en memoria, silent refresh, guards, interceptor)

## Estructura

```
socoti-ng-libs/
├── projects/
│   └── ng-auth/           ← @socoti/ng-auth
├── package.json           ← workspace root
├── angular.json
└── CLAUDE.md
```

## Comandos

```bash
pnpm install                       # Instalar dependencias
pnpm ng build ng-auth              # Build de la libreria
pnpm ng build ng-auth --watch      # Build con watch mode
pnpm ng test ng-auth               # Tests
```

## Estandares

- **Angular 21** standalone components
- **Signals** para estado
- **OnPush** change detection
- **TypeScript strict**
- Codigo en **INGLES**, documentacion en **ESPANOL**
- Tests con **Vitest**
- Package manager: **pnpm**

## Publicacion

Las librerias se publican en GitHub Packages con scope @socoti.
Ver README.md para instrucciones de publicacion.
