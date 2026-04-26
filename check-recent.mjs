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

console.log('=== Recent candidates (last 8) ===');
const cs = await db.collection('candidates').orderBy('createdAt', 'desc').limit(8).get();
cs.forEach((d) => {
  const x = d.data();
  console.log(' -', d.id.slice(0, 10) + '...', '|', x.email, '|', x.name, '| photoUrl:', x.photoUrl ? 'SET' : 'NONE');
});

console.log('\n=== Recent applications (last 6) ===');
const as = await db.collection('applications').orderBy('createdAt', 'desc').limit(6).get();
as.forEach((d) => {
  const a = d.data();
  console.log(' -', d.id.slice(0, 10) + '... | name:', a.candidateName ?? 'MISSING',
    '| jobId:', (a.jobId ?? '').slice(0, 10),
    '| candUid:', (a.candidateUid ?? '').slice(0, 10),
    '| agencyId:', (a.agencyId ?? '').slice(0, 10),
    '| prep.status:', a.interviewPrep?.status,
    '| prep.error:', a.interviewPrep?.error ? a.interviewPrep.error.slice(0, 80) : 'none');
});

console.log('\n=== Recent Firebase Auth users (last 8) ===');
const users = await admin.auth().listUsers(8);
users.users.forEach((u) => {
  console.log(' -', u.uid.slice(0, 10) + '...', '|', u.email, '|', u.displayName ?? '(no name)', '|', u.metadata.creationTime);
});

process.exit(0);
