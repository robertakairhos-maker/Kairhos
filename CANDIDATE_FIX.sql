-- FIX CANDIDATE PERSISTENCE
-- Run this in the Supabase SQL Editor

-- 1. Create Candidates Table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    candidate_status TEXT DEFAULT 'Triagem',
    candidate_stage TEXT DEFAULT 'Triagem',
    resume_url TEXT,
    resume_name TEXT,
    skills TEXT[] DEFAULT '{}',
    source TEXT,
    location TEXT,
    current_job_role TEXT,
    seniority TEXT,
    notes JSONB DEFAULT '[]'::jsonb,
    trashed BOOLEAN DEFAULT FALSE
);

-- 2. Enable RLS
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policy (Allow All for simplicity, or refine for Authenticated)
DROP POLICY IF EXISTS "Public Full Access" ON public.candidates;
CREATE POLICY "Public Full Access" ON public.candidates FOR ALL USING (true) WITH CHECK (true);

-- 4. Storage Bucket Setup
-- You must manually create the 'resumes' bucket in the Supabase Dashboard 
-- and set it to 'Public' if you want public URLs to work.

-- 5. Add Index for Performance
CREATE INDEX IF NOT EXISTS idx_candidates_job_id ON candidates(job_id);
CREATE INDEX IF NOT EXISTS idx_candidates_trashed ON candidates(trashed);

-- 6. Verification
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'candidates';
