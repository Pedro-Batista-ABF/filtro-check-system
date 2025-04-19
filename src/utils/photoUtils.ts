
/**
 * Verifica se uma URL é válida
 */
export function isValidUrl(urlString?: string): boolean {
  if (!urlString) return false;
  
  try {
    // Verificar se é uma URL de dados
    if (urlString.startsWith('data:')) return true;
    
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
    // Verificar se é uma URL de dados
    if (url.startsWith('data:')) return url;
    
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
 * Corrigido para lidar corretamente com caminhos duplicados
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
    
    let fullPath = parts[1];
    
    // Verificar se temos o nome do bucket
    if (!fullPath.includes('/')) {
      console.warn('Caminho inválido ou incompleto:', fullPath);
      return null;
    }
    
    // Extrair o caminho removendo bucket_name/
    const pathParts = fullPath.split('/', 1);
    const bucketName = pathParts[0];
    const filePath = fullPath.substring(bucketName.length + 1);
    
    // Para o bucket sector_photos, verificar duplicações
    if (bucketName === 'sector_photos') {
      // Verificar padrão sector_photos/sector_photos/
      if (filePath.startsWith('sector_photos/')) {
        console.log('Detectada duplicação de caminho em: ' + fullPath);
        return filePath;
      }
    }
    
    return fullPath;
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
    
    // Verificar e remover duplicação em sector_photos/sector_photos
    if (pathname.indexOf('/sector_photos/sector_photos/') !== -1) {
      console.log('Corrigindo caminho duplicado:', pathname);
      const correctedPath = pathname.replace('/sector_photos/sector_photos/', '/sector_photos/');
      return url.replace(pathname, correctedPath);
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
