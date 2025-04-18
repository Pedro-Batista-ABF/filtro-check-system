
/**
 * Extrai o caminho do arquivo do Supabase Storage a partir da URL pública
 */
export const extractPathFromUrl = (url: string): string | null => {
  if (!url) return null;
  
  try {
    // Formato padrão: https://xxxx.supabase.co/storage/v1/object/public/sector_photos/folder/file.jpg
    const storageMatch = url.match(/storage\/v1\/object\/public\/([^?]+)/);
    if (storageMatch && storageMatch[1]) {
      return storageMatch[1];
    }
    
    // Formato alternativo: https://xxxx.supabase.co/storage/v1/object/sector_photos/folder/file.jpg
    const urlParts = url.split('/object/public/');
    if (urlParts.length > 1) {
      return urlParts[1];
    }
    
    // Alternativa se o formato for diferente
    const match = url.match(/sector_photos\/([^?]+)/);
    if (match && match[1]) {
      return match[1];
    }
    
    console.error("Formato de URL não reconhecido:", url);
    return null;
  } catch (e) {
    console.error('Erro ao extrair caminho da URL:', e);
    return null;
  }
};

/**
 * Verifica se uma URL é válida
 */
export const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};
