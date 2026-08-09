# Sistema de Diseño: Mint & Slate Financial

Documento de especificaciones visuales, componentes y tokens de diseño para la aplicación móvil de préstamos.

---

## 1. Identidad y Concepto

- **Enfoque:** Simplicidad, utilidad inmediata y carga mental reducida para cobros en calle.
- **Estilo:** Corporativo moderno con influencias minimalistas.
- **Jerarquía:** Fondos en tono hueso/desactivados para evitar fatiga visual nocturna, tarjetas en blanco puro para destacar la información clave.

---

## 2. Paleta de Colores (Tokens)

### Colores de Marca y Superficies

| Token           | Valor Hex | Uso Principal                                       |
| :-------------- | :-------- | :-------------------------------------------------- |
| `primary`       | `#47D7A4` | Acción principal, acentos de marca y estado activo. |
| `primary-hover` | `#38B387` | Estado presionado / hover en botones.               |
| `primary-dark`  | `#2CB382` | Bordes activos y énfasis secundario.                |
| `background`    | `#F8F9FA` | Fondo general de la aplicación (Tono hueso).        |
| `surface`       | `#FFFFFF` | Tarjetas, contenedores, modales y campos de texto.  |
| `text-main`     | `#1E293B` | Texto principal, encabezados y cifras financieras.  |
| `text-muted`    | `#64748B` | Etiquetas, textos secundarios y fechas.             |
| `border`        | `#E2E8F0` | Líneas divisorias y bordes de insumos.              |

### Colores Funcionales y de Estado

| Estado                           | Color Texto / Borde | Color Fondo (10% Opacidad) |
| :------------------------------- | :------------------ | :------------------------- |
| **Éxito (Cobrado / Al día)**     | `#10B981`           | `#E6F4EA`                  |
| **Advertencia (Pendiente hoy)**  | `#F59E0B`           | `#FEF3C7`                  |
| **Peligro (En Mora / Atrasado)** | `#EF4444`           | `#FEE2E2`                  |
| **Información**                  | `#3B82F6`           | `#DBEAFE`                  |

---

## 3. Tipografía: Satoshi Variable (100–900)

Usamos **Satoshi Variable** por su legibilidad excepcional en números (_tabular-nums_) y legibilidad en pantallas móviles pequeñas.

```css
@font-face {
  font-family: "Satoshi";
  src: url("/fonts/Satoshi-Variable.woff2") format("woff2-variations");
  font-weight: 100 900;
  font-display: swap;
}
```

### Escala Tipográfica

| Token            | Tamaño / Interlínea | Grosor (font-weight)     | Uso                                                        |
| :--------------- | :------------------ | :------------------------ | :--------------------------------------------------------- |
| `headline-2xl`   | 24px / 32px         | Bold (700)                | Saldos principales, KPIs del Dashboard.                    |
| `headline-xl`    | 20px / 28px         | Bold (700)                | Títulos de pantallas y secciones.                          |
| `headline-lg`    | 18px / 26px         | Medium (500) / Bold (700) | Nombres de clientes en listas, botones.                    |
| `body-base`      | 16px / 24px         | Regular (400)             | Inputs, descripciones y textos del sistema.                |
| `body-sm`        | 14px / 20px         | Regular (400)             | Fechas, notas y detalles secundarios.                      |
| `label-sm`       | 14px / 20px         | Medium (500)              | Etiquetas de formularios y botones secundarios.            |
| `label-xs`       | 12px / 16px         | Medium (500)              | Insignias de estado (Badges).                              |

---

## 4. Bordes, Espaciado y Sombras

### Bordes Redondeados

- Contenedores y Tarjetas (`rounded-2xl`): **16px (1rem)**.
- Botones e Inputs (`rounded-xl`): **12px (0.75rem)**.
- Insignias y Píldoras (`rounded-full`): **9999px**.

### Espaciado y Cuadrícula (Base 8px)

- Margen lateral móvil: **16px (1rem)**.
- Separación interna en Tarjetas: **16px (1rem)**.
- Separación entre Tarjetas: **12px o 16px**.
- Altura mínima de toque (área táctil): **48px** (ideal **56px** en botones e inputs principales).

### Elevación

- **Sombra Suave (`shadow-sm`)**: `0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)`.
- **Modales / Bottom Sheets (`shadow-md`)**: `0 4px 6px -1px rgba(0, 0, 0, 0.1)`.

---

## 5. Especificación de Componentes Clave

### Botón Principal

- Fondo: `#47D7A4` | Texto: `#1E293B` (Satoshi Bold 700).
- Altura: **56px** | Borde: `rounded-xl` (12px).
- Feedback al presionar: Cambia a `#38B387`.

### Tarjeta de Cliente / Préstamo

- Fondo: `#FFFFFF` | Sombra: `shadow-sm` | Borde: `rounded-2xl` (16px).
- Estructura: Nombre en `headline-lg`, saldo restante destacado en `headline-xl` con color `#1E293B`, e insignia de estado en la esquina superior derecha.

### Campos de Entrada (Inputs)

- Fondo: `#FFFFFF` | Borde: 1px `#E2E8F0`.
- Enfocado (Focus): Borde 2px `#47D7A4` sin sombra pesada.
- Altura: **56px** para facilitar escritura rápida en la calle.

### Modal de Cobro Rápido (Bottom Sheet)

- Se despliega desde la parte inferior cubriendo entre el **50% y el 80%** de la pantalla.
- Fondo de pantalla oscuro con desenfoque suave (`backdrop-blur-sm`).
- Incluye botones de acceso rápido para montos comunes ($5, $10, $20, $50).
