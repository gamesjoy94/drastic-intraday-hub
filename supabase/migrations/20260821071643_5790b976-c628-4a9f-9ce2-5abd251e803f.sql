ALTER TABLE public.mt5_risk_settings
  ADD COLUMN IF NOT EXISTS auto_analysis_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_analysis_interval_minutes integer NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS auto_confidence_threshold integer NOT NULL DEFAULT 80,
  ADD COLUMN IF NOT EXISTS auto_entries_per_signal integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS auto_live_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_manage_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS auto_close_profit_usd numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS auto_close_loss_usd numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS auto_close_max_age_minutes integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS auto_close_on_reverse boolean NOT NULL DEFAULT true;