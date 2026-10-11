import test from 'node:test';
import assert from 'node:assert/strict';
import { check, grade, schedule, draft, queue, newWaiting, newRoom, entryDay, nextStats, NEW_PER_DAY } from '../js/srs.js';

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
  assert.equal(nextStats(s9, 10).streak, 5); assert.equal(nextStats(s9, 10).best, 5); assert.equal(nextStats(s9, 9), s9);
  assert.equal(nextStats({ last: 7, streak: 4, best: 6 }, 10).streak, 1); assert.equal(nextStats({ last: 7, streak: 4, best: 6 }, 10).best, 6);
});
