// Patch existing job docs that were stored with `id: ''` in their body.
// Removes the field so subsequent reads return the correct doc id.
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

process.env.GOOGLE_APPLICATION_CREDENTIALS =
  'C:\\Users\\Adam Ahmed Danish\\AppData\\Roaming\\firebase\\aadam_2012legend_gmail.com_application_default_credentials.json';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const admin = require(join(__dirname, 'functions', 'node_modules', 'firebase-admin'));
if (!admin.apps.length) admin.initializeApp({ projectId: 'recruitation-c64a9' });

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

const snap = await db.collection('jobs').get();
let patched = 0;
for (const doc of snap.docs) {
  const data = doc.data();
  // Patch any doc whose `id` field is missing or doesn't match the actual doc id.
  // (`id: ''` from old createJob; `id: 'something-stale'` would also be wrong.)
  if (data.id === undefined || data.id !== doc.id) {
    await doc.ref.update({ id: FieldValue.delete() });
    patched += 1;
    console.log(`Patched ${doc.id} (was id="${data.id}")`);
  }
}
console.log(`\nDone. ${patched}/${snap.size} jobs patched.`);

// Same fix for orphan applications that have jobId: ''
const apps = await db.collection('applications').get();
let badApps = 0;
for (const a of apps.docs) {
  if (a.data().jobId === '') {
    badApps += 1;
    console.log(`Bad app: ${a.id} candidateUid=${a.data().candidateUid?.slice(0, 8)} agencyId=${a.data().agencyId?.slice(0, 8)} — DELETING (orphan)`);
    await a.ref.delete();
  }
}
console.log(`${badApps} orphan applications deleted.`);

process.exit(0);
