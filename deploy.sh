#!/bin/bash
# Deploy script for Portfolio - Run locally

echo "🚀 Deploying Portfolio to Vercel..."
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git not initialized. Run: git init"
    exit 1
fi

# Check if there's a remote
if ! git remote get-url origin >/dev/null 2>&1; then
    echo "⚠️  No GitHub remote set."
    echo "Please create a GitHub repo and run:"
    echo "  git remote add origin https://github.com/YOUR_USERNAME/portfolio.git"
    exit 1
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "📋 Now deploy to Vercel:"
echo "   1. Go to https://vercel.com"
echo "   2. Import your GitHub repository"
echo "   3. Add environment variables:"
echo "      - NEXT_PUBLIC_SUPABASE_URL"
echo "      - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "      - SUPABASE_SERVICE_ROLE_KEY"
echo "      - NEXT_PUBLIC_SUPABASE_AUTH_SECRET (min 32 chars)"
echo "      - NEXT_PUBLIC_APP_URL"
echo "   4. Click Deploy!"
echo ""
echo "📊 Then set up Supabase:"
echo "   1. Go to https://supabase.com"
echo "   2. Create new project"
echo "   3. Run migrations in SQL Editor:"
echo "      - supabase/migrations/001_initial_schema.sql"
echo "      - supabase/migrations/002_rag_tables.sql"
echo ""
echo "🎉 Done!"
