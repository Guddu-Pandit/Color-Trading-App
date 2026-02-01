-- Create betting_config table
CREATE TABLE IF NOT EXISTS public.betting_config (
    id int PRIMARY KEY DEFAULT 1,
    is_paused boolean NOT NULL DEFAULT false,
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT singleton_check CHECK (id = 1)
);

-- Initialize if empty
INSERT INTO public.betting_config (id, is_paused)
VALUES (1, false)
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE public.betting_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anyone to read betting_config" ON public.betting_config
    FOR SELECT USING (true);

-- Only admins can update
CREATE POLICY "Allow only admins to update betting_config" ON public.betting_config
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
        )
    );
