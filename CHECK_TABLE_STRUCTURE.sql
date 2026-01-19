-- VERIFICAR ESTRUTURA COMPLETA DA TABELA CANDIDATES
-- Execute este script para ver EXATAMENTE quais colunas existem

SELECT 
    column_name,
    data_type,
    character_maximum_length,
    column_default,
    is_nullable,
    udt_name
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'candidates'
ORDER BY ordinal_position;

-- Ver constraints e chaves
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'candidates'
ORDER BY tc.constraint_type, tc.constraint_name;
