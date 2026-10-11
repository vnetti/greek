import { $, esc } from '../util.js';
import { DIRS } from '../srs.js';
import { auth, GoogleAuthProvider, signInWithPopup } from '../store.js';
import { app, badge } from '../ui.js';

export function login(msg = '') {
  app.innerHTML = `<div class="login"><div class="dots">${DIRS.map(badge).join('')}</div><h1>Λέξεις</h1>
    <p>Греческие слова на каждый день</p><button id="in">Войти через Google</button><p class="small">${esc(msg)}</p></div>`;
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' }); // let a different account sign in after logout
  $('#in').onclick = () => signInWithPopup(auth, provider).catch(e => login('Ошибка входа: ' + e.message));
}
