export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      skills: {
        Row: {
          id: string;
          name: string;
          category: string;
          proficiency: number | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          proficiency?: number | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          proficiency?: number | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
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
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          tech_stack?: string[] | null;
          image_url?: string | null;
          live_url?: string | null;
          github_url?: string | null;
          case_study_url?: string | null;
          featured?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          tech_stack?: string[] | null;
          image_url?: string | null;
          live_url?: string | null;
          github_url?: string | null;
          case_study_url?: string | null;
          featured?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          excerpt: string | null;
          cover_image: string | null;
          tags: string[] | null;
          status: "draft" | "published";
          published_at: string | null;
          reading_time: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content: string;
          excerpt?: string | null;
          cover_image?: string | null;
          tags?: string[] | null;
          status?: "draft" | "published";
          published_at?: string | null;
          reading_time?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          content?: string;
          excerpt?: string | null;
          cover_image?: string | null;
          tags?: string[] | null;
          status?: "draft" | "published";
          published_at?: string | null;
          reading_time?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          status: "pending" | "indexing" | "completed" | "error";
          error_message: string | null;
          chunk_count: number;
          uploaded_by: string | null;
          created_at: string;
          indexed_at: string | null;
        };
        Insert: {
          id?: string;
          file_name: string;
          file_type: string;
          file_size: number;
          status?: "pending" | "indexing" | "completed" | "error";
          error_message?: string | null;
          chunk_count?: number;
          uploaded_by?: string | null;
          created_at?: string;
          indexed_at?: string | null;
        };
        Update: {
          id?: string;
          file_name?: string;
          file_type?: string;
          file_size?: number;
          status?: "pending" | "indexing" | "completed" | "error";
          error_message?: string | null;
          chunk_count?: number;
          uploaded_by?: string | null;
          created_at?: string;
          indexed_at?: string | null;
        };
      };
      document_chunks: {
        Row: {
          id: string;
          document_id: string;
          chunk_text: string;
          chunk_index: number;
          embedding: number[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          chunk_text: string;
          chunk_index: number;
          embedding?: number[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          chunk_text?: string;
          chunk_index?: number;
          embedding?: number[] | null;
          created_at?: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
