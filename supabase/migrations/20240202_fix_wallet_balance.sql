-- Update default balance for future users
ALTER TABLE public.profiles ALTER COLUMN balance SET DEFAULT 100;

-- Update existing users who have 0 balance and haven't placed any bets
-- This ensures that users who just signed up but haven't interacted yet get their 100
UPDATE public.profiles p
SET balance = 100
WHERE p.balance = 0
AND NOT EXISTS (
    SELECT 1 FROM public.bets b WHERE b.user_id = p.id
);

-- Set balance to 5000 for admins
UPDATE public.profiles
SET balance = 5000
WHERE role = 'admin';
