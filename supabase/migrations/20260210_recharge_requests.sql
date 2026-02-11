-- Create Recharge Requests Table
CREATE TABLE IF NOT EXISTS public.recharge_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  status text CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recharge_requests ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own recharge requests.') THEN
        CREATE POLICY "Users can view their own recharge requests." ON public.recharge_requests
          FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own recharge requests.') THEN
        CREATE POLICY "Users can insert their own recharge requests." ON public.recharge_requests
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all recharge requests.') THEN
        CREATE POLICY "Admins can view all recharge requests." ON public.recharge_requests
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.profiles
              WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
            )
          );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update recharge requests.') THEN
        CREATE POLICY "Admins can update recharge requests." ON public.recharge_requests
          FOR UPDATE USING (
            EXISTS (
              SELECT 1 FROM public.profiles
              WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
            )
          );
    END IF;
END $$;

-- Function to approve recharge and update balance
CREATE OR REPLACE FUNCTION public.approve_recharge_request(request_id uuid)
RETURNS void AS $$
DECLARE
  req_amount numeric;
  req_user_id uuid;
  req_status text;
BEGIN
  -- Get request details and lock the row
  SELECT amount, user_id, status INTO req_amount, req_user_id, req_status
  FROM public.recharge_requests
  WHERE id = request_id
  FOR UPDATE;

  IF req_status != 'pending' THEN
    RAISE EXCEPTION 'Request is already processed';
  END IF;

  -- Update user balance
  UPDATE public.profiles
  SET balance = balance + req_amount
  WHERE id = req_user_id;

  -- Update request status
  UPDATE public.recharge_requests
  SET status = 'approved', updated_at = now()
  WHERE id = request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

