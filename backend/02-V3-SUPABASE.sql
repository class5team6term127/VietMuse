-- THE MOC DAILY V3 — run this entire script in Supabase > SQL Editor.
-- Separate from V2 community_* tables. This does not delete V2 data.
-- NEVER commit a service_role or secret key to GitHub.

create schema if not exists private;

create table if not exists public.news_roles (
  email text primary key check (email = lower(trim(email)) and email ~ '^[^ @]+@[^ @]+\.[^ @]+$'),
  role text not null check (role in ('editor','admin')),
  created_at timestamptz not null default now()
);

-- Read roles from VERIFIED email addresses, never client metadata or browser variables.
create or replace function private.news_role() returns text
language sql stable security definer set search_path = ''
as $$
  select coalesce((select r.role from public.news_roles r
    join auth.users u on lower(u.email) = r.email
    where u.id = (select auth.uid()) and u.email_confirmed_at is not null
    limit 1),'reader');
$$;
revoke all on function private.news_role() from public;
grant usage on schema private to authenticated;
grant execute on function private.news_role() to authenticated;

create or replace function public.news_my_role() returns text
language sql stable security invoker set search_path = ''
as $$ select private.news_role(); $$;
revoke all on function public.news_my_role() from public;
grant execute on function public.news_my_role() to authenticated;

create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  post_type text not null check (post_type in ('news','forum')),
  category text not null check (category in ('thoi-su','doi-song','giao-duc','van-hoa','cong-nghe','kinh-te','goc-nhin','moi-truong','du-lich','suc-khoe','giai-tri','the-thao')),
  author_name varchar(80) not null check (char_length(trim(author_name)) between 2 and 80),
  title varchar(180) not null check (char_length(trim(title)) between 8 and 180),
  excerpt varchar(400) not null check (char_length(trim(excerpt)) between 15 and 400),
  body text not null check (char_length(trim(body)) between 60 and 30000),
  cover_url text check (cover_url is null or (char_length(cover_url)<1200 and cover_url ~ '^https://[^[:space:]]+$')),
  poll_enabled boolean not null default false,
  status text not null default 'pending' check (status in ('draft','pending','published','rejected')),
  rejection_reason varchar(600),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint news_post_kind check (
    (post_type='forum' and category='goc-nhin') or
    (post_type='news' and category<>'goc-nhin' and poll_enabled=false)
  )
);
create index if not exists idx_news_posts_public on public.news_posts(status,published_at desc);
create index if not exists idx_news_posts_owner on public.news_posts(user_id,created_at desc);

create table if not exists public.news_poll_options (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.news_posts(id) on delete cascade,
  label varchar(120) not null check (char_length(trim(label)) between 1 and 120),
  position smallint not null check (position between 1 and 6),
  unique(post_id,position),
  unique(id,post_id)
);
create table if not exists public.news_votes (
  post_id uuid not null references public.news_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  option_id uuid not null,
  created_at timestamptz not null default now(),
  primary key(post_id,user_id),
  foreign key(option_id,post_id) references public.news_poll_options(id,post_id) on delete cascade
);
create table if not exists public.news_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.news_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name varchar(60) not null check (char_length(trim(display_name)) between 2 and 60),
  body varchar(2000) not null check (char_length(trim(body)) between 3 and 2000),
  kind text not null check (kind in ('comment','opinion')),
  status text not null default 'pending' check (status in ('pending','published','rejected')),
  created_at timestamptz not null default now()
);
create index if not exists idx_news_comments_post on public.news_comments(post_id,status,created_at desc);
create table if not exists public.news_metrics (
  post_id uuid primary key references public.news_posts(id) on delete cascade,
  views bigint not null default 0 check(views>=0),
  comments bigint not null default 0 check(comments>=0)
);
create table if not exists public.news_view_dedup (
  post_id uuid not null references public.news_posts(id) on delete cascade,
  token uuid not null,
  day_utc date not null,
  primary key(post_id,token,day_utc)
);

-- Both GRANT and RLS are required for secure access.
alter table public.news_roles enable row level security;
alter table public.news_posts enable row level security;
alter table public.news_poll_options enable row level security;
alter table public.news_votes enable row level security;
alter table public.news_comments enable row level security;
alter table public.news_metrics enable row level security;
alter table public.news_view_dedup enable row level security;
revoke all on table public.news_roles,public.news_posts,public.news_poll_options,public.news_votes,public.news_comments,public.news_metrics,public.news_view_dedup from anon,authenticated;
grant select on public.news_posts,public.news_poll_options,public.news_metrics to anon,authenticated;
grant select,insert,update,delete on public.news_roles to authenticated;
grant insert,update,delete on public.news_posts to authenticated;
grant select,insert,delete on public.news_poll_options to authenticated;
grant select,insert,update,delete on public.news_votes to authenticated;
grant select,insert,update,delete on public.news_comments to authenticated;
-- news_roles already has SELECT access. All operations are protected by RLS.

create policy nr_admin_read on public.news_roles for select to authenticated using ((select private.news_role())='admin');
create policy nr_admin_add on public.news_roles for insert to authenticated with check ((select private.news_role())='admin');
create policy nr_admin_edit on public.news_roles for update to authenticated using ((select private.news_role())='admin') with check ((select private.news_role())='admin');
create policy nr_admin_remove on public.news_roles for delete to authenticated using ((select private.news_role())='admin');

create policy np_public on public.news_posts for select to anon,authenticated using (status='published');
create policy np_own_or_staff on public.news_posts for select to authenticated
  using(user_id=(select auth.uid()) or (select private.news_role()) in ('editor','admin'));
create policy np_reader_or_staff_add on public.news_posts for insert to authenticated with check (
  user_id=(select auth.uid()) and (
    (post_type='forum' and category='goc-nhin' and status='pending' and published_at is null)
    or (post_type='news' and (select private.news_role()) in ('editor','admin'))
  )
);
create policy np_staff_edit on public.news_posts for update to authenticated
  using ((select private.news_role()) in ('editor','admin'))
  with check ((select private.news_role()) in ('editor','admin'));
create policy np_staff_delete on public.news_posts for delete to authenticated
  using ((select private.news_role()) in ('editor','admin'));

create policy no_public on public.news_poll_options for select to anon,authenticated
  using (exists(select 1 from public.news_posts p where p.id=post_id and p.status='published' and p.post_type='forum' and p.poll_enabled));
create policy no_author_or_staff_read on public.news_poll_options for select to authenticated
  using(exists(select 1 from public.news_posts p where p.id=post_id and (p.user_id=(select auth.uid()) or (select private.news_role()) in ('editor','admin'))));
create policy no_submit on public.news_poll_options for insert to authenticated
  with check(exists(select 1 from public.news_posts p where p.id=post_id and p.post_type='forum' and p.poll_enabled and p.status='pending' and p.user_id=(select auth.uid())));
-- Editors may remove options before approval; do not alter active poll results.
create policy no_staff_remove_unpublished on public.news_poll_options for delete to authenticated
  using((select private.news_role()) in ('editor','admin') and exists(select 1 from public.news_posts p where p.id=post_id and p.status<>'published'));

create policy nv_owner_read on public.news_votes for select to authenticated using(user_id=(select auth.uid()));
create policy nv_submit on public.news_votes for insert to authenticated with check(
  user_id=(select auth.uid()) and exists(select 1 from public.news_posts p where p.id=post_id and p.status='published' and p.post_type='forum' and p.poll_enabled)
);
create policy nv_change on public.news_votes for update to authenticated
  using(user_id=(select auth.uid()))
  with check(user_id=(select auth.uid()) and exists(select 1 from public.news_posts p where p.id=post_id and p.status='published' and p.post_type='forum' and p.poll_enabled));
create policy nv_remove on public.news_votes for delete to authenticated using(user_id=(select auth.uid()));

create policy nc_public on public.news_comments for select to anon,authenticated using(status='published');
create policy nc_owner_staff on public.news_comments for select to authenticated
  using(user_id=(select auth.uid()) or (select private.news_role()) in ('editor','admin'));
create policy nc_submit on public.news_comments for insert to authenticated with check(
  user_id=(select auth.uid()) and status='pending' and exists (
    select 1 from public.news_posts p where p.id=post_id and p.status='published' and
    ((p.post_type='news' and kind='comment') or (p.post_type='forum' and kind='opinion'))
  )
);
create policy nc_staff_edit on public.news_comments for update to authenticated
  using((select private.news_role()) in ('editor','admin')) with check((select private.news_role()) in ('editor','admin'));
create policy nc_staff_delete on public.news_comments for delete to authenticated
  using((select private.news_role()) in ('editor','admin'));
create policy nm_public on public.news_metrics for select to anon,authenticated using(true);

-- Forum approval requires valid choices when a poll is enabled.
create or replace function public.news_post_guard() returns trigger language plpgsql set search_path = '' as $$
declare n int;
begin
  new.updated_at=now();
  if new.post_type='forum' and new.status='published' and new.poll_enabled then
    select count(*) into n from public.news_poll_options where post_id=new.id;
    if n<2 then raise exception 'Forum posts need at least two poll choices before approval'; end if;
  end if;
  if new.status='published' then
    if tg_op='INSERT' or old.status is distinct from 'published' then new.published_at=now(); end if;
  else new.published_at=null; end if;
  return new;
end; $$;
drop trigger if exists trg_news_post_guard on public.news_posts;
create trigger trg_news_post_guard before insert or update on public.news_posts
for each row execute function public.news_post_guard();

create or replace function public.news_comment_counter() returns trigger
language plpgsql security definer set search_path='' as $$
declare increment int:=0; k uuid;
begin
  k=case when tg_op='DELETE' then old.post_id else new.post_id end;
  if tg_op='INSERT' and new.status='published' then increment=1;
  elsif tg_op='DELETE' and old.status='published' then increment=-1;
  elsif tg_op='UPDATE' then
    if old.status<>'published' and new.status='published' then increment=1;
    elsif old.status='published' and new.status<>'published' then increment=-1; end if;
  end if;
  if increment<>0 then
    insert into public.news_metrics(post_id,comments) values(k,greatest(0,increment))
    on conflict(post_id) do update set comments=greatest(0,public.news_metrics.comments+increment);
  end if;
  return case when tg_op='DELETE' then old else new end;
end; $$;
drop trigger if exists trg_news_comment_counter on public.news_comments;
create trigger trg_news_comment_counter after insert or update of status or delete on public.news_comments
for each row execute function public.news_comment_counter();

-- Return vote counts only, without exposing voters or email addresses.
create or replace function public.news_poll_summary(p_post_id uuid)
returns table(option_id uuid, total bigint) language sql stable security definer set search_path = '' as $$
  select o.id,count(v.user_id) from public.news_poll_options o
  join public.news_posts p on p.id=o.post_id
  left join public.news_votes v on v.option_id=o.id and v.post_id=o.post_id
  where p.id=p_post_id and p.status='published' and p.post_type='forum' and p.poll_enabled
  group by o.id;
$$;
revoke all on function public.news_poll_summary(uuid) from public;
grant execute on function public.news_poll_summary(uuid) to anon,authenticated;

-- Approximate one view per device per day; not fully resistant to manipulation.
create or replace function public.news_track_view(p_post_id uuid,p_token uuid) returns void
language plpgsql security definer set search_path='' as $$
declare n int;
begin
  if p_post_id is null or p_token is null then return; end if;
  if not exists(select 1 from public.news_posts where id=p_post_id and status='published') then return; end if;
  insert into public.news_view_dedup(post_id,token,day_utc)
  values(p_post_id,p_token,(now() at time zone 'utc')::date) on conflict do nothing;
  get diagnostics n = row_count;
  if n>0 then
    insert into public.news_metrics(post_id,views) values(p_post_id,1)
    on conflict(post_id) do update set views=public.news_metrics.views+1;
  end if;
end; $$;
revoke all on function public.news_track_view(uuid,uuid) from public;
grant execute on function public.news_track_view(uuid,uuid) to anon,authenticated;

-- Images: create a public bucket named "news-covers" under Storage > New bucket.
-- Public image URLs remain accessible if known, even while a story is pending.
-- Policy only allows uploads under the signed-in account UUID.
drop policy if exists news_covers_auth_upload on storage.objects;
create policy news_covers_auth_upload on storage.objects for insert to authenticated
  with check (bucket_id='news-covers'
    and (storage.foldername(name))[1]=(select auth.uid())::text
    and lower(storage.extension(name)) in ('jpg','jpeg','png','webp'));

-- REQUIRED: replace the example address below with a real admin email, then run ONCE.
-- The email must be registered and verified in Supabase Auth. Do not leave the example value.
-- insert into public.news_roles(email,role) values('admin-cua-nhom@example.com','admin')
-- on conflict(email) do update set role='admin';
