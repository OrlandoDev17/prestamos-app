# Manual de Usuario — TuPrestamo

Guia completa para prestamistas. Explica como usar la aplicacion paso a paso.

---

## 1. Primeros pasos

### 1.1. Obtener tu cuenta

Tu cuenta la crea el administrador. El te proporcionara:

- **Correo electronico** — tu identificador de usuario
- **Contrasena** — tu clave de acceso

Si aun no tienes cuenta, contacta al administrador.

### 1.2. Iniciar sesion

1. Abre la aplicacion en tu navegador o dispositivo movil
2. Ingresa tu correo electronico y contrasena
3. Toca **Entrar**

Si los datos son correctos, seras redirigido al **Dashboard**.

> Si olvidaste tu contrasena, contacta al administrador para que la restablezca.

### 1.3. Cerrar sesion

Toca el boton **Salir** en la esquina superior derecha de la pantalla.

---

## 2. Dashboard

El dashboard es tu pantalla principal. Muestra un resumen de tu actividad del dia.

### Tarjetas de resumen (KPIs)

| Tarjeta | Que muestra |
|---|---|
| **Pendiente Hoy** | Total de cobros que debes hacer hoy |
| **Cobrado Hoy** | Total que ya cobraste hoy |
| **Prestamos activos** | Cantidad de prestamos vigentes |
| **Clientes totales** | Cantidad total de tus clientes |

### Ruta de cobro

Seccion que muestra todos los pagos pendientes de hoy, agrupados por cliente. Toca el titulo de la seccion para ir a la vista completa de la ruta de cobro.

### Proximos 3 dias

Muestra los pagos que vencen en los proximos 3 dias, agrupados por cliente. Asi puedes anticipar tu cobranza.

### Cobrado hoy

Lista de los pagos que ya marcaste como cobrados hoy.

---

## 3. Clientes

Desde la pestaña **Clientes** en la navegacion inferior puedes gestionar tu cartera de clientes.

### 3.1. Ver clientes

- La lista muestra todos tus clientes con nombre, cedula, telefono y monto prestado
- Si tienes muchos clientes, toca **Cargar mas** para ver los siguientes

### 3.2. Crear un cliente

1. Toca el boton flotante (circulo verde con **+**) en la esquina inferior derecha
2. Completa los campos:
   - **Nombre completo** — Ej: Maria Garcia
   - **Cedula de identidad** — Ej: 12345678 (debe ser unica)
   - **Telefono** — Ej: 0412-1234567
   - **Direccion** — Ej: Av. Principal, Edif. 5, Piso 2
3. Toca **Crear Cliente**

> Si la cedula ya esta registrada, recibiras un aviso. Cada cliente debe tener una cedula diferente.

---

## 4. Prestamos

Desde la pestaña **Prestamos** puedes crear, ver y gestionar todos tus prestamos.

### 4.1. Ver prestamos

La pantalla muestra dos pestanas:

- **Activos** — prestamos vigentes con pagos pendientes
- **Pagados** — prestamos que ya fueron saldados completamente

Cada tarjeta de prestamo muestra: cliente, monto prestado, cuota, frecuencia, estado y fecha de inicio.

### 4.2. Crear un prestamo

Toca el boton flotante (**+**) y seguira un asistente de 5 pasos:

#### Paso 1 — Seleccionar cliente

- Busca el cliente por nombre en el campo de busqueda
- Toca sobre el cliente para seleccionarlo
- El cliente seleccionado se marca con una palomita

#### Paso 2 — Monto e interes

- **Monto a prestar** — cantidad de dinero que entregas al cliente
- **Tasa de interes (%)** — porcentaje de ganancia Ej: 10 significa 10%

> El total a pagar se calcula automaticamente: monto + (monto x interes / 100)

#### Paso 3 — Cuotas

- Selecciona la cantidad de cuotas con los botones rapidos (4, 8, 12, 24)
- O escribe una cantidad personalizada

#### Paso 4 — Frecuencia y fecha

- **Frecuencia** — que tan seguido cobras:
  - Diaria (cada 1 dia)
  - Semanal (cada 7 dias)
  - Quincenal (cada 15 dias)
  - Mensual (cada 30 dias)
- **Fecha de inicio** — dia en que se efectua el prestamo
  - Toca el campo de fecha para abrir el calendario
  - Selecciona la fecha y el calendario se cierra automaticamente
  - Por defecto es la fecha de hoy

> El primer pago se calcula como: fecha de inicio + frecuencia. Ej: si el prestamo es el 20 de agosto y es semanal, el primer pago es el 27 de agosto.

#### Paso 5 — Resumen

Revisa todos los datos antes de crear el prestamo:

- Cliente
- Monto prestado
- Tasa de interes
- Cuotas
- Frecuencia
- Fecha de inicio
- Valor por cuota
- Total a pagar

Si todo esta correcto, toca **Crear Prestamo**.

### 4.3. Ver detalle de un prestamo

Toca sobre cualquier tarjeta de prestamo para ver:

- Informacion general (monto, total, cuota, interes, fecha de inicio)
- Cronograma de pagos completo con el estado de cada cuota

### 4.4. Marcar un pago como pagado

Desde el detalle del prestamo:

1. En el cronograma de pagos, busca la cuota que deseas marcar
2. Toca **Marcar como pagada**
3. Confirma en el popup

> Tambien puedes cobrar multiples pagos desde la ruta de cobro del dashboard.

### 4.5. Prestamos de un cliente especifico

Desde la lista de clientes, toca sobre un cliente para ver solo sus prestamos. Desde ahi tambien puedes crear un nuevo prestamo pre-seleccionando ese cliente.

---

## 5. Ruta de cobro

Accede desde el dashboard tocando la seccion **Ruta de cobro**, o desde la pestaña Prestamos > boton de calendario.

Esta pantalla muestra todos los pagos del dia agrupados por cliente.

### Cobrar un pago

1. Toca el boton **Cobrar** junto al pago
2. El pago se marca inmediatamente como cobrado
3. El boton cambia a un badge verde **Pagado**

> La interfaz se actualiza al instante para que puedas seguir cobrando sin demora.

---

## 6. Reportes

Desde la pestaña **Reportes** puedes ver el rendimiento financiero de tu actividad.

### 6.1. Seleccionar periodo

Tres opciones de visualizacion:

- **Diario** — ultimos 7 dias
- **Semanal** — ultimas 6 semanas
- **Mensual** — ultimos 6 meses

### 6.2. Estadisticas

Muestra tres metricas clave:

- **Total prestado** — dinero total que prestaste en el periodo
- **Total cobrado** — dinero que ya cobraste en el periodo
- **Pendiente** — lo que aun te deben

### 6.3. Grafico de tendencia

Grafico de barras que compara prestado vs cobrado por periodo. Las barras verdes son lo cobrado, las barras de color primario son lo prestado.

### 6.4. Tabla de datos

Tabla detallada con el desglose por periodo: cuanto prestaste y cuanto cobraste en cada uno.

### 6.5. Exportar

Puedes exportar los reportes en dos formatos:

- **PDF** — documento formateado con estadisticas y tabla
- **Excel (CSV)** — archivo de texto separado por comas, compatible con hojas de calculo

Los archivos se descargan automaticamente con el nombre `reporte-{periodo}-{fecha}.{extension}`.

---

## 7. Navegacion rapida

| Accion | Como llegar |
|---|---|
| Ver dashboard | Pestaña **Dashboard** |
| Ver clientes | Pestaña **Clientes** |
| Crear cliente | Pestaña **Clientes** > boton **+** |
| Ver prestamos | Pestaña **Prestamos** |
| Crear prestamo | Pestaña **Prestamos** > boton **+** |
| Ver detalle de prestamo | Tocar una tarjeta de prestamo |
| Marcar pago | Detalle del prestamo > **Marcar como pagada** |
| Ruta de cobro | Dashboard > seccion **Ruta de cobro** |
| Ver reportes | Pestaña **Reportes** |
| Exportar reporte | Reportes > **Exportar PDF** o **Exportar Excel** |
| Cerrar sesion | Boton **Salir** (arriba a la derecha) |

---

## 8. Preguntas frecuentes

**Que pasa si me quedo sin internet?**
La aplicacion guarda tu sesion localmente. Cuando vuelvas a conectarte, los datos se sincronizan con el servidor.

**Puedo modificar un prestamo ya creado?**
No, los prestamos no se pueden editar una vez creados. Si necesitas hacer cambios, contacta al administrador.

**Que significan los colores en el cronograma de pagos?**
- **Verde** — pago realizado
- **Rojo** — pago vencido (no pagado a tiempo)
- **Primario (turquesa)** — pago pendiente (aun no vence)

**Puedo crear un prestamo con fecha de inicio en el pasado?**
Si, puedes seleccionar cualquier fecha en el calendario.

**Como se calcula el primer pago?**
Fecha de inicio + frecuencia. Ejemplo: inicio 20 de agosto, semanal = primer pago 27 de agosto.
