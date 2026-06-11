## Backend: limitar a 2 colores por pastel

Validar en la base de datos que cada fila de `cart_items` nunca tenga más de 2 colores en `customization.colors`. Una validación a nivel de BD garantiza que ni inserciones directas, ni clientes manipulados, ni código futuro puedan saltarse el límite.

### Cambios

1. **Migración SQL** — crear función + trigger:

```sql
create or replace function public.validate_cart_item_colors()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  colors_count int;
begin
  if new.customization ? 'colors'
     and jsonb_typeof(new.customization->'colors') = 'array' then
    colors_count := jsonb_array_length(new.customization->'colors');
    if colors_count > 2 then
      raise exception 'Un pastel no puede tener más de 2 colores (recibidos: %).', colors_count
        using errcode = 'check_violation';
    end if;
  end if;
  return new;
end;
$$;

create trigger cart_items_validate_colors
before insert or update on public.cart_items
for each row execute function public.validate_cart_item_colors();
```

2. **Frontend (`src/data/cart-store.ts`)** — manejo defensivo: en `addToCart` y `updateCartItem`, si Supabase devuelve un error del trigger, lanzar/propagar para que el caller muestre un toast (en vez de continuar silenciosamente al fallback local). El límite de 2 ya se aplica en `StepDecoration.tsx`, así que esto es una red de seguridad.

### No se toca
- Esquema de `cart_items` (sigue siendo JSONB).
- Lógica del wizard ni el resto del flujo de personalización.
