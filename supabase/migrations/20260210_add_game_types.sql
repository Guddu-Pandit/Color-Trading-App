
-- Add game_type to game_periods
ALTER TABLE public.game_periods 
ADD COLUMN IF NOT EXISTS game_type text DEFAULT '60s';

-- Index for faster filtering by game_type and status
CREATE INDEX IF NOT EXISTS idx_game_periods_status_type ON public.game_periods(status, game_type);
