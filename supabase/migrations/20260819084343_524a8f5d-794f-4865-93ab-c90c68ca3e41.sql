-- Make MT5 tables fully public (no auth in this app)
ALTER TABLE public.mt5_accounts ALTER COLUMN user_id SET DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE public.mt5_risk_settings ALTER COLUMN user_id SET DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE public.mt5_signals ALTER COLUMN user_id SET DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE public.mt5_orders ALTER COLUMN user_id SET DEFAULT '00000000-0000-0000-0000-000000000000';

ALTER TABLE public.mt5_accounts DROP CONSTRAINT IF EXISTS mt5_accounts_user_id_fkey;
ALTER TABLE public.mt5_risk_settings DROP CONSTRAINT IF EXISTS mt5_risk_settings_user_id_fkey;
ALTER TABLE public.mt5_signals DROP CONSTRAINT IF EXISTS mt5_signals_user_id_fkey;
ALTER TABLE public.mt5_orders DROP CONSTRAINT IF EXISTS mt5_orders_user_id_fkey;

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('mt5_accounts','mt5_risk_settings','mt5_signals','mt5_orders')
  LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

CREATE POLICY "public access" ON public.mt5_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public access" ON public.mt5_risk_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public access" ON public.mt5_signals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public access" ON public.mt5_orders FOR ALL USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mt5_accounts TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mt5_risk_settings TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mt5_signals TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mt5_orders TO anon, authenticated;
GRANT ALL ON public.mt5_accounts, public.mt5_risk_settings, public.mt5_signals, public.mt5_orders TO service_role;