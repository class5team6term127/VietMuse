-- VIETMUSE V8: ADDITIVE newsroom upgrade for an ALREADY INITIALIZED V3 database.
-- Run once in Supabase > SQL Editor. Safe to re-run: no DROP TABLE, no deletion.
-- IMPORTANT: do NOT upload confidential admin-authorization SQL to a public repo.

begin;

alter table public.news_posts
  add column if not exists editor_name varchar(100),
  add column if not exists translator_name varchar(100);

create index if not exists idx_vm_newsroom_articles
  on public.news_posts (post_type, category, status, published_at desc);

comment on column public.news_posts.editor_name
  is 'Optional named editor credited below the headline.';
comment on column public.news_posts.translator_name
  is 'Optional named translator credited below the headline.';

commit;

-- PostgREST must recognize the new fields for the website API.
notify pgrst, 'reload schema';

-- Check results: editor_name and translator_name should appear.
select column_name, data_type
from information_schema.columns
where table_schema='public' and table_name='news_posts'
  and column_name in ('editor_name','translator_name')
order by column_name;
