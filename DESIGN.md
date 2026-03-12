# Design: Portfolio Project

## Document Overview

**Project**: portfolio  
**Change**: portfolio-full  
**Type**: Full Technical Design (Greenfield Project)  
**Version**: 1.0  
**Date**: 2026-03-11

---

## 1. Technical Approach

### 1.1 Overview

This is a greenfield full-stack web application using Next.js 15 with App Router as the primary framework. The application consists of four main domains:

1. **Public Portfolio Website** - Static/hybrid pages showcasing the developer's profile
2. **RAG/Chatbot** - AI-powered chatbot using semantic search and LLM generation
3. **Admin Dashboard** - Authenticated CMS for content management
4. **Knowledge Management** - Document ingestion and vector storage for RAG

The application will use:
- **Frontend**: Next.js 15 + App Router + TailwindCSS + TypeScript
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: PostgreSQL via Supabase
- **Vector DB**: Supabase pgvector for embeddings storage
- **RAG**: LlamaIndex for ingestion + LangChain for orchestration
- **LLM**: Claude 3.5 Sonnet (primary) with GPT-4o-mini (fallback)
- **Auth**: Supabase Auth
- **Deployment**: Vercel

### 1.2 Strategy

The portfolio website will leverage Next.js static generation (SSG) for public pages with Incremental Static Regeneration (ISR) for content that changes occasionally. The admin dashboard and chatbot will use client-side rendering with API routes for backend operations.

The RAG pipeline will use a hybrid approach:
- Background processing for document ingestion (chunking, embedding)
- Synchronous API for chat queries with streaming responses

---

## 2. Architecture Decisions

### Decision: Next.js App Router over Pages Router

**Choice**: Next.js 15 with App Router (app directory)  
**Alternatives considered**: Pages Router, standalone React app  
**Rationale**: App Router provides better performance with React Server Components, improved caching, and future-proof architecture. It also simplifies data fetching with async/await in server components.

### Decision: Supabase for Database and Auth

**Choice**: Supabase (PostgreSQL + Auth + Storage)  
**Alternatives considered**: Firebase, PlanetScale + Clerk, self-hosted PostgreSQL  
**Rationale**: Supabase provides PostgreSQL with pgvector extension built-in, which is essential for the RAG functionality. It also offers Auth and Storage in a single platform, reducing integration complexity.

### Decision: Claude 3.5 Sonnet as Primary LLM

**Choice**: Anthropic Claude 3.5 Sonnet  
**Alternatives considered**: GPT-4o-mini, OpenAI GPT-4  
**Rationale**: Claude 3.5 Sonnet provides excellent quality-to-cost ratio and excels at following instructions, which is critical for generating accurate portfolio-related responses. It also has a large context window (200K tokens).

### Decision: LangChain for RAG Orchestration

**Choice**: LangChain.js for RAG pipeline  
**Alternatives considered**: LlamaIndex (direct), custom implementation  
**Rationale**: LangChain provides well-tested abstractions for RAG pipelines including document loaders, text splitters, vector stores, and chat models. It simplifies the implementation and provides good debugging capabilities.

### Decision: TailwindCSS for Styling

**Choice**: TailwindCSS with shadcn/ui components  
**Alternatives considered**: CSS Modules, Styled Components, MUI  
**Rationale**: TailwindCSS provides excellent developer experience with utility-first approach. shadcn/ui provides accessible, customizable components that can be copied into the project (no external dependency).

### Decision: Streaming Responses via Server-Sent Events (SSE)

**Choice**: SSE for streaming LLM responses  
**Alternatives considered**: WebSockets, WebRTC  
**Rationale**: SSE is simpler to implement with Next.js API routes, works over HTTP/1.1, and is well-suited for server-to-client streaming. No additional infrastructure required.

---

## 3. Data Flow Diagrams

### 3.1 Public Portfolio Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Public Portfolio Flow                     │
└─────────────────────────────────────────────────────────────┘

┌──────────┐     ┌──────────────┐     ┌─────────────┐
│  Visitor │────▶│  Next.js     │────▶│  Supabase   │
│  Browser │     │  (SSG/ISR)   │     │  PostgreSQL │
└──────────┘     └──────────────┘     └─────────────┘
                      │                       │
                      │ Static pages           │
                      ▼                       │
                 ┌──────────┐                  │
                 │  Cache   │◀─────────────────┘
                 └──────────┘
```

### 3.2 Admin Dashboard Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   Admin Dashboard Flow                       │
└─────────────────────────────────────────────────────────────┘

┌──────────┐     ┌──────────────┐     ┌─────────────┐
│  Admin   │────▶│  Next.js     │────▶│  Supabase   │
│  Browser │     │  (CSR + API) │     │  PostgreSQL │
└──────────┘     └──────────────┘     └─────────────┘
                      │                       │
                      │ Auth check            │
                      ▼                       │
                 ┌──────────┐                 │
                 │ Supabase │◀────────────────┘
                 │  Auth    │
                 └──────────┘
```

### 3.3 RAG/Chatbot Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      RAG Pipeline Flow                      │
└─────────────────────────────────────────────────────────────┘

Document Upload:
┌──────────┐     ┌──────────────┐     ┌─────────────┐
│  Admin   │────▶│  Upload API  │────▶│  Supabase   │
│  Browser │     │  (Parse)      │     │  Storage    │
└──────────┘     └──────────────┘     └─────────────┘
                       │                       │
                       ▼                       │
                  ┌──────────┐                  │
                  │ Background│                  │
                  │ Job       │                  │
                  └──────────┘                  │
                       │                       │
                       ▼                       ▼
                  ┌─────────────────────────────────┐
                  │  Chunk + Embed + Store (pgvector)│
                  └─────────────────────────────────┘

Chat Query:
┌──────────┐     ┌──────────────┐     ┌─────────────┐
│  User    │────▶│  Chat API    │────▶│  Embedding  │
│  Browser │     │  (Stream SSE)│     │  Model      │
└──────────┘     └──────────────┘     └─────────────┘
                      │                       │
                      │                       ▼
                      │                ┌─────────────┐
                      │                │  pgvector   │
                      │                │  Search     │
                      │                └─────────────┘
                      │                       │
                      │                       ▼
                      │                ┌─────────────┐
                      │                │  LLM        │
                      │                │ (Claude)    │
                      │                └─────────────┘
                      │                       │
                      └───────────────────────┘
                           Stream Response
```

---

## 4. File Structure

### 4.1 Project Root Structure

```
portfolio/
├── .env.local.example          # Environment variables template
├── .gitignore
├── next.config.js              # Next.js configuration
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── public/
│   ├── favicon.ico
│   ├── images/
│   │   └── ...
│   └── robots.txt
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx           # Home page
│   │   ├── about/
│   │   ├── skills/
│   │   ├── education/
│   │   ├── courses/
│   │   ├── research/
│   │   ├── projects/
│   │   │   ├── page.tsx       # Projects listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx   # Project detail
│   │   ├── blog/
│   │   │   ├── page.tsx       # Blog listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx   # Blog post
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   ├── api/               # API Routes
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth].ts
│   │   │   ├── chat/
│   │   │   │   └── route.ts
│   │   │   ├── upload/
│   │   │   │   └── route.ts
│   │   │   ├── index/
│   │   │   │   └── route.ts
│   │   │   └── knowledge/
│   │   │       └── route.ts
│   │   ├── chat/
│   │   │   └── page.tsx
│   │   ├── admin/             # Admin Dashboard
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── projects/
│   │   │   ├── blog/
│   │   │   ├── skills/
│   │   │   ├── education/
│   │   │   ├── courses/
│   │   │   ├── research/
│   │   │   ├── knowledge/
│   │   │   └── settings/
│   │   └── error.tsx
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── portfolio/         # Portfolio-specific components
│   │   │   ├── Hero.tsx
│   │   │   ├── Skills.tsx
│   │   │   ├── ProjectCard.tsx
│   │   │   └── ...
│   │   ├── chatbot/           # Chatbot components
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   └── Message.tsx
│   │   └── admin/            # Admin components
│   │       ├── Dashboard.tsx
│   │       ├── Editor.tsx
│   │       └── ...
│   ├── lib/
│   │   ├── supabase.ts        # Supabase client
│   │   ├── rag.ts             # RAG utilities
│   │   ├── embedding.ts       # Embedding generation
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useChat.ts
│   │   └── useAuth.ts
│   └── types/
│       └── index.ts           # TypeScript types
└── supabase/
    └── migrations/            # Database migrations
```

### 4.2 Database Schema Files

```
supabase/migrations/
├── 001_initial_schema.sql
├── 002_add_pgvector.sql
├── 003_rag_tables.sql
└── ...
```

---

## 5. API Endpoints Design

### 5.1 Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register new admin | No |
| POST | `/api/auth/signin` | Login | No |
| POST | `/api/auth/signout` | Logout | Yes |
| GET | `/api/auth/session` | Get current session | Yes |

### 5.2 Content API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/projects` | List all projects | No |
| POST | `/api/projects` | Create project | Yes |
| GET | `/api/projects/[id]` | Get project by ID | No |
| PUT | `/api/projects/[id]` | Update project | Yes |
| DELETE | `/api/projects/[id]` | Delete project | Yes |
| GET | `/api/blog` | List blog posts | No |
| POST | `/api/blog` | Create blog post | Yes |
| GET | `/api/blog/[slug]` | Get blog post | No |
| PUT | `/api/blog/[slug]` | Update blog post | Yes |
| DELETE | `/api/blog/[slug]` | Delete blog post | Yes |
| GET | `/api/skills` | List skills | No |
| POST | `/api/skills` | Create skill | Yes |
| PUT | `/api/skills/[id]` | Update skill | Yes |
| DELETE | `/api/skills/[id]` | Delete skill | Yes |
| GET | `/api/education` | List education | No |
| POST | `/api/education` | Create education | Yes |
| PUT | `/api/education/[id]` | Update education | Yes |
| DELETE | `/api/education/[id]` | Delete education | Yes |
| GET | `/api/courses` | List courses | No |
| POST | `/api/courses` | Create course | Yes |
| PUT | `/api/courses/[id]` | Update course | Yes |
| DELETE | `/api/courses/[id]` | Delete course | Yes |
| GET | `/api/research` | List research | No |
| POST | `/api/research` | Create research | Yes |
| PUT | `/api/research/[id]` | Update research | Yes |
| DELETE | `/api/research/[id]` | Delete research | Yes |

### 5.3 RAG/Chat API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/chat` | Send chat message (streaming) | Optional |

### 5.4 Knowledge Management API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/knowledge` | List uploaded documents | Yes |
| POST | `/api/knowledge/upload` | Upload document | Yes |
| DELETE | `/api/knowledge/[id]` | Delete document | Yes |
| POST | `/api/knowledge/[id]/reindex` | Re-index document | Yes |

---

## 6. Database Schema Details

### 6.1 Core Tables

```sql
-- Users (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  proficiency INTEGER, -- 1-100
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Education
CREATE TABLE education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  degree TEXT NOT NULL,
  institution TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  completion_date DATE,
  certificate_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Research
CREATE TABLE research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  publication_date DATE,
  conference_journal TEXT,
  abstract TEXT,
  paper_url TEXT,
  code_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  tech_stack TEXT[], -- Array of technologies
  image_url TEXT,
  live_url TEXT,
  github_url TEXT,
  case_study_url TEXT,
  featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Posts
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL, -- Markdown
  excerpt TEXT,
  cover_image TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'draft', -- draft, published
  published_at TIMESTAMP WITH TIME ZONE,
  reading_time INTEGER, -- minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site Settings
CREATE TABLE settings (
  id TEXT PRIMARY KEY, -- single-row table with key-value
  value JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6.2 RAG Tables

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Document metadata
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, indexing, completed, error
  error_message TEXT,
  chunk_count INTEGER DEFAULT 0,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  indexed_at TIMESTAMP WITH TIME ZONE
);

-- Document chunks with embeddings
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding VECTOR(1536), -- OpenAI ada-002 dimension
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX ON document_chunks USING ivfflat (embedding vector_cosine_ops);
```

### 6.3 Chat History (Optional)

```sql
-- Chat conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- user, assistant
  content TEXT NOT NULL,
  sources JSONB, -- Array of source documents used
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 7. RAG Pipeline Design

### 7.1 Document Ingestion Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                   Document Ingestion Pipeline                    │
└─────────────────────────────────────────────────────────────────┘

1. Upload Phase
   - User uploads file via /api/knowledge/upload
   - Validate file type (PDF, TXT, MD, DOCX)
   - Validate file size (< 10MB)
   - Store file in Supabase Storage
   - Create document record with status='pending'

2. Processing Phase (Background Job)
   a. Fetch file from Storage
   b. Parse document:
      - PDF: Use pdf-parse or pdf.js
      - DOCX: Use mammoth
      - TXT/MD: Read as plain text
   c. Chunk text:
      - Use RecursiveCharacterTextSplitter (LangChain)
      - chunk_size: 1000 tokens
      - chunk_overlap: 200 tokens
   d. Generate embeddings:
      - Use OpenAI text-embedding-3-small
      - Dimension: 1536
   e. Store in database:
      - Insert chunks with embeddings into document_chunks
      - Update document status='completed'
      - Update chunk_count

3. Error Handling
   - Catch parsing errors → status='error', error_message
   - Catch embedding errors → retry with exponential backoff
   - After 3 failures → mark as error
```

### 7.2 Query Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                      Query Pipeline                              │
└─────────────────────────────────────────────────────────────────┘

1. Receive user query from chat interface

2. Generate query embedding:
   - Use same embedding model (text-embedding-3-small)
   - Get 1536-dimensional vector

3. Search vector database:
   - SQL: SELECT * FROM document_chunks 
          ORDER BY embedding <=> query_embedding
          LIMIT 5;
   - Use cosine distance for similarity

4. Build context from results:
   - Concatenate top-k chunk texts
   - Add source citations

5. Generate LLM response:
   - Prompt template with:
     * System instructions
     * Retrieved context
     * User question
   - Stream response to client via SSE

6. (Optional) Save to chat history
```

### 7.3 Prompt Template

```typescript
const SYSTEM_PROMPT = `You are a helpful assistant answering questions about the developer's portfolio. 
Use the provided context to answer questions. If the context doesn't contain enough information, 
say so clearly. Always be helpful and concise.

Context:
{context}

Question: {question}

Answer:`;
```

---

## 8. Testing Strategy

### 8.1 Unit Tests

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Utils | Data transformations, helpers | Jest |
| Components | Rendering, props | React Testing Library |
| Hooks | State management | React Hooks Testing Library |

### 8.2 Integration Tests

| Layer | What to Test | Approach |
|-------|-------------|----------|
| API Routes | CRUD operations, auth | SuperTest + Supabase test DB |
| Database | Queries, migrations | Test container |
| RAG Pipeline | Embedding, search | Mock LLM responses |

### 8.3 E2E Tests

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Public Site | Page rendering, navigation | Playwright |
| Admin | CRUD workflows | Playwright |
| Chatbot | Full conversation flow | Playwright |

### 8.4 Test Coverage Goals

- Unit: 80% coverage
- Integration: Key workflows covered
- E2E: Critical paths only

---

## 9. Migration Plan

### 9.1 Initial Setup (Greenfield)

Since this is a greenfield project, no migration is required. The plan is:

1. Create Supabase project
2. Run database migrations to create tables
3. Configure environment variables
4. Deploy to Vercel
5. Create initial admin user manually (via Supabase dashboard)
6. Configure authentication

### 9.2 Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Anthropic (for Claude)
ANTHROPIC_API_KEY=your-anthropic-key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 9.3 Deployment Steps

1. **Database Setup**:
   - Create Supabase project
   - Run migrations in `supabase/migrations/`

2. **Vercel Deployment**:
   - Connect GitHub repository to Vercel
   - Set environment variables
   - Deploy preview/production

3. **Initial Configuration**:
   - Create admin user via Supabase dashboard
   - Update site settings
   - Upload initial knowledge base documents

---

## 10. Open Questions

- [ ] Should chat history be persisted for users? (Decide before implementation)
- [ ] What is the expected scale of knowledge base? (Affects chunking strategy)
- [ ] Should the chatbot support multi-modal inputs (images, files)?
- [ ] Need to decide on exact rate limiting strategy per user
- [ ] Should blog support comments?

---

## 11. File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `SPEC.md` | Create | This specification document |
| `DESIGN.md` | Create | This technical design document |
| `src/app/**` | Create | Next.js app router pages |
| `src/components/**` | Create | React components |
| `src/lib/**` | Create | Utility libraries |
| `src/hooks/**` | Create | Custom React hooks |
| `src/types/**` | Create | TypeScript type definitions |
| `supabase/migrations/**` | Create | Database migrations |

---

*End of Design Document*
