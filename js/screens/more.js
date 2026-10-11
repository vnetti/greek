import { $, esc } from '../util.js';
import { state } from '../state.js';
import { save, loadAll, saveKeys, savePush, pushToken, isSupported } from '../store.js';
import { app, icon, back } from '../ui.js';
import { home } from './home.js';
import { help } from './help.js';

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

export function more(msg = '') {
  const cur = document.documentElement.dataset.theme;
  app.innerHTML = `<div class="top">${back()}<h2>Ещё</h2></div>
    <section class="block"><h2>Тема</h2>
      <div class="themes">${THEMES.map(([id, name, g, p]) => `<button class="sw" data-t="${id}" aria-pressed="${id === cur}">
        <span class="dot" style="--g:${g};--p:${p}"></span>${name}</button>`).join('')}</div>
      <p class="small mut" style="margin:12px 0 0">Светлая или тёмная — как в настройках iPhone. «Ночь» всегда тёмная.</p></section>
    <nav class="block menu">
      <button class="mi" id="help">Как это работает<span class="v">${icon('chev')}</span></button>
      <button class="mi" id="k">Ключи API<span class="v">${icon('chev')}</span></button>
      <button class="mi" id="exp">Экспорт словаря<span class="v">${icon('chev')}</span></button>
      <button class="mi" id="imp">Импорт из файла<span class="v">${icon('chev')}</span></button>
    </nav>
    <div class="msg">${esc(msg)}</div>
    <input type="file" id="file" accept=".json,application/json" hidden>`;
  $('#x').onclick = () => home();
  document.querySelectorAll('.sw').forEach(b => b.onclick = () => { setTheme(b.dataset.t); more(); });
  $('#help').onclick = () => help();
  $('#k').onclick = () => editKeys();
  $('#exp').onclick = () => exportAll();
  $('#imp').onclick = () => $('#file').click();
  $('#file').onchange = e => e.target.files[0] && importAll(e.target.files[0]);
}

// Prefilled with current keys; Cancel changes nothing, an empty Gemini field keeps the old key.
function editKeys() {
  const g = prompt('Gemini API key', localStorage.getItem('key') || '');
  if (g === null) return;
  const t = prompt('Google Text-to-Speech API key (пусто — голос iOS)', localStorage.getItem('tts') || '');
  if (t === null) return;
  if (g.trim()) localStorage.setItem('key', g.trim());
  localStorage.setItem('tts', t.trim());
  saveKeys();
  home('Ключи сохранены');
}

export async function setupReminders() {
  // iOS exposes web push only to the app opened from the home screen (iOS 16.4+)
  if (!('Notification' in window) || !('PushManager' in window)) return home('Напоминания работают в приложении с экрана «Домой» (iOS 16.4+)');
  const h = prompt('Во сколько напоминать? Час от 0 до 23. Пусто — выключить', String(state.push.hour ?? 9));
  if (h === null) return;
  if (!h.trim()) { state.push = {}; savePush(); return home('Напоминания выключены'); }
  const hour = Math.min(23, Math.max(0, parseInt(h, 10) || 0));
  if (await Notification.requestPermission() !== 'granted') return home('Уведомления запрещены — разреши их в настройках iOS для Λέξεις');
  try {
    if (!(await isSupported())) throw new Error('браузер не поддерживает push');
    state.push = { token: await pushToken(), hour, tz: new Date().getTimezoneOffset() };
    await savePush();
    home(`Напомним в ${hour}:00, если к этому времени ещё не повторишь`);
  } catch (e) { home('Не получилось включить напоминания: ' + e.message); }
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
    home('Импортировано: ' + list.length);
  } catch (e) { home('Ошибка импорта: ' + e.message); }
}
