ALTER TABLE public.products
  ADD COLUMN allergens_info text NOT NULL DEFAULT 'Puede contener: gluten, lácteos, huevo y frutos secos.',
  ADD COLUMN delivery_info text NOT NULL DEFAULT 'Mínimo 3 días desde el pedido.';