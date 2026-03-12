-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create skills table
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  proficiency INTEGER CHECK (proficiency >= 1 AND proficiency <= 100),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create education table
CREATE TABLE public.education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  degree TEXT NOT NULL,
  institution TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  completion_date DATE,
  certificate_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create research table
CREATE TABLE public.research (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  publication_date DATE,
  conference_journal TEXT,
  abstract TEXT,
  paper_url TEXT,
  code_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  tech_stack TEXT[],
  image_url TEXT,
  live_url TEXT,
  github_url TEXT,
  case_study_url TEXT,
  featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  reading_time INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create settings table (single-row key-value)
CREATE TABLE public.settings (
  id TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Create RLS policies for skills (public read, auth write)
CREATE POLICY "Skills are viewable by everyone" 
  ON public.skills FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage skills" 
  ON public.skills FOR ALL 
  USING (auth.role() = 'authenticated');

-- Create RLS policies for education
CREATE POLICY "Education is viewable by everyone" 
  ON public.education FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage education" 
  ON public.education FOR ALL 
  USING (auth.role() = 'authenticated');

-- Create RLS policies for courses
CREATE POLICY "Courses are viewable by everyone" 
  ON public.courses FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage courses" 
  ON public.courses FOR ALL 
  USING (auth.role() = 'authenticated');

-- Create RLS policies for research
CREATE POLICY "Research is viewable by everyone" 
  ON public.research FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage research" 
  ON public.research FOR ALL 
  USING (auth.role() = 'authenticated');

-- Create RLS policies for projects
CREATE POLICY "Projects are viewable by everyone" 
  ON public.projects FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage projects" 
  ON public.projects FOR ALL 
  USING (auth.role() = 'authenticated');

-- Create RLS policies for blog_posts
CREATE POLICY "Published posts are viewable by everyone" 
  ON public.blog_posts FOR SELECT 
  USING (status = 'published');

CREATE POLICY "Authenticated users can manage posts" 
  ON public.blog_posts FOR ALL 
  USING (auth.role() = 'authenticated');

-- Create RLS policies for settings
CREATE POLICY "Settings are viewable by everyone" 
  ON public.settings FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage settings" 
  ON public.settings FOR ALL 
  USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX idx_projects_slug ON public.projects(slug);
CREATE INDEX idx_projects_featured ON public.projects(featured);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_skills_category ON public.skills(category);
CREATE INDEX idx_education_sort_order ON public.education(sort_order);
