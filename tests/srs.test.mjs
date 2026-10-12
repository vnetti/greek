import test from 'node:test';
import assert from 'node:assert/strict';
import { check, grade, schedule, draft, queue, newWaiting, newRoom, entryDay, nextStats, alive, news, NEW_PER_DAY } from '../js/srs.js';

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

test('streak history: grades per day, old docs get their streak days seeded', () => {
  let s = nextStats({ last: 9, streak: 2, best: 2 }, 10); // doc from before history
  assert.deepEqual(s.days, { 8: 0, 9: 0, 10: 1 });
  s = nextStats(s, 10); assert.equal(s.days[10], 2); assert.equal(s.streak, 3);
  assert.equal(nextStats(s, 9).last, 10); // clock went back: no reset
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
