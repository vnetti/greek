import { $, esc, today, plural } from '../util.js';
import { state } from '../state.js';
import { DIRS, NEW_PER_DAY, entryDay } from '../srs.js';
import { save, remove } from '../store.js';
import { tts } from '../api.js';
import { say } from '../audio.js';
import { searchKeys, matcher } from '../search.js';
import { app, icon, LINES, badge, wordTrack, scale, back, SAY, cardHtml, wire, level, clearable } from '../ui.js';
import { home } from './home.js';

export function list() {
  const sortKey = c => (c.gr || c.text).replace(/^(ο|η|το|οι|τα)\s+/, '');
  const rows = [...state.cards].sort((a, b) => sortKey(a).localeCompare(sortKey(b), "el"));
  app.innerHTML = `<div class="top">${back()}<h2>Словарь</h2><span class="small mut num">${state.cards.length}</span></div>
    <input id="s" type="search" placeholder="Поиск по-гречески или по-русски" aria-label="Поиск" autocomplete="off">
    <div class="block list" style="margin-top:12px">${!rows.length ? '<p class="mut center" style="padding:24px 12px">Пока пусто — добавь первое слово на главной</p>' : rows.map(c => { const k = searchKeys(c); return `<button class="item" data-id="${esc(c.id)}" data-p="${esc(k.p)}" data-f="${esc(k.f)}">
      <span class="e">${c.pending ? icon('clock') : esc(c.emoji)}</span>
      <span class="t"><b lang="el">${esc(c.gr || c.text)}</b><small>${esc(c.pending ? 'ждёт интернета' : c.ru)}</small></span>
      ${level(c)}</button>`; }).join('') + '<p class="mut center" id="none" hidden style="padding:24px 12px">Ничего не нашли</p>'}</div>`;
  $('#x').onclick = () => home();
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
    if (!c.pending) return view(c);
    if (!confirm(`«${c.text}» ещё не готово. Убрать из очереди?`)) return;
    state.cards = state.cards.filter(x => x !== c);
    remove(c.id);
    list();
  });
}

// Read-only card from the dictionary: where the word is on each line and when it comes up next; editing is one tap away.
export function view(c) {
  const start = entryDay(state.cards, c, today()); // a waiting new card shows nothing before it enters review
  const when = d => { const n = Math.max(c[d].due, start) - today(); return n <= 0 ? 'сегодня' : n === 1 ? 'завтра' : 'через ' + plural(n, 'день', 'дня', 'дней'); };
  app.innerHTML = `<div class="top">${back()}<h2>Карточка</h2><button class="link" id="ed">Изменить</button></div>` + cardHtml(c) +
    `<section class="block sched">${DIRS.map(d => `<div class="st">${badge(d)}<div><div class="name">${LINES[d].name}</div>${wordTrack(c, d)}</div>
      <div class="when">${when(d)}</div></div>`).join('')}${scale('st-scale')}
      ${start > today() ? `<p class="small mut" style="margin:0 0 14px">Новое слово ждёт очереди: в день начинаем не больше ${NEW_PER_DAY} новых</p>` : ''}</section>`;
  wire(c);
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
