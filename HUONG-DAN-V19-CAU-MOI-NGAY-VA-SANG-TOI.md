# VietMuse V19 — One daily sentence + automatic light/dark logos

## Files to update on GitHub
- assets/js/app.js — replaces the old header slogan with the daily line slot; swaps the three logo placements to responsive `<picture>` markup.
- assets/js/daily-quote.js — self-contained library of 91 original bilingual VI/EN quotes, selected as a matched pair by Vietnam calendar date (Asia/Ho_Chi_Minh). No API / backend required.
- assets/css/style.css — masthead layout on desktop/tablet/mobile, dark-mode color tokens, and daily line styling.
- assets/images/vietmuse-mark-light.webp — optimized light-mode emblem from the supplied Google Drive image.
- assets/images/vietmuse-mark-dark.webp — optimized dark-mode emblem from the supplied Google Drive image.
- all root .html files — updated script references/cache versions so the new script runs on every page.

## How it works
1. Website loads; based on today's date in Vietnam, it chooses exactly one VI/EN quote pair.
2. The VI/EN site toggle reloads into the corresponding translation of the *same* quote.
3. A background check every minute and when tab becomes active refreshes the quote if midnight in Vietnam passes.
4. `<picture>` auto-switches logo image using `prefers-color-scheme`, including while OS setting changes. The site's basic surface color palette now adapts to OS dark mode.
5. The daily quote is visible below the logo on phone and tablet.
6. After the full 91-day quote cycle it repeats; edit the QUOTES array to add more lines.

**No database migration or Supabase change is needed.** All articles and login configuration are preserved.

## Install
1. Download and unzip the small V19 update; upload files to the same repository paths (do NOT overwrite `assets/js/config.js`).
2. Commit and wait for GitHub Pages deploy. Open a private tab to avoid stale cached files.
3. Check date, switch site VI/EN, and switch system appearance light/dark to test the images.

## Caveats
The site previously did not have full dark-mode styling for all older components. V19 adds OS-aware base palette, but highly customized older CMS panels may still need further contrast refinement. Never claim live GitHub Pages testing or Supabase testing without performing it.

Original reference images: provided by the project owner through two Google Drive links (light/dark). Resized and compressed from 6400 × 6400 PNGs for web delivery.
