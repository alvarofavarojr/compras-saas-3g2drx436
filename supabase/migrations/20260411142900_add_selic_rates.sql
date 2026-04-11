CREATE TABLE IF NOT EXISTS public.selic_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  valid_from DATE NOT NULL,
  rate NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.selic_rates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own selic_rates" ON public.selic_rates;
CREATE POLICY "Users can manage their own selic_rates" ON public.selic_rates
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.selic_rates) THEN
    -- Insert seed data for the first user found
    INSERT INTO public.selic_rates (user_id, valid_from, rate)
    SELECT id, '2024-05-08', 10.50 FROM auth.users LIMIT 1;
    
    INSERT INTO public.selic_rates (user_id, valid_from, rate)
    SELECT id, '2024-03-20', 10.75 FROM auth.users LIMIT 1;
  END IF;
END $$;
