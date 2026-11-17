import { $, esc, today, plural } from '../util.js';
import { state } from '../state.js';
import { DIRS, NEW_PER_DAY, entryDay, addedAt } from '../srs.js';
import { save, remove } from '../store.js';
import { tts } from '../api.js';
import { say } from '../audio.js';
import { searchKeys, matcher } from '../search.js';
import { app, icon, LINES, badge, wordTrack, scale, back, SAY, cardHtml, wire, level, clearable } from '../ui.js';
import { home } from './home.js';
import { processPending } from './add.js';

let exit = home; // where back goes: whoever opened the dictionary from outside
const SORTS = { new: 'Новые', old: 'Старые', az: 'А–Я' };
export function list(from) {
  if (from) exit = from;
  let sort; try { sort = localStorage.getItem('dictSort'); } catch {}
  if (!SORTS[sort]) sort = 'new';
  const sortKey = c => (c.gr || c.text).replace(/^(ο|η|το|οι|τα)\s+/, '');
  const age = (a, b) => addedAt(a) - addedAt(b) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  const order = k => [...state.cards].sort(k === 'az' ? (a, b) => sortKey(a).localeCompare(sortKey(b), "el") : k === 'old' ? age : (a, b) => age(b, a));
  const rows = order(sort);
  app.innerHTML = `<div class="top">${back()}<h2>Словарь</h2><span class="small mut num">${state.cards.length}</span>
    <select id="sort" aria-label="Порядок">${Object.entries(SORTS).map(([k, l]) => `<option value="${k}"${k === sort ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
    <input id="s" type="search" placeholder="Поиск по-гречески или по-русски" aria-label="Поиск" autocomplete="off">
    <div class="block list" style="margin-top:12px">${!rows.length ? '<p class="mut center" style="padding:24px 12px">Пока пусто — добавь первое слово на главной</p>' : rows.map(c => { const k = searchKeys(c); return `<button class="item" data-id="${esc(c.id)}" data-p="${esc(k.p)}" data-f="${esc(k.f)}">
      <span class="e">${c.pending ? icon('clock') : esc(c.emoji)}</span>
      <span class="t"><b lang="el">${esc(c.gr || c.text)}</b><small>${esc(c.pending ? (c.err ? 'не получилось: ' + c.err : 'ждёт интернета') : c.ru)}</small></span>
      ${level(c)}</button>`; }).join('') + '<p class="mut center" id="none" hidden style="padding:24px 12px">Ничего не нашли</p>'}</div>`;
  $('#x').onclick = () => exit();
  $('#sort').onchange = e => { // reorder in place: the select keeps focus and the iOS picker stays attached
    try { localStorage.setItem('dictSort', e.target.value); } catch {}
    const ids = order(e.target.value).map(c => c.id), box = $('.list'), el = Object.fromEntries([...box.querySelectorAll('.item')].map(x => [x.dataset.id, x]));
    box.prepend(...ids.map(id => el[id]).filter(Boolean));
  };
  const s = $('#s');
  s.oninput = () => { // filter in place so the keyboard stays open
    const m = matcher(state.search = s.value);
    let any = false;
    document.querySelectorAll('.item').forEach(el => { el.hidden = !m(el.dataset); any ||= !el.hidden; });
    if ($('#none')) $('#none').hidden = any;
  };
  s.value = state.search; if (s.value) s.oninput();
  clearable(s);
  document.querySelectorAll('.item').forEach(el => el.onclick = () => {
    const c = state.cards.find(c => c.id === el.dataset.id);
    if (!c) return list(); // dropped meanwhile (a background run found it already in the dictionary)
    c.pending ? waiting(c) : view(c);
  });
}

// A word still without its card: why, retry it now or drop it.
function waiting(c, msg = '') {
  app.innerHTML = `<div class="top">${back()}<h2>Не доделано</h2></div>
    <section class="block"><b lang="el">${esc(c.text)}</b><p class="small mut" style="margin:6px 0 0">${esc(c.err ? 'Не получилось: ' + c.err : 'Ждёт интернета')}</p></section>
    <div class="msg">${esc(msg)}</div>
    <button id="redo" style="margin-top:12px">Перезапустить</button>
    <button class="bad" id="del" style="margin-top:12px">Убрать из очереди</button>`;
  $('#x').onclick = () => list();
  $('#redo').onclick = async e => {
    const b = e.target; b.disabled = true; b.textContent = 'Делаем…';
    await processPending(c); // a run already going is awaited first
    if (!b.isConnected) return; // the user left this screen meanwhile
    c = state.cards.find(x => x.id === c.id); // an import may have swapped the object
    if (!c) return list(); // dropped: the word was already in the dictionary
    c.pending ? waiting(c, navigator.onLine ? '' : 'Нет интернета') : view(c);
  };
  $('#del').onclick = () => {
    if (!confirm(`Убрать «${c.text}» из очереди?`)) return;
    state.cards = state.cards.filter(x => x !== c);
    remove(c.id);
    list();
  };
}

// Read-only card from the dictionary: where the word is on each line and when it comes up next; editing is one tap away.
// msg + force: opened from adding a word we already have; force makes the new card anyway
export function view(c, msg = '', force) {
  if (msg) exit = home; // opened from home's add: the dictionary behind it leads back home
  const start = entryDay(state.cards, c, today()); // a waiting new card shows nothing before it enters review
  const when = d => { const n = Math.max(c[d].due, start) - today(); return n <= 0 ? 'сегодня' : n === 1 ? 'завтра' : 'через ' + plural(n, 'день', 'дня', 'дней'); };
  app.innerHTML = `<div class="top">${back()}<h2>Карточка</h2><button class="link" id="ed">Изменить</button></div>` +
    (msg ? `<div class="msg" role="status">${esc(msg)}</div>` : '') + cardHtml(c) +
    (force ? '<button class="sec" id="force" style="margin-top:12px">Всё равно создать</button>' : '') +
    `<section class="block sched">${DIRS.map(d => `<div class="st">${badge(d)}<div><div class="name">${LINES[d].name}</div>${wordTrack(c, d)}</div>
      <div class="when">${when(d)}</div></div>`).join('')}${scale('st-scale')}
      ${start > today() ? `<p class="small mut" style="margin:0 0 14px">Новое слово ждёт очереди: в день начинаем не больше ${NEW_PER_DAY} новых</p>` : ''}</section>`;
  wire(c);
  if (force) $('#force').onclick = force;
  $('#x').onclick = () => list();
  $('#ed').onclick = () => edit(c);
}

export function edit(c) {
  const F = [['gr', 'Греческий'], ['tr', 'Транскрипция'], ['forms', 'Грамматика'], ['ru', 'Перевод'], ['ex', 'Пример'],
    ['exRu', 'Перевод примера'], ['emoji', 'Эмодзи']];
  app.innerHTML = `<div class="top">${back()}<h2>Редактирование</h2>${SAY}</div>
    <form id="ef" class="block form">${F.map(([k, l]) => `<label>${l}<input name="${k}" value="${esc(c[k])}" autocomplete="off"></label>`).join('')}
      <button id="sv">Сохранить</button></form>
    <button class="bad" id="del" style="margin-top:12px">Удалить карточку</button>`;
  document.querySelectorAll('#ef input').forEach(clearable);
  $('#x').onclick = () => view(c);
  $('#say').onclick = () => say(c);
  $('#ef').onsubmit = async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target)), newGr = d.gr.trim() !== c.gr, newEx = d.ex !== c.ex;
    if (!d.gr.trim()) return alert('Греческое слово не может быть пустым');
    if (d.forms !== c.forms) delete c.formsAudio; // re-recorded on next play
    Object.assign(c, d, { gr: d.gr.trim() });
    if (newGr || newEx) { // old audio says the old text
      $('#sv').disabled = true; $('#sv').textContent = 'Озвучиваем…';
      if (newGr) try { c.audio = await tts(c.gr); } catch { delete c.audio; }
      if (newEx) try { c.exAudio = await tts(c.ex); } catch { delete c.exAudio; }
    }
    save(c);
    view(c);
  };
  $('#del').onclick = () => {
    if (!confirm(`Удалить «${c.gr}»?`)) return;
    state.cards = state.cards.filter(x => x !== c);
    remove(c.id);
    list();
  };
}
