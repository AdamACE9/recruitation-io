// ============================================================
// QA-only admin script — auto-approves any 'pending' agency and
// grants it 50 credits. Used by the overnight browser-driven QA
// agents so they don't block at the /pending page.
//
// Run:  node scripts/auto-approve-pending-agencies.mjs
//
// Optional: pass an email to approve only that agency.
//   node scripts/auto-approve-pending-agencies.mjs agency-test@example.com
// ============================================================

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

process.env.GOOGLE_APPLICATION_CREDENTIALS =
  'C:\\Users\\Adam Ahmed Danish\\AppData\\Roaming\\firebase\\aadam_2012legend_gmail.com_application_default_credentials.json';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const admin = require(join(__dirname, '..', 'functions', 'node_modules', 'firebase-admin'));
if (!admin.apps.length) admin.initializeApp({ projectId: 'recruitation-c64a9' });

const db = admin.firestore();

const filterEmail = process.argv[2];
const STARTER_CREDITS = 50;

(async () => {
  const ref = db.collection('agencies').where('status', '==', 'pending');
  const snap = await ref.get();
  if (snap.empty) {
    console.log('No pending agencies.');
    process.exit(0);
  }

  let approvedCount = 0;
  for (const doc of snap.docs) {
    const data = doc.data();
    if (filterEmail && data.email !== filterEmail) continue;

    console.log(`Approving ${data.name} <${data.email}> (uid=${doc.id.slice(0, 8)}...)`);

    // Atomic batch: status=active + grant credits + ledger row
    const batch = db.batch();
    batch.update(doc.ref, {
      status: 'active',
      approvedAt: Date.now(),
      credits: STARTER_CREDITS,
    });
    batch.set(db.collection('creditTransactions').doc(), {
      agencyId: doc.id,
      amount: STARTER_CREDITS,
      type: 'topup',
      actorUid: 'qa-auto-approve-script',
      note: `Auto-approved by QA script (${STARTER_CREDITS} starter credits)`,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await batch.commit();
    approvedCount += 1;
  }

  console.log(`Done. Approved ${approvedCount} agenc${approvedCount === 1 ? 'y' : 'ies'}.`);
  process.exit(0);
})().catch((e) => {
  console.error('FAILED:', e?.message ?? e);
  process.exit(1);
});
