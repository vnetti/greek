// Hourly (see .github/workflows/remind.yml): push a reminder to users whose chosen local hour is now,
// who haven't reviewed today and have cards due. Mirrors the app's schedule rules in index.html.
// The repo is public, so its logs are too: never log user ids, emails or tokens.
const DIRS = ['gr2ru', 'ru2gr', 'listen'], NEW_PER_DAY = 10;

const plural = (n, one, few, many) => n + ' ' + (n % 10 === 1 && n % 100 !== 11 ? one
  : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? few : many);

// Cards due on `day`, counting at most NEW_PER_DAY new cards (oldest first), like queue() in the app.
export function dueCount(cards, day) {
  const live = cards.filter(c => !c.pending).map(c => ({ ...c, listen: c.listen ?? { box: 0, due: c.ru2gr.due + 1 } }));
  const isNew = c => c.introduced == null && DIRS.every(d => c[d].box === 0);
  const due = c => DIRS.filter(d => c[d].due <= day).length;
  const fresh = live.filter(isNew).sort((a, b) => a.id < b.id ? -1 : 1).slice(0, NEW_PER_DAY);
  return [...live.filter(c => !isNew(c)), ...fresh].reduce((n, c) => n + due(c), 0);
}

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
