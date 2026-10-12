import { $, esc } from '../util.js';
import { state } from '../state.js';
import { auth, signOut, save, loadAll, saveKeys, savePush, pushToken, isSupported } from '../store.js';
import { key } from '../api.js';
import { app, icon, back, avatar } from '../ui.js';
import { home } from './home.js';
import { stats, knownCount } from './stats.js';

// Colour theme is a per-device preference; light/dark still follows the system (Ночь is always dark).
const THEMES = [['graphite', 'Графит', '#ECEEF1', '#1C1F24'], ['aegean', 'Эгейский', '#D9E5F2', '#0E4C92'],
  ['olive', 'Олива', '#E2E6DC', '#3D5A2C'], ['night', 'Ночь', '#0F1217', '#F2C230']];
export const syncThemeColor = () => { $('meta[name=theme-color]').content = getComputedStyle(document.body).backgroundColor; };
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', syncThemeColor);
function setTheme(t) {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem('theme', t); } catch {}
  syncThemeColor();
}

// Account = everything about you: stats, settings, your data, sign-out. Theme applies at once;
// reminders and keys are forms whose «Сохранить» wakes up only after a change and sends it to the server.
export function account(msg = '', at = '') { // at: the section the message belongs under ('rem' | 'keys' | 'data')
  const u = auth.currentUser, cur = document.documentElement.dataset.theme, on = !!state.push.token;
  const note = s => msg && at === s ? `<div class="msg" role="status">${esc(msg)}</div>` : '';
  const hours = Array.from({ length: 24 }, (_, h) => `<option value="${h}"${h === (state.push.hour ?? 9) ? ' selected' : ''}>${h}:00</option>`).join('');
  app.innerHTML = `<div class="top">${back()}<h2>Аккаунт</h2></div>
    <section class="block me">${avatar(u)}<div class="who">${esc(u?.displayName || 'Аккаунт')}<small>${esc(u?.email)}</small></div></section>
    <nav class="block menu"><button class="mi" id="sts">Статистика<span class="v num">${knownCount()} выучено${icon('chev')}</span></button></nav>
    <form class="block form set" id="rem"><h2>Напоминания</h2>
      <label class="sw-row">Напоминать каждый день<input type="checkbox" role="switch" name="on"${on ? ' checked' : ''}></label>
      <label>Во сколько<select name="hour"${on ? '' : ' disabled'}>${hours}</select></label>
      <p class="small mut">Пришлём, только если ты ещё не повторял и есть что повторять. На iPhone — в приложении с экрана «Домой».</p>
      <button class="sec" disabled>Сохранить</button></form>${note('rem')}
    <section class="block"><h2>Тема</h2>
      <div class="themes">${THEMES.map(([id, name, g, p]) => `<button class="sw" data-t="${id}" aria-pressed="${id === cur}">
        <span class="dot" style="--g:${g};--p:${p}"></span>${name}</button>`).join('')}</div>
      <p class="small mut" style="margin:12px 0 0">Светлая или тёмная — как в настройках телефона. «Ночь» всегда тёмная.</p></section>
    <form class="block form set" id="keys"><h2>Ключи API</h2>
      <label>Gemini — делает карточки<input name="key" class="secret" value="${esc(key())}" autocomplete="off" spellcheck="false" placeholder="aistudio.google.com/apikey"></label>
      <label>Google Text-to-Speech — озвучка<input name="tts" class="secret" value="${esc(key('tts'))}" autocomplete="off" spellcheck="false" placeholder="пусто — голос iOS"></label>
      <button class="sec" disabled>Сохранить</button></form>${note('keys')}
    <nav class="block menu">
      <button class="mi" id="exp">Экспорт словаря<span class="v">${icon('chev')}</span></button>
      <button class="mi" id="imp">Импорт из файла<span class="v">${icon('chev')}</span></button>
    </nav>${note('data')}
    <button class="bad" id="out" style="margin-top:12px">Выйти</button>
    <input type="file" id="file" accept=".json,application/json" hidden>`;
  $('#x').onclick = () => home();
  $('#sts').onclick = () => stats();
  document.querySelectorAll('form.set').forEach(f => { f.oninput = () => { f.querySelector('button.sec').disabled = false; }; });
  $('#rem').elements.on.onchange = e => { $('#rem').elements.hour.disabled = !e.target.checked; };
  $('#rem').onsubmit = e => { e.preventDefault(); saveReminders(e.target.elements.on.checked, +e.target.elements.hour.value); };
  document.querySelectorAll('#keys input').forEach(peekable);
  $('#keys').onsubmit = e => {
    e.preventDefault();
    const k = e.target.key.value.trim();
    if (!k) return account('Ключ Gemini не может быть пустым', 'keys'); // an empty one would wipe the shared key for everyone
    localStorage.setItem('key', k); localStorage.setItem('tts', e.target.tts.value.trim()); localStorage.setItem('ownKeys', '1');
    account('Ключи сохранены', 'keys');
    // not awaited: offline the write waits for the network; a rejection means we aren't the owner
    saveKeys().then(ok => { if (!ok && $('#keys')) account('Ключи сохранены только на этом устройстве', 'keys'); });
  };
  document.querySelectorAll('.sw').forEach(b => b.onclick = () => {
    setTheme(b.dataset.t);
    document.querySelectorAll('.sw').forEach(x => x.setAttribute('aria-pressed', x === b));
  });
  $('#exp').onclick = () => exportAll();
  $('#imp').onclick = () => $('#file').click();
  $('#file').onchange = e => e.target.files[0] && importAll(e.target.files[0]);
  $('#out').onclick = () => {
    if (!confirm('Выйти из аккаунта?')) return;
    // keys came from this account: don't leave them for whoever signs in next
    ['key', 'tts', 'ownKeys'].forEach(n => localStorage.removeItem(n));
    state.cards = []; state.stats = {}; state.push = {}; state.draft = state.search = ''; state.news = null;
    signOut(auth); // onAuthStateChanged then shows the login screen
  };
}

// a key field: dots until the eye in it is pressed
function peekable(el) {
  const w = document.createElement('span'), b = document.createElement('button');
  w.className = 'clr on peek'; b.type = 'button';
  const set = show => { el.classList.toggle('secret', !show); b.innerHTML = icon(show ? 'eyeOff' : 'eye'); b.setAttribute('aria-label', show ? 'Скрыть ключ' : 'Показать ключ'); };
  el.replaceWith(w); w.append(el, b); set(false);
  b.onpointerdown = e => e.preventDefault();
  b.onclick = () => set(el.classList.contains('secret'));
}

async function saveReminders(on, hour) {
  if (!on) { state.push = { hour }; savePush().catch(() => {}); return account('Напоминания выключены', 'rem'); } // not awaited: offline it would hang
  // iOS exposes web push only to the app opened from the home screen (iOS 16.4+)
  if (!('Notification' in window) || !('PushManager' in window)) return account('Напоминания работают в приложении с экрана «Домой» (iOS 16.4+)', 'rem');
  if (await Notification.requestPermission() !== 'granted') return account('Уведомления запрещены — разреши их в настройках iOS для Λέξεις', 'rem');
  try {
    if (!(await isSupported())) throw new Error('браузер не поддерживает push');
    state.push = { token: await pushToken(), hour, tz: new Date().getTimezoneOffset() };
    await savePush();
    account(`Напомним в ${hour}:00, если к этому времени ещё не повторишь`, 'rem');
  } catch (e) { account('Не получилось включить напоминания: ' + e.message, 'rem'); }
}

async function exportAll() {
  const file = new File([JSON.stringify(state.cards)], `greek-${new Date().toISOString().slice(0, 10)}.json`, { type: 'application/json' });
  if (navigator.canShare?.({ files: [file] })) return navigator.share({ files: [file] }).catch(() => {});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file);
  a.download = file.name;
  a.click();
}
async function importAll(file) {
  try {
    const list = JSON.parse(await file.text());
    if (!Array.isArray(list) || !list.every(c => c.id && c.gr && c.gr2ru && c.ru2gr)) throw new Error('не тот файл');
    list.forEach(save);
    state.cards = await loadAll();
    account('Импортировано: ' + list.length, 'data');
  } catch (e) { account('Ошибка импорта: ' + e.message, 'data'); }
}
