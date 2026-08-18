# TuPrestamo

Aplicacion web movil para la gestion de prestamos y cobranzas. Disenada para prestamistas independientes que necesitan controlar sus creditos, clientes y pagos de forma sencilla.

## Stack

| Capa          | Tecnologia                      |
| ------------- | ------------------------------- |
| Framework     | React 19 + TanStack Start (SSR) |
| Router        | TanStack Router (file-based)    |
| Build         | Vite 8                          |
| Lenguaje      | TypeScript 6                    |
| CSS           | Tailwind CSS v4                 |
| Estado        | Zustand                         |
| Backend       | Supabase (Auth + PostgreSQL)    |
| Movil         | Capacitor 8 (Android)           |
| Forms         | TanStack Form                   |
| Data fetching | TanStack Query                  |
| Icons         | Lucide React                    |
| Calendar      | React Day Picker + date-fns     |
| PDF           | jsPDF + jspdf-autotable         |
| Linter        | Biome                           |

## Requisitos

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) (gestor de paquetes)
- Cuenta en [Supabase](https://supabase.com/) con un proyecto activo

## Instalacion

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd prestamos-app

# Instalar dependencias
pnpm install

# Configurar variables de entorno
# Crear un archivo .env con las credenciales de Supabase:
# VITE_SUPABASE_URL=tu-url-de-supabase
# VITE_SUPABASE_ANON_KEY=tu-anon-key

# Iniciar servidor de desarrollo
pnpm dev
```

La app estara disponible en `http://localhost:3000`.

## Scripts

```bash
pnpm dev              # Servidor de desarrollo (port 3000)
pnpm build            # Build de produccion
pnpm preview          # Preview del build
pnpm check            # Lint + format con Biome
pnpm lint             # Solo lint
pnpm format           # Solo format
pnpm generate-routes  # Regenerar routeTree.gen.ts
```

## Estructura del proyecto

```
src/
├── routes/                  # Rutas file-based (TanStack Router)
│   ├── __root.tsx           # Root layout + auth guard
│   ├── index.tsx            # Redirige a /admin o /lender
│   ├── auth.tsx             # Pagina de login
│   ├── admin.tsx            # Layout admin + guard rol
│   ├── admin/
│   │   └── index.tsx        # Gestion de prestamistas
│   ├── lender.tsx           # Layout lender + guard auth
│   └── lender/
│       ├── index.tsx        # Dashboard
│       ├── clients.tsx      # Lista de clientes
│       ├── reports.tsx      # Reportes financieros
│       └── loans/
│           ├── index.tsx            # Lista de prestamos
│           ├── pending-today.tsx     # Ruta de cobro del dia
│           ├── $clientId.tsx         # Layout prestamos por cliente
│           ├── $clientId/
│           │   └── index.tsx        # Prestamos de un cliente
│           └── $clientId.$loanId.tsx # Detalle de prestamo
├── components/
│   ├── layout/              # Layout, header, navegacion
│   ├── lender/              # Componentes de prestamista
│   ├── admin/               # Componentes de admin
│   ├── auth/                # Formulario de login
│   └── ui/                  # Componentes reutilizables
├── queries/                 # React Query hooks y funciones
├── hooks/                   # Custom hooks
├── stores/                  # Zustand stores
├── lib/                     # Utilidades (formato, supabase, pdf)
├── constants/               # Configuraciones
└── styles.css               # Tailwind v4 + design tokens
```

## Roles

| Rol            | Descripcion                                                         |
| -------------- | ------------------------------------------------------------------- |
| **superadmin** | Gestiona prestamistas (crear, editar, activar/desactivar, eliminar) |
| **lender**     | Panel completo: clientes, prestamos, pagos, reportes                |

## Base de datos (Supabase)

### Tablas principales

- **profiles** — `id`, `username`, `full_name`, `email`, `role`, `is_active`
- **clients** — `id`, `user_id`, `full_name`, `cedula`, `phone`, `address`, `is_active`
- **loans** — `id`, `user_id`, `client_id`, `amount_borrowed`, `interest_rate`, `total_to_pay`, `payment_frequency`, `installment_amount`, `installment_count`, `status`, `loan_date`, `created_at`, `deleted_at`
- **payments** — `id`, `loan_id`, `installment_number`, `amount`, `due_date`, `paid_amount`, `payment_date`, `notes`

## Despliegue

### Web (SPA)

```bash
pnpm build
# Los archivos estaticos quedan en .output/public/
```

### Android (Capacitor)

```bash
pnpm build
npx cap sync android
npx cap open android
```

## Licencia

Privado.
