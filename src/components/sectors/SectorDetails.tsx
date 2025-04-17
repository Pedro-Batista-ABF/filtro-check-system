
// Assuming this file exists, let's fix the type issue with the query
import { supabase } from '@/integrations/supabase/client';

// Replace the problematic query
const { data } = await supabase
  .from('cycle_services')
  .select('*')
  .eq('cycle_id', cycleId as any);
