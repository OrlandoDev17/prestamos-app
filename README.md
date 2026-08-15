# Prestamos App

Aplicación de gestión de préstamos y cobranzas.

## Stack

- React 19 + TanStack Start (SSR)
- Supabase (Auth + Database)
- Zustand + Capacitor Preferences
- Tailwind CSS v4
- TypeScript + Biome

## Iniciar

```bash
pnpm install
pnpm dev
```

## Scripts

```bash
pnpm dev              # Desarrollo (port 3000)
pnpm build            # Build producción
pnpm check            # Lint + format
pnpm generate-routes  # Regenerar rutas
```

## Roles

- **superadmin**: Gestión de lenders
- **lender**: Dashboard de cobranza (clientes, préstamos, pagos)
