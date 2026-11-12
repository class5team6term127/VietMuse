-- VietMuse V27 - Optional crowd polls on official bilingual news stories.
-- Run AFTER migrations 02, 03, 06 and 07. Safe to run again.
-- Does not change the existing Forum poll schema, the news_save_bilingual RPC,
-- the news_posts constraint, article content, or existing votes.
-- No secret API key is needed in browser code.

BEGIN;

CREATE TABLE IF NOT EXISTS public.news_crowd_polls (
  article_group uuid PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT true,
  question_vi varchar(240) NOT NULL,
  question_en varchar(240) NOT NULL,
  choices jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vm_crowd_choices_array CHECK (
    jsonb_typeof(choices) = 'array'
    AND jsonb_array_length(choices) BETWEEN 2 AND 6
  )
);

CREATE TABLE IF NOT EXISTS public.news_crowd_votes (
  article_group uuid NOT NULL REFERENCES public.news_crowd_polls(article_group) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  choice_index smallint NOT NULL CHECK(choice_index BETWEEN 0 AND 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (article_group, user_id)
);
CREATE INDEX IF NOT EXISTS idx_news_crowd_votes_choice ON public.news_crowd_votes(article_group, choice_index);

ALTER TABLE public.news_crowd_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_crowd_votes ENABLE ROW LEVEL SECURITY;
-- All access goes through restricted RPCs; no direct browser table access.
REVOKE ALL ON TABLE public.news_crowd_polls, public.news_crowd_votes FROM PUBLIC, anon, authenticated;

-- View/edit unpublished polls only for verified editorial accounts.
CREATE OR REPLACE FUNCTION public.news_crowd_editor_get(p_group uuid)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = ''
AS $$
DECLARE p public.news_crowd_polls%ROWTYPE;
count_votes bigint;
BEGIN
  IF (SELECT private.news_role()) NOT IN ('admin','editor') THEN
    RAISE EXCEPTION 'Editorial role required';
  END IF;
  IF p_group IS NULL THEN RETURN NULL; END IF;
  SELECT * INTO p FROM public.news_crowd_polls WHERE article_group = p_group;
  IF NOT FOUND THEN RETURN NULL; END IF;
  SELECT count(*) INTO count_votes FROM public.news_crowd_votes WHERE article_group = p_group;
  RETURN jsonb_build_object('enabled',p.enabled,'question_vi',p.question_vi,
    'question_en',p.question_en,'choices',p.choices,'votes',count_votes);
END;
$$;

-- Save/edit/disable the single bilingual poll shared by both article versions.
-- For safety, questions/options cannot change once any reader has voted.
CREATE OR REPLACE FUNCTION public.news_crowd_save(
  p_group uuid, p_enabled boolean, p_question_vi text,
  p_question_en text, p_choices jsonb
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE p public.news_crowd_polls%ROWTYPE;
norm_choices jsonb := '[]'::jsonb;
item jsonb;
vi text;
en text;
seen_vi text[] := ARRAY[]::text[];
seen_en text[] := ARRAY[]::text[];
vote_count bigint;
qvi text := trim(coalesce(p_question_vi,''));
qen text := trim(coalesce(p_question_en,''));
BEGIN
  IF auth.uid() IS NULL OR (SELECT private.news_role()) NOT IN ('admin','editor') THEN
    RAISE EXCEPTION 'Editor or administrator permission required';
  END IF;
  IF p_group IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.news_posts WHERE translation_group=p_group AND post_type='news'
  ) THEN RAISE EXCEPTION 'Save the bilingual news article before its crowd poll'; END IF;

  SELECT * INTO p FROM public.news_crowd_polls
    WHERE article_group=p_group FOR UPDATE;

  IF NOT coalesce(p_enabled,false) THEN
    -- Preserve prior answers when turning a poll off.
    IF FOUND THEN
      UPDATE public.news_crowd_polls
      SET enabled=false, updated_at=now() WHERE article_group=p_group;
    END IF;
    RETURN jsonb_build_object('enabled',false,'article_group',p_group);
  END IF;

  IF char_length(qvi) NOT BETWEEN 8 AND 240 OR char_length(qen) NOT BETWEEN 8 AND 240 THEN
    RAISE EXCEPTION 'Both VI and EN poll questions must be 8-240 characters';
  END IF;
  IF p_choices IS NULL OR jsonb_typeof(p_choices)<>'array'
     OR jsonb_array_length(p_choices) NOT BETWEEN 2 AND 6 THEN
    RAISE EXCEPTION 'A crowd poll needs 2-6 bilingual choices';
  END IF;
  FOR item IN SELECT value FROM jsonb_array_elements(p_choices) LOOP
    IF jsonb_typeof(item)<>'object' THEN RAISE EXCEPTION 'Invalid poll choice'; END IF;
    vi := trim(coalesce(item->>'vi',''));
    en := trim(coalesce(item->>'en',''));
    IF char_length(vi) NOT BETWEEN 1 AND 120 OR char_length(en) NOT BETWEEN 1 AND 120 THEN
      RAISE EXCEPTION 'Each poll option needs VI and EN labels (1-120 characters)';
    END IF;
    IF lower(vi)=ANY(seen_vi) OR lower(en)=ANY(seen_en) THEN
      RAISE EXCEPTION 'Poll choices must be distinct in both languages';
    END IF;
    seen_vi := array_append(seen_vi,lower(vi));
    seen_en := array_append(seen_en,lower(en));
    norm_choices := norm_choices || jsonb_build_array(jsonb_build_object('vi',vi,'en',en));
  END LOOP;

  IF p.article_group IS NOT NULL THEN
    SELECT count(*) INTO vote_count FROM public.news_crowd_votes WHERE article_group=p_group;
    IF vote_count>0 AND (p.question_vi IS DISTINCT FROM qvi
      OR p.question_en IS DISTINCT FROM qen OR p.choices IS DISTINCT FROM norm_choices) THEN
      RAISE EXCEPTION 'This poll already has votes. You may disable it, but cannot rewrite the question or choices';
    END IF;
    UPDATE public.news_crowd_polls SET enabled=true, question_vi=qvi,
      question_en=qen,choices=norm_choices,updated_at=now()
      WHERE article_group=p_group;
  ELSE
    INSERT INTO public.news_crowd_polls(article_group,enabled,question_vi,question_en,choices)
    VALUES (p_group,true,qvi,qen,norm_choices);
  END IF;
  RETURN jsonb_build_object('enabled',true,'article_group',p_group);
END;
$$;

-- Public result: counts only. Do not expose identities or emails of voters.
CREATE OR REPLACE FUNCTION public.news_crowd_get(p_group uuid)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = ''
AS $$
DECLARE p public.news_crowd_polls%ROWTYPE;
choices_with_counts jsonb;
n bigint;
selected smallint;
BEGIN
  IF p_group IS NULL THEN RETURN NULL; END IF;
  SELECT * INTO p FROM public.news_crowd_polls WHERE article_group=p_group AND enabled;
  IF NOT FOUND OR NOT EXISTS (
    SELECT 1 FROM public.news_posts WHERE translation_group=p_group
      AND post_type='news' AND status='published'
  ) THEN RETURN NULL; END IF;

  SELECT count(*) INTO n FROM public.news_crowd_votes WHERE article_group=p_group;
  IF auth.uid() IS NOT NULL AND coalesce(auth.jwt()->>'is_anonymous','false') <> 'true' THEN
    SELECT choice_index INTO selected FROM public.news_crowd_votes
      WHERE article_group=p_group AND user_id=auth.uid();
  END IF;
  SELECT coalesce(jsonb_agg(
      obj || jsonb_build_object('index',idx-1,
        'votes',(SELECT count(*) FROM public.news_crowd_votes v
          WHERE v.article_group=p_group AND v.choice_index=idx-1))
      ORDER BY idx), '[]'::jsonb)
  INTO choices_with_counts
  FROM jsonb_array_elements(p.choices) WITH ORDINALITY AS o(obj,idx);
  RETURN jsonb_build_object('article_group',p_group,'question_vi',p.question_vi,
    'question_en',p.question_en,'choices',choices_with_counts,
    'total_votes',n,'my_vote',selected);
END;
$$;

-- One vote per registered reader across BOTH language versions. Revoting changes choice.
CREATE OR REPLACE FUNCTION public.news_crowd_vote(p_group uuid, p_choice_index integer)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE p public.news_crowd_polls%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL OR coalesce(auth.jwt()->>'is_anonymous','false')='true' THEN
    RAISE EXCEPTION 'Sign in with a regular account to vote';
  END IF;
  SELECT * INTO p FROM public.news_crowd_polls
    WHERE article_group=p_group AND enabled FOR SHARE;
  IF NOT FOUND OR NOT EXISTS (
    SELECT 1 FROM public.news_posts WHERE translation_group=p_group
      AND post_type='news' AND status='published'
  ) THEN RAISE EXCEPTION 'This crowd poll is not open'; END IF;
  IF p_choice_index IS NULL OR p_choice_index<0
     OR p_choice_index >= jsonb_array_length(p.choices) THEN
    RAISE EXCEPTION 'Invalid poll option';
  END IF;
  INSERT INTO public.news_crowd_votes(article_group,user_id,choice_index)
    VALUES (p_group,auth.uid(),p_choice_index)
  ON CONFLICT(article_group,user_id) DO UPDATE
    SET choice_index=EXCLUDED.choice_index,updated_at=now();
  RETURN jsonb_build_object('saved',true,'choice_index',p_choice_index);
END;
$$;

-- Clean up the poll only after its last language version has been deleted.
CREATE OR REPLACE FUNCTION private.news_crowd_cleanup()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF OLD.post_type='news' AND OLD.translation_group IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.news_posts WHERE translation_group=OLD.translation_group
  ) THEN
    DELETE FROM public.news_crowd_polls WHERE article_group=OLD.translation_group;
  END IF;
  RETURN OLD;
END;
$$;
DROP TRIGGER IF EXISTS trg_news_crowd_cleanup ON public.news_posts;
CREATE TRIGGER trg_news_crowd_cleanup AFTER DELETE ON public.news_posts
FOR EACH ROW EXECUTE FUNCTION private.news_crowd_cleanup();

REVOKE ALL ON FUNCTION public.news_crowd_editor_get(uuid),
  public.news_crowd_save(uuid,boolean,text,text,jsonb),
  public.news_crowd_get(uuid),
  public.news_crowd_vote(uuid,integer)
FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.news_crowd_editor_get(uuid),
  public.news_crowd_save(uuid,boolean,text,text,jsonb),
  public.news_crowd_vote(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.news_crowd_get(uuid) TO anon,authenticated;

NOTIFY pgrst, 'reload schema';
COMMIT;

-- Read-only verification:
SELECT to_regprocedure('public.news_crowd_save(uuid,boolean,text,text,jsonb)') IS NOT NULL AS can_save_poll,
       to_regprocedure('public.news_crowd_get(uuid)') IS NOT NULL AS can_read_poll,
       to_regprocedure('public.news_crowd_vote(uuid,integer)') IS NOT NULL AS can_vote;
