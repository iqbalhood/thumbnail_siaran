import { createAdminClient } from '../lib/supabase/server';

async function seed() {
  const supabase = createAdminClient();

  console.log('🌱 Seeding database...');

  // 1. Seed Presenters
  const presentersToSeed = [{ name: 'Dimas' }, { name: 'Ammar' }];
  
  for (const presenter of presentersToSeed) {
    const { error: pError } = await supabase
      .from('presenters')
      .upsert(presenter, { onConflict: 'name' });

    if (pError) {
      console.error(`❌ Error seeding presenter ${presenter.name}:`, pError.message);
    } else {
      console.log(`✅ Presenter seeded: ${presenter.name}`);
    }
  }

  // 2. Seed Branding Settings (Singleton)
  const brandingId = '00000000-0000-0000-0000-000000000001';
  const { error: brandingError } = await supabase
    .from('branding_settings')
    .upsert({ id: brandingId }, { onConflict: 'id' });

  if (brandingError) {
    console.error('❌ Error seeding branding settings:', brandingError.message);
  } else {
    console.log('✅ Branding settings initialized');
  }

  console.log('✨ Seeding complete!');
}

seed().catch((err) => {
  console.error('❌ Unexpected error during seeding:', err);
  process.exit(1);
});
