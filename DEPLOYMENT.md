# Developer Portfolio - Deployment Guide

This guide covers deploying the portfolio to production with Vercel and Supabase.

## Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Vercel account
- OpenAI API key (for embeddings)
- Anthropic API key (optional)

## Quick Deploy

### Option 1: Deploy to Vercel (Recommended)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/portfolio.git
   git push -u origin main
   ```

2. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your project URL and keys

3. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
     NEXT_PUBLIC_SUPABASE_AUTH_SECRET=your_jwt_secret
     OPENAI_API_KEY=your_openai_key
     ANTHROPIC_API_KEY=your_anthropic_key (optional)
     NEXT_PUBLIC_APP_URL=https://your-domain.com
     ```
   - Deploy!

4. **Run Database Migrations**
   - Go to Supabase Dashboard → SQL Editor
   - Copy and run `supabase/migrations/001_initial_schema.sql`
   - Copy and run `supabase/migrations/002_rag_tables.sql`

### Option 2: Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up Supabase locally**
   ```bash
   npx supabase init
   npx supabase start
   ```

3. **Run migrations**
   ```bash
   npx supabase db push
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `NEXT_PUBLIC_SUPABASE_AUTH_SECRET` | Yes | JWT secret (min 32 chars) |
| `OPENAI_API_KEY` | Yes | For embeddings generation |
| `ANTHROPIC_API_KEY` | No | For Claude integration |
| `NEXT_PUBLIC_APP_URL` | Yes | Your production URL |

## Database Setup

### Supabase Dashboard

1. Go to your Supabase project
2. Go to SQL Editor
3. Run the migration files in order:
   - `001_initial_schema.sql`
   - `002_rag_tables.sql`

### Create Admin User

Since there's no public signup:

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user"
3. Enter email and password
4. User will be created with authenticated role

## Verifying Deployment

1. Visit your deployed site
2. Go to `/auth/signin` and log in
3. Test admin features:
   - Add projects at `/admin/projects`
   - Upload documents at `/admin/knowledge`
4. Visit homepage to see:
   - Technologies detected from projects
   - Featured projects

## Troubleshooting

### Build Errors
```bash
npm run build
```

### Database Connection Issues
- Verify Supabase URL is correct
- Check API keys have correct permissions

### Authentication Issues
- Ensure `NEXT_PUBLIC_SUPABASE_AUTH_SECRET` is set
- Check URL configuration in Supabase dashboard

### Chatbot Not Working
- Verify OpenAI API key
- Upload documents to knowledge base
- Check Vercel function logs

## Project Structure

```
portfolio/
├── src/
│   ├── app/           # Next.js App Router pages
│   │   ├── api/      # API routes
│   │   ├── admin/    # Admin dashboard
│   │   └── ...       # Public pages
│   ├── components/   # React components
│   ├── lib/          # Utilities
│   └── types/        # TypeScript types
├── supabase/
│   └── migrations/   # Database migrations
└── public/           # Static assets
```

## Features

- ✅ Public portfolio with dynamic content
- ✅ Admin dashboard for content management
- ✅ RAG-powered AI chatbot
- ✅ Knowledge base document upload
- ✅ Automatic technology detection
- ✅ SEO optimized

## Support

For issues, check:
1. Vercel deployment logs
2. Supabase dashboard logs
3. Browser console errors
