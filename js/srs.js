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

// Streak, users/{uid}/meta/stats: { last, streak, best, days: { [day]: grades }, frozen: [day…], freezes, seen }.
// A day counts once at least one card was graded. Every FREEZE_EVERY-th streak day banks a freeze (at most FREEZE_MAX);
// practising after missed days spends one per missed day if enough are banked (those days become frozen), else the streak restarts.
// days: grades per practised day (0 = practised before history was kept); seen: the day home last showed news (below).
export const MILESTONES = [3, 7, 14, 30, 50, 100, 365], FREEZE_EVERY = 7, FREEZE_MAX = 2;
const gap = (s, t) => s.last == null ? Infinity : t - s.last - 1; // missed days since the last practised one
export const alive = (s, t) => gap(s, t) <= (s.freezes ?? 0); // still going if banked freezes cover the gap
export function nextStats(s, t) {
  const days = { ...(s.days ?? Object.fromEntries(Array.from({ length: s.streak ?? 0 }, (_, i) => [s.last - i, 0]))) };
  days[t] = (days[t] ?? 0) + 1;
  if (t <= s.last) return { ...s, days }; // same day (or the clock went back): only count the grade
  const g = gap(s, t), keep = alive(s, t), streak = keep ? s.streak + 1 : 1;
  const frozen = [...(s.frozen ?? []), ...(keep ? Array.from({ length: g }, (_, i) => s.last + 1 + i) : [])];
  const freezes = Math.min(FREEZE_MAX, (s.freezes ?? 0) - (keep ? g : 0) + (streak % FREEZE_EVERY ? 0 : 1));
  return { ...s, last: t, streak, best: Math.max(s.best ?? 0, streak), days, frozen, freezes };
}
// What home tells once, on the day it happened: a milestone reached today, freezes spent today (the frozen run right before it).
export function news(s, t) {
  if (s.last !== t || s.seen === t) return {};
  let froze = 0; while (s.frozen?.includes(t - 1 - froze)) froze++;
  return { milestone: MILESTONES.includes(s.streak) ? s.streak : 0, froze };
}

// Statistics. A word is «выучено» once every line has reached the 7-day station (box ≥ LEARNED_BOX): it has been recalled
// on all three lines after a 3-day gap, so its next show is a week away. Below that it is «в пути»; never shown yet, «новое».
export const LEARNED_BOX = 3;
export const stage = c => c.pending || isNew(c) ? 'new' : DIRS.every(d => c[d].box >= LEARNED_BOX) ? 'known' : 'going';
export const dayOf = ms => Math.floor((ms - new Date(ms).getTimezoneOffset() * 6e4) / 864e5); // same local day as util.today()
// day added: the id's base36 Date.now() prefix; an id that doesn't parse to a sane date falls back to the first review
export function addedDay(c) {
  const ms = parseInt(c.id.slice(0, 8), 36);
  return ms > 1.6e12 && ms < 4e12 ? dayOf(ms) : c.introduced;
}
// `learned` is stamped in review the first time a word becomes known and kept if it slips back. Words known before the
// stamp existed get an estimate: on each line, walk back from the due day along on-time reviews to the grade that
// reached the 7-day station; the word was learned when the last line got there (late reviews make the real day earlier).
export function learnedDay(c) {
  if (c.learned != null || stage(c) !== 'known') return c.learned;
  const iv = k => INTERVALS[Math.min(k, INTERVALS.length - 1)];
  return Math.max(...DIRS.map(d => { let g = c[d].due - iv(c[d].box - 1); for (let k = c[d].box - 2; k >= LEARNED_BOX - 1; k--) g -= iv(k); return g; }));
}
// the last n Monday-based weeks, oldest first: how many words were added and learned in each
export const weekStart = day => day - (day + 3) % 7; // day 0, 1 Jan 1970, was a Thursday
export function weekly(cards, day, n) {
  const w0 = weekStart(day) - 7 * (n - 1), weeks = Array.from({ length: n }, (_, i) => ({ start: w0 + 7 * i, added: 0, learned: 0 }));
  const put = (d, k) => { const i = Math.floor((d - w0) / 7); if (i >= 0 && i < n) weeks[i][k]++; }; // d null → NaN → skipped
  cards.forEach(c => { put(addedDay(c), 'added'); put(learnedDay(c), 'learned'); });
  return weeks;
}
