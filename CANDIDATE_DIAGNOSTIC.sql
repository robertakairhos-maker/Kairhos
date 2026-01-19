-- DIAGNÓSTICO E CORREÇÃO DE CANDIDATOS
-- Execute este script no Supabase SQL Editor para diagnosticar e corrigir problemas

-- 1. Verificar se a tabela existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates'
);

-- 2. Ver estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'candidates'
ORDER BY ordinal_position;

-- 3. Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'candidates';

-- 4. Testar inserção manual (SUBSTITUA os valores conforme necessário)
INSERT INTO public.candidates (
    job_id,
    name,
    email,
    phone,
    candidate_status,
    candidate_stage,
    source,
    location,
    current_job_role,
    seniority,
    trashed
) VALUES (
    (SELECT id FROM public.jobs LIMIT 1), -- Pega o ID da primeira vaga
    'Teste Candidato',
    'teste@email.com',
    '11999999999',
    'Triagem',
    'Triagem',
    'Manual',
    'São Paulo',
    'Desenvolvedor',
    'Pleno',
    false
) RETURNING *;

-- 5. Ver todos os candidatos (para confirmar)
SELECT id, name, email, job_id, candidate_stage, trashed, created_at
FROM public.candidates
ORDER BY created_at DESC
LIMIT 10;

-- 6. Se a tabela não existir, recrie com este comando:
/*
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
    source TEXT DEFAULT 'Manual',
    location TEXT,
    current_job_role TEXT,
    seniority TEXT DEFAULT 'Pleno',
    notes JSONB DEFAULT '[]'::jsonb,
    trashed BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Full Access" ON public.candidates;
CREATE POLICY "Public Full Access" ON public.candidates FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_candidates_job_id ON candidates(job_id);
CREATE INDEX IF NOT EXISTS idx_candidates_trashed ON candidates(trashed);
*/
