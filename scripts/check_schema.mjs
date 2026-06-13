import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('tools').select('id').limit(1);
  if (error) {
    console.error('Error fetching tool:', error);
  } else {
    console.log('Tools table ID column type check:');
    console.log(data);
  }
}

main();
