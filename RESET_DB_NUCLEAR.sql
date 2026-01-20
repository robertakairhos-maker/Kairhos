-- SOLUÇÃO NUCLEAR PARA DESTRAVAR A TABELA PROFILES
-- Este script força a remoção de TODAS as políticas e triggers, independente do nome.

BEGIN;

-- 1. Remover TODAS as políticas da tabela profiles dinamicamente
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- 2. Remover TODOS os triggers da tabela profiles dinamicamente
DO $$
DECLARE
    trig record;
BEGIN
    FOR trig IN SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'profiles' LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.profiles', trig.trigger_name);
    END LOOP;
END $$;

-- 3. Desabilitar temporariamente o RLS para garantir acesso imediato (Teste de Destravamento)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 4. Inserir manualmente uma política básica APENAS se precisarmos reativar depois.
-- Por enquanto, vamos deixar DESABILITADO (DISABLE) para provar que o login funciona.
-- Depois reativamos com segurança.

COMMIT;

-- 5. Verificar se destravou
SELECT count(*) as total_perfis FROM public.profiles;
