import { $, esc, today, plural } from '../util.js';
import { state } from '../state.js';
import { newId, stamp, schedule, draft } from '../srs.js';
import { save, remove } from '../store.js';
import { findCard } from '../search.js';
import { build, forget } from '../api.js';
import { say } from '../audio.js';
import { app, back, cardHtml, wire } from '../ui.js';
import { home } from './home.js';
import { view } from './dictionary.js';

// same flip card as the splash: what you typed on the front, "?" on the back, live step text below
const making = text => `<div class="splash"><div class="flip">
    <div class="face${text.length > 9 ? ' long' : ''}">${esc(text)}</div><div class="face back q">?</div></div>
  <h1 style="font-size:17px">Готовим карточку</h1><div id="step"></div></div>`;

// force: «Всё равно создать» — skip the «already in the dictionary» checks
export async function add(raw, force) {
  const words = raw.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
  const park = (list, err) => { state.draft = ''; list.forEach(w => { const d = draft(w, today()); if (err) d.err = err; state.cards.push(d); save(d); }); };
  const have = (old, go) => { state.draft = ''; view(old, 'Это слово уже в словаре — вот его карточка', go); };
  if (words.length > 1) { // batch: no preview, fill in the background
    // one at a time, so a repeat within the list finds the draft just parked (and isn't reported as «already there»)
    const n0 = state.cards.length, skip = [];
    words.forEach(w => { const o = findCard(state.cards, w); if (!o) park([w]); else if (state.cards.indexOf(o) < n0) skip.push(w); });
    const n = state.cards.length - n0;
    state.draft = '';
    if (!n) return home('Все эти слова уже есть в словаре или в очереди');
    home(`Готовим ${plural(n, 'карточку', 'карточки', 'карточек')}…${skip.length ? ' Уже есть: ' + skip.join(', ') : ''}`);
    return processPending();
  }
  const text = words[0], old = findCard(state.cards, text);
  if (old && !force) { if (!old.pending) return have(old, () => add(text, true)); state.draft = ''; home(`«${text}» уже ждёт в очереди — пробуем ещё раз`); return processPending(old); }
  app.innerHTML = making(text);
  try {
    const { c, note } = await build(text, s => { if ($('#step')) $('#step').textContent = s; });
    const dup = findCard(state.cards, c.gr); // typed in English or a synonym of a word we have
    const keep = () => {
      Object.assign(c, { id: newId(), added: stamp(), text, ...schedule(today()) }); // text: what was typed, so typing it again finds this card
      state.draft = '';
      save(c);
      state.cards.push(c);
      home('Добавлено: ' + c.gr);
    };
    const preview = () => {
      app.innerHTML = `<div class="top">${back('no', 'Отмена')}<h2>Новая карточка</h2></div>` + cardHtml(c) +
        `<p class="small mut center">${esc(note)}</p><button id="yes">Сохранить в словарь</button>`;
      wire(c);
      say(c);
      $('#no').onclick = () => { forget(text); home(); };
      $('#yes').onclick = () => {
        const d = findCard(state.cards, c.gr); // a background run may have finished the same word meanwhile
        d && !d.pending && d !== dup ? have(d, keep) : keep();
      };
    };
    if (dup && !dup.pending && !force) return have(dup, preview);
    preview();
  } catch (e) {
    if (e.status) return home('Ошибка: ' + e.message);
    park([text], e.noAnswer && e.message); // no network or no answer: keep the word, finish it later
    home(e.noAnswer ? `${e.message} — «${text}» отложили, перезапусти позже` : `Нет связи — «${text}» доделаем, когда появится интернет`);
  }
}

// Words added without network (or several at once) wait here as drafts and get filled in the background.
// One run at a time: a call during a run (the 'online' event, a retry button, a batch add) waits for it, then gets a run of
// its own; all-words calls share one such follow-up, so taps and events don't stack up. only = just that card.
let run = null, again = null;
export function processPending(only) {
  if (run) return only ? run.then(() => processPending(only)) : (again ||= run.then(() => (again = null, processPending())));
  if (!navigator.onLine) return Promise.resolve(); // nothing to do, and no redraw that would wipe the screen's message
  const dup = []; // finished as a word already in the dictionary: dropped, named on home
  return run = (async () => {
    for (const { id, text } of state.cards.filter(c => c.pending && (!only || c.id === only.id))) {
      // by id: an import or re-sign-in swaps the card objects mid-run; gone (removed, signed out) → don't write it back
      const cur = () => state.cards.find(c => c.id === id && c.pending);
      try {
        const r = await build(text), c = cur(); if (!c) continue;
        if (findCard(state.cards.filter(x => x.id !== id && !x.pending), r.c.gr)) { state.cards = state.cards.filter(x => x.id !== id); remove(id); dup.push(text); continue; }
        Object.assign(c, r.c, { pending: false }); delete c.err; save(c);
      }
      catch (e) {
        const c = cur(); if (!c) continue;
        if (e.status || e.noAnswer) c.err = e.message; else delete c.err; // shown in the dictionary and on home
        save(c);
        if (!e.status) break; // offline or the AI is silent: the rest would fail the same way
      }
    }
  })().finally(() => {
    run = null;
    if ($('#w') && !$('#w').value) home(dup.length ? 'Уже в словаре: ' + dup.join(', ') : ''); // refresh counters unless the user is typing
  });
}
