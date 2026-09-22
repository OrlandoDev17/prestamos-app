# Project Constitution & SDD Rules — prestamos-app

## 1. Principios de Código y Calidad

- **Tipado:** TypeScript estricto (config `strict: true` ya activa, además de `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`). Prohibido `any`, `as any` y `@ts-ignore`; usar `unknown` + narrowing, genéricos y tipos explícitos en los boundaries. Todo dato externo (respuestas de Supabase, inputs de usuario, storage) se valida con Zod antes de usarse. Sin tipos implícitos; preferir `type` para uniones/aliases y `interface` solo cuando se necesite extensión.
- **Manejo de Errores:** Patrón de retornos explícitos tipo `Result<T, E>` o `{ data, error }` (estilo Supabase). Las funciones de dominio y hooks devuelven el error en lugar de lanzarlo; `try/catch` se reserva a boundaries (llamadas de red, parsing, `route.beforeLoad`) donde se traduce el error a un valor de retorno o estado de UI. Prohibido el `catch` silencioso: siempre propagar, loggear o exponer un mensaje al usuario. Las mutaciones de TanStack Query exponen `onError` y estados de error visibles.
- **Persistencia y Caché:** Manejar siempre estados de carga, error y sincronización/caché cuando aplique. La sesión se persiste con Zustand + Capacitor Preferences y se restaura desde `__root.tsx:beforeLoad` en cada navegación.
- **Formato y Calidad:** Se deben cumplir estrictamente las reglas de linter y formateo antes de considerar una tarea terminada. Biome es el único linter/formatter (tabs, double quotes, organize imports). `pnpm check` debe pasar sin errores; prohibido introducir ESLint/Prettier.
- **Idioma del código:** Todo el código (archivos, carpetas, componentes, hooks, funciones, variables, constantes, tipos) se escribe en inglés. Los comentarios, textos de UI y mensajes al usuario van en español. Convenciones de naming:
  - Componente (archivo): `first-component.tsx` → Componente (código): `FirstComponent`
  - Hook: `useFirstThing` en `use-first-thing.ts`
  - Variable/función: `firstVariable` / `firstFunction` (camelCase)
  - Constante: `FIRST_CONSTANT` (SCREAMING_SNAKE_CASE)
  - Tipo/Interface: `FirstType` (PascalCase)
  - Tabla/columna Supabase: `snake_case`

## 2. Reglas del Protocolo SDD

1. Ninguna tarea se implementa sin un archivo `spec/NNN-[feature]/spec.md` aprobado.
2. Cada spec debe desglosarse en `plan.md` y `tasks.md`.
3. Está prohibido modificar archivos o componentes fuera del alcance indicado en la tarea activa de `tasks.md`.

## 3. Límites e Invariantes

- **Imports y exports:** Usar siempre el alias `#/` (`#/components/...`). Named exports para todo, excepto los default exports de páginas/rutas.
- **Estado y datos:** Estado global solo con Zustand (nunca Context API). Data fetching, caché y sincronización solo con TanStack Query. Formularios con TanStack Form.
- **Estilos:** Solo Tailwind v4 utility-first y los design tokens de `styles.css` (tema "Mint & Slate Financial"). Mobile-first, touch targets mínimo 48px. Prohibido CSS-in-JS y estilos arbitrarios fuera de los tokens.
- **Supabase / RLS:** Toda tabla nueva requiere políticas RLS explícitas. Nunca exponer la `service_role` key ni secretos en el cliente; solo la anon key vía variables de entorno.
- **Código generado:** No editar `src/routeTree.gen.ts` manualmente; se regenera con `pnpm generate-routes`. Las rutas son file-based y viven en `src/routes/`.
- **Backend:** Sin middleware server ni API routes en TanStack Start; la lógica server-side se delega a Supabase (RPC/RLS).
- **RBAC:** El control de acceso por rol (`superadmin` / `lender`) se resuelve en los guards `beforeLoad` de `__root.tsx` y layouts de ruta.
- **Tooling:** Gestor de paquetes exclusivo `pnpm`. Comentarios y mensajes en español; código y nombres en inglés.
