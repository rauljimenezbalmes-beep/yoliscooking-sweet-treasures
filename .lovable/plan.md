## Objetivo

Transformar `/pasteles/$id/personalizar` (hoy una sola página con todas las secciones apiladas) en un **wizard paso a paso** tipo e-commerce premium, empezando por el **Paso 1: Sabores** completamente pulido y dejando preparada la estructura para los siguientes pasos.

## Comportamiento del botón "Personalizar mi pastel"

Sin cambios en la ficha del producto: el botón ya navega a `/pasteles/$id/personalizar`. Solo se rehace lo que se ve dentro de esa página.

## Estructura nueva de la página

```
┌─────────────────────────────────────────────┐
│  ← Volver       [Red Velvet]    🛒          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 20%      │
│  ① Sabores  ② Relleno  ③ Decor.  ④ Texto …  │
├─────────────────────────────────────────────┤
│                                             │
│   Paso actual (tarjetas grandes, hover,     │
│   estado seleccionado, icono ✓)             │
│                                             │
├─────────────────────────────────────────────┤
│  [← Atrás]                    [Continuar →] │
└─────────────────────────────────────────────┘
```

- **Header sticky**: nombre del pastel + miniatura + barra de progreso con `%` y lista visual de pasos (el actual destacado, los completados con check, los futuros atenuados).
- **Un solo paso visible a la vez** con transición suave (fade + slide).
- **Footer sticky** con botones "Atrás" y "Continuar". "Continuar" deshabilitado hasta cumplir la validación del paso.
- **Responsive**: en móvil los pasos se compactan a "Paso 1 de 5 · Sabores" + barra; en escritorio se ven todos los nombres.

## Pasos definidos

| # | Paso | Estado en esta entrega |
|---|------|-----------------------|
| 1 | Sabores | Implementado completo |
| 2 | Relleno | Placeholder "Próximamente" navegable |
| 3 | Decoración | Placeholder |
| 4 | Texto personalizado | Placeholder |
| 5 | Resumen + añadir al carrito | Placeholder con CTA final |

Los placeholders permiten Atrás/Continuar para que la barra de progreso y la navegación se vean reales hoy y se rellenen sin refactor mañana.

## Paso 1: Sabores (especificación)

- Título "Elige uno o dos sabores" + subtítulo "Selecciona hasta 2 sabores para el interior".
- **Tarjetas seleccionables** (no chips) en grid responsive (2 col móvil, 3 col tablet, 4 col desktop):
  - Borde redondeado `rounded-2xl`, sombra suave, hover `translate-y` + sombra.
  - Estado seleccionado: borde `primary`, fondo `primary/5`, **icono ✓** en esquina superior derecha.
  - Si ya hay 2 seleccionados, las demás tarjetas se atenúan (opacidad 50%) y no aceptan click hasta deseleccionar.
- Contador "1/2 sabores seleccionados".
- Opciones: Crema pastelera, Yema quemada, Trufa, Chocolate blanco, Nocilla, Crema de pistacho, Crema de lotus, Nata, Crema de naranja (ya existen en `FLAVORS`, solo se renombra "Crema Lotus" → "Crema de lotus").
- Validación: ≥1 sabor para habilitar "Continuar".

## Persistencia del estado

- Crear `src/context/CustomizationContext.tsx` con `CustomizationProvider` + hook `useCustomization()`.
- El estado vive a nivel del componente de ruta (`PersonalizarPage`) y se expone vía contexto a los componentes de cada paso. Así cada paso lee/escribe sin prop drilling y al volver atrás conserva la selección.
- Se mantiene el tipo `CakeCustomization` actual de `src/data/customization.ts` (no se rompe el contrato con el carrito).
- No se persiste en localStorage en esta iteración (la sesión vive en memoria mientras dura el wizard).

## Componentes nuevos

```
src/components/customization/
  WizardLayout.tsx        ← header sticky + barra + footer Atrás/Continuar
  WizardProgress.tsx      ← barra + lista de pasos (responsive)
  WizardFooter.tsx        ← botones Atrás/Continuar
  steps/
    StepFlavors.tsx       ← Paso 1 completo
    StepFilling.tsx       ← placeholder
    StepDecoration.tsx    ← placeholder
    StepText.tsx          ← placeholder
    StepSummary.tsx       ← placeholder con CTA final (reutiliza addToCart)
  SelectableCard.tsx      ← tarjeta reutilizable con check, hover y selected
```

## Cambios en archivos existentes

- `src/routes/pasteles.$id.personalizar.tsx`: se reescribe el cuerpo del componente para usar `WizardLayout` + estado del paso actual (`useState<number>(1)`) + render condicional del componente de paso. Se conserva la lógica de `addToCart` y `computePrice` actual, movida al `StepSummary`. **No se cambia la ruta ni el contrato externo.**
- `src/data/customization.ts`: renombrar `"Crema Lotus"` → `"Crema de lotus"` para alinear con la lista pedida. Resto intacto.

## Fuera de alcance (siguiente iteración)

Los pasos 2–5 quedan como placeholders funcionales (con su propio header y botón Continuar). La lógica detallada de relleno, cobertura, decoración personalizada (colores/temática/descripción), tamaño, fecha de entrega y subida de imágenes se migrará paso a paso reutilizando lo que ya está en el archivo actual y los datos de `customization.ts`.

## Riesgos / no se toca

- El catálogo (`/mis-pasteles`, `index.tsx`, `ProductCard`) no se modifica.
- La ficha de producto `/pasteles/$id` no se modifica.
- El carrito (`/carrito`, `cart-store.ts`) no se modifica.
- `routeTree.gen.ts` no se edita a mano.
