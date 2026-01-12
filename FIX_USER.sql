-- Run this in the Supabase SQL Editor to verify and fix the missing user profile

-- 1. Check if the user exists in auth.users (System table)
SELECT * FROM auth.users WHERE email = 'robertakairhos@gmail.com';

-- 2. Insert the missing profile into public.profiles
-- This links the existing auth user to the profiles table so they appear in the app
INSERT INTO public.profiles (
    id, 
    email, 
    name, 
    user_role, 
    status, 
    avatar_url, 
    bio, 
    preferences
)
SELECT 
    id, 
    email, 
    'Roberta Kairhos',       -- Name (You can change this)
    'Admin',                 -- Role
    'Ativo',                 -- Status
    '',                      -- Avatar URL (Empty by default)
    'Admin do Sistema',      -- Bio
    '{"notifications": true}'::jsonb
FROM auth.users
WHERE email = 'robertakairhos@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- 3. Verify it was added
SELECT * FROM public.profiles WHERE email = 'robertakairhos@gmail.com';
