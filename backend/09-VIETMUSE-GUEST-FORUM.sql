-- VietMuse V24 · Safe, moderated guest forum submissions.
-- Requires the existing 02/V3 news_posts schema; run in Supabase SQL Editor.
-- Safe to rerun. Never stores a privileged/service-role key in the browser.
-- IMPORTANT: Also enable Authentication > Providers > Anonymous Sign-ins in Supabase.

BEGIN;

-- Anonymous Auth users are "authenticated" at the Postgres role level.
-- Check the trusted JWT claim, not a browser-provided form field.
CREATE OR REPLACE FUNCTION public.vm_guest_forum_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $vm$
DECLARE
  is_guest boolean;
  recent_posts integer;
BEGIN
  is_guest := COALESCE((auth.jwt()->>'is_anonymous')::boolean,false);
  IF NOT is_guest THEN
    RETURN NEW;
  END IF;

  -- A guest can only submit a pending Forum post owned by their own Auth UID.
  IF NEW.user_id IS DISTINCT FROM auth.uid()
    OR NEW.post_type IS DISTINCT FROM 'forum'
    OR NEW.category IS DISTINCT FROM 'goc-nhin'
    OR NEW.status IS DISTINCT FROM 'pending'
    OR NEW.published_at IS NOT NULL
  THEN
    RAISE EXCEPTION 'Guest submissions must be pending perspectives owned by the guest';
  END IF;

  -- Never trust client-supplied timestamps/cover URLs for guest submissions.
  -- Otherwise a forged created_at could evade the daily rate limit.
  NEW.created_at := NOW();
  NEW.updated_at := NOW();
  NEW.cover_url := NULL;
  NEW.rejection_reason := NULL;

  -- Serialize concurrent submissions for the same guest UID.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(NEW.user_id::text, 20261110)
  );

  -- Maximum 3 submissions per guest identity within 24 hours.
  SELECT COUNT(*) INTO recent_posts
  FROM public.news_posts
  WHERE user_id = NEW.user_id
    AND post_type = 'forum'
    AND created_at >= NOW() - INTERVAL '24 hours';
  IF recent_posts >= 3 THEN
    RAISE EXCEPTION 'Guest submission limit reached (3 submissions per 24 hours)';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.news_posts
    WHERE user_id = NEW.user_id
      AND post_type = 'forum'
      AND created_at >= NOW() - INTERVAL '10 minutes'
  ) THEN
    RAISE EXCEPTION 'Please wait 10 minutes before submitting another guest perspective';
  END IF;
  RETURN NEW;
END;
$vm$;

REVOKE ALL ON FUNCTION public.vm_guest_forum_rate_limit() FROM PUBLIC;
DROP TRIGGER IF EXISTS vm_guest_forum_rate_limit ON public.news_posts;
CREATE TRIGGER vm_guest_forum_rate_limit
BEFORE INSERT ON public.news_posts
FOR EACH ROW EXECUTE FUNCTION public.vm_guest_forum_rate_limit();

-- Guest sessions are authenticated but should not gain access to features
-- the site reserves for registered accounts. Restrictive RLS policies are
-- necessary because ordinary RLS policies are joined with OR.
DROP POLICY IF EXISTS vm_no_guest_comment_submit ON public.news_comments;
CREATE POLICY vm_no_guest_comment_submit
ON public.news_comments AS RESTRICTIVE
FOR INSERT TO authenticated
WITH CHECK (COALESCE((SELECT (auth.jwt()->>'is_anonymous')::boolean),false)=false);

DROP POLICY IF EXISTS vm_no_guest_votes ON public.news_votes;
CREATE POLICY vm_no_guest_votes
ON public.news_votes AS RESTRICTIVE
FOR ALL TO authenticated
USING (COALESCE((SELECT (auth.jwt()->>'is_anonymous')::boolean),false)=false)
WITH CHECK (COALESCE((SELECT (auth.jwt()->>'is_anonymous')::boolean),false)=false);

-- Keep the public storage bucket for registered members only.
-- An editor can add images when reviewing a guest's text submission.
DROP POLICY IF EXISTS vm_no_guest_cover_upload ON storage.objects;
CREATE POLICY vm_no_guest_cover_upload
ON storage.objects AS RESTRICTIVE
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id <> 'news-covers'
  OR COALESCE((SELECT (auth.jwt()->>'is_anonymous')::boolean),false)=false
);

COMMIT;
NOTIFY pgrst, 'reload schema';

-- VERIFY (read-only): returns 1 if the trigger was installed.
SELECT COUNT(*) AS guest_limiter_installed
FROM pg_trigger
WHERE tgrelid = 'public.news_posts'::regclass
  AND tgname = 'vm_guest_forum_rate_limit'
  AND NOT tgisinternal;
