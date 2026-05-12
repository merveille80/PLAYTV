-- SQL for Channel Reporting System
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.channel_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    channel_id TEXT NOT NULL,
    channel_name TEXT,
    user_id UUID REFERENCES auth.users(id),
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT DEFAULT 'pending' -- pending, investigated, resolved
);

-- Enable RLS
ALTER TABLE public.channel_reports ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own reports
CREATE POLICY "Users can insert reports" ON public.channel_reports
FOR INSERT WITH CHECK (true); -- Anyone can report (even guests if user_id is null)

-- Allow only admins to see reports (or you can use service role for your admin dashboard)
CREATE POLICY "Only admins can see reports" ON public.channel_reports
FOR SELECT USING (false); -- Default to false, you'll see them via Supabase Dashboard or Admin service role
