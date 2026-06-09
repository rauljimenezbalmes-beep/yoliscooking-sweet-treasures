## Contexto

Hoy el precio que ve el cliente se calcula así:

```
precio_final = product.price (base) × size.extra.multiplier (+ 8 € si decoración personalizada)
```

- `product.price` se edita por tarta en `CakeForm` (admin → editar pastel).
- `size.extra.multiplier` es **global** para todas las tartas (tabla `wizard_options`, tipo `size`).

Resultado: el admin no puede decir “el Lemon Pie mediano cuesta 28 €” sin afectar al resto de tartas.

## Objetivo

Que el admin, desde la ficha de cada pastel, pueda fijar un **precio explícito por tamaño** para esa tarta concreta, sin tocar los demás productos ni los multiplicadores globales.

## Cambios

### 1. Modelo de datos (sin migración nueva)

Reutilizar la tabla existente `product_wizard_options` (overrides por producto). Para filas con `type = 'size'` guardar el precio override en el JSON `extra`:

```json
{ "price": 28 }
```

- Si existe `extra.price` numérico → ese es el precio final para esa tarta + tamaño.
- Si no existe → se mantiene el cálculo actual `product.price × multiplier`.
- Funciona tanto para tamaños **globales** (creando una fila override con `global_option_id` apuntando al tamaño global y `extra.price`) como para **extras propios** del pastel.

No hace falta cambiar el esquema porque `extra` ya es `jsonb` y `product_wizard_options` ya admite overrides por tipo `size`.

### 2. UI del editor del pastel (`src/components/admin/ProductWizardEditor.tsx`)

En la pestaña **Tamaños** de cada pastel:

- Junto a cada tamaño global activo añadir un input `Precio (€)`:
  - Vacío = usar cálculo automático con multiplicador.
  - Con número = precio fijo para ese pastel y tamaño.
  - Guardar crea/actualiza la fila override correspondiente (con `enabled: true` y `extra: { price: N }`); borrar el valor limpia `extra.price`.
- En los extras propios de tipo size, mostrar también el input de precio y persistirlo igual en `extra.price`.
- Pequeño texto de ayuda: “Si lo dejas vacío, se calculará automáticamente a partir del precio base × multiplicador del tamaño.”

### 3. Store (`src/data/product-wizard-store.ts`)

- Ampliar `useUpdateProductExtra` (o añadir helper `useSetSizePrice`) para aceptar `extra` en el `patch` y hacer merge con el `extra` existente (no sobreescribir el objeto entero).
- Ampliar `useToggleGlobalForProduct` para poder pasar `extra` al crear la fila inicial, de modo que se pueda fijar el precio sin tener que primero desactivar/activar.

### 4. Cálculo de precio para el cliente

Modificar los dos sitios donde se calcula el precio para que primero comprueben `extra.price`:

- `src/components/customization/steps/StepSummary.tsx` (resumen y precio estimado).
- `src/routes/pasteles.$id.personalizar.tsx` / `cart-store` donde se guarda el precio en el carrito.

Lógica:

```text
si selectedSize.extra.price es número > 0 → price = extra.price (+ 8 si personalizada)
si no → price = product.price × multiplier (+ 8 si personalizada)
```

`useResolvedWizardOptions` ya hace merge de overrides globales con extras, así que el `extra` que llega al componente debe ser el del override cuando exista. Ajustar el merge para que, si hay override con `extra` no vacío, prevalezca sobre el `extra` del global (hoy se queda con el global).

### 5. Fuera de alcance

- No se cambian los multiplicadores globales ni la pestaña global de Wizard.
- No se añade precio por sabor/cobertura/decoración (solo tamaño, que es lo que pide el usuario).
- El precio base del producto (`CakeForm`) sigue funcionando como precio “desde” y como fallback cuando no hay overrides.

## Resultado

Para cada tarta el admin podrá decidir:
- Dejar todo automático (como ahora).
- Fijar precios concretos por tamaño solo para esa tarta, sin afectar al resto del catálogo.
