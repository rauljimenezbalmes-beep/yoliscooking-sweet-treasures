# Sabores configurables por pastel (1 o 2)

Permitir al admin elegir, para cada pastel, si el cliente puede seleccionar **1 sabor** o **hasta 2 sabores** en el wizard de personalización.

## Cambios

### 1. Base de datos
- Añadir columna `max_flavors smallint not null default 2 check (max_flavors in (1, 2))` a `public.products`.
- Actualizar el trigger/función `validate_cart_item_colors` (renombrar mentalmente a "validar customización") para que, al insertar/actualizar `cart_items`, también valide que `jsonb_array_length(customization->'flavors') <= products.max_flavors` del producto referenciado. Lookup vía `select max_flavors from products where id = new.product_id`.

### 2. Tipos y store de productos
- `src/data/products.ts`: añadir `maxFlavors: 1 | 2` al tipo `Product` (default `2` en los seeds).
- `src/data/products-store.ts`:
  - `DbProduct` y `mapRow` incluyen `max_flavors`.
  - `useUpdateProduct` y `useCreateProduct` mapean `maxFlavors → max_flavors`.

### 3. Admin
- `src/components/CakeForm.tsx`: nuevo control (radio o select) "Sabores que puede elegir el cliente: 1 / Hasta 2", enlazado a `maxFlavors`. Se envía en el payload de create/update.

### 4. Wizard del cliente
- `src/components/customization/steps/StepFlavors.tsx`: recibir `maxFlavors` (vía prop derivada de `useProduct(productId)`). Sustituir el `2` hardcoded en:
  - `maxReached = selectedCount >= maxFlavors`
  - Encabezado: "Elige un sabor" si `maxFlavors === 1`, si no "Elige uno o dos sabores".
  - Contador `{selectedCount}/{maxFlavors}`.
- `src/context/CustomizationContext.tsx`: si `toggleFlavor` hoy permite hasta 2, ajustarlo para respetar `maxFlavors` (pasar el límite al provider o re-validar en el step).
- `src/routes/pasteles.$id.personalizar.tsx`: en la validación del paso de sabores, exigir `state.flavors.length >= 1 && state.flavors.length <= maxFlavors`.

### 5. Defensa en cart-store
- `src/data/cart-store.ts`: en `addToCart` y `updateCartItem`, además del check de colores, lanzar error si `customization.flavors.length` excede `product.maxFlavors`.

## No incluido
- No se cambia la UI de `admin/wizard` (opciones globales de sabores). El límite es por pastel, no por sabor.
- No se modifica el comportamiento de colores ya implementado.
