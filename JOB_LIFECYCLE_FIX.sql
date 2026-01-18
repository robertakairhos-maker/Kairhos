-- JOB LIFECYCLE & TRASH SYSTEM FIX
-- Run this in the Supabase SQL Editor

-- 1. Ensure the 'deadline' column exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='jobs' AND column_name='deadline') THEN
        ALTER TABLE public.jobs ADD COLUMN deadline DATE;
    END IF;
END $$;

-- 2. Ensure the 'trashed' column exists for the soft-delete system
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='jobs' AND column_name='trashed') THEN
        ALTER TABLE public.jobs ADD COLUMN trashed BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 3. Ensure salary columns exist and are numeric
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='jobs' AND column_name='salary_min') THEN
        ALTER TABLE public.jobs ADD COLUMN salary_min NUMERIC;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='jobs' AND column_name='salary_max') THEN
        ALTER TABLE public.jobs ADD COLUMN salary_max NUMERIC;
    END IF;
END $$;

-- 4. Verify the requirements column type (should be jsonb or text[])
-- If it's currently text, we might want to convert it, but let's be careful.
-- Usually, we'll keep it as is if it's already working, otherwise:
-- ALTER TABLE public.jobs ALTER COLUMN requirements TYPE TEXT[] USING requirements::TEXT[];

-- 5. Verification Query
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'jobs';
