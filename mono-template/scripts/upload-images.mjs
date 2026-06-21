import { readFileSync } from 'fs';
import { join } from 'path';
import { env } from 'process';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://upcrqpiotnrybbcazwso.supabase.co';
const PICTURES_DIR = 'C:\\Users\\filali\\Desktop\\open code\\Pictures of our product types';

const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};

const FILE_MAP = [
  { local: 'Basic bedrooms.jpg',    bucket: 'main-bedroom',    saveAs: 'main-bedroom.jpg' },
  { local: 'Basic bedrooms.webp',   bucket: 'main-bedroom',    saveAs: 'main-bedroom.webp' },
  { local: "Children's bedrooms.jpg", bucket: 'kids-bedroom',  saveAs: 'kids-bedroom.jpg' },
  { local: 'Dining room.jpg',       bucket: 'salle-a-manger',  saveAs: 'salle-a-manger.jpg' },
  { local: 'Lockers.jpg',           bucket: 'armoires',        saveAs: 'armoires.jpg' },
  { local: 'Mattresses.jpg',        bucket: 'matelas',         saveAs: 'matelas.jpg' },
  { local: 'Salons.jpg',            bucket: 'salons',          saveAs: 'salons.jpg' },
  { local: 'Wall clocks.jpg',       bucket: 'horloges',        saveAs: 'horloges.jpg' },
];

async function main() {
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment.');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, serviceRoleKey);

  let success = 0;
  let failed = 0;

  for (const { local, bucket, saveAs } of FILE_MAP) {
    const filePath = join(PICTURES_DIR, local);
    let buffer;
    try {
      buffer = readFileSync(filePath);
    } catch {
      console.error(`❌ File not found: ${filePath}`);
      failed++;
      continue;
    }

    const ext = saveAs.substring(saveAs.lastIndexOf('.')).toLowerCase();
    const contentType = MIME_TYPES[ext];
    if (!contentType) {
      console.error(`❌ ${local} → unsupported extension "${ext}"`);
      failed++;
      continue;
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${saveAs}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(saveAs, buffer, { contentType, upsert: true });

    if (error) {
      console.error(`❌ ${local} → ${error.message}`);
      failed++;
    } else {
      console.log(`✅ ${local} → ${publicUrl}`);
      success++;
    }
  }

  console.log(`\nDone: ${success} uploaded, ${failed} failed`);
}

main();
