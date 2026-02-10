-- Document Review Workflow Schema
-- This schema supports checklist-based document review with RAG

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Standardized Checklists Table
CREATE TABLE IF NOT EXISTS checklists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL, -- Array of {id, question, category, required}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Projects Table (links to existing project_financing_data)
CREATE TABLE IF NOT EXISTS review_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_financing_data_id UUID REFERENCES project_financing_data(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  status TEXT DEFAULT 'draft', -- draft, in_review, completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_project_id UUID REFERENCES review_projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Storage path in Supabase Storage
  file_type TEXT, -- pdf, docx, etc.
  file_size BIGINT, -- bytes
  page_count INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by TEXT
);

-- Document Chunks Table (for RAG/vector search)
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL, -- Order within document
  page_number INTEGER NOT NULL,
  embedding vector(1536), -- OpenAI ada-002 dimension
  metadata JSONB, -- Additional metadata like section, headers, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Working Papers Table
CREATE TABLE IF NOT EXISTS working_papers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_project_id UUID REFERENCES review_projects(id) ON DELETE CASCADE,
  checklist_id UUID REFERENCES checklists(id),
  title TEXT NOT NULL,
  content JSONB NOT NULL, -- Array of {question_id, answer, sources: [{document_id, page_number, excerpt}]}
  status TEXT DEFAULT 'draft', -- draft, reviewed, submitted
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  snaptable_submission_id TEXT -- ID returned from Snaptable API
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_checklists_active ON checklists(is_active);
CREATE INDEX IF NOT EXISTS idx_review_projects_project_id ON review_projects(project_financing_data_id);
CREATE INDEX IF NOT EXISTS idx_documents_review_project ON documents(review_project_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_document ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_page ON document_chunks(page_number);
CREATE INDEX IF NOT EXISTS idx_working_papers_project ON working_papers(review_project_id);
CREATE INDEX IF NOT EXISTS idx_working_papers_status ON working_papers(status);

-- Vector similarity search index (using HNSW for fast approximate search)
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding ON document_chunks 
USING hnsw (embedding vector_cosine_ops);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_checklists_updated_at
  BEFORE UPDATE ON checklists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_projects_updated_at
  BEFORE UPDATE ON review_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_working_papers_updated_at
  BEFORE UPDATE ON working_papers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
