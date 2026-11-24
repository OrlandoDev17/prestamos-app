# SPEC — TuPrestamo promo vertical

GOAL:    el prestamista siente que hoy su cartera se le escapa y al final escribe al vendedor para probar TuPrestamo.
OUTPUT:  HyperFrames, 1080 × 1920, 30 fps
TIME:    29.6 s × 30 = 888 frames; música ~120 BPM ⇒ 15 frames por beat (cuando se resuelva la pista)

LOOK:    ground hueso #F8F9FA plano (el del app; sin textura, 0% grain), superficie #FFFFFF,
         tinta slate #1E293B, secundario #64748B, bordes #E2E8F0;
         UN acento mint #47D7A4 — solo en: la palabra acentuada de cada escena, el KPI "Cobrado Hoy",
         el saldo pendiente del sheet, el check, el punto del wordmark y la cápsula CTA;
         rojo #EF4444 y ámbar #F59E0B SOLO como estados funcionales del caos (badges, tachones);
         display = Satoshi Variable wght 900, titular ~130–150 px (7–8% del alto), tracking -0.02em;
         body/UI = Satoshi Variable 500–700; números siempre tabular-nums;
         el medio es "UI de producto real ampliada": tarjetas blancas radius 16 px, sombra
         `0 1px 3px rgba(0,0,0,.05)`, botones radius 12 px altura 56 px-equivalente,
         badges pill 999 px; nada de 3D, nada de tilt de UI;
         luz: sombra de contacto bajo el teléfono `0 30px 60px rgba(30,41,59,.18)`, sin glow;
         profundidad: solo capas de papel (cards encima de ground), sin viñeta, sin grano.

OBJECTS: el teléfono (marco negro #0F172A radius 56 px, notch pill, bezel 14 px) con la UI REAL de
         la app reconstruida del código: header "Dashboard / Resumen de cobranzas", grid 2×2 de
         KPIs con icono-circle + label + cifra 2xl bold, sección "Ruta de cobro" con tarjetas
         avatar-inicial + nombre + "Cuota #N" + monto; bottom sheet real "Registrar Pago" con
         panel de 3 líneas, input y botones Cancelar/Confirmar; recibos de papel del caos con
         línea perforada; avatares circulares con iniciales.

MOTION:  entradas power4.out / expo.out (0.35–0.5 s), salidas power3.in 40–50% más cortas;
         cámara: power2.inOut (color flood 0.4 s, punch-ins 0.5–0.6 s);
         springs: damping 0.8 (premium) para el teléfono y el sheet; 0.55 para pops de badge;
         slams de tipografía: blur 6→0, 0.13 s por palabra, 0.07 s de stagger, sin translate;
         títulos aterrizados quedan muertos quietos; stagger de listas 40–80 ms;
         cortes al beat de la música en 3.2 / 8.6 / 10.4 / 21.6 s;
         transiciones del film: slam de tipografía (hook), whip vertical (caos), color flood mint
         (reveal), zoom-through del touch (demo → sheet), dip cut al cierre. Nada de crossfade
         entre mundos.

SHOTS:   (ver STORYBOARD.md — 5 escenas, ids hook/caos/reveal/demo-a/demo-b/demo-c/cierre, con beats por frame)

BANNED:  void negro o navy con elementos flotando; glow, bloom, neón, partículas decorativas;
         gradientes violeta/azul, mesh gradients, glass cards; papel crema con serif;
         todo centrado y todo fade-in a la vez; todo elemento fade + slide-up igual;
         texto que se mueve mientras se lee; títulos que siguen derivando tras aterrizar;
         esquinas con labels, bordes de marco, brackets, HUD decorativo;
         tres tarjetas idénticas en fila / grids de KPI como recurso del CAOS (el grid 2×2 solo
         existe porque es el layout REAL del dashboard); título sobre screenshot atenuado;
         logo en esquina; UI inclinada en 3D; bounce en opacidad o color.

QA:      frames a revisar: 0 (hook vivo ya en frame 0), 4.5 (recibo caído), 6.9 (badges atraso),
         9.0 (flood mint + slam), 12.0 (dashboard completo legible), 14.5 (sheet armado),
         17.5 (check + KPI actualizado), 20.5 (payoff legible fuera del teléfono),
         25.0 (cápsula CTA), 27.5 (cierre quieto). Contraste: toda palabra ≥ 28 px en 1080×1920.
