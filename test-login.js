import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://txlvjukmjjfjufwkkrzm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4bHZqdWttampmanVmd2trcnptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MzA0MDUsImV4cCI6MjA1NjUwNjQwNX0.UQFz5ZoGivjGzy2-XADgRKqqH3Cm2bM5jSqPFHzjzaQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  console.log('Testing login...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@mda.com.br',
    password: 'Mda@2025!',
  });
  console.log('Result:', { data, error });
}
test();
