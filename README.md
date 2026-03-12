# Developer Portfolio with RAG Chatbot

A production-ready personal developer portfolio with an integrated AI chatbot powered by Retrieval-Augmented Generation (RAG).

## Features

### Public Portfolio Website
- **Hero Section** - Animated introduction with social links
- **About Me** - Personal bio and background
- **Skills** - Visual display of technical skills by category
- **Projects Portfolio** - Showcase projects with tech stack, links, and details
- **Blog** - Markdown-powered blog posts
- **Contact** - Contact form and social links

### AI Chatbot (RAG)
- Semantic search over your knowledge base
- Answers questions about your projects, skills, and experience
- Streaming responses for real-time feedback
- Source attribution in responses

### Admin Dashboard
- Secure authentication with Supabase Auth
- Full CRUD for projects, blog posts, skills
- Knowledge base management
- Upload documents for RAG indexing
- Real-time status tracking

### RAG Pipeline
- Document ingestion with automatic text extraction
- Intelligent text chunking
- OpenAI embeddings generation
- Supabase pgvector for similarity search
- Support for TXT, MD, PDF, DOCX files

## Tech Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **Vector DB**: Supabase pgvector
- **RAG**: LangChain + LlamaIndex
- **LLM**: Claude 3.5 Sonnet / GPT-4
- **Auth**: Supabase Auth
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- OpenAI API key (for embeddings)
- Anthropic API key (optional)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

### Database Setup

```bash
# Run database migrations
supabase db push

# Or run SQL files in Supabase dashboard
# supabase/migrations/001_initial_schema.sql
# supabase/migrations/002_rag_tables.sql
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── chat/         # Chatbot API
│   │   ├── knowledge/    # Knowledge management
│   │   └── projects/     # Projects CRUD
│   ├── admin/            # Admin dashboard
│   │   ├── projects/     # Project management
│   │   └── knowledge/    # Knowledge base
│   └── auth/             # Authentication
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── portfolio/        # Portfolio components
│   └── chatbot/          # Chatbot components
├── lib/                  # Utilities and clients
└── types/                # TypeScript types
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Documentation

- [SPEC.md](./SPEC.md) - Detailed specifications
- [DESIGN.md](./DESIGN.md) - Technical design document
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide

## License

MIT License
