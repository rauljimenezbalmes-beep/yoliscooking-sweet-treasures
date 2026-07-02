Mostrar "+10 €" en el botón "Decoración personalizada" en el wizard de personalización, y asegurar que el recargo aplicado al precio sea 10 € (no 8 €) para todas las tartas actuales y futuras que tengan esa opción.

## Cambios

### 1. `src/data/customization.ts`
- Cambiar `CUSTOM_DECORATION_FEE = 8` → `CUSTOM_DECORATION_FEE = 10`.
- Esto afecta a `computePrice` y `resolveWizardPrice`, que ya se usan en el resumen del wizard y al añadir/actualizar el carrito, por lo que el recargo pasa a 10 € automáticamente en todas las tartas (actuales y futuras) sin tocar la base de datos.

### 2. `src/components/customization/steps/StepDecoration.tsx`
- En el `map` de `decoOpts`, detectar si la opción es "personalizada" (misma lógica ya existente: `opt.label.toLowerCase().includes("personal")`).
- Pasar una nueva prop `badge="+10 €"` (o similar) al `SelectableCard` correspondiente, para que se vea el recargo directamente en el botón, junto al título "Decoración personalizada".

### 3. `src/components/customization/SelectableCard.tsx`
- Añadir una prop opcional `badge?: string`.
- Si está presente, renderizar un pequeño chip/etiqueta en la esquina superior derecha de la tarjeta (estilo `rounded-full border border-primary/30 bg-primary/10 text-primary text-xs px-2 py-0.5`) para no romper el layout actual.

## Notas

- No se toca la base de datos: las opciones del wizard siguen viniendo de `product_wizard_options`, y la etiqueta "+10 €" se calcula en el frontend a partir de la constante `CUSTOM_DECORATION_FEE`, así que cualquier tarta futura que tenga la opción "personalizada" mostrará el badge automáticamente.
- Si más adelante quieres que el importe sea configurable por tarta desde el admin, sería un cambio aparte (nuevo campo en `product_wizard_options.extra`).
