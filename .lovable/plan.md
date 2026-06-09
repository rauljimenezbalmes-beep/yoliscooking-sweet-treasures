## Objetivo

Permitir personalizar las opciones del wizard **por cada pastel** desde su ficha en admin, manteniendo las opciones globales actuales como base. Para cada pastel se podrá:

- Activar/desactivar opciones globales.
- Añadir opciones exclusivas de ese pastel (extras).
- Para todos los pasos del wizard: sabores, coberturas/rellenos, decoración, temas, colores y tamaños.

## Modelo de datos

Nueva tabla `product_wizard_options` (extras + overrides):

```text
product_wizard_options
- id            uuid pk
- product_id    text  fk -> products.id
- type          wizard_option_type  (sabor, cobertura, ...)
- global_option_id uuid null  fk -> wizard_options.id
- label         text null         (sólo cuando global_option_id is null = extra)
- value         text null
- description   text null
- extra         jsonb default '{}'
- sort_order    int default 0
- enabled       boolean default true
- created_at / updated_at
- unique(product_id, global_option_id) cuando no es null
```

Reglas:
- Fila con `global_option_id` no nulo → override de un global; sólo se respeta `enabled` y opcionalmente `sort_order`.
- Fila con `global_option_id` nulo → opción **extra** sólo para ese pastel; usa `label/value/description/extra`.
- Si no hay overrides para un pastel+tipo, se muestran todos los globales activos.

RLS: lectura pública (igual que `wizard_options`); escritura sólo admins.

## Capa de datos

Nuevo `src/data/product-wizard-store.ts`:

- `useProductWizardOptions(productId, type)` → combina globales activos + overrides + extras y devuelve la lista final ordenada que ve el cliente.
- `useProductWizardOverrides(productId)` → datos crudos para el editor admin (todos los tipos).
- Mutaciones: `useToggleGlobalForProduct`, `useUpsertProductExtra`, `useDeleteProductExtra`, `useReorderProductOptions`.

Refactor mínimo en los pasos del wizard (`StepFlavors`, `StepCovering`, `StepPlaceholder` para decoración/tema/color/tamaño) para que reciban el `productId` (ya disponible vía `useCustomization` / ruta `/pasteles/$id/personalizar`) y usen el nuevo hook en lugar de `useActiveWizardLabels`.

## UI de administración

Dentro de `src/routes/admin.pasteles.$id.tsx`, añadir una segunda sección debajo del `CakeForm` titulada **"Opciones del wizard para este pastel"**, sólo visible al editar (no en `new`).

Componente nuevo `src/components/admin/ProductWizardEditor.tsx`:

- Tabs por tipo: Sabores · Coberturas · Decoración · Temas · Colores · Tamaños.
- Por cada tab:
  - Sección **"Opciones globales"**: lista de globales activos con un switch para activar/desactivar ese global en este pastel. Por defecto todos activos.
  - Sección **"Extras de este pastel"**: lista editable (label / value / descripción según tipo) con botones añadir, editar, eliminar — misma UX que `/admin/wizard` pero scope al pastel.
- Indicador visual que distinga global vs extra.

## Fuera de alcance

- Reordenación drag-and-drop (sólo `sort_order` numérico, opcional en una segunda pasada).
- Cambios en el wizard global (`/admin/wizard`) — sigue igual.
- Lógica de precios o validación nueva.

## Detalles técnicos

- Migración crea tabla + GRANTs (`authenticated`, `service_role`, `anon SELECT`) + RLS + policies (`has_role(auth.uid(),'admin')` para escritura, lectura pública) + trigger `updated_at`.
- El hook `useProductWizardOptions` hace dos queries en paralelo (globales del tipo + overrides del producto+tipo) y las combina en memoria con `useMemo`.
- Invalidación de queries tras cada mutación con clave `["product-wizard", productId, type]`.
