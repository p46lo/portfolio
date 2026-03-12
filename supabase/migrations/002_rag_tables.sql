-- RAG-specific tables for document storage and vector search

-- Create documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'indexing', 'completed', 'error')),
  error_message TEXT,
  chunk_count INTEGER DEFAULT 0,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  indexed_at TIMESTAMPTZ
);

-- Create document_chunks table with vector embeddings
CREATE TABLE public.document_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

-- RLS policies for documents
CREATE POLICY "Documents are viewable by everyone" 
  ON public.documents FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage documents" 
  ON public.documents FOR ALL 
  USING (auth.role() = 'authenticated');

-- RLS policies for document_chunks
CREATE POLICY "Chunks are viewable by everyone" 
  ON public.document_chunks FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage chunks" 
  ON public.document_chunks FOR ALL 
  USING (auth.role() = 'authenticated');

-- Create indexes for vector similarity search
-- Using HNSW index for better performance
CREATE INDEX ON public.document_chunks 
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Create indexes for foreign keys
CREATE INDEX idx_documents_uploaded_by ON public.documents(uploaded_by);
CREATE INDEX idx_document_chunks_document_id ON public.document_chunks(document_id);

-- Function to search similar chunks
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 5,
  min_similarity FLOAT DEFAULT 0.0
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  chunk_text TEXT,
  chunk_index INTEGER,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.chunk_text,
    dc.chunk_index,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM public.document_chunks dc
  WHERE dc.embedding IS NOT NULL
    AND 1 - (dc.embedding <=> query_embedding) > min_similarity
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  sources JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for conversations and messages
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Conversations are viewable by owners" 
  ON public.conversations FOR SELECT 
  USING (auth.uid() = user_id OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage conversations" 
  ON public.conversations FOR ALL 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Messages are viewable by owners" 
  ON public.messages FOR SELECT 
  USING (
    auth.uid() IN (SELECT user_id FROM public.conversations WHERE id = conversation_id)
    OR auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can manage messages" 
  ON public.messages FOR ALL 
  USING (auth.role() = 'authenticated');

-- Create indexes
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
