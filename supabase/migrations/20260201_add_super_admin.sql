-- Migration to update role check constraint
-- Run this script in the Supabase SQL Editor

-- 1. Drop existing check constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Add new check constraint including 'super_admin'
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_role_check 
  CHECK (role = ANY (ARRAY['user'::text, 'admin'::text, 'super_admin'::text]));
