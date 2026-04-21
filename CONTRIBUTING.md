# Guia de contribucion

## Estructura del workspace

```
socoti-ng-libs/
├── projects/              ← Cada libreria es un directorio aqui
│   └── ng-auth/           ← @socoti/ng-auth
├── dist/                  ← Output de build (gitignored)
├── package.json           ← Workspace root
├── angular.json           ← Config de Angular CLI
└── tsconfig.json          ← TypeScript base
```

## Crear una nueva libreria

```bash
pnpm ng generate library ng-nombre --prefix=socoti
```

Despues de crear:
1. Actualizar `projects/ng-nombre/package.json` con `"name": "@socoti/ng-nombre"`
2. Agregar `publishConfig` con registry de GitHub Packages
3. Implementar codigo en `src/lib/`
4. Exportar API publica en `src/public-api.ts`

## Convenciones de codigo

- **Idioma del codigo**: INGLES (variables, funciones, clases, interfaces)
- **Idioma de documentacion**: ESPANOL
- **Signals**: Usar signals para estado, computed para derivados
- **No NgModules**: Solo standalone components/services
- **OnPush**: Siempre ChangeDetectionStrategy.OnPush
- **Prefijo**: `socoti` para selectores de componentes
- **Tests**: Vitest, cobertura minima 80%

## Versionamiento

Usamos [Semantic Versioning](https://semver.org/):
- **MAJOR**: cambios incompatibles en API publica
- **MINOR**: funcionalidad nueva compatible
- **PATCH**: correcciones de bugs

## Publicar

```bash
# 1. Actualizar version en projects/ng-nombre/package.json
# 2. Build
pnpm ng build ng-nombre --configuration=production
# 3. Publicar
cd dist/ng-nombre
pnpm publish
```

## Probar localmente (sin publicar)

```bash
# Build
pnpm ng build ng-nombre

# Link
cd dist/ng-nombre
pnpm link --global

# En el proyecto consumidor
pnpm link --global @socoti/ng-nombre
```
