-- FIX NUCLEAR PARA PERSISTÊNCIA DE NOTAS E CANDIDATOS
-- Execute este script no SQL Editor do Supabase para corrigir todos os problemas de salvamento.

-- 1. Garante que a coluna 'notes' existe e é do tipo correto (JSONB)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidates' AND column_name = 'notes') THEN
        ALTER TABLE public.candidates ADD COLUMN notes JSONB DEFAULT '[]'::jsonb;
    ELSE
        -- Se já existe, garante que o default é []
        ALTER TABLE public.candidates ALTER COLUMN notes SET DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- 2. Limpa políticas RLS antigas conflitantes (Reset Seguro)
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.candidates;
DROP POLICY IF EXISTS "Public Full Access" ON public.candidates;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.candidates;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.candidates;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.candidates;

-- 3. Habilita RLS (Row Level Security) - Importante: Se estiver desativado, o Supabase pode bloquear por segurança
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- 4. Cria uma política Permissiva Definitiva para usuários logados
CREATE POLICY "Allow all operations for authenticated users"
ON public.candidates
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Garante permissões para a role anon e service_role (caso use API key publica)
GRANT ALL ON TABLE public.candidates TO anon;
GRANT ALL ON TABLE public.candidates TO authenticated;
GRANT ALL ON TABLE public.candidates TO service_role;

-- 6. Correção de dados nulos existentes nas notas
UPDATE public.candidates 
SET notes = '[]'::jsonb 
WHERE notes IS NULL OR notes = 'null'::jsonb;

-- 7. Teste de Verificação (Retorna se a coluna existe e se há uma política ativa)
SELECT 
    c.column_name, 
    c.data_type,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'candidates') as active_policies
FROM information_schema.columns c
WHERE table_name = 'candidates' AND column_name = 'notes';
