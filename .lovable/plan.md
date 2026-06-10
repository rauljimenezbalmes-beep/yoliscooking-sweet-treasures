## Objetivo

Que la tabla "Tamaños y precio orientativo" de la ficha del pastel (`/pasteles/:id`) muestre los mismos valores que ve el cliente al personalizar: la **etiqueta de porciones** y el **precio** configurados por el admin para ese pastel concreto (no los `SIZES` fijos del código).

## Estado actual

`src/routes/pasteles.$id.index.tsx` recorre la constante `SIZES` de `src/data/customization.ts` y muestra:
- `{s.portions} porc.` (siempre el número fijo del código).
- `(product.price * s.multiplier).toFixed(2) €` (siempre el cálculo automático, ignora precios fijados por el admin y los tamaños extra del pastel).

Esto ignora todo lo que el admin configura en la pestaña Tamaños: precios concretos, etiquetas de porciones personalizadas, tamaños activados/desactivados y tamaños extra propios del pastel.

## Cambios

1. **Sustituir la fuente de datos** de la lista por `useResolvedWizardOptions(product.id, "size")`, que ya combina globales activos + overrides del pastel + extras y respeta los flags `enabled`.

2. **Etiqueta de porciones**: usar `extra.portionsLabel` si está definido; si no, caer en `${extra.portions} porc.` (mismo orden de prioridad que en `StepDetails`).

3. **Precio**: usar `extra.price` si está definido; si no, calcularlo con `product.price * extra.multiplier` (mismo orden que `SizePriceInput` ya muestra como "auto").

4. **Si no hay tamaños activos** para el pastel, ocultar la sección entera en lugar de mostrar una tabla vacía.

5. Quitar el import ya innecesario de `SIZES`.

## Detalles técnicos

- Sin migración ni cambios de datos. Se reutiliza el store existente.
- Único archivo a tocar: `src/routes/pasteles.$id.index.tsx`.
- Extraer un helper local pequeño (`function sizeDisplay(opt, basePrice)`) para que el JSX quede limpio.
