-- TESTE DE INSERÇÃO DIRETA
-- Execute este script para testar se a inserção funciona diretamente no banco

-- 1. Verificar se há vagas disponíveis
SELECT id, title, trashed 
FROM public.jobs 
WHERE NOT trashed 
LIMIT 5;

-- 2. Tentar inserção simples (SUBSTITUA o job_id por um ID real da query acima)
INSERT INTO public.candidates (
    job_id,
    name,
    email,
    phone,
    candidate_status,
    candidate_stage,
    source,
    trashed
) VALUES (
    'COLE_UM_JOB_ID_AQUI',  -- ⚠️ SUBSTITUA por um ID real
    'Teste Direto',
    'teste@direto.com',
    '11999999999',
    'Triagem',
    'Triagem',
    'Manual',
    false
) RETURNING *;

-- 3. Se der erro, veja qual é:
-- Se funcionar, o problema está no código JavaScript
-- Se não funcionar, o problema está no banco de dados

-- 4. Verificar se foi inserido
SELECT * FROM public.candidates 
WHERE name = 'Teste Direto'
ORDER BY created_at DESC;
