-- Create a table for public profiles with the exact schema requested
CREATE TABLE public.profiles (
  id uuid not null,
  updated_at timestamp with time zone null default timezone ('utc'::text, now()),
  email text null,
  role text null default 'user'::text,
  full_name text null,
  password text null, -- Added field as requested
  balance numeric not null default 0,
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint email_length check ((char_length(email) >= 3)),
  constraint profiles_role_check check ((role = any (array['user'::text, 'admin'::text])))
) TABLESPACE pg_default;

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create a function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, password, role, balance)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), 
    new.raw_user_meta_data->>'hashed_password', -- Capturing hashed password from metadata
    'user',
    100 -- ₹100 signup bonus
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Game Periods Table
CREATE TABLE public.game_periods (
  id bigint generated always as identity primary key,
  start_time timestamp with time zone default now(),
  end_time timestamp with time zone,
  status text check (status in ('active', 'locked', 'completed')) default 'active',
  result_color text,
  result_number int
);

-- Bets Table
CREATE TABLE public.bets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  period_id bigint references public.game_periods(id) on delete cascade,
  color text,
  amount numeric not null,
  status text check (status in ('pending', 'win', 'loss')) default 'pending',
  payout numeric default 0,
  created_at timestamp with time zone default now()
);

-- RLS for game_periods and bets
ALTER TABLE public.game_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Game periods are viewable by everyone." ON public.game_periods FOR SELECT USING (true);
CREATE POLICY "Users can view their own bets." ON public.bets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bets." ON public.bets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create a trigger to call the function on every signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
