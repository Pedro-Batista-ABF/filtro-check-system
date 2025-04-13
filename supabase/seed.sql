
-- Verificar se o bucket já existe e criar se não existir
DO $$
BEGIN
    -- Verificar se o bucket existe
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'sector_photos'
    ) THEN
        -- Criar o bucket se não existir
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('sector_photos', 'Fotos dos Setores', true);
    END IF;
END
$$;

-- Adicionar políticas de acesso público diretamente na tabela objects para o bucket sector_photos
-- Estas substituem as políticas antigas que podiam usar tables diferentes dependendo da versão do Supabase

-- Permitir SELECT a todos
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
CREATE POLICY "Allow public read access" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'sector_photos');

-- Permitir INSERT a todos
DROP POLICY IF EXISTS "Allow public insert access" ON storage.objects;
CREATE POLICY "Allow public insert access" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'sector_photos');

-- Permitir UPDATE a todos 
DROP POLICY IF EXISTS "Allow public update access" ON storage.objects;
CREATE POLICY "Allow public update access" 
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'sector_photos');

-- Permitir DELETE a todos
DROP POLICY IF EXISTS "Allow public delete access" ON storage.objects;
CREATE POLICY "Allow public delete access" 
    ON storage.objects FOR DELETE
    USING (bucket_id = 'sector_photos');
