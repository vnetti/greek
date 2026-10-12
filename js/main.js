// Boot: service worker, then the screen follows the signed-in user.
import { state } from './state.js';
import { auth, onAuthStateChanged, loadKeys, loadMeta, refreshStats, migrate, loadAll } from './store.js';
import { $ } from './util.js';
import { app } from './ui.js';
import { home } from './screens/home.js';
import { login } from './screens/login.js';
import { processPending } from './screens/add.js';
import './swipe.js';
import { syncThemeColor } from './screens/account.js';

addEventListener('online', processPending);
// back from the background: another device may have practised meanwhile (and the day may have turned)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && auth.currentUser) refreshStats().then(() => { if ($('#w') && !$('#w').value) home(); }, () => {});
});
navigator.serviceWorker?.register('sw.js').catch(() => {});
const SPLASH = app.innerHTML; // reused while a fresh sign-in loads the dictionary
syncThemeColor();
onAuthStateChanged(auth, async user => {
  if (!user) return login();
  app.innerHTML = SPLASH;
  try {
    await Promise.all([loadKeys(), loadMeta()]);
    const moved = await migrate();
    state.cards = await loadAll();
    processPending(); // background: finish words added offline
    home(moved ? `Перенесено с телефона в аккаунт: ${moved}` : '');
  } catch (e) { home('Ошибка загрузки: ' + e.message); }
});
