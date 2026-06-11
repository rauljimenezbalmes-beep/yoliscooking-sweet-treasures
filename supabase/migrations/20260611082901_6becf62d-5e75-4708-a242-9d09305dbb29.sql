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

drop trigger if exists cart_items_validate_colors on public.cart_items;

create trigger cart_items_validate_colors
before insert or update on public.cart_items
for each row execute function public.validate_cart_item_colors();