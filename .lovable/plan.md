## Problema

En el wizard del cliente sólo dos pasos leen lo configurado en admin:

- Paso 1 **Sabores** → ya usa las opciones del pastel.
- Paso 2 **Cobertura** → sólo se renderiza si el producto es categoría "Bizcochos". Para tartas (red-velvet, etc.) se muestra el placeholder "Próximamente".
- Pasos 3, 4 y 5 (Decoración, Texto, Resumen) → todos son placeholders.

Por eso lo que activas en las pestañas Coberturas, Decoración, Temas, Colores y Tamaños en `/admin/pasteles/$id` nunca aparece al personalizar como cliente.

## Solución

Hacer que cada paso del cliente lea sus opciones del pastel desde `useResolvedWizardLabels(productId, type)` (helper que ya existe y combina globales activos + extras del pastel).

### Paso 2 — Cobertura/Relleno (siempre, no sólo Bizcochos)

- Eliminar la rama placeholder. Usar siempre `StepCovering` con `productId`.
- Título dinámico: "Cobertura" si el producto es **Bizcochos**, "Relleno" para el resto (manteniendo la etiqueta actual de los pasos).
- `stepValid[2]` requiere selección sólo si hay opciones disponibles para ese pastel (si no hay ninguna, el paso se considera válido para no bloquear).

### Paso 3 — Decoración

Nuevo componente `StepDecoration({ productId })`:

- Lee opciones de tipo `decoration` (típicamente "Clásica" / "Personalizada"). Selección guarda `state.decoration`.
- Si se elige Personalizada, muestra debajo:
  - Selector de **tema** (`type=theme`) — opcional.
  - Selector múltiple de **colores** (`type=color`) — usa el campo `value` (hex) para el swatch cuando existe.
  - Textarea de descripción libre (ya existente en el estado).
- Mapea el label seleccionado a `"clasica" | "personalizada"` por comparación case-insensitive con "personalizada" para mantener compatibilidad con `computePrice` y `CakeCustomization`.

### Paso 4 — Texto / Tamaño / Entrega

Renombrar y reutilizar paso "Texto" como **"Detalles"**:

- Textarea para `state.customText` (mensaje en el pastel).
- Selector de **tamaño** (`type=size`): muestra labels y si `extra.portions` o `extra.multiplier` están definidos los muestra como subtítulo. Selección guarda `state.sizeId` (usa `value` de la opción; si no hay, usa el label slug).
- Input `date` para `state.deliveryDate` con `MIN_DELIVERY_DAYS` mínimo.

### Paso 5 — Resumen

Nuevo componente `StepSummary({ product })`:

- Lista las elecciones: sabores, cobertura/relleno, decoración, tema, colores (chips con swatch), tamaño, fecha, texto.
- Calcula y muestra el precio con `computePrice` usando el multiplicador del tamaño seleccionado (si la opción admin trae `extra.multiplier` numérico, se usa ese; si no, cae a los `SIZES` por defecto).
- Botón final del footer ya añade al carrito (no cambia la lógica de `handleNext`).

### Validación por paso

```text
1: state.flavors.length >= 1
2: coverings.length === 0 || state.covering !== ""
3: state.decoration !== "" && (decoration !== "personalizada" || colors.length > 0)
4: state.deliveryDate set y >= hoy + MIN_DELIVERY_DAYS
5: true
```

## Archivos a tocar

- `src/components/customization/steps/StepDecoration.tsx` (nuevo)
- `src/components/customization/steps/StepDetails.tsx` (nuevo, sustituye a "Texto")
- `src/components/customization/steps/StepSummary.tsx` (nuevo)
- `src/routes/pasteles.$id.personalizar.tsx`:
  - paso 2 siempre con `StepCovering`
  - sustituir los 3 placeholders restantes por los nuevos componentes
  - actualizar `stepValid` y etiqueta del paso 4 a "Detalles"
- `src/components/customization/steps/StepCovering.tsx`: copy dinámico ("cobertura" vs "relleno") según `isBizcocho` recibido como prop opcional.

## Fuera de alcance

- No se cambia el esquema de BD ni la API admin.
- No se añaden subidas de imágenes ni nuevos campos de personalización.
- Lógica de precio se mantiene (`computePrice` con multiplicador del tamaño).
