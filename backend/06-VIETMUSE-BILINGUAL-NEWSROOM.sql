-- VietMuse V12: pair Vietnamese and English articles and save atomically.
-- Apply AFTER 02-V3-SUPABASE.sql, 03-VIETMUSE-BILINGUAL.sql,
-- and 04-VIETMUSE-NEWSROOM.sql. Additive and safe to re-run.
-- NEVER put service_role keys or administrative SQL in a public web app.
BEGIN;
ALTER TABLE public.news_posts ADD COLUMN IF NOT EXISTS translation_group uuid;
ALTER TABLE public.news_posts ADD COLUMN IF NOT EXISTS source_key text;
ALTER TABLE public.news_posts ADD COLUMN IF NOT EXISTS source_name text;
ALTER TABLE public.news_posts ADD COLUMN IF NOT EXISTS source_url text;
CREATE UNIQUE INDEX IF NOT EXISTS vm_news_pair_unique ON public.news_posts (translation_group, language)
  WHERE translation_group IS NOT NULL AND post_type='news';
CREATE UNIQUE INDEX IF NOT EXISTS vm_news_source_unique ON public.news_posts (source_key, language)
  WHERE source_key IS NOT NULL AND post_type='news';
CREATE INDEX IF NOT EXISTS vm_news_translation_group ON public.news_posts (translation_group)
  WHERE translation_group IS NOT NULL;
-- If the 36 drafts were imported using the PREVIOUS SQL package, link its known
-- VI/EN records without re-importing their content. Missing IDs are ignored.
DO $vm_pair_existing_drafts$
DECLARE
  v_item record;
  v_group uuid;
BEGIN
  FOR v_item IN SELECT * FROM (VALUES
(1,'8b4f6632-4338-5436-aafd-483fe9bb4a1b'::uuid,'9519bfb6-ce73-5ca5-b882-e95c947a7010'::uuid),
(2,'77bb7ea2-8622-5fe5-ad37-1680aa295235'::uuid,'3cc6ce41-c23c-5898-b78e-11bf39c93f8b'::uuid),
(3,'2999ffc3-b3aa-5c26-89a4-69c93bcce8b6'::uuid,'113994f2-2a3c-5c84-b733-f63ed1d74a15'::uuid),
(4,'7b9822e7-cd03-5f2a-b466-1b946a4520d0'::uuid,'5b2a1c68-34d1-5bc5-9c2e-e8af101a3f27'::uuid),
(5,'fc84d4df-42fb-52c6-a0b9-b8f97ea84db9'::uuid,'d7f84b4f-9717-5437-a136-9063e1894680'::uuid),
(6,'e41c101a-19b5-5895-b590-8149e5001f0b'::uuid,'da537076-8f21-5e6c-8b86-fb8e80b978ca'::uuid),
(7,'594290b4-7b52-5cbc-b396-954f179cc438'::uuid,'91658731-5b27-59b6-af09-afd8445a8b97'::uuid),
(8,'2eec4188-e2a1-56eb-ac8e-1e0afc373a64'::uuid,'c86375c8-31d1-5198-84e2-5e721e884480'::uuid),
(9,'39d4803d-0bcf-5bb6-9378-02ed3efa8c64'::uuid,'a3eeb0d8-99d6-5d9c-82d4-acf233e03e0a'::uuid),
(10,'76a2e8f4-13aa-5550-b297-319b8edb24d7'::uuid,'8d9b5465-62aa-5baf-a8bd-b5846f0e6a9b'::uuid),
(11,'bc6bf79b-0c20-5ed7-8583-19945ba53325'::uuid,'ecd43607-6773-5075-bd48-5b8a2f43dd10'::uuid),
(12,'6f8aeeba-a0a9-5739-9a17-6fb291fde0bc'::uuid,'a5dd0307-1e3c-5a6c-8b64-17cc767da371'::uuid),
(13,'396ca9d0-a3dc-5246-94e1-a4887cf44265'::uuid,'61dcf722-4499-5bbe-93dd-1d1a89b8d1bd'::uuid),
(14,'8bd0b04b-c61f-53e3-8c60-232d4063484c'::uuid,'8541b7a9-33eb-5062-822b-79fbcfdd382d'::uuid),
(15,'5467c61b-8b12-5d04-bdb6-9b0a4e6701eb'::uuid,'c05edcb1-191a-59b6-8abe-312233a9d690'::uuid),
(16,'c8bc7936-b9ae-5a21-9d09-dd27026ba54a'::uuid,'f6b40114-4bc8-5d18-b41e-744710dafd12'::uuid),
(17,'b9328a44-45f0-55a6-b2de-034c0c8c907c'::uuid,'318ec214-369e-5060-bb0a-ee8dce4a55c9'::uuid),
(18,'23bb5935-30fe-5dd0-8ce2-e6cfbddd485b'::uuid,'b1f0525e-f5a2-5670-a39c-c181608c0e65'::uuid)
  ) AS existing_pair(article_no,vi_id,en_id) LOOP
    SELECT translation_group INTO v_group FROM public.news_posts
    WHERE id IN (v_item.vi_id,v_item.en_id) AND translation_group IS NOT NULL LIMIT 1;
    v_group := coalesce(v_group,gen_random_uuid());
    UPDATE public.news_posts
       SET translation_group=coalesce(translation_group,v_group),
           source_key=coalesce(source_key,'docs-week8-'||v_item.article_no)
     WHERE id IN (v_item.vi_id,v_item.en_id)
       AND (translation_group IS NULL OR translation_group=v_group);
  END LOOP;
END;
$vm_pair_existing_drafts$;
COMMIT;

-- One RPC call = one database transaction. If one language fails, neither is committed.
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
    IF char_length(v_title) NOT BETWEEN 8 AND 180 OR char_length(v_excerpt) NOT BETWEEN 15 AND 400
       OR char_length(v_body) NOT BETWEEN 60 AND 30000 THEN
      RAISE EXCEPTION 'Invalid % version: title 8-180, summary 15-400, body 60-30000 characters',v_lang;
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

-- Confirm the migration:
SELECT column_name FROM information_schema.columns
WHERE table_schema='public' AND table_name='news_posts'
AND column_name IN ('translation_group','source_key','source_name','source_url')
ORDER BY column_name;
