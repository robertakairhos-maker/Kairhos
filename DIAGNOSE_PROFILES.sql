-- DIAGNÓSTICO DE TRAVAMENTO (Tabela Profiles)
-- Execute este script para vermos o que exatamente está "pendurado" na tabela.

-- 1. Listar TODAS as Políticas RLS ativas na tabela profiles
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd AS command, -- SELECT, INSERT, UPDATE, DELETE
    qual AS condition,
    with_check AS check_condition
FROM pg_policies
WHERE tablename = 'profiles';

-- 2. Listar TODOS os Gatilhos (Triggers) na tabela profiles
-- (Triggers mal configurados causam loops infinitos)
SELECT 
    event_object_table AS table_name,
    trigger_name,
    event_manipulation AS event,
    action_statement AS action
FROM information_schema.triggers
WHERE event_object_table = 'profiles';

-- 3. Verificar status do RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';
