import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_ANALYTICS_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.ANALYTICS_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  // Query supabase database schema tables
  // Let's run a select on information_schema.tables if possible, or try fetching from potential table names
  const { data, error } = await supabase.rpc('get_tables'); // sometimes there's an RPC or we can write one.
  if (error) {
    console.log('RPC get_tables failed, which is normal. Let\'s query information_schema via standard query if permitted.');
  }

  // Let's check common table names: 'ai_clips_transcripts', 'transcripts', 'captions', 'clip_captions', 'ai_clip_captions'
  const tablesToCheck = ['ai_clips_transcripts', 'transcripts', 'captions', 'clip_captions', 'ai_clips_captions'];
  for (const t of tablesToCheck) {
    const { error: e } = await supabase.from(t).select('id').limit(1);
    if (!e) {
      console.log(`Table ${t} exists!`);
    } else {
      console.log(`Table ${t} check failed:`, e.message);
    }
  }
}

main();
