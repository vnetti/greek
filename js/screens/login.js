import { $, esc } from '../util.js';
import { DIRS } from '../srs.js';
import { auth, GoogleAuthProvider, signInWithPopup } from '../store.js';
import { app, badge } from '../ui.js';

export function login(msg = '') {
  app.innerHTML = `<div class="login"><div class="dots">${DIRS.map(badge).join('')}</div><h1>Λέξεις</h1>
    <p>Греческие слова на каждый день</p><button id="in">Войти через Google</button><p class="small">${esc(msg)}</p></div>`;
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' }); // let a different account sign in after logout
  // In-app browsers (Telegram, Instagram…) kill the Google popup → it surfaces as popup-closed/blocked
  $('#in').onclick = () => signInWithPopup(auth, provider).catch(e => login(/popup/.test(e.code)
    ? 'The sign-in window closed. If you opened this link inside Telegram, Instagram or another app, open it in Safari or Chrome instead (⋯ menu → "Open in browser").'
    : 'Ошибка входа: ' + e.message));
}
