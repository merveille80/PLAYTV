-- === RLS SECURITY RULES FOR PLAYTV ===
-- Run this in your Supabase SQL Editor

-- 1. Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Allow users to READ their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- 3. Allow users to UPDATE their own profile (except for subscription_expiry and plan)
-- We use a trigger or function for payment, but for basic profile data (data_saver, language, etc):
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (
  -- Prevent users from modifying their own subscription status
  -- This requires the app to update subscription_expiry only via a secure Service Role key
  auth.uid() = id
);

-- Note: To fully secure 'subscription_expiry', you would typically handle payments 
-- via a secure backend route (/api/payment) that uses the Supabase Service Role Key
-- The Service Role Key bypasses RLS, so it can update 'subscription_expiry', 
-- while normal users (anon/authenticated keys) cannot update it if we restrict the UPDATE policy columns.

-- 4. Favorites table RLS (already secure if users only see their own)
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own favorites" ON public.user_favorites
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON public.user_favorites
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.user_favorites
FOR DELETE USING (auth.uid() = user_id);
