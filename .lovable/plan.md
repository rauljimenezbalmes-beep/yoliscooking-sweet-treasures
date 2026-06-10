## Objetivo

Que el admin pueda editar, desde el panel de cada pastel (`/admin/pasteles/:id`), dos textos que ahora están fijos en el código:

- **Información de alérgenos** (ahora siempre dice "Puede contener: gluten, lácteos, huevo y frutos secos").
- **Tiempo de entrega** (ahora siempre dice "Mínimo 3 días desde el pedido").

Cada pastel guarda sus propios valores y se muestran en su ficha pública (`/pasteles/:id`).

## Pasos

1. **Base de datos** — añadir a la tabla `products` dos columnas nuevas:
   - `allergens_info text` (texto libre, por defecto el texto actual).
   - `delivery_info text` (texto libre, por defecto el texto actual).
   Ambas no nulas con valor por defecto, así los pasteles existentes mantienen lo que se muestra hoy.

2. **Modelo de datos en el código**:
   - Añadir `allergensInfo` y `deliveryInfo` al tipo `Product` (`src/data/products.ts`).
   - Mapear las nuevas columnas en `src/data/products-store.ts` (lectura, `useUpdateProduct`, `useCreateProduct`).

3. **Formulario de admin** (`src/components/CakeForm.tsx`):
   - Añadir dos campos `<textarea>` ("Información de alérgenos" y "Tiempo de entrega") con el resto de campos.
   - Incluirlos en el `payload` de guardar/crear.

4. **Ficha pública del pastel** (`src/routes/pasteles.$id.index.tsx`):
   - Sustituir los textos fijos de las dos tarjetas ("Tiempo de entrega" e "Información alérgenos") por `product.deliveryInfo` y `product.allergensInfo`.

5. No se cambia la lógica del wizard de personalización ni la validación de fecha mínima de entrega (sigue siendo `MIN_DELIVERY_DAYS`). El texto editable es solo informativo en la ficha del pastel.

## Detalles técnicos

SQL de la migración:

```sql
ALTER TABLE public.products
  ADD COLUMN allergens_info text NOT NULL
    DEFAULT 'Puede contener: gluten, lácteos, huevo y frutos secos.',
  ADD COLUMN delivery_info text NOT NULL
    DEFAULT 'Mínimo 3 días desde el pedido.';
```

Las políticas RLS existentes ya cubren estas columnas (admin puede `UPDATE`, todos pueden `SELECT`), no hace falta tocarlas.
