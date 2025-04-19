
/**
 * Verifica se uma URL é válida
 */
export function isValidUrl(urlString?: string): boolean {
  if (!urlString) return false;
  
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Adiciona um parâmetro para evitar cache em uma URL
 */
export function addNoCacheParam(url: string): string {
  if (!url) return url;
  
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('t', Date.now().toString());
    return urlObj.toString();
  } catch (e) {
    console.warn('URL inválida ao adicionar parâmetro de cache:', url);
    return url;
  }
}

/**
 * Verifica se uma string é uma URL de dados (data:image)
 */
export function isDataUrl(url?: string): boolean {
  return !!url && typeof url === 'string' && url.startsWith('data:');
}

/**
 * Extrai o caminho do arquivo da URL do Supabase Storage
 */
export function extractPathFromUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  
  try {
    // Não processar URLs de dados
    if (isDataUrl(url)) return null;
    
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Verificar se é uma URL do Supabase Storage
    if (!pathname.includes('/storage/v1/object/public/')) {
      return null;
    }
    
    // Extrair o caminho após o nome do bucket
    const parts = pathname.split('/storage/v1/object/public/');
    if (parts.length !== 2) return null;
    
    const fullPath = parts[1];
    
    // Verificar se já temos o prefixo 'sector_photos/'
    if (fullPath.startsWith('sector_photos/')) {
      return fullPath;
    }
    
    // Adicionar o prefixo se necessário
    return `sector_photos/${fullPath}`;
  } catch (e) {
    console.error('Erro ao extrair caminho da URL:', e);
    return null;
  }
}

/**
 * Corrige URLs com caminhos duplicados (problema comum)
 */
export function fixDuplicatedStoragePath(url: string): string {
  if (!url || typeof url !== 'string') return url;
  
  try {
    // Não processar URLs de dados
    if (isDataUrl(url)) return url;
    
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Verificar se é uma URL do Supabase Storage
    if (!pathname.includes('/storage/v1/object/public/')) {
      return url;
    }
    
    // Verificar duplicação do caminho sector_photos/sector_photos
    if (pathname.includes('/sector_photos/sector_photos/')) {
      return url; // Já está correto com o prefixo duplicado
    }
    
    // Verificar se falta o prefixo do bucket no caminho
    const parts = pathname.split('/storage/v1/object/public/');
    if (parts.length === 2) {
      const pathPart = parts[1];
      
      // Se o caminho não começa com 'sector_photos/', adicionar o prefixo
      if (!pathPart.startsWith('sector_photos/')) {
        const correctedPath = `/storage/v1/object/public/sector_photos/${pathPart}`;
        const correctedUrl = url.replace(pathname, correctedPath);
        return correctedUrl;
      }
    }
    
    return url;
  } catch (e) {
    console.warn('Erro ao corrigir caminho da URL:', e);
    return url;
  }
}

/**
 * Converte um arquivo para base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
