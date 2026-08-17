-- profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- shared updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- mt5_accounts
CREATE TABLE public.mt5_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  label TEXT NOT NULL,
  login TEXT NOT NULL,
  server_name TEXT NOT NULL,
  is_demo BOOLEAN NOT NULL DEFAULT true,
  symbol_suffix TEXT NOT NULL DEFAULT '',
  bridge_account_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, login, server_name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mt5_accounts TO authenticated;
GRANT ALL ON public.mt5_accounts TO service_role;
ALTER TABLE public.mt5_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mt5_accounts_own" ON public.mt5_accounts FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER mt5_accounts_set_updated_at BEFORE UPDATE ON public.mt5_accounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- mt5_risk_settings
CREATE TABLE public.mt5_risk_settings (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  max_risk_percentage NUMERIC NOT NULL DEFAULT 1,
  max_position_size NUMERIC NOT NULL DEFAULT 0.1,
  use_stop_loss BOOLEAN NOT NULL DEFAULT true,
  use_take_profit BOOLEAN NOT NULL DEFAULT true,
  max_open_positions INTEGER NOT NULL DEFAULT 3,
  min_confidence INTEGER NOT NULL DEFAULT 70,
  allowed_symbols TEXT[] NOT NULL DEFAULT ARRAY['XAUUSD','EURUSD','GBPUSD','USDJPY'],
  max_slippage_percentage NUMERIC NOT NULL DEFAULT 0.15,
  auto_trading_enabled BOOLEAN NOT NULL DEFAULT false,
  require_manual_confirm BOOLEAN NOT NULL DEFAULT true,
  kill_switch_engaged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.mt5_risk_settings TO authenticated;
GRANT ALL ON public.mt5_risk_settings TO service_role;
ALTER TABLE public.mt5_risk_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mt5_risk_settings_own" ON public.mt5_risk_settings FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER mt5_risk_settings_set_updated_at BEFORE UPDATE ON public.mt5_risk_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- mt5_signals
CREATE TABLE public.mt5_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  account_id UUID REFERENCES public.mt5_accounts(id) ON DELETE SET NULL,
  dedupe_key TEXT,
  symbol TEXT NOT NULL,
  direction TEXT NOT NULL,
  entry NUMERIC,
  stop_loss NUMERIC,
  take_profit NUMERIC,
  confidence NUMERIC,
  current_price NUMERIC,
  executed BOOLEAN NOT NULL DEFAULT false,
  reason TEXT,
  raw JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, dedupe_key)
);
GRANT SELECT, INSERT, DELETE ON public.mt5_signals TO authenticated;
GRANT ALL ON public.mt5_signals TO service_role;
ALTER TABLE public.mt5_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mt5_signals_own" ON public.mt5_signals FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX mt5_signals_user_created_idx ON public.mt5_signals (user_id, created_at DESC);

-- mt5_orders
CREATE TABLE public.mt5_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  account_id UUID REFERENCES public.mt5_accounts(id) ON DELETE SET NULL,
  signal_id UUID REFERENCES public.mt5_signals(id) ON DELETE SET NULL,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL,
  volume NUMERIC NOT NULL,
  requested_price NUMERIC,
  fill_price NUMERIC,
  stop_loss NUMERIC,
  take_profit NUMERIC,
  ticket TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  retcode INTEGER,
  error TEXT,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.mt5_orders TO authenticated;
GRANT ALL ON public.mt5_orders TO service_role;
ALTER TABLE public.mt5_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mt5_orders_select_own" ON public.mt5_orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE INDEX mt5_orders_user_created_idx ON public.mt5_orders (user_id, created_at DESC);
CREATE TRIGGER mt5_orders_set_updated_at BEFORE UPDATE ON public.mt5_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();