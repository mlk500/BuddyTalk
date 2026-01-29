import { createClient } from '@supabase/supabase-js';

// Read from environment variables (falls back to hardcoded values for compatibility)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qxsnycmufxgqqgirfmdm.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_TpXM_pfajD_M6I3ZSZRRjw_n6dVqiMb';

export const supabase = createClient(supabaseUrl, supabaseKey);
