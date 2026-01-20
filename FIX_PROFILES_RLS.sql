-- CORREÇÃO CRÍTICA DE RLS (TABELA PROFILES)
-- O erro "Infinite Splash" ocorre porque a leitura do perfil está travando (timeout).
-- Isso geralmente acontece quando uma política RLS entra em loop infinito (recursão).

-- 1. Remover TODAS as políticas antigas da tabela profiles param limpar qualquer recursão
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;

-- 2. Habilitar RLS (caso não esteja)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Criar uma política SIMPLES e SEGURA (Sem recursão)
-- Permite que usuários leiam apenas seu próprio perfil
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 4. Permite que usuários atualizem apenas seu próprio perfil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- 5. Permite inserção para novos usuários (no primeiro login)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 6. (Opcional) Se Admin precisar ler tudo, usar uma política separada SEM JOIN na própria tabela profiles se possível,
-- ou garantir que não crie loop. Para garantir o login agora, vamos liberar leitura geral para autenticados TEMPORARIAMENTE
-- se a política acima não for suficiente (caso o usuário precise ler dados de outros users na UI).
-- DESCOMENTE A LINHA ABAIXO APENAS SE PRECISAR QUE TODOS LEIAM TODOS:
-- CREATE POLICY "Authenticated can read all profiles" ON profiles FOR SELECT TO authenticated USING (true);
