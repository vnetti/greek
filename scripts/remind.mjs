// Hourly (see .github/workflows/remind.yml): push a reminder to users whose chosen local hour is now,
// who haven't reviewed today and have cards due. Schedule rules come from the app's js/srs.js.
// The repo is public, so its logs are too: never log user ids, emails or tokens.
import { DIRS, dueCount } from '../js/srs.js';
import { plural } from '../js/util.js';

export function message(n, stats, day) {
  const streak = stats.last === day - 1 ? stats.streak : 0; // alive, but today not done yet
  return plural(n, 'карточка ждёт', 'карточки ждут', 'карточек ждут') + ' повторения'
    + (streak ? ` · 🔥 серия ${plural(streak, 'день', 'дня', 'дней')}, не прерывай` : '');
}

async function main() {
  if (!process.env.FIREBASE_SA) return console.log('FIREBASE_SA secret is not set yet, nothing to do');
  const { initializeApp, cert } = await import('firebase-admin/app');
  const { getFirestore } = await import('firebase-admin/firestore');
  const { getMessaging } = await import('firebase-admin/messaging');
  initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SA)) });
  const db = getFirestore();
  let sent = 0, skipped = 0;
  for (const snap of (await db.collectionGroup('meta').get()).docs) {
    const { token, hour, tz } = snap.id === 'push' ? snap.data() : {};
    if (!token) continue;
    const local = Date.now() - tz * 6e4, day = Math.floor(local / 864e5); // same day numbering as today() in the app
    if (new Date(local).getUTCHours() !== hour) continue;
    const user = snap.ref.parent.parent;
    const stats = (await user.collection('meta').doc('stats').get()).data() ?? {};
    const cards = (await user.collection('cards').select(...DIRS, 'introduced', 'pending').get()).docs
      .map(d => ({ id: d.id, ...d.data() }));
    const n = stats.last === day ? 0 : dueCount(cards, day);
    if (!n) { skipped++; continue; }
    try {
      await getMessaging().send({ token, data: { title: 'Λέξεις', body: message(n, stats, day) }, webpush: { headers: { Urgency: 'high' } } });
      sent++;
    } catch (e) {
      console.log('send failed:', e.code);
      if (e.code === 'messaging/registration-token-not-registered') await snap.ref.update({ token: null }); // app was removed
    }
  }
  console.log(`sent ${sent}, nothing due or already practised: ${skipped}`);
}

if (process.argv[1]?.endsWith('remind.mjs')) await main();
