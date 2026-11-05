-- VietMuse V10: staff media library. Run in Supabase SQL Editor AFTER 02-V3-SUPABASE.sql.
-- No DROP, DELETE or table reset. Public image links can be viewed by anyone who knows the URL.
-- Preserve existing bucket settings when it already exists.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('news-covers','news-covers',true,2097152,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;

-- For signed-in editors/admins, allow LIST of THEIR OWN folder only.
-- The V3 policy news_covers_auth_upload already allows signed-in users to INSERT into their own folder.
-- SELECT access does not allow deleting or altering uploaded files.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='vm_news_covers_staff_list_own') then
    create policy vm_news_covers_staff_list_own
    on storage.objects for select to authenticated
    using (
      bucket_id = 'news-covers'
      and (storage.foldername(name))[1] = (select auth.uid())::text
      and (select private.news_role()) in ('editor','admin')
    );
  end if;
end $$;

notify pgrst, 'reload schema';
