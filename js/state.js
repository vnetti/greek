// Shared mutable state: modules read and assign through this object (state.cards = …), never their own copies.
export const state = {
  cards: [],
  stats: {}, push: {}, // users/{uid}/meta/{stats,push}
  q: [], total: 0, recent: [], // review queue, cards in the current session (progress line), words just shown
  trainAt: 0, // where the progress train last stopped, in %
  draft: '', search: '', // home «Новое слово» text and dictionary query, kept across screens until reload
  news: null // today's streak news once shown, so it stays on home for the session
};
