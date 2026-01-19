-- VERIFICAR SE CANDIDATO FOI SALVO
-- Execute este script no Supabase SQL Editor após tentar adicionar um candidato

-- 1. Ver os últimos 10 candidatos adicionados
SELECT 
    id,
    name,
    email,
    job_id,
    candidate_stage,
    source,
    trashed,
    created_at
FROM public.candidates
ORDER BY created_at DESC
LIMIT 10;

-- 2. Contar total de candidatos
SELECT COUNT(*) as total_candidatos FROM public.candidates;

-- 3. Contar candidatos não-excluídos
SELECT COUNT(*) as candidatos_ativos 
FROM public.candidates 
WHERE trashed = false;

-- 4. Ver candidatos por vaga
SELECT 
    j.title as vaga,
    COUNT(c.id) as total_candidatos
FROM public.jobs j
LEFT JOIN public.candidates c ON c.job_id = j.id
GROUP BY j.id, j.title
ORDER BY total_candidatos DESC;

-- 5. Se o candidato foi salvo mas tem trashed = true, corrija:
UPDATE public.candidates
SET trashed = false
WHERE trashed = true AND created_at > NOW() - INTERVAL '1 hour';

-- 6. Verificar último candidato adicionado
SELECT * FROM public.candidates 
ORDER BY created_at DESC 
LIMIT 1;
