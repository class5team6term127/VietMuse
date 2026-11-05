VIETMUSE V8 — NEWSROOM ADMIN
==========================
Open HUONG-DAN-V8-NEWSROOM.md for step-by-step Vietnamese instructions.

ORDER:
1. Run backend/04-VIETMUSE-NEWSROOM.sql in Supabase SQL Editor
   (run backend/03-VIETMUSE-BILINGUAL.sql first if language column is missing).
2. Check Storage bucket news-covers is Public and its RLS policy exists.
3. Upload changed frontend files to existing GitHub repository.
4. Sign in as an already authorized Administrator.
5. Open quan-ly-bao.html, create/edit/publish articles, inspect views.

No secret keys in this release; config.js contains only the existing public project URL and publishable key.
Do not put service_role or secret keys into any GitHub Pages file.
