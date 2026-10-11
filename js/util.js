// Tiny helpers. Nothing here touches the DOM at import time, so scripts/remind.mjs can import plural from node.
export const $ = s => document.querySelector(s);
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
export const today = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5);
export const plural = (n, one, few, many) => n + ' ' + (n % 10 === 1 && n % 100 !== 11 ? one
  : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? few : many);
export const sec = t0 => ((performance.now() - t0) / 1000).toFixed(1) + ' с';
