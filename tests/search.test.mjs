import test from 'node:test';
import assert from 'node:assert/strict';
import { matcher, searchKeys, findCard } from '../js/search.js';

const finds = (q, c) => matcher(q)(searchKeys(c));
const sea = { gr: 'η θάλασσα', ru: 'море', tr: 'и ТХА-ла-са' }, morning = { gr: 'η καλημέρα', ru: 'доброе утро', tr: 'ка-ли-МЭ-ра' };
const thanks = { gr: 'ευχαριστώ', ru: 'спасибо', tr: 'эф-ха-ри-СТО' }, oven = { gr: 'ο φούρνος', ru: 'пекарня, печь', tr: 'о ФУР-нос' };
const all = (qs, c, want = true) => { for (const q of qs) assert.equal(finds(q, c), want, q); };

test('sound, transcription, accents, case, article, layout slips, typos', () => {
  all(['таласса', 'тхалас', 'thalassa', 'thalasa', 'θαλασσα', 'ΘΑΛΑΣΣΑ', 'θαλ', 'η θαλασσα', 'море', 'МОРЕ', 'vjht', 'ωξητ', 'ualassa', 'гфдфыыф'], sea);
  all(['калимера', 'калимэра', 'kalimera', 'KALIMERA', 'kalhmera', 'καλημερα', 'rfkbvthf'], morning);
  all(['efharisto', 'eucharisto', 'evcharisto', 'эфхаристо', 'ευχαριστω'], thanks);
  all(['fournos', 'furnos', 'фурнос', 'пекарн', 'пекарня печь'], oven);
  assert.equal(finds('spiti', { gr: 'το σπίτι', ru: 'дом' }), true);
  assert.equal(finds('yia', { gr: 'γεια', ru: 'привет' }), true);
  assert.equal(finds('салата', { pending: true, text: 'σαλάτα' }), true); // drafts: by the typed text
});

test('negatives', () => {
  all(['vfkfccf', 'telefono', 'kipos', 'спасибо'], sea, false);
});

test('findCard: same typed text or same Greek word, saved beats pending', () => {
  const house = { id: 'h', gr: 'το σπίτι', ru: 'дом, жилище', text: 'House' }, ov = { id: 'o', ...oven };
  const d = { id: 'd', pending: true, text: 'σαλάτα' }, dupe = { id: 'p', pending: true, text: 'σπίτι' }, cards = [dupe, house, ov, d, sea];
  for (const q of ['το σπίτι', 'σπίτι', 'ΣΠΙΤΙ', 'σπιτι', 'house', ' HOUSE ']) assert.equal(findCard(cards, q), house, q);
  assert.equal(findCard(cards, 'φούρνος'), ov);
  assert.equal(findCard(cards, 'σαλάτα'), d);
  assert.equal(findCard(cards, 'θάλασσα'), sea); // card without text (made before it was kept)
  // translations don't block (homonyms), nor partial words, nor an accent in another place
  for (const q of ['жилище', 'печь', 'пек', 'σπι', '', ' ', 'φουρνός']) assert.equal(findCard(cards, q), undefined, q);
  const when = { id: 'w', gr: 'ποτέ', ru: 'никогда' }, where = { id: 'x', gr: 'που', ru: 'что, который' };
  assert.equal(findCard([when, where], 'πότε'), undefined);
  assert.equal(findCard([when, where], 'πού'), undefined);
  assert.equal(findCard([when], 'ποτε'), when); // no accents typed: loose
});
