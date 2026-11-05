-- VietMuse V13 - Summary optional on news AND forum posts, Vietnamese and English.
-- Run ONCE in Supabase SQL Editor, after migrations 02, 03, 04, 06.
-- Existing posts are preserved. This does not drop or reset tables.
-- Database keeps the excerpt column NOT NULL; empty summary is stored as ''.
BEGIN;
ALTER TABLE public.news_posts
  ALTER COLUMN excerpt SET DEFAULT '';
-- PostgreSQL names the existing unnamed inline check 'news_posts_excerpt_check'.
-- Drop ONLY the old minimum-length constraint for this column.
ALTER TABLE public.news_posts
  DROP CONSTRAINT IF EXISTS news_posts_excerpt_check;
-- Replace with an explicit maximum-length rule; empty values are valid.
ALTER TABLE public.news_posts
  DROP CONSTRAINT IF EXISTS vm_news_excerpt_optional;
ALTER TABLE public.news_posts
  ADD CONSTRAINT vm_news_excerpt_optional CHECK (char_length(trim(excerpt)) <= 400);
COMMIT;

-- Re-define existing bilingual save RPC with the matching validation rule.
CREATE OR REPLACE FUNCTION public.news_save_bilingual(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
AS $$
DECLARE
  v_role text;
  v_group uuid;
  v_existing uuid;
  v_category text;
  v_status text;
  v_author text;
  v_editor text;
  v_translator text;
  v_cover text;
  v_source text;
  v_source_url text;
  v_source_key text;
  v_variant jsonb;
  v_lang text;
  v_title text;
  v_excerpt text;
  v_body text;
  v_current uuid;
  v_ids jsonb := '{}'::jsonb;
  v_count integer := 0;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in before publishing'; END IF;
  v_role := private.news_role();
  IF v_role NOT IN ('admin','editor') THEN RAISE EXCEPTION 'Editor or administrator role required'; END IF;
  IF p_payload IS NULL OR jsonb_typeof(p_payload) <> 'object' THEN
    RAISE EXCEPTION 'Invalid article payload';
  END IF;
  v_category := trim(coalesce(p_payload->>'category',''));
  IF v_category NOT IN ('thoi-su','doi-song','giao-duc','van-hoa','cong-nghe','kinh-te','moi-truong','du-lich','suc-khoe','giai-tri','the-thao') THEN
    RAISE EXCEPTION 'Invalid news category';
  END IF;
  v_status := coalesce(p_payload->>'status','draft');
  IF v_status NOT IN ('draft','pending','published') THEN RAISE EXCEPTION 'Invalid publishing status'; END IF;
  v_author := trim(coalesce(p_payload->>'author_name',''));
  IF char_length(v_author) NOT BETWEEN 2 AND 80 THEN RAISE EXCEPTION 'Author must be 2-80 characters'; END IF;
  v_editor := nullif(trim(coalesce(p_payload->>'editor_name','')),'');
  v_translator := nullif(trim(coalesce(p_payload->>'translator_name','')),'');
  IF char_length(coalesce(v_editor,''))>100 OR char_length(coalesce(v_translator,''))>100 THEN
    RAISE EXCEPTION 'Editor/translator name is too long';
  END IF;
  v_cover := nullif(trim(coalesce(p_payload->>'cover_url','')),'');
  v_source := nullif(trim(coalesce(p_payload->>'source_name','')),'');
  v_source_url := nullif(trim(coalesce(p_payload->>'source_url','')),'');
  v_source_key := nullif(trim(coalesce(p_payload->>'source_key','')),'');
  IF v_cover IS NOT NULL AND (v_cover !~ '^https://[^[:space:]]+$' OR char_length(v_cover)>=1200) THEN
    RAISE EXCEPTION 'Cover must be a valid HTTPS URL';
  END IF;
  IF v_source_url IS NOT NULL AND (v_source_url !~ '^https://[^[:space:]]+$' OR char_length(v_source_url)>1500) THEN
    RAISE EXCEPTION 'Source URL must be HTTPS';
  END IF;
  IF char_length(coalesce(v_source,''))>200 OR char_length(coalesce(v_source_key,''))>200 THEN
    RAISE EXCEPTION 'Source metadata too long';
  END IF;
  v_existing := nullif(p_payload->>'post_id','')::uuid;
  IF v_existing IS NOT NULL THEN
    SELECT translation_group INTO v_group FROM public.news_posts
      WHERE id=v_existing AND post_type='news' FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Article not found or not editable'; END IF;
  END IF;
  IF v_group IS NULL AND v_source_key IS NOT NULL THEN
    SELECT translation_group INTO v_group FROM public.news_posts
      WHERE source_key=v_source_key AND post_type='news' LIMIT 1;
  END IF;
  v_group := coalesce(v_group,nullif(p_payload->>'group_id','')::uuid,gen_random_uuid());
  -- Upgrade legacy single-language record when edited using this new editor.
  IF v_existing IS NOT NULL THEN
    UPDATE public.news_posts SET translation_group=v_group WHERE id=v_existing AND translation_group IS NULL;
  END IF;
  FOR v_lang IN SELECT unnest(ARRAY['vi','en']) LOOP
    v_variant := p_payload->v_lang;
    IF v_variant IS NULL OR jsonb_typeof(v_variant) <> 'object' THEN
      IF v_status='published' THEN RAISE EXCEPTION 'Both Vietnamese and English versions are required to publish'; END IF;
      CONTINUE;
    END IF;
    v_title := trim(coalesce(v_variant->>'title',''));
    v_excerpt := trim(coalesce(v_variant->>'excerpt',''));
    v_body := trim(coalesce(v_variant->>'body',''));
    IF v_title='' AND v_excerpt='' AND v_body='' THEN
      IF v_status='published' THEN RAISE EXCEPTION 'Both versions must be completed before publishing'; END IF;
      CONTINUE;
    END IF;
    IF char_length(v_title) NOT BETWEEN 8 AND 180 OR char_length(v_excerpt) > 400
       OR char_length(v_body) NOT BETWEEN 60 AND 30000 THEN
      RAISE EXCEPTION 'Invalid % version: title 8-180, summary optional (max 400), body 60-30000 characters',v_lang;
    END IF;
    -- Protect against a source key accidentally colliding with a different group.
    IF v_source_key IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.news_posts WHERE source_key=v_source_key AND post_type='news'
      AND translation_group IS DISTINCT FROM v_group
    ) THEN RAISE EXCEPTION 'Source import key already belongs to another article'; END IF;
    SELECT id INTO v_current FROM public.news_posts
      WHERE translation_group=v_group AND language=v_lang AND post_type='news' LIMIT 1 FOR UPDATE;
    IF v_current IS NULL AND v_source_key IS NOT NULL THEN
      SELECT id INTO v_current FROM public.news_posts
        WHERE source_key=v_source_key AND language=v_lang AND post_type='news' LIMIT 1 FOR UPDATE;
    END IF;
    IF v_current IS NOT NULL THEN
      UPDATE public.news_posts SET
        translation_group=v_group, category=v_category, status=v_status, author_name=v_author,
        editor_name=v_editor, translator_name=v_translator, cover_url=v_cover,
        source_name=v_source, source_url=v_source_url, source_key=COALESCE(v_source_key,source_key),
        title=v_title, excerpt=v_excerpt, body=v_body
      WHERE id=v_current;
    ELSE
      INSERT INTO public.news_posts
      (user_id, post_type, category, language, title, excerpt, body, author_name,
        editor_name,translator_name,cover_url,source_name,source_url,source_key,
        translation_group,poll_enabled,status)
      VALUES
      (auth.uid(),'news',v_category,v_lang,v_title,v_excerpt,v_body,v_author,
        v_editor,v_translator,v_cover,v_source,v_source_url,v_source_key,
        v_group,false,v_status)
      RETURNING id INTO v_current;
    END IF;
    v_ids := v_ids || jsonb_build_object(v_lang,v_current);
    v_count := v_count+1;
    v_current := NULL;
  END LOOP;
  IF v_count=0 THEN RAISE EXCEPTION 'Enter at least one completed language version'; END IF;
  RETURN jsonb_build_object('translation_group',v_group,'posts',v_ids,'status',v_status,'saved_count',v_count);
END;
$$;
REVOKE ALL ON FUNCTION public.news_save_bilingual(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.news_save_bilingual(jsonb) TO authenticated;
NOTIFY pgrst, 'reload schema';

-- Optional check: see summary column default and the enabled validation constraint.
SELECT column_name, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema='public' AND table_name='news_posts' AND column_name='excerpt';
