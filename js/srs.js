// Spaced repetition and answer checking. Pure: no DOM, no Firebase — node tests and scripts/remind.mjs import it.
// Whatever needs the deck or the day takes them as parameters; the app passes state.cards and today().
export const INTERVALS = [1, 3, 7, 14, 30, 60]; // days, indexed by box
export const DIRS = ['gr2ru', 'ru2gr', 'listen'];
export const NEW_PER_DAY = 10;

// cards made before listening mode get its schedule in memory, a day after the reverse one; stored on first grade
export const withListen = c => ({ ...c, listen: c.listen ?? { box: 0, due: c.ru2gr.due + 1 } });

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2); // time-ordered prefix
export const schedule = day => ({ gr2ru: { box: 0, due: day }, ru2gr: { box: 0, due: day + 1 }, listen: { box: 0, due: day + 2 } });
export const draft = (text, day) => ({ id: newId(), text, pending: true, ...schedule(day) });

const base = s => s.toLowerCase().normalize('NFC').replace(/ς/g, 'σ').replace(/[.,!?;·«»"]/g, '')
  .trim().replace(/\s+/g, ' ').replace(/^(ο|η|το|οι|τα|ο\/η)\s+/, '');
const loose = s => base(s).normalize('NFD').replace(/\p{M}/gu, '');
export const check = (answer, gr) => base(answer) === base(gr) ? 'ok' : loose(answer) === loose(gr) ? 'accent' : 'bad';
export function grade(d, ok, day) {
  if (ok) { d.due = day + INTERVALS[Math.min(d.box, INTERVALS.length - 1)]; d.box++; }
  else { d.box = 0; d.due = day + 1; }
}
// A card is new until first graded (then `introduced` = that day). At most NEW_PER_DAY new cards enter per day, oldest first.
export const isNew = c => !c.pending && c.introduced == null && DIRS.every(d => c[d].box === 0);
export const newRoom = (cards, day) => Math.max(0, NEW_PER_DAY - cards.filter(c => c.introduced === day).length);
export const newWaiting = (cards, day) => Math.max(0, cards.filter(isNew).length - newRoom(cards, day));
export const newCards = cards => cards.filter(isNew).sort((a, b) => a.id < b.id ? -1 : 1); // oldest first = order they enter
// Day a card enters review under the daily limit (assumes each day's limit gets used up).
export function entryDay(cards, c, day) {
  const i = newCards(cards).indexOf(c), room = newRoom(cards, day);
  return i < room ? day : day + Math.floor((i - room) / NEW_PER_DAY) + 1; // not new (i = -1) → today
}
export function queue(cards, day) {
  const fresh = new Set(newCards(cards).slice(0, newRoom(cards, day)));
  const a = cards.filter(c => !c.pending && (!isNew(c) || fresh.has(c)))
    .flatMap(c => DIRS.filter(d => c[d].due <= day).map(dir => ({ c, dir })));
  for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
// Reminder sender (scripts/remind.mjs): cards due on `day` straight from Firestore docs, same rules as the app's queue.
export const dueCount = (cards, day) => queue(cards.map(withListen), day).length;

// a day counts once at least one card was graded; the streak survives until the end of the next day
export function nextStats(s, t) {
  if (s.last === t) return s;
  const streak = s.last === t - 1 ? s.streak + 1 : 1;
  return { last: t, streak, best: Math.max(s.best ?? 0, streak) };
}
