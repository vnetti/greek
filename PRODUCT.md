# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Russian-speaking adults learning Modern Greek for everyday life (shops, street, signs, conversations). Started as the owner's personal tool (plus his wife); the intent is that other Russian speakers can use it over time. Used mostly on iPhone as a home-screen web app, in short sessions: adding a word on the spot, then a few minutes of daily review.

## Product Purpose

Type a word or phrase (Russian or Greek) and immediately get a finished flashcard: Greek form with article, Cyrillic transcription with stress, short grammar (plural / aorist+future / three genders), Russian translation, an example sentence with translation, an emoji, and Google TTS audio for the word, the forms and the example. Then review on a spaced schedule. Success: the learner keeps adding real-life words and opens the app every day.

## Positioning

Speed and minimalism over feature breadth: one input field produces a complete, voiced card in about a second, and review needs no setup. Built for Russian speakers specifically (Cyrillic transcription, Russian UI), unlike generic decks. The owner also wants it to feel good to open daily; more practice modes may come later.

## Operating Context

- Adding words happens on the go, often with poor mobile network; words added offline wait in a queue ("ждут интернета") and finish automatically.
- Daily review session: three directions per word, each with its own Leitner schedule (1→3→7→14→30→60 days; a miss resets to tomorrow): Greek→Russian (reveal, self-grade), Russian→Greek (type, auto-checked; accent-insensitive with a warning), listening (hear, type).
- At most 10 new words enter review per day; others wait in order.
- Push reminder at a chosen hour if the day's review isn't done; a streak of consecutive days.
- Dictionary: search, read-only card view with next review per direction, edit, delete.

## Capabilities and Constraints

- Static `index.html` + `sw.js` on GitHub Pages (vnetti.github.io/greek); no build step. Firebase Auth (Google sign-in) + Firestore (offline cache), Gemini for card content, Google Cloud TTS, FCM push sent by an hourly GitHub Action (`scripts/remind.mjs`).
- Russian UI; Greek content. iOS Safari standalone PWA is the primary runtime (safe areas, Greek keyboard, home-screen icon `icon.png`).
- Functionality must stay intact through visual changes.

## Brand Commitments

- Name: Λέξεις (kept for now; the owner may rename it later).
- Light and dark themes, following the system setting.

## Evidence on Hand

No testimonials, user numbers or press. Do not invent any.

## Product Principles

1. One field, one second, one complete card: adding a word must never feel like work.
2. Minimum of extras: every screen element must earn its place.
3. Daily habit first: opening the app should feel rewarding and quick.
4. Works in the real world: bad network, one hand, short sessions.
