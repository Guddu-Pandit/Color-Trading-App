
-- Add individual pause states for game types
ALTER TABLE public.betting_config 
ADD COLUMN IF NOT EXISTS is_paused_30s boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS is_paused_60s boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS is_paused_90s boolean NOT NULL DEFAULT false;
