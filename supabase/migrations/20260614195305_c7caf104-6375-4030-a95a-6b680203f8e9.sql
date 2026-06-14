
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS max_flavors smallint NOT NULL DEFAULT 2
  CHECK (max_flavors IN (1, 2));

CREATE OR REPLACE FUNCTION public.validate_cart_item_colors()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
declare
  colors_count int;
  flavors_count int;
  max_flav int;
begin
  if new.customization ? 'colors'
     and jsonb_typeof(new.customization->'colors') = 'array' then
    colors_count := jsonb_array_length(new.customization->'colors');
    if colors_count > 2 then
      raise exception 'Un pastel no puede tener más de 2 colores (recibidos: %).', colors_count
        using errcode = 'check_violation';
    end if;
  end if;

  if new.customization ? 'flavors'
     and jsonb_typeof(new.customization->'flavors') = 'array' then
    flavors_count := jsonb_array_length(new.customization->'flavors');
    select max_flavors into max_flav from public.products where id = new.product_id;
    if max_flav is null then
      max_flav := 2;
    end if;
    if flavors_count > max_flav then
      raise exception 'Este pastel permite como máximo % sabor(es) (recibidos: %).', max_flav, flavors_count
        using errcode = 'check_violation';
    end if;
  end if;

  return new;
end;
$$;

DROP TRIGGER IF EXISTS cart_items_validate_colors ON public.cart_items;
CREATE TRIGGER cart_items_validate_colors
  BEFORE INSERT OR UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.validate_cart_item_colors();
