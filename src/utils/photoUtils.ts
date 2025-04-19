
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
      return `sector_photos/${match[1]}`;
    }
    
    console.warn("Formato de URL não reconhecido:", url);
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

/**
 * Adiciona um timestamp ao URL para evitar cache
 */
export const addNoCacheParam = (url: string): string => {
  if (!url) return url;
  
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('t', Date.now().toString());
    return urlObj.toString();
  } catch (e) {
    // Se não conseguir processar como URL, retornar original com parâmetro
    return `${url}?t=${Date.now()}`;
  }
};

/**
 * Converte um Blob/File para Base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Verifica se uma URL de imagem é acessível
 * Implementação mais tolerante a erros - apenas faz a verificação básica
 */
export const checkImageExists = async (url: string): Promise<boolean> => {
  try {
    // Simplificando para tornar mais robusto - usar fetch com timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: controller.signal,
      mode: 'no-cors',
      cache: 'no-store'
    });
    
    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    console.warn('Erro ao verificar se imagem existe:', error);
    return false;
  }
};

/**
 * Retorna um placeholder para imagens que falharam ao carregar
 */
export const getImagePlaceholder = (): string => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmM2YzZjMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5JbWFnZW0gaW5kaXNwb27DrXZlbDwvdGV4dD48L3N2Zz4=';
};

/**
 * Verifica se uma URL é um Data URL (base64)
 */
export const isDataUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  return url.startsWith('data:');
};
