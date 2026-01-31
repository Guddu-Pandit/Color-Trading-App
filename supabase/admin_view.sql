-- =============================================
-- SQL to Add 'status' column to public.profiles
-- =============================================

-- 1. Add the 'status' column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'Active';

-- 2. Add a constraint to ensure valid status values
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_status_check 
CHECK (status IN ('Active', 'Inactive'));

-- 3. Create a function to update status based on last login
-- This function will be called by a trigger or scheduled job
CREATE OR REPLACE FUNCTION update_user_status()
RETURNS void AS $$
BEGIN
  -- Set users to 'Inactive' if they haven't logged in for 4 weeks
  UPDATE public.profiles p
  SET status = 'Inactive'
  FROM auth.users au
  WHERE p.id = au.id
    AND p.status = 'Active'
    AND (
      -- User has signed in before but not in last 4 weeks
      (au.last_sign_in_at IS NOT NULL AND au.last_sign_in_at < (now() - interval '4 weeks'))
      OR
      -- User never signed in and account is older than 4 weeks
      (au.last_sign_in_at IS NULL AND au.created_at < (now() - interval '4 weeks'))
    );
  
  -- Set users to 'Active' if they logged in within 4 weeks
  UPDATE public.profiles p
  SET status = 'Active'
  FROM auth.users au
  WHERE p.id = au.id
    AND p.status = 'Inactive'
    AND au.last_sign_in_at > (now() - interval '4 weeks');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create a trigger function to set new users as 'Active'
CREATE OR REPLACE FUNCTION set_new_user_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.status := 'Active';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger for new profile inserts
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_new_user_active();

-- 6. Initialize all existing users' status
-- Run the update function once to set current statuses
SELECT update_user_status();

-- =============================================
-- OPTIONAL: Schedule the update_user_status() function
-- to run daily using pg_cron (if available in your Supabase plan)
-- =============================================
-- SELECT cron.schedule('update-user-status', '0 0 * * *', 'SELECT update_user_status()');
