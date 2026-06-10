
## Objetivo

Que el admin pueda ordenar a su gusto las opciones del wizard de cada pastel (tamaños y el resto de categorías), incluyendo tanto las opciones globales activas (Individual, Pequeño, Grande, Extra grande…) como los extras propios del pastel, mezclándolas libremente. El orden elegido es el que verá el cliente en el wizard y en la ficha del pastel.

## Cambios

### 1. Editor admin (`ProductWizardEditor.tsx`)

- En cada pestaña (Sabores, Coberturas, Tamaños…), mostrar una **única lista ordenada** que combine globales activos + extras del pastel, en lugar de las dos secciones separadas actuales.
- Cada fila lleva un badge `Global` o `Extra` para distinguirlas, y mantiene sus controles actuales (precio/etiqueta de porciones en Tamaños, activar/ocultar, editar/borrar en extras).
- Añadir a la izquierda de cada fila dos botones de orden: `↑` y `↓` (deshabilitados en los extremos). Al pulsar, se intercambia el `sort_order` con el vecino dentro de la misma pestaña.
- Debajo de la lista se mantiene el formulario para crear un nuevo extra. Los extras nuevos se añaden al final.

### 2. Persistencia del orden

- **Extras** (`product_wizard_options` sin `global_option_id`): actualizar `sort_order` con el `useUpdateProductExtra` ya existente.
- **Globales**: el `sort_order` se guarda en la fila override de `product_wizard_options`. Si no existe override para ese global, se crea con `enabled: true` y el nuevo `sort_order` (mismo patrón que `useSetGlobalSizePrice`).
- Añadir un mutation `useSetWizardSortOrder({ productId, type, global?, existing?, extraId?, sort_order })` que cubre ambos casos.
- El intercambio se hace en dos `update`/`insert` (uno por cada vecino), invalidando la query `["product-wizard", productId]` al final.

### 3. Cálculo del orden vigente

- En el editor, construir la lista combinada con la misma lógica que `useResolvedWizardOptions` (override.sort_order si hay, si no global.sort_order para globales; sort_order propio para extras) y ordenarla. Sobre esa lista se pintan las flechas y se decide el sort_order vecino para los swaps.
- `useResolvedWizardOptions` ya ordena por `sort` para globales y por `sort_order` para extras, pero los concatena (globales y luego extras). Se modifica para **mezclar ambos en una única ordenación** por su sort efectivo, de modo que el orden del admin se respete tal cual en el cliente y en `pasteles/$id` (que ya consume este hook).

## Detalles técnicos

- Sin cambios de esquema: `product_wizard_options.sort_order` ya existe.
- Archivos afectados:
  - `src/components/admin/ProductWizardEditor.tsx` (UI unificada + botones de orden).
  - `src/data/product-wizard-store.ts` (nuevo `useSetWizardSortOrder`; resolver mezcla globales y extras en una única ordenación).
- Sin migración de datos: los `sort_order` actuales de globales y extras siguen siendo válidos como punto de partida; el admin reordena cuando lo necesite.
- Para evitar empates de `sort_order` entre globales y extras, al cargar la lista en el editor se reasignan visualmente índices 1..N y los swaps escriben valores enteros consecutivos, garantizando un orden determinista.
