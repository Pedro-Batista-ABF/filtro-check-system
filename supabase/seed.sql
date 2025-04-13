
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
        
        -- Criar políticas de acesso público para o bucket
        -- Permitir leitura a todos
        INSERT INTO storage.policies (name, definition, bucket_id)
        VALUES (
            'Public Read Access',
            '(bucket_id = ''sector_photos''::text)',
            'sector_photos'
        );
        
        -- Permitir inserção a todos
        INSERT INTO storage.policies (name, definition, bucket_id, operation)
        VALUES (
            'Public Insert Access',
            '(bucket_id = ''sector_photos''::text)',
            'sector_photos',
            'INSERT'
        );
    END IF;
END
$$;
