import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qxsnycmufxgqqgirfmdm.supabase.co';
const supabaseKey = 'sb_publishable_TpXM_pfajD_M6I3ZSZRRjw_n6dVqiMb';

export const supabase = createClient(supabaseUrl, supabaseKey);
