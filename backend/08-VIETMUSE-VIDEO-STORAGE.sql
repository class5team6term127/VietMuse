-- VietMuse V17 - Video uploads for Editor/Admin (requires base SQL 02).
-- Safe additive migration: no DROP TABLE, no deletion of existing articles/images.
-- IMPORTANT: video files are PUBLIC once uploaded, even while a story remains a draft.
-- For private/unreleased footage, use external unlisted hosting instead of this bucket.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('news-videos', 'news-videos', true, 26214400,
        ARRAY['video/mp4', 'video/webm']::text[])
ON CONFLICT (id) DO NOTHING;

DO $vm_video_policies$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'vm_news_videos_staff_insert'
  ) THEN
    CREATE POLICY vm_news_videos_staff_insert
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'news-videos'
        AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
        AND lower(storage.extension(name)) IN ('mp4', 'webm')
        AND (SELECT private.news_role()) IN ('admin','editor')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'vm_news_videos_staff_list_own'
  ) THEN
    CREATE POLICY vm_news_videos_staff_list_own
      ON storage.objects FOR SELECT TO authenticated
      USING (
        bucket_id = 'news-videos'
        AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
        AND (SELECT private.news_role()) IN ('admin','editor')
      );
  END IF;
END
$vm_video_policies$;

NOTIFY pgrst, 'reload schema';

-- Verify after running:
SELECT id, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id IN ('news-covers', 'news-videos');
