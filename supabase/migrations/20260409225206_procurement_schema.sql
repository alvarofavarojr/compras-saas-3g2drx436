CREATE TABLE IF NOT EXISTS public.suppliers (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.erp_needs (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  min_stock NUMERIC NOT NULL,
  max_stock NUMERIC NOT NULL,
  required_quantity NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.supplier_items (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  supplier_id TEXT REFERENCES public.suppliers(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  pack_size NUMERIC NOT NULL,
  source TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.matched_needs (
  erp_id TEXT PRIMARY KEY REFERENCES public.erp_needs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  matches_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  selected_item_id TEXT REFERENCES public.supplier_items(id) ON DELETE SET NULL,
  suggested_quantity NUMERIC NOT NULL,
  confirmed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erp_needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matched_needs ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can manage their own suppliers" ON public.suppliers;
CREATE POLICY "Users can manage their own suppliers" ON public.suppliers
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own erp_needs" ON public.erp_needs;
CREATE POLICY "Users can manage their own erp_needs" ON public.erp_needs
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own supplier_items" ON public.supplier_items;
CREATE POLICY "Users can manage their own supplier_items" ON public.supplier_items
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own matched_needs" ON public.matched_needs;
CREATE POLICY "Users can manage their own matched_needs" ON public.matched_needs
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
