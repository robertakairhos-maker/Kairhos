-- ADICIONAR COLUNA NOTES À TABELA CANDIDATES
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar a coluna notes
ALTER TABLE public.candidates 
ADD COLUMN IF NOT EXISTS notes JSONB DEFAULT '[]'::jsonb;

-- 2. Atualizar candidatos existentes para garantir que não sejam null
UPDATE public.candidates 
SET notes = '[]'::jsonb 
WHERE notes IS NULL;

-- 3. Verificar que a coluna foi adicionada
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'candidates' AND column_name = 'notes';

-- 4. Testar inserção com notes
INSERT INTO public.candidates (
    job_id,
    name,
    email,
    phone,
    candidate_status,
    candidate_stage,
    source,
    trashed,
    notes
) VALUES (
    (SELECT id FROM public.jobs WHERE NOT trashed LIMIT 1),
    'Teste com Notes',
    'teste@notes.com',
    '11999999999',
    'Triagem',
    'Triagem',
    'Manual',
    false,
    '[]'::jsonb
) RETURNING *;

-- 5. Ver candidatos recentes
SELECT id, name, email, notes, created_at
FROM public.candidates
ORDER BY created_at DESC
LIMIT 3;
