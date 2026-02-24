
-- Storage bucket for source files
INSERT INTO storage.buckets (id, name, public) VALUES ('source-files', 'source-files', false);

CREATE POLICY "Users can upload own source files" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'source-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own source files" ON storage.objects FOR SELECT
USING (bucket_id = 'source-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own source files" ON storage.objects FOR DELETE
USING (bucket_id = 'source-files' AND auth.uid()::text = (storage.foldername(name))[1]);
