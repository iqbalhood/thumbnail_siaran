import { createAdminClient } from '../lib/supabase/server';

async function checkStep2() {
  const supabase = createAdminClient();

  console.log('🔍 Checking Supabase tables...');

  // Check speakers table
  const { error: speakersError } = await supabase.from('speakers').select('count', { count: 'exact', head: true });
  if (speakersError) {
    console.error('❌ Table "speakers" not found or error:', speakersError.message);
  } else {
    console.log('✅ Table "speakers" exists');
  }

  // Check presenters table
  const { error: presentersError } = await supabase.from('presenters').select('count', { count: 'exact', head: true });
  if (presentersError) {
    console.error('❌ Table "presenters" not found or error:', presentersError.message);
  } else {
    console.log('✅ Table "presenters" exists');
  }

  // Check branding_settings table
  const { error: brandingError } = await supabase.from('branding_settings').select('count', { count: 'exact', head: true });
  if (brandingError) {
    console.error('❌ Table "branding_settings" not found or error:', brandingError.message);
  } else {
    console.log('✅ Table "branding_settings" exists');
  }

  if (!speakersError && !presentersError && !brandingError) {
    console.log('\n✨ Step 2 is fully completed and verified! Tables are ready.');
  } else {
    console.log('\n⚠️ Some tables are missing. Please ensure you have run the SQL in Supabase dashboard.');
  }
}

checkStep2().catch(console.error);
