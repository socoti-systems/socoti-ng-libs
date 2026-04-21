# Guia: Build y publicacion con pnpm + GitHub Packages

## Publicar @socoti/ng-auth

### Paso 1: Crear repositorio en GitHub

1. Ve a https://github.com/organizations/socoti-systems/repositories/new
2. Nombre: `socoti-ng-libs`
3. Visibilidad: **Private**
4. NO inicializar con README (ya lo tenemos)
5. Click "Create repository"

### Paso 2: Subir codigo al repo

```bash
cd socoti-ng-libs

git init
git add .
git commit -m "Initial commit: @socoti/ng-auth library v0.1.0"
git remote add origin https://github.com/socoti-systems/socoti-ng-libs.git
git branch -M main
git push -u origin main
```

### Paso 3: Configurar .npmrc para publicar

```bash
cd socoti-ng-libs

echo "@socoti:registry=https://npm.pkg.github.com" > .npmrc
echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc
```

> **IMPORTANTE**: Agregar `.npmrc` a `.gitignore` para no subir el token al repo.

### Paso 4: Instalar dependencias y build

```bash
# Instalar dependencias del workspace
pnpm install

# Build produccion
pnpm ng build ng-auth --configuration=production
```

### Paso 5: Publicar a GitHub Packages

```bash
cd dist/ng-auth
pnpm publish --no-git-checks
```

Deberias ver: `+ @socoti/ng-auth@0.1.0`

### Paso 6: Verificar publicacion

Ve a https://github.com/orgs/socoti-systems/packages — deberias ver `@socoti/ng-auth`.

---

## Consumir en un proyecto (ej: Nexara)

### Instalar

```bash
cd nexara/frontend

# Crear .npmrc con acceso a GitHub Packages
echo "@socoti:registry=https://npm.pkg.github.com" > .npmrc
echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc

# Instalar la libreria + peer dependency
pnpm add @socoti/ng-auth angular-oauth2-oidc
```

### Docker

En el Dockerfile del frontend, copiar `.npmrc` antes de `pnpm install`:

```dockerfile
ARG GITHUB_TOKEN
RUN echo "@socoti:registry=https://npm.pkg.github.com" > .npmrc && \
    echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc

COPY package.json pnpm-lock.yaml ./
RUN pnpm install
```

---

## Desarrollo local con pnpm link (debug)

Cuando necesitas hacer cambios en la libreria y probarlos sin publicar:

```bash
# Terminal 1: Build con watch
cd socoti-ng-libs
pnpm ng build ng-auth --watch

# Terminal 2: Link global
cd socoti-ng-libs/dist/ng-auth
pnpm link --global

# Terminal 3: Usar en Nexara
cd nexara/frontend
pnpm link --global @socoti/ng-auth

# Cada cambio en la libreria se refleja en Nexara en vivo.

# Cuando termines, deshacer el link:
cd nexara/frontend
pnpm unlink @socoti/ng-auth
pnpm install  # restaura version de GitHub Packages
```

---

## Publicar nueva version

```bash
cd socoti-ng-libs

# 1. Actualizar version en projects/ng-auth/package.json
#    Ejemplo: "version": "0.2.0"

# 2. Build
pnpm ng build ng-auth --configuration=production

# 3. Publicar
cd dist/ng-auth
pnpm publish --no-git-checks

# 4. En proyectos consumidores:
cd nexara/frontend
pnpm update @socoti/ng-auth
```

---

## Agregar nueva libreria al workspace

```bash
cd socoti-ng-libs

# Generar libreria
pnpm ng generate library ng-nombre --prefix=socoti

# Editar projects/ng-nombre/package.json:
#   "name": "@socoti/ng-nombre"
#   Agregar publishConfig

# Implementar, build y publicar igual que ng-auth
```
