// Database types
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  name: string;
  provider: string;
  completion_date: string | null;
  certificate_url: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Research {
  id: string;
  title: string;
  publication_date: string | null;
  conference_journal: string | null;
  abstract: string | null;
  paper_url: string | null;
  code_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  tech_stack: string[] | null;
  image_url: string | null;
  live_url: string | null;
  github_url: string | null;
  case_study_url: string | null;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  tags: string[] | null;
  status: 'draft' | 'published';
  published_at: string | null;
  reading_time: number | null;
  created_at: string;
  updated_at: string;
}

export interface Setting {
  id: string;
  value: Json;
  updated_at: string;
}

// RAG Types
export interface Document {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  status: 'pending' | 'indexing' | 'completed' | 'error';
  error_message: string | null;
  chunk_count: number;
  uploaded_by: string | null;
  created_at: string;
  indexed_at: string | null;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  chunk_text: string;
  chunk_index: number;
  embedding: number[] | null;
  created_at: string;
}

// Chat Types
export interface Conversation {
  id: string;
  user_id: string | null;
  title: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources: Json | null;
  created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: Source[];
}

export interface Source {
  id: string;
  file_name: string;
  chunk_text: string;
  similarity: number;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatResponse {
  message: string;
  sources: Source[];
  conversationId: string;
}

// Admin Types
export interface DashboardStats {
  totalProjects: number;
  totalBlogPosts: number;
  totalDocuments: number;
  recentConversations: number;
}

// Form Types
export interface ProjectFormData {
  title: string;
  slug: string;
  description: string;
  tech_stack: string[];
  image_url: string;
  live_url: string;
  github_url: string;
  case_study_url: string;
  featured: boolean;
  sort_order: number;
}

export interface BlogPostFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  tags: string[];
  status: 'draft' | 'published';
}

export interface SkillFormData {
  name: string;
  category: string;
  proficiency: number;
  sort_order: number;
}
