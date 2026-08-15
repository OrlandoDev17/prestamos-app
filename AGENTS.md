# AGENTS.md — Guía del Proyecto prestamos-app

## Stack

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | React | ^19.2.0 |
| Meta-framework | TanStack Start | latest (SSR) |
| Router | @tanstack/react-router | latest (file-based) |
| Build | Vite | ^8.0.0 |
| Server | Nitro | 3.0.260610-beta |
| Lenguaje | TypeScript | ^6.0.2 |
| CSS | Tailwind CSS v4 | ^4.1.18 |
| Estado | Zustand | ^5.0.14 |
| Forms | @tanstack/react-form | latest |
| Data fetching | @tanstack/react-query | latest |
| Backend/Auth | Supabase | ^2.112.2 |
| Validación | Zod | ^4.4.3 |
| Móvil | Capacitor | ^8.5.0 (Android) |
| Icons | lucide-react | ^1.30.0 |
| Linter/Formatter | Biome | 2.4.5 |
| Font | Satoshi Variable | Custom woff2 |
| DevTools | @tanstack/react-devtools + devtools-vite | latest |

## Package Manager

**USAR PNPM SIEMPRE.** No usar npm ni yarn.

```bash
pnpm install          # instalar dependencias
pnpm dev              # servidor de desarrollo (port 3000)
pnpm build            # build de producción
pnpm preview          # preview del build
pnpm lint             # lint con Biome
pnpm format           # formatear con Biome
pnpm check            # lint + format en uno
pnpm generate-routes  # regenerar routeTree.gen.ts
```

## Path Aliases

```ts
"#/*" → "./src/*"   // alias primario
"@/*"  → "./src/*"  // alias secundario (mismo resultado)
```

Ambos resuelven a `src/`. Usar `#/` es la convención principal en el proyecto.

## Estructura del Proyecto

```
src/
├── routes/                       # Rutas file-based (TanStack Router)
│   ├── __root.tsx                # Root layout + auth guard global
│   ├── auth.tsx                  # "/auth" — página de login
│   ├── admin.tsx                 # "/admin" — layout admin + guard rol
│   ├── admin/
│   │   └── index.tsx            # "/admin" — panel de admin
│   ├── lender.tsx                # "/lender" — layout lender + guard auth
│   └── lender/
│       └── index.tsx            # "/lender" — dashboard lender
├── components/
│   ├── auth/
│   │   └── login-form.tsx       # Formulario de login (TanStack Form)
│   └── ui/
│       └── Input.tsx            # Input reutilizable
├── stores/
│   └── authStore.ts             # Zustand store + Capacitor Preferences
├── hooks/
│   └── useAuthActions.ts        # Lógica de login (Supabase)
├── constants/
│   └── auth.constants.ts        # Config de campos del form + validadores
├── lib/
│   └── supabase.ts              # Cliente Supabase singleton
├── integrations/
│   └── tanstack-query/          # QueryClient provider + devtools
└── styles.css                   # Tailwind v4 + design tokens
```

## Arquitectura de Autenticación

### Flujo de Login
1. Usuario ingresa `email` + `password`
2. `supabase.auth.signInWithPassword({ email, password })`
3. Query a `profiles` table: `SELECT id, full_name, role WHERE id = auth.uid()`
4. Guardar `{ id, full_name, role }` en Zustand store + Capacitor Preferences

### Persistencia de Sesión
- **Zustand**: Estado en memoria para la sesión actual
- **Capacitor Preferences**: Storage persistente (localStorage en web, native en Android)
- **Restauración**: `__root.tsx:beforeLoad` llama `getStoreSession()` en cada navegación

### Roles
```ts
type UserRole = "superadmin" | "lender";
```
- **superadmin**: Panel para crear/gestionar lenders
- **lender**: Dashboard con funciones básicas de cobranza

### Tabla `profiles` en Supabase
Columnas requeridas: `id`, `username`, `email`, `full_name`, `role`

## Guards de Rutas (Actuales)

| Ruta | Guard | Comportamiento |
|---|---|---|
| `__root.tsx` | `beforeLoad` | Restaura sesión desde Supabase session + Preferences |
| `/auth` | Pública | Login page |
| `/admin/*` | Requiere auth | Redirect a `/auth` si no hay sesión |
| `/lender/*` | Requiere auth | Redirect a `/auth` si no hay sesión |

## Convenciones de Código

- **Formatter/Linter**: Biome (ver `biome.json`)
- **Idioma**: Comentarios y mensajes en español
- **Naming**: camelCase para variables/functions, PascalCase para componentes/interfaces
- **Exports**: Named exports para todo excepto default exports de páginas
- **Imports**: Usar alias `#/` consistentemente
- **Formularios**: TanStack Form con validadores de campo
- **Estado global**: Zustand (no Context API)
- **CSS**: Tailwind utility-first, tokens en `styles.css`

## Diseño

Ver `DESIGN.md` para el design system completo. Tema "Mint & Slate Financial":
- Primary: `#47D7A4` (mint green)
- Background: `#F8F9FA` (bone/off-white)
- Font: Satoshi Variable con tabular-nums
- Mobile-first: 48px min touch targets

## TanStack Intent Skills

Antes de editar archivos TanStack, ejecutar el comando de guidance correspondiente:

<!-- intent-skills:start -->
Ver skills en el archivo original o ejecutar:
```bash
pnpm dlx @tanstack/intent@latest load @tanstack/<package>#<skill>
```
<!-- intent-skills:end -->

## Notas Importantes

- **No hay middleware server** — no existe `start.ts` ni `createMiddleware`
- **No hay API routes** — no hay handlers server definidos
- **RBAC implementado** — redirección por rol en `__root.tsx` beforeLoad
- **RLS en Supabase** — políticas para profiles, clients, loans, payments
