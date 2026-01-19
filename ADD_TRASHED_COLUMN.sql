-- ADICIONAR COLUNA TRASHED À TABELA CANDIDATES
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar a coluna trashed se não existir
ALTER TABLE public.candidates 
ADD COLUMN IF NOT EXISTS trashed BOOLEAN DEFAULT FALSE;

-- 2. Atualizar candidatos existentes para garantir que não sejam null
UPDATE public.candidates 
SET trashed = FALSE 
WHERE trashed IS NULL;

-- 3. Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_candidates_trashed ON public.candidates(trashed);

-- 4. Verificar que a coluna foi adicionada
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'candidates' AND column_name = 'trashed';

-- 5. Ver alguns candidatos para confirmar
SELECT id, name, email, candidate_stage, trashed, created_at
FROM public.candidates
ORDER BY created_at DESC
LIMIT 5;
