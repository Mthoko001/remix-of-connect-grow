CREATE POLICY "Suppliers can read own supplier media"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'supplier-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Suppliers can upload own supplier media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'supplier-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Suppliers can update own supplier media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'supplier-media' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'supplier-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Suppliers can delete own supplier media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'supplier-media' AND (storage.foldername(name))[1] = auth.uid()::text);