## Objetivo

Que el admin pueda editar el texto de porciones que ve el cliente al elegir un tamaño de un pastel concreto (ej. cambiar "10 porciones" por "8-10 personas" o "Para una mesa de 12").

## Estado actual

En el paso de tamaño del wizard, debajo de cada tamaño se muestra `"{portions} porciones"` (`src/components/customization/steps/StepDetails.tsx`), donde `portions` sale de `extra.portions` del tamaño global. No es editable por pastel ni se puede personalizar el texto.

## Cambios

1. **Tab "Tamaños" en `/admin/pasteles/:id`** (`src/components/admin/ProductWizardEditor.tsx`): junto al input de precio, añadir un campo de texto "Etiqueta de porciones" para cada tamaño (tanto los globales como los extras del pastel). Texto libre, opcional.

2. **Guardado**: el valor va al JSON `extra` de la fila de `product_wizard_options` como `extra.portionsLabel` (no requiere migración; la columna `extra jsonb` ya existe y se usa para `price`). Se mantiene junto al `price` ya existente.

3. **Lectura en el wizard del cliente** (`StepDetails.tsx`): si el tamaño tiene `extra.portionsLabel` definido para este pastel, se muestra ese texto; si no, se mantiene el fallback actual `"{portions} porciones"`.

4. **Texto vacío = volver al automático.** Borrar el campo elimina `portionsLabel` del `extra` y vuelve a mostrar el cálculo por defecto.

## Detalles técnicos

- Sin migración SQL.
- Archivos a modificar:
  - `src/components/admin/ProductWizardEditor.tsx`: añadir input "Etiqueta de porciones" en `SizePriceInput` y en `ExtraSizePriceInput`; al guardar, fusionar `{ price, portionsLabel }` en `extra` (sin pisar otros campos).
  - `src/components/customization/steps/StepDetails.tsx`: leer `extra.portionsLabel` antes de caer en `${portions} porciones`.
- Sin cambios en políticas RLS (las existentes ya cubren `product_wizard_options`).
