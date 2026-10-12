import test from 'node:test';
import assert from 'node:assert/strict';
import { check, grade, schedule, draft, queue, newWaiting, newRoom, entryDay, nextStats, NEW_PER_DAY,
  stage, learnedDay, addedDay, weekly, weekStart, dayOf,
  alive, news } from '../js/srs.js';

const day = 1000;

test('answer check: article, case, ς, accents', () => {
  assert.equal(check('καλημέρα', 'η καλημέρα'), 'ok');
  assert.equal(check(' Καλημερα ', 'η καλημέρα'), 'accent');
  assert.equal(check('καλησπέρα', 'η καλημέρα'), 'bad');
  assert.equal(check('ο δρόμοσ', 'ο δρόμος'), 'ok');
});

test('grading moves along the stations, a miss goes back to the depot', () => {
  const d = { box: 0, due: 0 };
  grade(d, true, day); assert.equal(d.due, day + 1);
  grade(d, true, day); assert.equal(d.due, day + 3);
  grade(d, false, day); assert.equal(d.box, 0); assert.equal(d.due, day + 1);
});

test('new-per-day limit, drafts and entry day', () => {
  // 12 fresh cards, only gr2ru is due today
  const cards = Array.from({ length: 12 }, (_, i) => ({ id: 'a' + String(i).padStart(2, '0'), ...schedule(day) }));
  assert.equal(queue(cards, day).length, NEW_PER_DAY); assert.equal(newWaiting(cards, day), 2);
  cards[0].introduced = day; // one seen today: still 10 today in total, one less waiting
  assert.equal(queue(cards, day).length, NEW_PER_DAY); assert.equal(newWaiting(cards, day), 2);
  assert.equal(newRoom(cards, day), NEW_PER_DAY - 1);
  cards.push(draft('x', day)); assert.equal(queue(cards, day).length, NEW_PER_DAY); // drafts never enter review
  assert.equal(entryDay(cards, cards[0], day), day); assert.equal(entryDay(cards, cards[1], day), day); // introduced / within today's room
  assert.equal(entryDay(cards, cards[11], day), day + 1); // 11th new card with room 9 → tomorrow
});

test('streak: first day, next day, same day, gap', () => {
  assert.equal(nextStats({}, 10).streak, 1);
  const s9 = { last: 9, streak: 4, best: 4 };
  assert.equal(nextStats(s9, 10).streak, 5); assert.equal(nextStats(s9, 10).best, 5); assert.equal(nextStats(s9, 9).streak, 4);
  assert.equal(nextStats({ last: 7, streak: 4, best: 6 }, 10).streak, 1); assert.equal(nextStats({ last: 7, streak: 4, best: 6 }, 10).best, 6);
});

test('stats: stage, learned day, added day, weekly buckets', () => {
  const at = (g, r, l, due = day + 7) => ({ gr2ru: { box: g, due }, ru2gr: { box: r, due }, listen: { box: l, due } });
  assert.equal(stage({ id: 'n', ...schedule(day) }), 'new');
  assert.equal(stage(draft('x', day)), 'new');
  assert.equal(stage({ id: 'g', introduced: day - 5, ...at(3, 3, 2) }), 'going');
  assert.equal(stage({ id: 'k', introduced: day - 5, ...at(3, 4, 3) }), 'known');
  // all lines just reached the 7-day station (due in 7) → learned today; one station further on time → a week earlier
  assert.equal(learnedDay({ id: 'k', ...at(3, 3, 3) }), day);
  assert.equal(learnedDay({ id: 'k', ...at(4, 4, 4, day + 14) }), day - 7);
  assert.equal(learnedDay({ id: 'k', ...at(4, 4, 4, day + 14), gr2ru: { box: 3, due: day + 7 } }), day); // the latest line decides
  assert.equal(learnedDay({ id: 'k', learned: day - 30, ...at(0, 3, 3) }), day - 30); // the stamp survives slipping back
  assert.equal(learnedDay({ id: 'g', introduced: day, ...at(1, 1, 1) }), undefined);
  // added: the id's base36 Date.now() prefix; ids that don't parse fall back to the first review
  const ms = Date.UTC(2026, 0, 15, 12);
  assert.equal(addedDay({ id: ms.toString(36) + 'abc' }), dayOf(ms));
  assert.equal(addedDay({ id: 'a1', introduced: 42 }), 42);
  // weeks start on Monday: 12 Oct 2026 is one
  const mon = dayOf(Date.UTC(2026, 9, 12, 12));
  assert.equal(weekStart(mon), mon); assert.equal(weekStart(mon + 6), mon); assert.equal(weekStart(mon + 7), mon + 7);
  const w = weekly([{ id: 'x', introduced: mon - 7, learned: mon + 2, ...at(0, 0, 0) }, { id: 'y', introduced: mon - 100, ...at(0, 0, 0) }], mon + 3, 3);
  assert.deepEqual(w.map(x => [x.start - mon, x.added, x.learned]), [[-14, 0, 0], [-7, 1, 0], [0, 0, 1]]);
});

test('streak history: a mark per day, old docs get their streak days seeded, no change → same object', () => {
  let s = nextStats({ last: 9, streak: 2, best: 2 }, 10); // doc from before history
  assert.deepEqual(s.days, { 8: 1, 9: 1, 10: 1 });
  assert.equal(nextStats(s, 10), s); // today already marked: same object, so no write
  assert.equal(nextStats(s, 9), s); // clock went back: no reset, no stray calendar day
  const old = { last: 10, streak: 2, best: 2 }; // same day, doc from before history: seeded once
  assert.deepEqual(nextStats(old, 10).days, { 9: 1, 10: 1 }); assert.equal(nextStats(old, 10).streak, 2);
});

test('freezes: earned every 7th day, max 2, spent per missed day, kept on reset', () => {
  let s = {};
  for (let t = 1; t <= 7; t++) s = nextStats(s, t);
  assert.equal(s.freezes, 1);
  for (let t = 8; t <= 21; t++) s = nextStats(s, t);
  assert.equal(s.freezes, 2); // 7, 14, 21 → capped at 2
  assert.ok(alive(s, 24)); assert.ok(!alive(s, 25)); // 2 missed days still coverable, 3 not
  const two = nextStats(s, 24); // 22 and 23 missed
  assert.equal(two.streak, 22); assert.equal(two.freezes, 0); assert.deepEqual(two.frozen, [22, 23]);
  assert.deepEqual(news(two, 24), { milestone: 0, froze: 2 });
  assert.deepEqual(news({ ...two, seen: 24 }, 24), {});
  const one = nextStats({ ...s, freezes: 1 }, 23); assert.equal(one.freezes, 0); assert.deepEqual(one.frozen, [22]);
  const reset = nextStats(s, 25); assert.equal(reset.streak, 1); assert.equal(reset.freezes, 2); assert.deepEqual(reset.frozen, []);
  assert.ok(!alive({}, 5));
});

test('news: milestone on the day it is reached', () => {
  let s = {};
  for (let t = 1; t <= 3; t++) s = nextStats(s, t);
  assert.deepEqual(news(s, 3), { milestone: 3, froze: 0 });
  assert.deepEqual(news(nextStats(s, 4), 4), { milestone: 0, froze: 0 });
});
