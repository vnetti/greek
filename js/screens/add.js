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
  const park = list => list.forEach(w => { const d = draft(w, today()); state.cards.push(d); save(d); });
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
      save(c);
      state.cards.push(c);
      home('Добавлено: ' + c.gr);
    };
  } catch (e) {
    if (e.status) return home('Ошибка: ' + e.message);
    park([text]); // no network: keep the word, finish it later
    home(`Нет связи — «${text}» доделаем, когда появится интернет`);
  }
}

// Words added without network (or several at once) wait here as drafts and get filled in the background.
let busy = false;
export async function processPending() {
  if (busy || !navigator.onLine) return;
  busy = true;
  for (const c of state.cards.filter(c => c.pending)) {
    try { Object.assign(c, (await build(c.text)).c, { pending: false }); save(c); }
    catch (e) { if (!e.status) break; } // offline again: stop, the 'online' event retries
  }
  busy = false;
  if ($('.today') && !$('#w').value) home(); // refresh counters unless the user is typing
}
