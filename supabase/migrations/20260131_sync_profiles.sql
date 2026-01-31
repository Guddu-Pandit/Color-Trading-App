-- Migration to sync Supabase Auth users to public.profiles
-- Run this script in the Supabase SQL Editor

-- 1. Create or Replace the function to handle new user signups
-- This function will run every time a new user is created in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    -- Extract full_name from the user metadata (supports 'full_name' or 'name')
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    'user' -- Default role
  )
  -- If there's a conflict (e.g. ID already exists), we do nothing or could update
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the trigger if it exists to avoid duplications during setup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verification helpers (Optional - you can run these queries to check status)
-- SELECT * FROM public.profiles;
