# Manual de Usuario — TuPrestamo

Guia completa para prestamistas y cobradores. Explica como usar la aplicacion paso a paso.

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
| **Cobrado Hoy** | Total que ya cobraste hoy (resaltado en verde) |
| **Prestamos activos** | Cantidad de prestamos vigentes |
| **Clientes totales** | Cantidad total de tus clientes |

### Ruta de cobro

Seccion que muestra todos los pagos pendientes de hoy, agrupados por cliente con el monto total pendiente.

### Proximos 3 dias

Muestra los pagos que vencen en los proximos 3 dias, agrupados por cliente. Asi puedes anticipar tu cobranza.

### Cobrado hoy

Lista de los pagos que ya marcaste como cobrados hoy, agrupados por cliente con el monto cobrado por cuota.

---

## 3. Clientes

Desde la pestaña **Clientes** en la navegacion inferior puedes gestionar tu cartera de clientes.

### 3.1. Ver clientes

- La lista muestra todos tus clientes con nombre, cedula, telefono y monto prestado
- Si tienes muchos clientes, toca **Cargar mas** para ver los siguientes

### 3.2. Filtrar por ruta

En la parte superior de la lista veras chips con las rutas disponibles. Toca un chip para filtrar clientes por esa ruta. Toca **Todos** para ver la lista completa.

### 3.3. Buscar clientes

Usa el campo de busqueda para encontrar clientes por nombre. La busqueda es instantanea y acepta acentos.

### 3.4. Crear un cliente

1. Toca el boton flotante (circulo verde con **+**) en la esquina inferior derecha
2. Completa los campos:
   - **Nombre completo** — Ej: Maria Garcia
   - **Cedula de identidad** — Ej: 12345678 (debe ser unica)
   - **Telefono** — Ej: 0412-1234567
   - **Direccion** — Ej: Av. Principal, Edif. 5, Piso 2
   - **Ruta** (opcional) — Ej: Charallave. Puedes seleccionar una ruta existente o escribir una nueva
3. Toca **Crear Cliente**

> Si la cedula ya esta registrada, recibiras un aviso. Cada cliente debe tener una cedula diferente.

### 3.5. Editar un cliente

1. Toca el boton de puntos (...) en la tarjeta del cliente
2. Selecciona **Editar**
3. Modifica los campos que desees
4. Toca **Guardar**

### 3.6. Activar/Desactivar un cliente

1. Toca el boton de puntos (...) en la tarjeta del cliente
2. Selecciona **Activar** o **Desactivar**

> Los clientes desactivados no aparecen en la lista por defecto.

---

## 4. Prestamos

Desde la pestaña **Prestamos** puedes crear, ver y gestionar todos tus prestamos.

### 4.1. Ver prestamos

La pantalla muestra tres pestanas:

- **Activos** — prestamos vigentes con pagos pendientes
- **Pagados** — prestamos que ya fueron saldados completamente
- **Refinanciados** — prestamos que fueron refinanciados (sustituidos por uno nuevo)

Cada tarjeta de prestamo muestra: cliente, monto prestado, cuota, frecuencia, estado y fecha de inicio.

### 4.2. Crear un prestamo

Toca el boton flotante (**+**) y seguira un asistente de 5 pasos:

#### Paso 1 — Seleccionar cliente

- Busca el cliente por nombre o cedula en el campo de busqueda
- Toca sobre el cliente para seleccionarlo

#### Paso 2 — Monto e interes

- **Monto a prestar** — cantidad de dinero que entregas al cliente
- **Tasa de interes (%)** — porcentaje de ganancia Ej: 20 significa 20%

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
- Conteo de cuotas pagadas vs pendientes
- Boton **Refinanciar** (solo si el prestamo esta activo)
- Cronograma de pagos completo con el estado de cada cuota

### 4.4. Registrar un pago

Desde el detalle del prestamo:

1. En el cronograma de pagos, busca la cuota que deseas marcar
2. Toca **Registrar pago**
3. En el dialogo que se abre, revisa el monto a pagar (viene prellenado con el saldo pendiente)
4. Puedes modificar el monto si el cliente paga parcialmente
5. Toca **Confirmar**

> Si pagas mas del monto de la cuota, el excedente se distribuye automaticamente a las cuotas siguientes.

### 4.5. Corregir un monto de pago

Si registraste un monto incorrecto:

1. En el cronograma, busca la cuota ya pagada
2. Toca el boton de puntos (...) junto a la cuota
3. Selecciona **Corregir monto**
4. Ingresa el monto correcto
5. Toca **Guardar**

### 4.6. Revertir un pago

Si necesitas deshacer un pago:

1. En el cronograma, busca la cuota pagada
2. Toca el boton de puntos (...) junto a la cuota
3. Selecciona **Revertir pago**
4. Confirma la accion

> Si el pago tenia un excedente que se distribuyo a otras cuotas, esas distribuciones tambien se revierten.

### 4.7. Refinanciar un prestamo

Si un cliente necesita un nuevo prestamo cubriendo el saldo pendiente del anterior:

1. En el detalle del prestamo activo, toca **Refinanciar**
2. **Paso 1 — Monto y tasa:** ingresa el monto adicional y la tasa de interes del nuevo prestamo
3. **Paso 2 — Cuotas y frecuencia:** selecciona cuotas y frecuencia del nuevo prestamo
4. **Paso 3 — Fecha y confirmar:** revisa el resumen y confirma

> El saldo pendiente del prestamo anterior se suma al nuevo monto. El prestamo anterior cambia de estado a "Refinanciado".

### 4.8. Eliminar un prestamo

1. En la lista de prestamos, toca el boton de puntos (...) en la tarjeta
2. Selecciona **Eliminar**
3. Confirma la accion

> El prestamo se elimina de forma virtual (soft delete). No afecta el historial de pagos.

### 4.9. Prestamos de un cliente especifico

Desde la lista de clientes, toca sobre un cliente para ver solo sus prestamos. Desde ahi tambien puedes crear un nuevo prestamo pre-seleccionando ese cliente.

---

## 5. Ruta de cobro del dia

Accede desde el dashboard tocando la seccion **Ruta de cobro**, o desde la pestaña Prestamos.

Esta pantalla muestra todos los pagos del dia agrupados por cliente.

### Cobrar un pago

1. Junto a cada cuota veras un campo de entrada con el monto
2. Ingresa el monto que el cliente paga
3. Toca **Confirmar**

> La interfaz se actualiza al instante para que puedas seguir cobrando sin demora.

---

## 6. Equipo (Cobradores)

Como prestamista, puedes crear cuentas de cobrador para que otra persona cobre en tu nombre.

### 6.1. Ver cobradores

Desde la pestaña **Equipo** en la navegacion inferior veras la lista de tus cobradores con nombre, correo y estado (activo/inactivo).

> Los cobradores no tienen esta pestana en su navegacion.

### 6.2. Crear un cobrador

1. Toca el boton **Agregar cobrador** o el boton flotante (**+**)
2. Completa los campos:
   - **Nombre completo** — Ej: Juan Perez
   - **Correo electronico** — debe ser un correo nuevo
   - **Contrasena** — minimo 6 caracteres
3. Toca **Crear Cobrador**

> El cobrador podra iniciar sesion inmediatamente con esas credenciales.

### 6.3. Activar/Desactivar un cobrador

1. Usa el interruptor (toggle) en la tarjeta del cobrador para activarlo o desactivarlo

> Si desactivas a un cobrador con sesion activa, perdera acceso en su proxima navegacion.

### 6.4. Editar un cobrador

1. Toca el boton de puntos (...) en la tarjeta del cobrador
2. Selecciona **Editar**
3. Modifica el nombre o correo
4. Toca **Guardar**

### 6.5. Eliminar un cobrador

1. Toca el boton de puntos (...) en la tarjeta del cobrador
2. Selecciona **Eliminar**
3. Confirma la accion

> Esta accion elimina permanentemente la cuenta del cobrador.

---

## 7. Cuenta de cobrador

Si tu cuenta es de tipo **cobrador**, tu experiencia es diferente:

### 7.1. Que puedes hacer

- **Ver** todos los clientes, prestamos y pagos de tu prestamista dueño
- **Registrar pagos** en cuotas de prestamos activos
- **Corregir montos** de pagos que tu registraste
- **Revertir pagos** que tu registraste

### 7.2. Que NO puedes hacer

- Crear, editar o eliminar clientes
- Crear o eliminar prestamos
- Refinanciar prestamos
- Gestionar cobradores
- Ver la seccion de Reportes

### 7.3. Restricciones de pago

- Solo puedes registrar pagos en prestamos activos
- Si una cuota ya fue registrada por otro cobrador, no puedes modificarla
- El excedente de un pago se distribuye automaticamente a cuotas siguientes

### 7.4. Navegacion

La navegacion inferior del cobrador tiene 4 pestanas: Dashboard, Clientes, Prestamos y Reportes. No tiene la pestana Equipo.

---

## 8. Reportes

Desde la pestaña **Reportes** puedes ver el rendimiento financiero de tu actividad.

### 8.1. Seleccionar periodo

Tres opciones de visualizacion:

- **Diario** — ultimos 7 dias
- **Semanal** — ultimas 6 semanas
- **Mensual** — ultimos 6 meses

### 8.2. Estadisticas

Muestra tres metricas clave:

- **Total prestado** — dinero total que prestaste en el periodo
- **Total cobrado** — dinero que ya cobraste en el periodo
- **Pendiente** — lo que aun te deben

### 8.3. Grafico de tendencia

Grafico de barras que compara prestado vs cobrado por periodo. Las barras verdes son lo cobrado, las barras de color primario son lo prestado.

### 8.4. Tabla de datos

Tabla detallada con el desglose por periodo: cuanto prestaste y cuanto cobraste en cada uno.

### 8.5. Exportar

Puedes exportar los reportes en dos formatos:

- **PDF** — documento formateado con estadisticas y tabla
- **Excel (CSV)** — archivo de texto separado por comas, compatible con hojas de calculo

Los archivos se descargan automaticamente con el nombre `reporte-{periodo}-{fecha}.{extension}`.

---

## 9. Navegacion rapida

### Prestamista (lender)

| Accion | Como llegar |
|---|---|
| Ver dashboard | Pestaña **Dashboard** |
| Ver clientes | Pestaña **Clientes** |
| Crear cliente | Pestaña **Clientes** > boton **+** |
| Ver prestamos | Pestaña **Prestamos** |
| Crear prestamo | Pestaña **Prestamos** > boton **+** |
| Ver detalle de prestamo | Tocar una tarjeta de prestamo |
| Registrar pago | Detalle del prestamo > **Registrar pago** |
| Corregir monto | Detalle > puntos de cuota pagada > **Corregir monto** |
| Revertir pago | Detalle > puntos de cuota pagada > **Revertir pago** |
| Refinanciar | Detalle del prestamo > **Refinanciar** |
| Ruta de cobro | Dashboard > seccion **Ruta de cobro** |
| Gestionar cobradores | Pestaña **Equipo** |
| Ver reportes | Pestaña **Reportes** |
| Exportar reporte | Reportes > **Exportar PDF** o **Exportar Excel** |
| Cerrar sesion | Boton **Salir** (arriba a la derecha) |

### Cobrador (collector)

| Accion | Como llegar |
|---|---|
| Ver dashboard | Pestaña **Dashboard** |
| Ver clientes | Pestaña **Clientes** |
| Ver prestamos | Pestaña **Prestamos** |
| Registrar pago | Detalle del prestamo > **Registrar pago** |
| Cerrar sesion | Boton **Salir** (arriba a la derecha) |

---

## 10. Colores en el cronograma de pagos

- **Verde** — pago realizado
- **Rojo** — pago vencido (no pagado a tiempo)
- **Primario (turquesa)** — pago pendiente (aun no vence)

---

## 11. Preguntas frecuentes

**Que pasa si me quedo sin internet?**
La aplicacion guarda tu sesion localmente. Cuando vuelvas a conectarte, los datos se sincronizan con el servidor.

**Puedo modificar un prestamo ya creado?**
No, los prestamos no se pueden editar una vez creados. Si necesitas hacer cambios, puedes refinanciarlo o eliminarlo y crear uno nuevo.

**Que pasa si un cobraitor registra un pago de mas?**
El excedente se distribuye automaticamente a las cuotas siguientes. Si necesitas corregir, usa la opcion **Corregir monto**.

**Puedo crear un prestamo con fecha de inicio en el pasado?**
Si, puedes seleccionar cualquier fecha en el calendario.

**Como se calcula el primer pago?**
Fecha de inicio + frecuencia. Ejemplo: inicio 20 de agosto, semanal = primer pago 27 de agosto.

**Que pasa si desactivo a un cobrador?**
El cobrador perdera acceso en su proxima navegacion. Si estaba en medio de una operacion, se cerrara su sesion.

**Puede un cobrador pagar cuotas de otro prestamista?**
No. Un cobrador solo puede ver y cobrar los prestamos de su prestamista dueño.
