-- VERIFICAR E CORRIGIR POLÍTICAS RLS DA TABELA CANDIDATES
-- Execute este script no Supabase SQL Editor

-- 1. Ver políticas RLS atuais
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'candidates';

-- 2. Verificar se RLS está habilitado
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'candidates';

-- 3. REMOVER todas as políticas antigas
DROP POLICY IF EXISTS "Public Full Access" ON public.candidates;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.candidates;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.candidates;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.candidates;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.candidates;

-- 4. CRIAR política que permite TUDO para usuários autenticados
CREATE POLICY "Allow all for authenticated users"
ON public.candidates
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Verificar que a política foi criada
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'candidates';

-- 6. Testar inserção manual
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
    (SELECT id FROM public.jobs WHERE NOT trashed LIMIT 1),
    'Teste Manual ' || NOW()::text,
    'teste@manual.com',
    '11999999999',
    'Triagem',
    'Triagem',
    'Manual',
    'São Paulo',
    'Desenvolvedor',
    'Pleno',
    false
) RETURNING *;

-- 7. Ver candidatos recém-criados
SELECT id, name, email, candidate_stage, trashed, created_at
FROM public.candidates
ORDER BY created_at DESC
LIMIT 5;
