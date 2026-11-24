# REVIEW — TuPrestamo promo vertical (previo a handoff a Studio)

Fecha: 2026-11-15 · Versión CLI: 0.9.55 · Duración 29.6 s @ 30 fps · 1080×1920

## Qué se revisó

- `check --json` completo: **0 errores** en lint, runtime, layout, motion, contrast y craft.
- 3 rondas de snapshots: hook (0.1/1.9), caos (4.6/5.6/8.0), reveal (10.5/10.7), demo (12.6/13.2/16.2/19.2/19.3/19.5/20.4/20.8/21.0), cierre (24.7/27.5/29.35).

## Resultado visual

- Frame 0: línea gigante ya en pantalla sobre hueso, acento mint en "HOY?" ✓
- Caos: 4 beats con visuales distintos (recibos+sello, cuenta tachada, avatares+badges, costo) ✓
- Reveal: flood mint + slam del wordmark + teléfono con spring ✓
- Demo: dashboard real (KPIs, ruta de cobro), bottom sheet real con spring muestreado, check de éxito dibujado, KPIs que se actualizan ($45→$70, $85→$60, "Pagada") ✓
- Cierre: cascada del wordmark + punto mint + tagline + cápsula CTA mint + chip ✓

## Warnings pesados y decisiones

1. **`audio_source_unreadable` ×17 (error de entorno):** falta FFmpeg/ffprobe en el sistema. No afecta el preview en Studio (el navegador reproduce los MP3); SÍ bloqueará el render final hasta instalar FFmpeg (`winget install ffmpeg` o similar). Los SFX existen y están bien colocados.
2. **`text_below_floor` ×3 (demo-a/b/c):** falso positivo de medición en este entorno (el checker reporta ~0.54× del px CSS en TODO el proyecto — p. ej. valores de 44 px medidos como 15 px). Los snapshots a resolución completa muestran el UI del teléfono nítido y legible; los tamaños CSS cumplen el piso de 28 px. Documentado, no se cambia.
3. **`outside_safe_zone` hook line2 (slam):** overshoot transitorio del slam (escala 1.6→1, ~0.3 s). Es el gesto de impacto del gancho; pesado y aceptado.
4. Zona inferior IG Reels en el sheet: el bottom sheet real llega al borde inferior de la pantalla del teléfono (1311 px < banda TikTok 1330 px ✓; IG reserva más abajo). Marcado con `data-layout-allow-safe-zone` como intención; la alternativa (encoger el teléfono) rompería la fidelidad del UI.

## Pendientes para el render final

- [ ] Instalar FFmpeg (desbloquea el mix de audio en render).
- [ ] Resolver pista de música (requiere `npx hyperframes auth login` — catálogo HeyGen gratuito) y colocarla con cortes al beat.
- [ ] (Opcional) Ajustar copys de contacto en las variables de Studio.
