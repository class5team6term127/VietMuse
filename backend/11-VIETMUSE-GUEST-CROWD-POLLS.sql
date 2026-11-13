-- VIETMUSE V29 | MIGRATION 11 | GUEST CROWD POLL VOTING
-- REQUIREMENT: SQL 10 already installed; Supabase Auth > Providers > Anonymous Sign-ins enabled.
-- Safe to run again. Replaces ONLY news_crowd_get and news_crowd_vote RPC definitions.
-- Does not delete existing votes, polls, stories, roles, or accounts.
-- V24 Forum poll access controls remain unchanged.

BEGIN;

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
  IF auth.uid() IS NOT NULL THEN
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


CREATE OR REPLACE FUNCTION public.news_crowd_vote(p_group uuid, p_choice_index integer)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE p public.news_crowd_polls%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'A valid account or anonymous guest session is required to vote';
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


-- Guests first call Supabase Auth signInAnonymously(), then use the AUTHENTICATED RPC.
-- Do NOT grant anonymous Postgres role (anon) EXECUTE on vote; it lacks an Auth UID.
REVOKE ALL ON FUNCTION public.news_crowd_vote(uuid,integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.news_crowd_vote(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.news_crowd_get(uuid) TO anon, authenticated;

COMMIT;
NOTIFY pgrst, 'reload schema';

-- Read-only verification:
SELECT
  to_regprocedure('public.news_crowd_vote(uuid,integer)') IS NOT NULL AS vote_rpc_ready,
  to_regprocedure('public.news_crowd_get(uuid)') IS NOT NULL AS results_rpc_ready,
  has_function_privilege('authenticated','public.news_crowd_vote(uuid,integer)','EXECUTE') AS guest_session_can_vote;
