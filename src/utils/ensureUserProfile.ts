
import { supabase } from "@/integrations/supabase/client";

export async function ensureUserProfile() {
  // Obter dados do usuário atual usando getUser (mais confiável que getSession)
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    console.error('Usuário não autenticado:', userError);
    throw new Error('Usuário não autenticado. Faça login para continuar.');
  }

  const userId = userData.user.id;
  console.log('Verificando perfil para o usuário:', userId);

  // Verificar se o perfil já existe
  const { data: existingProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (fetchError) {
    console.error('Erro ao verificar perfil:', fetchError);
    throw new Error(`Erro ao verificar perfil: ${fetchError.message}`);
  }

  // Se o perfil já existe, retorne o ID do usuário
  if (existingProfile) {
    console.log('Perfil já existente para o usuário:', userId);
    return userId;
  }

  // Se não existir, cria o perfil
  const { error: insertError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      full_name: userData.user.user_metadata?.full_name || 'Usuário',
      email: userData.user.email || '',
      role: 'producao' // papel padrão
    });

  if (insertError) {
    console.error('Erro ao criar perfil:', insertError);
    throw new Error(`Não foi possível criar o perfil do usuário: ${insertError.message}`);
  }

  console.log('✅ Perfil criado com sucesso para o usuário:', userId);
  return userId;
}
