---
name: Λέξεις
description: Greek flashcards for Russian speakers; each word rides three Athens metro lines through its review stations.
colors:
  m1-blue: "#0069B4"
  m2-red: "#E3001B"
  m3-green: "#009A49"
  m1-blue-dark: "#3B8FE0"
  m2-red-dark: "#FF4757"
  m3-green-dark: "#1FBF68"
  ok: "#1E7A45"
  ok-bg: "#DFF1E6"
  bad: "#B3261E"
  bad-bg: "#F9E1DE"
  warn: "#8A5A00"
  warn-bg: "#FBEFD3"
  fire: "#B4520F"
  fire-bg: "#FDEBD8"
  ok-dark: "#6FD59A"
  ok-bg-dark: "#14301F"
  bad-dark: "#FF8A80"
  bad-bg-dark: "#3A1B18"
  warn-dark: "#F5C15A"
  warn-bg-dark: "#36290E"
  fire-dark: "#FFB070"
  fire-bg-dark: "#3A2412"
  graphite-ground: "#ECEEF1"
  graphite-block: "#FFFFFF"
  graphite-ink: "#1C1F24"
  graphite-mut: "#5A606A"
  graphite-rule: "#E2E5E9"
  graphite-inset: "#F3F4F6"
  graphite-primary: "#1C1F24"
  graphite-on-primary: "#FFFFFF"
  graphite-dark-ground: "#0E1013"
  graphite-dark-block: "#191C21"
  graphite-dark-ink: "#ECEEF1"
  graphite-dark-mut: "#9BA1AB"
  graphite-dark-rule: "#2A2E35"
  graphite-dark-inset: "#22262C"
  graphite-dark-primary: "#ECEEF1"
  graphite-dark-on-primary: "#0E1013"
  aegean-ground: "#D9E5F2"
  aegean-block: "#FFFFFF"
  aegean-ink: "#0E2A47"
  aegean-mut: "#4A6180"
  aegean-rule: "#DCE5EF"
  aegean-inset: "#EEF3F9"
  aegean-primary: "#0E4C92"
  aegean-on-primary: "#FFFFFF"
  aegean-head-mut: "#C6D8EE"
  aegean-dark-ground: "#06172A"
  aegean-dark-block: "#0E223B"
  aegean-dark-ink: "#E5EDF7"
  aegean-dark-mut: "#92A7C1"
  aegean-dark-rule: "#1B3150"
  aegean-dark-inset: "#132A47"
  aegean-dark-primary: "#6AAEF5"
  aegean-dark-on-primary: "#06172A"
  aegean-dark-head-mut: "#BFD3EC"
  olive-ground: "#E2E6DC"
  olive-block: "#FBFCF8"
  olive-ink: "#222A1E"
  olive-mut: "#56614D"
  olive-rule: "#E1E5D9"
  olive-inset: "#F1F3EC"
  olive-primary: "#3D5A2C"
  olive-on-primary: "#FFFFFF"
  olive-dark-ground: "#11150E"
  olive-dark-block: "#1B2117"
  olive-dark-ink: "#E8ECE2"
  olive-dark-mut: "#A0AA94"
  olive-dark-rule: "#2A3225"
  olive-dark-inset: "#232A1E"
  olive-dark-primary: "#A3C584"
  olive-dark-on-primary: "#11150E"
  night-ground: "#0F1217"
  night-block: "#1A1F27"
  night-ink: "#EEF1F6"
  night-mut: "#9AA3B2"
  night-rule: "#29303B"
  night-inset: "#222832"
  night-primary: "#F2C230"
  night-on-primary: "#0F1217"
typography:
  display:
    fontFamily: "Commissioner, -apple-system, system-ui, sans-serif"
    fontSize: "72px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontFeature: "tnum"
  headline:
    fontFamily: "Commissioner, -apple-system, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Commissioner, -apple-system, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 800
    lineHeight: 1.2
  body:
    fontFamily: "Commissioner, -apple-system, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Commissioner, -apple-system, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.3
  stamp:
    fontFamily: "Commissioner, -apple-system, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.14em"
  station:
    fontFamily: "Commissioner, -apple-system, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: "14px"
    fontFeature: "tnum"
rounded:
  hairline: "2px"
  stamp: "8px"
  icon: "12px"
  control: "14px"
  block: "20px"
  pill: "999px"
  circle: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  block: "18px"
  card: "28px"
components:
  button-primary:
    backgroundColor: "{colors.graphite-primary}"
    textColor: "{colors.graphite-on-primary}"
    typography: "{typography.title}"
    rounded: "{rounded.control}"
    padding: "16px 18px"
    width: "100%"
  button-secondary:
    backgroundColor: "{colors.graphite-inset}"
    textColor: "{colors.graphite-ink}"
    rounded: "{rounded.control}"
    padding: "16px 18px"
  button-ok:
    backgroundColor: "{colors.ok-bg}"
    textColor: "{colors.ok}"
    rounded: "{rounded.control}"
    padding: "16px 18px"
  button-bad:
    backgroundColor: "{colors.bad-bg}"
    textColor: "{colors.bad}"
    rounded: "{rounded.control}"
    padding: "16px 18px"
  button-link:
    textColor: "{colors.graphite-primary}"
    padding: "8px 4px"
  button-icon:
    backgroundColor: "{colors.graphite-block}"
    textColor: "{colors.graphite-ink}"
    rounded: "{rounded.icon}"
    size: "40px"
  button-say:
    backgroundColor: "{colors.graphite-inset}"
    textColor: "{colors.graphite-ink}"
    rounded: "{rounded.circle}"
    size: "44px"
  input:
    backgroundColor: "{colors.graphite-block}"
    textColor: "{colors.graphite-ink}"
    rounded: "{rounded.control}"
    padding: "14px 16px"
  block:
    backgroundColor: "{colors.graphite-block}"
    rounded: "{rounded.block}"
    padding: "{spacing.block}"
  line-badge:
    textColor: "#FFFFFF"
    typography: "{typography.label}"
    rounded: "{rounded.circle}"
    size: "28px"
  station-mark:
    textColor: "{colors.graphite-ink}"
    typography: "{typography.station}"
    rounded: "{rounded.circle}"
    size: "26px"
  menu-item:
    textColor: "{colors.graphite-ink}"
    padding: "14px 0"
  streak-pill:
    textColor: "{colors.graphite-mut}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "3px 10px 3px 7px"
  streak-pill-on:
    backgroundColor: "{colors.fire-bg}"
    textColor: "{colors.fire}"
    rounded: "{rounded.pill}"
    padding: "3px 10px 3px 7px"
  verdict-stamp:
    typography: "{typography.stamp}"
    rounded: "{rounded.stamp}"
    padding: "7px 10px"
  section-sign:
    backgroundColor: "{colors.graphite-ink}"
    textColor: "{colors.graphite-block}"
    rounded: "{rounded.circle}"
    size: "28px"
  theme-swatch:
    backgroundColor: "{colors.graphite-inset}"
    textColor: "{colors.graphite-ink}"
    rounded: "{rounded.control}"
    padding: "10px 4px 9px"
---

# Design System: Λέξεις

## Overview

**Creative North Star: "The Athens Metro Map"**

Every word is a passenger riding three metro lines at once: blue M1 for Узнать (Greek to Russian), red M2 for Написать (Russian to Greek), green M3 for Услышать (listening). Its review schedule is the line's stations, depot then 1 · 3 · 7 · 14 · 30 · 60 days. The interface is the system map: rounded white blocks set on a tinted ground, a line badge and a station track wherever a direction appears, and one dark reversed button that says where to go next. Verdicts are stamped onto the card like a validated ticket and stay there.

Density is phone-first and calm: one centred column no wider than 440px, blocks stacked 12px apart, three type sizes ranked by weight rather than by size. A single self-hosted face, Commissioner (drawn by a Greek type designer, with full Greek and Cyrillic), carries everything, so Greek content and Russian UI sit in the same voice.

Four themes (Графит, Эгейский, Олива, Ночь) restyle ground, blocks, ink and primary; the three line colours and the state colours never move with the theme. Light and dark follow the system, except Ночь, which is always dark.

**Key Characteristics:**
- Three line colours reserved for the three directions, on every screen that names one.
- Station tracks (line bar, ringed station dots, day scale) as the signature component.
- Rounded white blocks with a soft two-layer shadow on a tinted ground.
- One typeface, three sizes (13 / 17 / 34), weight does the ranking; one 72px count numeral.
- One reversed primary action per screen; secondary actions are tinted, ghost, or link.
- Verdict stamps that land and stay.

## Colors

A quiet theme-tinted neutral world that hands all its saturation to three transit-line colours and a small set of state tints.

### Primary
- **Line Blue M1** (m1-blue; m1-blue-dark in dark): Узнать, Greek to Russian. Badge fill, track bar, ringed station, station-mark outline.
- **Line Red M2** (m2-red; m2-red-dark): Написать, Russian to Greek.
- **Line Green M3** (m3-green; m3-green-dark): Услышать, listening.
- **Theme Primary** (graphite-primary, aegean-primary, olive-primary, night-primary and their dark variants): the one reversed action button, links, caret, focus ring, input focus border, selected theme swatch border. Text on it is the matching on-primary.

### Secondary
- **Success Green** (ok / ok-bg): the «Верно» stamp and the tinted «Знал» button.
- **Error Red** (bad / bad-bg): the «Ошибка» stamp, «Не знал», «Удалить карточку».
- **Amber Warning** (warn / warn-bg): the «Ударение» stamp (correct but stress missing or misplaced).
- **Ember** (fire / fire-bg): the streak and only the streak: the pill while it is alive, and the streak line on the streak screen and the milestone cheer. Nothing else is warm.

### Neutral
Each theme defines the same six roles, light and dark:
- **Ground** (`*-ground`): the page behind blocks, also the PWA theme-color.
- **Block** (`*-block`): every container surface.
- **Ink** (`*-ink`): primary text.
- **Muted** (`*-mut`): secondary text, zero counts, station day labels, placeholders.
- **Rule** (`*-rule`): 1px dividers between list rows and input strokes.
- **Inset** (`*-inset`): example sentence well, secondary buttons, speaker buttons, theme swatches.

Эгейский is the one theme that also reverses the header block: in Эгейский the Λέξεις header fills with aegean-primary (light and dark), ink goes white, meta text uses aegean-head-mut / aegean-dark-head-mut. Other themes keep the header as an ordinary block.

### Named Rules
**The Three Lines Rule.** M1 blue, M2 red and M3 green belong to Узнать, Написать and Услышать and to nothing else. No theme, state, or decoration may borrow them, and a direction is never shown without its line colour.

**The Themes Leave The Lines Alone Rule.** A theme changes ground, block, ink, muted, rule, inset and primary. It never changes the line colours or the state colours.

**The Warm Only When Alive Rule.** Ember belongs to the streak: the pill while the streak is running (a dead streak is an outlined muted pill), and the streak screen's line, where ember marks practised days and the way travelled.

## Typography

**Display Font:** Commissioner (variable 400–800, self-hosted Greek, Cyrillic, Latin, Latin-ext subsets) with -apple-system, system-ui, sans-serif
**Body Font:** Commissioner, same stack

**Character:** One humanist sans for Greek and Cyrillic alike; contrast comes from weight (400 / 500 / 700 / 800) and from reversal, not from extra sizes.

### Hierarchy
- **Display** (800, 72px, line-height 1, -0.03em, tabular): the home count of cards due today. Only this numeral.
- **Headline** (800, 34px, 1.1, -0.02em): the Λέξεις title and the card word (word uses 1.2, -0.01em).
- **Title** (800, 17px, 1.2): block and screen headings; buttons use 700 17px.
- **Body** (400, 17px, 1.45): all running text; 500 for menu items and example sentences, 700 for the Russian meaning on the card.
- **Label** (700, 13px): line names, form labels, station "when" column, sub-lines and meta at 400 muted.
- **Station** (600, 11px, tabular): day numbers under station tracks and inside dictionary station marks (700 there).
- **Stamp** (800, 13px, uppercase, 0.14em): verdict stamps only.

### Named Rules
**The Three Sizes Rule.** Text is 13, 17 or 34px. The 72px count and the 11px station numerals are the only exceptions; emoji glyphs are content, not type.

**The Weight Ranks Rule.** When something needs more emphasis, raise weight or reverse it onto primary; do not add a size.

**The Tabular Numbers Rule.** Every count, progress fraction and day number uses tabular figures.

## Layout

A single centred column (max-width 440px) inside safe-area-aware body padding (16px sides, at least 16px top, 20px bottom). Screens are a vertical stack of blocks with 12px between them; block padding is 18px, the review card 28px 20px. Rows of paired actions sit side by side with a 10px gap and 12px top margin.

Screens other than home open with a top bar (44px min height): a 40px back/close icon button, then the title or, during review, the line badge, line name, a progress track whose train glides along, and a tabular `n/total` count.

Home is ordered: centred header block (Λέξεις, a 36px avatar button in its top-right corner, word count link, streak pill, «повтори сегодня» when due) → today block (72px count, muted sub-line, three line rows each badge / name + station track / count, a station day scale aligned under the tracks, full-width «Поехали») → add-word block (auto-growing textarea + square add button that turns primary once there is text; no clear × here, the add button is the field's only action) → status line → grouped menu block (Словарь, Как это работает). Everything personal — statistics, reminders, theme, API keys, export/import, sign-out — lives on the account screen behind the avatar.

Line rows use a three-column grid (28px badge / track / 28px count); the card view schedule uses 28px / track / 96px "when".

## Elevation & Depth

Hybrid of tonal layering and one soft ambient shadow. Blocks lift off the tinted ground with the same shadow everywhere; inside a block, depth is conveyed by the inset tint, never by a second shadow.

### Shadow Vocabulary
- **Block lift** (`box-shadow: 0 1px 2px rgba(16,24,40,.05), 0 8px 24px rgba(16,24,40,.06)`; dark: `0 1px 2px rgba(0,0,0,.3), 0 8px 24px rgba(0,0,0,.28)`): every block, the 40px icon button, the login button, splash flip faces.
- **Station halo** (`box-shadow: 0 0 0 3px <block>`): the ringed current station, to clear it from the track.

### Named Rules
**The One Shadow Rule.** There is a single shadow token. Nothing gets a stronger or offset shadow; hierarchy comes from reversal and weight.

## Shapes

Soft, transit-signage geometry. Blocks round at 20px, controls (buttons, inputs, example well, swatches) at 14px, compact icon buttons at 12px, stamps at 8px. Everything that represents a line or station is a perfect circle: line badges, station dots, station marks, speaker buttons, avatars. The streak is a full pill. Track bars are 4px tall with 2px ends. Dividers are 1px rule lines between list rows; blocks themselves have no border.

## Components

### Buttons
Confident, full-width, pressable.
- **Shape:** gently rounded (14px), full width by default, 16px 18px padding, 700 17px label.
- **Primary (reversed):** theme primary fill, on-primary text. One per screen: «Поехали», «Проверить», «Дальше», «Сохранить», «Войти через Google». Deliberate exception, asked for by the owner: on home the square add-word button becomes a second reversed primary, but only while its field has text; empty, it is inset.
- **Press / Focus:** scales to 0.97 on press over 0.15s with `cubic-bezier(.16,1,.3,1)` (icon buttons and theme swatches 0.92, speaker buttons 0.88); on hover-capable pointers a filled button tints 8% toward its own text colour, a link fades to 0.7; focus-visible draws a 2px primary outline at 2px offset; disabled drops to 0.4 opacity.
- **Secondary:** inset fill, ink text («Засчитать»).
- **Verdict pair:** «Не знал» in bad-bg / bad and «Знал» in ok-bg / ok, side by side.
- **Link:** no fill, primary text, 8px 4px; muted 13px for destructive afterthoughts («Удалить карточку» under a review card).
- **Icon:** 40px square, 12px radius, block fill with block shadow, 20px stroke icon (back, close).
- **Speaker:** circular inset button, 44px beside the word, 34px for example and 28px for forms, 104px on the listening card.

### Line badge and station track (signature)
- **Badge:** 28px circle in the line colour with a white mark: Ε for Узнать, Р for Написать, an ear stroke icon for Услышать.
- **Track:** 4px line-coloured bar with seven 12px stations (depot + six intervals), hollow (block fill, 3px line-coloured ring) or lit (filled). The word's current station grows to a 20px ring with a block-coloured halo.
- **Day scale:** 11px muted day numbers (· 1 3 7 14 30 60) aligned under the tracks.
- **Review progress:** the same track at 30% opacity with a solid fill and a 16px train dot that glides 0.6s along it.
- **Screen change (the train pulls in):** a 3px rail sweeps the top of the viewport, just under the safe-area inset, in the direction of travel: left→right, right→left when going back via #x. It is the three lines stacked 1px each (M1, M2, M3), or the destination's line colour when entering a review. 0.4s ease-in-out; the head runs ahead, the tail follows and leaves. Behind it the screen's top-level blocks open like doors from their centre (clip-path, opacity 0→1, 0.24s, 40ms then 40ms apart, all done by 440ms). Nothing translates, so nothing shifts, there is no horizontal scrollbar, and the review top bar and its train stay put. Only a different screen plays it: in-place re-renders (search filter, background refresh, account re-render after Save, theme swatches) and review card-to-card don't. Reduced motion: no rail, blocks just fade.
- **Swipe back (js/swipe.js):** a pull from the left 32px edge on any screen with a back button drags the current screen on a layer (ground background, soft left shadow) that follows the finger; the previous screen is already rendered beneath, 30% to the left and dimmed, and slides into place as you pull. Release past 35% of the width or with a flick to finish, otherwise it springs back and the same screen (live nodes, handlers intact) returns. 0.3s settle; the train rail doesn't play for it.
- **Swipe a review card (swipeCard in js/swipe.js):** on the answer card, a horizontal drag moves and tilts it (dx/24 deg); the button it will press (#y right, #n left) shows on the card as a stamp-styled tag in ok/bad colour, fading in over 90px. Release past 30% or with a flick: it flies off and presses that button; otherwise it settles back (0.25s). With no button that way it resists (¼ speed). Drags from the 32px left edge belong to swipe-back.

### Station marks (dictionary)
Each dictionary row ends with three 26px outlined circles, one per line, 2px line-coloured ring, holding the current station's day number (or · at the depot) in 700 11px ink. Rows otherwise show the emoji, the Greek word (700, ellipsis) and a 13px muted translation.

### Verdict stamp
Absolute, top-right of the answered card, rotated -8deg, 2px currentColor border, 8px radius, uppercase 800 13px at 0.14em: «Верно» (ok), «Ударение» (warn), «Ошибка» (bad). It lands with a 0.45s scale-from-1.8 animation and stays on the card.

### Cards / Containers
- **Corner Style:** 20px.
- **Background:** block.
- **Shadow Strategy:** block lift (see Elevation).
- **Border:** none; internal sections split by 1px rule (Russian meaning) or by an inset well (example).
- **Internal Padding:** 18px; review card 28px 20px, front faces at least 300px tall and centred.
- **Entrance:** cards rise 8px from 0.4 opacity over 0.35s.

### Inputs / Fields
- **Style:** block fill, 1px rule stroke, 14px radius, 14px 16px padding, primary caret. Review answers are centred 600.
- **Focus:** stroke switches to primary; no outline ring on inputs.
- **Add-word field:** borderless auto-growing textarea inside its own block, paired with a 44px square add button.

### Navigation
- **Menu block:** grouped list of rows inside one block, 14px vertical padding, 500 17px ink, 1px rule dividers, muted value and an 18px chevron on the right; press fades to 0.6 and nudges the chevron 4px right (hover: 2px). Dictionary rows press to inset fill with the emoji shrinking to 0.88.
- **Account:** 36px circular avatar in a 44px button (Google photo or initial on inset, aria-label «Аккаунт») in the head corner opens the account screen. It opens on the rider's travel pass («проездной»): a block with a 6px theme-primary stripe across its top edge, 56px avatar, name, muted email, and a fare strip below in an inset well, three equal cells split by 1px rules, each a 17px 800 tabular number over a 13px muted label: words in the dictionary, learned (a button in primary that opens Статистика), current streak in days. Then the Статистика row, then sections headed like metro signage: a 28px round pictogram in the line-badge shape but ink-filled with a block-coloured 15px stroke icon (bell, contrast, key, archive; never a line colour), then the 17px title. Sections: Напоминания (iOS-style switch + hour select), Тема (roundels, below), Ключи API (two fields with the eye) — both forms keep a secondary «Сохранить» disabled until something changes; Данные (export/import rows); a full-width «Выйти» in bad tint at the bottom.

### Streak pill
13px 700 pill with a 14px flame icon. Dead streak: outlined in currentColor, header-muted. Alive: ember fill (fire-bg) with fire text, no border. It opens the streak screen.

### Streak screen: the streak line
The streak is a fourth line, drawn in ember instead of a metro colour, with the same station vocabulary as the tracks.
- **Station:** 26px circle, block fill, 3px ember ring, the date in 700 11px ink. Practised: ember fill, date in block colour. Frozen (a spent freeze): ink fill and ring, block-coloured 14px snowflake in place of the date. Missed: 2px dashed muted ring, muted date, off the line. Ahead: 2px rule ring, muted date. Today is the current station: 32px, 4px ring, block halo; once practised it fills, with a 2px block ring inside.
- **Calendar:** the last five weeks, Monday first, one row per week under 11px muted weekday initials (П В С Ч П С В). A 4px ember track runs between consecutive practised, frozen and (while the streak lives) today's stations and crosses row ends, so a run reads as one line wrapping week to week; a missed day breaks it; days ahead sit on a rule-coloured track. Each station is `role="img"` with the full date and state as its label. Legend: занимались / заморозка / пропуск / сегодня as 16px stations.
- **Next milestone:** a trip from the last milestone (12px filled station) to the next as a 36px terminus with its number; the way travelled is a 4px ember track up to the ringed current station, the rest a 2px muted line. Header «Цель: N дней» with a muted `n/goal`, then «Ещё N дней».
- **Freezes:** the two slots are 36px stations on a 2px muted siding: banked = ink fill with a block snowflake (the same token a spent freeze leaves on the calendar), empty = 2px muted ring and muted snowflake.
- **Milestone cheer (home):** the reached terminus: a 56px ember-filled station with a block ring inside and the milestone number in 800 17px, popping in once (0.7s overshoot; off under reduced motion), beside the congratulation.

### Theme picker
Four equal swatch buttons in a row: inset tile, 14px radius, a 34px station roundel in the theme's own primary rimmed 3px with its ground (plus a 1px hairline), carrying the name's first letter in 800 13px on-primary like a line badge's mark, then the 600 13px name. The selected tile gets a 2px primary border.

### Card-making splash
A 150 × 190 card flips in 3D (2.6s loop) between the typed word and its result on a primary face, above three small line badges and a 13px muted step line.

### Icons
Inline SVG only, 24px viewBox drawn at 20px, 2px round stroke, no fill, currentColor. Sizes step down to 18 (chevrons), 15 (badges, status), 14 (streak, forms speaker).

## Do's and Don'ts

### Do:
- **Do** give every direction its line colour and badge wherever it appears (home rows, review top bar, card schedule, dictionary marks, splash).
- **Do** keep exactly one reversed primary button per screen; make every other action secondary, tinted, link or icon. The one exception is the add-word button, primary only while its field has text.
- **Do** rank text by weight (400 / 500 / 700 / 800) inside the 13 / 17 / 34 sizes.
- **Do** use the single block shadow and the 20 / 14 / 12px radius steps.
- **Do** leave verdict stamps on the card after answering.
- **Do** let a new screen pull in like a train: the rail sweeps the top in the direction of travel and the blocks open like doors (see Screen change). Re-rendering the same screen (background refresh, next review card) doesn't replay it.
- **Do** honour `prefers-reduced-motion`: flip, card rise, stamp, train and milestone-cheer animations switch off; the screen-change rail is dropped and its blocks only fade.

### Don't:
- **Don't** use M1, M2 or M3 for anything except their directions, and don't let a theme recolour them.
- **Don't** add text sizes beyond 13 / 17 / 34, the 72px count and the 11px station numerals.
- **Don't** put eyebrow or kicker labels above blocks; the today block opens on its count.
- **Don't** use warm colour anywhere except the streak (live pill, streak line, milestone cheer).
- **Don't** add icon fonts or glyph icons; icons are inline stroke SVGs (the Ε and Р line marks are letters, not icons).
