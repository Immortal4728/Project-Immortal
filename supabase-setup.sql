-- Create the project_documents table
CREATE TABLE IF NOT EXISTS project_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id TEXT NOT NULL,
    document_type TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(project_id, document_type)
);

-- Note: You should be doing this in your Supabase SQL editor!

-- Disable Row Level Security (RLS) or set up active policies so the Anon key can insert/delete records
-- Since your app operates using the Anon key inside the workspace:
ALTER TABLE project_documents DISABLE ROW LEVEL SECURITY;

-- If you want to keep RLS active, create appropriate policies:
-- CREATE POLICY "Enable read access for all users" ON "public"."project_documents" FOR SELECT USING (true);
-- CREATE POLICY "Enable insert for anonymously authenticated or public" ON "public"."project_documents" FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Enable delete for anonymously authenticated or public" ON "public"."project_documents" FOR DELETE USING (true);
-- CREATE POLICY "Enable update for anonymously authenticated or public" ON "public"."project_documents" FOR UPDATE USING (true);

-- Insert bucket config
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-documents', 'project-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the `project-documents` bucket (if RLS is active on storage)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'project-documents');
CREATE POLICY "Public Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-documents');
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'project-documents');
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'project-documents');
