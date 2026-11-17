import { $, esc, today, plural } from '../util.js';
import { state } from '../state.js';
import { newId, schedule, draft } from '../srs.js';
import { save } from '../store.js';
import { build } from '../api.js';
import { say } from '../audio.js';
import { app, back, cardHtml, wire } from '../ui.js';
import { home } from './home.js';

// same flip card as the splash: what you typed on the front, "?" on the back, live step text below
const making = text => `<div class="splash"><div class="flip">
    <div class="face${text.length > 9 ? ' long' : ''}">${esc(text)}</div><div class="face back q">?</div></div>
  <h1 style="font-size:17px">Готовим карточку</h1><div id="step"></div></div>`;

export async function add(raw) {
  const words = raw.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
  const park = (list, err) => { state.draft = ''; list.forEach(w => { const d = draft(w, today()); if (err) d.err = err; state.cards.push(d); save(d); }); };
  if (words.length > 1) { // batch: no preview, fill in the background
    park(words);
    home(`Готовим ${plural(words.length, 'карточку', 'карточки', 'карточек')}…`);
    return processPending();
  }
  const text = words[0];
  app.innerHTML = making(text);
  try {
    const { c, note } = await build(text, s => { if ($('#step')) $('#step').textContent = s; });
    app.innerHTML = `<div class="top">${back('no', 'Отмена')}<h2>Новая карточка</h2></div>` + cardHtml(c) +
      `<p class="small mut center">${esc(note)}</p><button id="yes">Сохранить в словарь</button>`;
    wire(c);
    say(c);
    $('#no').onclick = () => home();
    $('#yes').onclick = () => {
      Object.assign(c, { id: newId(), ...schedule(today()) });
      state.draft = '';
      save(c);
      state.cards.push(c);
      home('Добавлено: ' + c.gr);
    };
  } catch (e) {
    if (e.status) return home('Ошибка: ' + e.message);
    park([text], e.noAnswer && e.message); // no network or no answer: keep the word, finish it later
    home(e.noAnswer ? `${e.message} — «${text}» отложили, перезапусти позже` : `Нет связи — «${text}» доделаем, когда появится интернет`);
  }
}

// Words added without network (or several at once) wait here as drafts and get filled in the background.
// One run at a time: a call during a run (the 'online' event, a retry button, a batch add) waits for it, then gets its own run.
// only = just that card.
let run = null;
export function processPending(only) {
  if (run) return run.then(() => processPending(only));
  if (!navigator.onLine) return Promise.resolve(); // nothing to do, and no redraw that would wipe the screen's message
  return run = (async () => {
    for (const c of state.cards.filter(c => c.pending && (!only || c === only))) {
      // removed from the queue (or signed out) while its build ran: don't write it back
      try { const r = await build(c.text); if (!state.cards.includes(c)) continue; Object.assign(c, r.c, { pending: false }); delete c.err; save(c); }
      catch (e) {
        if (!state.cards.includes(c)) continue;
        if (e.status || e.noAnswer) c.err = e.message; else delete c.err; // shown in the dictionary and on home
        save(c);
        if (!e.status) break; // offline or the AI is silent: the rest would fail the same way
      }
    }
  })().finally(() => {
    run = null;
    if ($('#w') && !$('#w').value) home(); // refresh counters unless the user is typing
  });
}
