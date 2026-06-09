
CREATE TABLE public.product_wizard_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  type public.wizard_option_type NOT NULL,
  global_option_id uuid REFERENCES public.wizard_options(id) ON DELETE CASCADE,
  label text,
  value text,
  description text,
  extra jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX product_wizard_options_global_uniq
  ON public.product_wizard_options(product_id, global_option_id)
  WHERE global_option_id IS NOT NULL;

CREATE INDEX product_wizard_options_product_type_idx
  ON public.product_wizard_options(product_id, type);

GRANT SELECT ON public.product_wizard_options TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_wizard_options TO authenticated;
GRANT ALL ON public.product_wizard_options TO service_role;

ALTER TABLE public.product_wizard_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product wizard options"
  ON public.product_wizard_options FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage product wizard options"
  ON public.product_wizard_options FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_product_wizard_options_updated_at
  BEFORE UPDATE ON public.product_wizard_options
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
