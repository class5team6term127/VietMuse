-- VietMuse V4: run ONCE in Supabase Dashboard > SQL Editor.
-- Run backend/02-V3-SUPABASE.sql first if the V3 tables have not been created.
-- Each news/forum post has an original content language; the interface switch does NOT translate user text.
ALTER TABLE public.news_posts
ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'vi';

-- Add an idempotent database constraint.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'news_posts_language_allowed'
    AND conrelid = 'public.news_posts'::regclass
  ) THEN
    ALTER TABLE public.news_posts
    ADD CONSTRAINT news_posts_language_allowed CHECK (language IN ('vi','en'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_news_posts_lang_public
ON public.news_posts (language, status, published_at DESC);

-- Old content is labelled Vietnamese by default. If you have already posted articles
-- in English, relabel them from your trusted Supabase SQL Editor as appropriate.
-- Example (edit the exact ID, NEVER run blindly):
-- UPDATE public.news_posts SET language='en' WHERE id='YOUR-POST-UUID';
