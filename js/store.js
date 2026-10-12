// Firebase: the only module that imports the SDK. Others get auth helpers re-exported from here.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { initializeFirestore, persistentLocalCache, collection, doc, getDoc, getDocs, setDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { getMessaging, getToken, isSupported } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging.js';
import { state } from './state.js';
import { today } from './util.js';
import { nextStats, alive, withListen } from './srs.js';

export { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, isSupported };

// Public web config, not a secret: access is enforced by Firestore rules (users/{uid}/** is owner-only).
const fb = initializeApp({
  apiKey: 'AIzaSyBM-nKxH-5GoYd5lUyDxwhDLOlh0Ea532A',
  authDomain: 'gen-lang-client-0926920334.firebaseapp.com',
  projectId: 'gen-lang-client-0926920334',
  messagingSenderId: '665443389022', // required by push (Firebase Cloud Messaging)
  appId: '1:665443389022:web:1b6839b28521d9cefeeecf'
});
export const auth = getAuth(fb);
const fs = initializeFirestore(fb, { localCache: persistentLocalCache(), ignoreUndefinedProperties: true });

// --- storage: Firestore users/{uid}/cards, cached on device so review works offline.
// Writes are not awaited: they land in the local cache at once and sync when online.
const cardsRef = () => collection(fs, 'users', auth.currentUser.uid, 'cards');
export const loadAll = async () => (await getDocs(cardsRef())).docs.map(d => d.data()).map(withListen);
export const save = c => setDoc(doc(cardsRef(), c.id), c).catch(e => alert('Не сохранилось: ' + e.message));
export const remove = id => deleteDoc(doc(cardsRef(), id));
navigator.storage?.persist?.();

// --- streak & reminders: users/{uid}/meta/{stats,push}. Reminders are sent by .github/workflows/remind.yml
const VAPID = 'BPeo583swFMcfOAu3KAgjPdnX5xCs5ZiNtI6qKrCzf9oWztiFTHpE9z3_1zVi58MDE0jnWBcUQb2OAkAF-QFlC4'; // public half
const metaRef = n => doc(fs, 'users', auth.currentUser.uid, 'meta', n);
export const savePush = () => setDoc(metaRef('push'), state.push);
export async function loadMeta() {
  [state.stats, state.push] = await Promise.all(['stats', 'push'].map(n => getDoc(metaRef(n)).then(d => d.data() ?? {}).catch(() => ({}))));
  if (state.push.token && globalThis.Notification?.permission === 'granted') pushToken().then(t => { // tokens rotate: keep ours current
    if (t !== state.push.token) { state.push.token = t; savePush(); }
  }).catch(() => {});
}
const saveStats = () => auth.currentUser && setDoc(metaRef('stats'), state.stats).catch(() => {}); // no user: signed out mid-way (or the dev harness)
export function bumpStreak() { state.stats = nextStats(state.stats, today()); saveStats(); }
export function markSeen() { state.stats = { ...state.stats, seen: today() }; saveStats(); } // home showed today's news
export const streakNow = () => alive(state.stats, today()) ? state.stats.streak : 0;
export const pushToken = async () => getToken(getMessaging(fb), { vapidKey: VAPID, serviceWorkerRegistration: await navigator.serviceWorker.ready });

// One-time move of cards from the pre-Firebase on-device IndexedDB; the old copy is kept untouched.
function oldCards() {
  return new Promise(res => {
    const r = indexedDB.open('greek');
    r.onupgradeneeded = () => r.transaction.abort(); // no old db: don't create one
    r.onerror = () => res([]);
    r.onsuccess = () => {
      const db = r.result;
      if (!db.objectStoreNames.contains('cards')) return res([]);
      const g = db.transaction('cards').objectStore('cards').getAll();
      g.onsuccess = () => res(g.result);
      g.onerror = () => res([]);
    };
  });
}
export async function migrate() {
  if (localStorage.getItem('migrated')) return;
  const old = await oldCards();
  old.forEach(save);
  localStorage.setItem('migrated', '1');
  return old.length;
}

// API keys live in one shared doc: readable by the email allowlist in Firestore rules, writable by the owner only.
// Others get a permission error here and simply type their own keys. Mirrored to localStorage for sync access.
const keysRef = () => doc(fs, 'shared', 'keys');
export const saveKeys = () => setDoc(keysRef(), { key: localStorage.getItem('key'), tts: localStorage.getItem('tts') }).catch(() => {});
export async function loadKeys() {
  const k = (await getDoc(keysRef()).catch(() => null))?.data();
  if (!k) return saveKeys(); // first device: upload whatever is already entered here
  for (const n of ['key', 'tts']) if (k[n] != null) localStorage.setItem(n, k[n]);
}
