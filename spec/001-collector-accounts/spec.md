# Spec 001 — Cuentas de cobrador (rol `collector`)

## Contexto y objetivo

El MVP actual soporta dos roles: `superadmin` y `lender`. Cada prestamista gestiona de forma aislada sus clientes, préstamos y pagos (los `loans` se filtran por `user_id = session.user.id` y el aislamiento de `clients`/`payments` depende de RLS).

El cliente necesita delegar la cobranza en calle: con su propia cuenta (`lender`) quiere crear una o varias cuentas subordinadas para que otra persona cobre. Esa cuenta debe tener un **rol menor (`collector`)** que pueda **visualizar todo** lo del prestamista dueño, pero que **no pueda crear, editar ni eliminar clientes, préstamos ni refinanciarlos**. Su única acción de escritura permitida es **registrar pagos de préstamos y editarlos** (corregir monto y revertir), igual que lo hace hoy el dueño.

Objetivo: incorporar un tercer rol `collector` con aislamiento por dueño (`owner_id`), permisos de solo-lectura sobre la operación del dueño y escritura limitada al módulo de pagos, respaldado por RLS en base de datos (no solo por ocultamiento en UI).

## Usuarios / actores

- **Prestamista dueño (`lender`)**: crea, lista, activa/desactiva y elimina sus cuentas de cobrador. Conserva todos los permisos actuales.
- **Cobrador (`collector`)**: cuenta subordinada creada por un prestamista. Ve todos los clientes, préstamos y pagos de su dueño; solo registra/corrige/revierte pagos.
- **Superadmin**: fuera de alcance de esta feature (no crea ni administra cobradores en esta iteración).

## Historias de usuario

- **HU-1** — Como prestamista, quiero crear una cuenta de cobrador con nombre, correo y contraseña, para que mi personal cobre en la calle sin poder modificar mis datos.
- **HU-2** — Como prestamista, quiero ver y gestionar (activar/desactivar/eliminar) mis cobradores desde la app.
- **HU-3** — Como prestamista, quiero que mis cobradores solo vean y cobren MIS clientes y préstamos, nunca los de otros prestamistas.
- **HU-4** — Como cobrador, quiero consultar clientes y préstamos y registrar/corregir/revertir pagos desde mi dispositivo, sin opciones para editar la estructura del negocio.
- **HU-5** — Como prestamista, quiero que si desactivo o elimino a un cobrador, este pierda el acceso de inmediato.

## Requisitos funcionales (EARS)

- **RF-1** — EL SISTEMA DEBE soportar el rol `collector` además de `superadmin` y `lender`, tanto en `profiles.role` como en el tipo `UserRole` del cliente.
- **RF-2** — EL SISTEMA DEBE asociar cada `collector` a un único prestamista dueño mediante una referencia de propiedad (`profiles.owner_id` → `profiles.id` del `lender`), nullable para roles no-collector.
- **RF-3** — CUANDO un prestamista autenticado abre la gestión de su equipo, EL SISTEMA DEBE listar únicamente los cobradores cuyo `owner_id` sea el propio prestamista.
- **RF-4** — CUANDO el prestamista envía nombre, correo y contraseña válidos, EL SISTEMA DEBE crear la cuenta en Auth y el perfil en `profiles` con `role = 'collector'`, `owner_id = <lender.id>` e `is_active = true`.
- **RF-5** — EL SISTEMA DEBE generar un `username` único a partir del nombre y rechazar correos o usernames ya existentes sin crear la cuenta.
- **RF-6** — CUANDO el prestamista desactiva a un cobrador, EL SISTEMA DEBE marcar `is_active = false` e impedir que ese cobrador obtenga sesión válida o acceda a datos.
- **RF-7** — CUANDO el prestamista elimina a un cobrador, EL SISTEMA DEBE eliminar la cuenta de Auth (vía Edge Function `delete-user`) y su perfil, sin afectar clientes, préstamos ni pagos del prestamista.
- **RF-8** — MIENTRAS un usuario tiene rol `collector` con sesión activa, EL SISTEMA DEBE permitirle leer todos los clientes, préstamos y pagos pertenecientes a su dueño (`owner_id`), y únicamente esos.
- **RF-9** — CUANDO un cobrador registra un pago sobre una cuota de un préstamo del dueño, EL SISTEMA DEBE aplicarlo con las mismas reglas de distribución y abono que el dueño.
- **RF-10** — CUANDO un cobrador corrige el monto de un pago o lo revierte, EL SISTEMA DEBE permitirlo sobre cuotas de préstamos del dueño, con las mismas reglas vigentes.
- **RF-11** — SI un cobrador intenta crear, editar o eliminar un cliente, ENTONCES EL SISTEMA DEBE rechazar la operación en la UI y en la base de datos (RLS).
- **RF-12** — SI un cobrador intenta crear, editar o eliminar un préstamo, o refinanciarlo, ENTONCES EL SISTEMA DEBE rechazar la operación en la UI y en la base de datos (RLS).
- **RF-13** — SI un cobrador intenta gestionar cobradores (crear/editar/eliminar) o modificar su propio rol/perfil, ENTONCES EL SISTEMA DEBE rechazar la operación en UI y en base de datos.
- **RF-14** — SI un cobrador intenta acceder por URL/API a una ruta o acción no permitida (ej. `/admin/*`, mutations de clientes/préstamos), ENTONCES EL SISTEMA DEBE bloquearlo con el guard de ruta y la capa RLS debe denegar la escritura aunque la UI sea evadida.
- **RF-15** — MIENTRAS el usuario tenga rol `collector`, EL SISTEMA DEBE ocultar en la UI las acciones no permitidas: crear/editar/eliminar cliente, crear/eliminar/refinanciar préstamo, gestionar equipo y gestión de prestamistas.
- **RF-16** — CUANDO el cobrador inicia sesión por primera vez, EL SISTEMA DEBE redirigirlo a un destino válido para su rol (dashboard del dueño en modo solo-lectura + pagos), sin exponer rutas administrativas.
- **RF-17** — CUANDO el dueño desactiva o elimina a un cobrador con sesión activa, EL SISTEMA DEBE invalidar su acceso en la siguiente verificación de sesión (`getStoreSession` / `beforeLoad`) y cerrar su sesión.

## Requisitos no funcionales

- **Seguridad / RLS:** El control de acceso se implementa en la base de datos con políticas RLS para `profiles`, `clients`, `loans` y `payments`. La UI nunca es la única barrera. Nunca exponer `service_role` en el cliente; usar la Edge Function existente para operaciones privilegiadas.
- **Aislamiento de datos:** Ninguna consulta del cobrador debe mezclar datos de otros prestamistas. El dueño efectivo se resuelve a partir de `profiles.owner_id` del cobrador.
- **Consistencia de esquema:** Agregar `owner_id` a `profiles`, ampliar el CHECK/constraint de `role` para incluir `collector` y asegurar que `owner_id` sea obligatorio cuando `role = 'collector'`.
- **Tipado y error handling:** Conforme al `constitution.md` — TypeScript estricto sin `any`, retornos `{ data, error }` o `Result`, sin `catch` silenciosos.
- **Formato/Calidad:** `pnpm check` (Biome) debe pasar sin errores. Sin regresiones en las consultas actuales del `lender`.
- **Experiencia móvil:** Respetar `DESIGN.md` (mobile-first, touch targets ≥ 48px, tokens, `bottom-sheet` para formularios de cobro y de creación de cobrador).
- **Idempotencia y red:** El registro de pagos debe ser seguro ante reintentos/red intermitente: bloquear doble envío y evitar doble registro.

## Casos límite y Clarificaciones

1. **Forzar acción vía URL/API directa** — Un `collector` escribe la URL de una ruta restringida o invoca directamente una mutation de clientes/préstamos. *Resolución:* guard de ruta por rol (`beforeLoad`) + políticas RLS que denieguen `INSERT/UPDATE/DELETE` de `clients` y `loans` cuando el rol es `collector`. La UI se oculta, pero la base de datos es la garantía.
2. **Edición concurrente dueño/cobrador** — El dueño y el cobrador corrigen/registran el mismo pago casi al mismo tiempo. *Resolución:* política de último-escritura-gana, expuesta de forma explícita; invalidar queries (`["payments"]`) al confirmar y advertir si el saldo cambió durante la operación. *Clarificación:* ¿se requiere bloqueo optimista por `updated_at`?
3. **Pérdida de red al registrar pago** — Se corta la conexión a mitad del registro o la respuesta no llega. *Resolución:* bloquear el botón mientras la mutation está `pending`, no reintentar automáticamente sin confirmar, y revalidar la cuota antes de reintentar para evitar duplicados.
4. **Desactivar/eliminar cobrador con sesión activa** — El cobrador está logueado o a mitad de un cobro cuando el dueño lo desactiva/elimina. *Resolución:* `getStoreSession`/`beforeLoad` consultan `is_active` del perfil; si está inactivo o no existe, limpiar store + Preferences y redirigir a `/auth`. *Clarificación:* ¿forzar cierre inmediato con `signOut` en tiempo real (realtime) o basta en la siguiente navegación?
5. **Doble registro de pago** — El cobrador toca "Confirmar" dos veces o reintenta tras un timeout percibido. *Resolución:* deshabilitar durante `isPending`, recalcular el saldo pendiente antes de aplicar y validar el estado de la cuota. *Clarificación:* ¿se admite `paid_amount` > `amount` como sobrepago (comportamiento actual reparte excedente) o se debe bloquear?
6. **Editar préstamo cerrado/refinanciado** — El cobrador intenta registrar/editar pagos sobre un préstamo `paid` o `refinanced`. *Resolución:* permitir la lectura pero bloquear las acciones de pago en UI para estados no `active`, y validar estado en mutation/RLS. *Clarificación:* ¿debe poder corregir/revertir pagos históricos de un préstamo ya pagado?

## Fuera de alcance

- Asignación de cobradores por ruta o por cliente (solo se define "todo lo del dueño").
- Permisos granulares configurables por cobrador.
- Panel de superadmin para ver/gestionar cobradores de cada prestamista.
- Notificaciones push o en tiempo real sobre cambios de estado de la cuenta.
- Registro de auditoría detallado de quién ejecutó cada acción (salvo la duda abierta sobre `registered_by`).
- Límite máximo de cobradores por prestamista (a definir).

## Criterios de finalización

- Rol `collector` operativo en `profiles.role` y en el tipo `UserRole`, con `owner_id` asociado.
- Migración SQL con nuevas políticas RLS aplicada y verificada: el cobrador solo lee datos de su dueño y solo escribe en `payments`.
- Alta de cobrador por parte del `lender` (Auth + perfil + rollback si falla el perfil), listado, activación/desactivación y baja.
- Login de `collector` funcional con redirección correcta y sesión persistida (Zustand + Preferences).
- Bloqueo efectivo (UI + RLS) de crear/editar/eliminar clientes, crear/eliminar/refinanciar préstamos, gestionar equipo y editar rol/perfil.
- Registro, corrección y reversión de pagos funcional para el cobrador sobre préstamos del dueño.
- Casos límite 1–6 cubiertos con pruebas manuales documentadas.
- `pnpm check` sin errores; sin regresiones para `lender`/`superadmin`.

## Dudas abiertas

1. ¿El cobrador debe ver el **Dashboard y Reportes** del dueño (read-only) o solo Clientes, Préstamos y Pagos?
2. ¿Se debe registrar en `payments` quién ejecutó el cambio (`registered_by` / `updated_by`) para auditoría y para el caso de concurrencia?
3. ¿La corrección de pago debe permitir cambiar la **fecha** del pago o solo el monto?
4. ¿Debe existir un límite de cobradores por prestamista?
5. ¿La desactivación/eliminación de un cobrador debe forzar `signOut` inmediato (tiempo real) o basta en la próxima verificación de sesión?
6. ¿El cobrador puede revertir un pago ya conciliado por el dueño, o solo pagos registrados por él mismo?

## Notas de implementación (alto nivel)

- **Modelo de datos:** `profiles` gana `owner_id uuid null references profiles(id) on delete cascade` y `role` acepta `'collector'`. Constraint: `role = 'collector'` ⇒ `owner_id IS NOT NULL`.
- **Scoping de consultas:** hoy `loans` filtra por `user_id = session.user.id`; para el cobrador debe resolverse el `owner_id` y filtrar por el dueño. Revisar `clients.queries.ts` y `payments` cuya visibilidad hoy recae en RLS.
- **Reutilización:** el flujo de alta es análogo a `usersStore.createLender` (signUp + setSession de restauración + upsert de perfil + rollback con `delete-user`). El borrado reutiliza la Edge Function `delete-user`.
- **Guards:** extender el mapeo por rol en `__root.tsx` y `bottom-nav.tsx`; agregar un helper de permisos (`can(role, action)`) para gating uniforme.
- **UI:** nueva pantalla/sección "Equipo"/"Cobradores" en el área `lender`, reutilizando `BottomSheet`, `PageHeader` y tarjetas existentes.
