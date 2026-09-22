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
| Testing       | Vitest + React Testing Library  |

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
pnpm test             # Ejecutar tests
pnpm test:watch       # Tests en modo watch
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
│   │   └── lenders.tsx      # Gestion de prestamistas
│   ├── lender.tsx           # Layout lender + guard auth
│   └── lender/
│       ├── dashboard.tsx    # Dashboard principal
│       ├── clients.tsx      # Lista de clientes
│       ├── reports.tsx      # Reportes financieros
│       ├── team.tsx         # Gestion de cobradores
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
├── lib/                     # Utilidades (formato, supabase, pdf, permisos)
├── constants/               # Configuraciones
└── styles.css               # Tailwind v4 + design tokens
```

## Roles

| Rol            | Descripcion                                                         |
| -------------- | ------------------------------------------------------------------- |
| **superadmin** | Gestiona prestamistas (crear, editar, activar/desactivar, eliminar) |
| **lender**     | Panel completo: clientes, prestamos, pagos, reportes, equipo        |
| **collector**  | Solo registra/corrige/revuelve pagos. Sin crear/editar nada mas    |

### Permisos por rol

| Accion                    | superadmin | lender | collector |
| ------------------------- | :--------: | :----: | :-------: |
| Gestionar prestamistas    |     ✅     |   ✅   |    ❌     |
| Gestionar clientes        |     ✅     |   ✅   |    ❌     |
| Crear/eliminar prestamos  |     ✅     |   ✅   |    ❌     |
| Refinanciar prestamos     |     ✅     |   ✅   |    ❌     |
| Registrar/corregir pagos  |     ✅     |   ✅   |    ✅     |
| Gestionar equipo/cobradores |   ✅     |   ✅   |    ❌     |

## Base de datos (Supabase)

### Tablas principales

- **profiles** — `id`, `username`, `full_name`, `email`, `role`, `owner_id`, `is_active`
- **clients** — `id`, `user_id`, `full_name`, `cedula`, `phone`, `address`, `route`, `is_active`
- **loans** — `id`, `user_id`, `client_id`, `amount_borrowed`, `interest_rate`, `total_to_pay`, `payment_frequency`, `installment_amount`, `installment_count`, `status`, `loan_date`, `created_at`, `deleted_at`, `refinanced_from`
- **payments** — `id`, `loan_id`, `installment_number`, `amount`, `due_date`, `paid_amount`, `payment_date`, `notes`, `registered_by`
- **routes** — `id`, `user_id`, `name`, `created_at`

### Sistema de permisos (RBAC)

El control de acceso se implementa en dos capas:

1. **UI (client):** Helper `can(role, action)` en `src/lib/permissions.ts` que oculta/muestra elementos de interfaz segun el rol.
2. **Base de datos (RLS):** Políticas Row Level Security en Supabase que garantizan que cada rol solo acceda a los datos que le corresponden, incluso si la UI es evadida.

## Tests

Tests de integracion que prueban la logica de negocio de las mutaciones principales:

```bash
pnpm test
```

### Archivos de test

| Archivo | Que prueba |
|---------|------------|
| `src/lib/permissions.test.ts` | RBAC: permisos de cada rol |
| `src/stores/authStore.test.ts` | Store de autenticacion: setUser, logout, persistencia |
| `src/stores/collectorsStore.test.ts` | Store de cobradores: fetch, toggle active |
| `src/queries/loans.integration.test.tsx` | Crear prestamo, registrar pagos, distribuir sobrepago, refinanciar |
| `src/queries/clients.integration.test.tsx` | Crear cliente, actualizar, validacion de cedula duplicada |
| `src/hooks/useAuthActions.test.ts` | Login: credenciales, perfil, cuentas desactivadas, roles |

### Que cubren los tests de integracion

- **Crear prestamo:** calculo de total_to_pay, installment_amount, generacion de cuotas con fechas correctas, rollback si falla la insercion de pagos
- **Registrar pago:** marca cuota como pagada, distribuye sobrepago a cuotas siguientes, respeta restriccion de cobrador (`registered_by`)
- **Refinanciar:** calculo de saldo pendiente, creacion de nuevo prestamo con montos correctos, marca anterior como refinanciado
- **Crear cliente:** insercion con campos correctos, rechazo de cedula duplicada (pre-check + constraint 23505)
- **Actualizar cliente:** permite misma cedula del mismo cliente, rechaza cedula de otro cliente
- **Login:** exitoso, credenciales incorrectas, perfil no encontrado, cuenta desactivada, roles collector/lender

## Bug fix: registro de pagos

Se corrigio un bug en `useMarkPaymentPaid` donde la query de `allPayments` no incluia el campo `registered_by` en el `SELECT`. Esto causaba que la condicion de restriccion para cobradores evaluara `undefined === null` → `false`, resultando en un array de updates vacio y cero requests PATCH a Supabase. El pago parecia ejecutarse (el dialogo se cerraba) pero nunca se guardaba.

```diff
- .select("id, installment_number, amount, paid_amount")
+ .select("id, installment_number, amount, paid_amount, registered_by")
```

Ubicacion: `src/queries/loans.queries.ts:412`

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
