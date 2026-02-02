    -- 1. Add balance column to existing profiles table
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS balance numeric NOT NULL DEFAULT 0;

    -- 2. Update the handle_new_user function to include signup bonus
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
    INSERT INTO public.profiles (id, email, full_name, password, role, balance)
    VALUES (
        new.id, 
        new.email, 
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), 
        new.raw_user_meta_data->>'hashed_password',
        'user',
        100 -- ₹100 signup bonus
    );
    RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- 3. Create Game Periods Table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.game_periods (
    id bigint generated always as identity primary key,
    start_time timestamp with time zone default now(),
    end_time timestamp with time zone,
    status text check (status in ('active', 'locked', 'completed')) default 'active',
    result_color text,
    result_number int
    );

    -- 4. Create Bets Table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.bets (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade,
    period_id bigint references public.game_periods(id) on delete cascade,
    color text,
    amount numeric not null,
    status text check (status in ('pending', 'win', 'loss')) default 'pending',
    payout numeric default 0,
    created_at timestamp with time zone default now()
    );

    -- 5. Set up RLS for new tables
    ALTER TABLE public.game_periods ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

    -- 6. Add Policies (using DO block to avoid errors if they already exist)
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Game periods are viewable by everyone.') THEN
            CREATE POLICY "Game periods are viewable by everyone." ON public.game_periods FOR SELECT USING (true);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own bets.') THEN
            CREATE POLICY "Users can view their own bets." ON public.bets FOR SELECT USING (auth.uid() = user_id);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own bets.') THEN
            CREATE POLICY "Users can insert their own bets." ON public.bets FOR INSERT WITH CHECK (auth.uid() = user_id);
        END IF;
    END $$;
