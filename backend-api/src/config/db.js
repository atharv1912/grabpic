import {createClient} from '@supabase/supabase-js'  ;
import env from 'dotenv';
env.config();

export const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

