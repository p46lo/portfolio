import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Known technology keywords to detect
const TECH_KEYWORDS = [
  // Frontend
  "react", "next.js", "nextjs", "vue", "vue.js", "angular", "svelte",
  "typescript", "javascript", "html", "css", "tailwind", "tailwindcss",
  "redux", "zustand", "mobx", "graphql", "apollo", "axios",
  // Backend
  "node.js", "nodejs", "express", "python", "django", "flask", "fastapi",
  "java", "spring", "c#", ".net", "go", "golang", "rust", "ruby", "rails",
  "php", "laravel", "symfony",
  // Databases
  "postgresql", "postgres", "mysql", "mongodb", "redis", "elasticsearch",
  "supabase", "firebase", "prisma", "sequelize", "typeorm",
  // DevOps & Cloud
  "docker", "kubernetes", "k8s", "aws", "azure", "gcp", "google cloud",
  "vercel", "netlify", "heroku", "ci/cd", "github actions", "gitlab",
  // Tools
  "git", "github", "gitlab", "bitbucket", "webpack", "vite", "esbuild",
  "jest", "testing library", "cypress", "playwright", "mocha",
  // Mobile
  "react native", "flutter", "ionic", "swift", "kotlin",
  // AI/ML
  "machine learning", "ml", "ai", "pytorch", "tensorflow", "langchain",
  "llamaindex", "openai", "anthropic", "claude", "gpt",
  // Other
  "rest", "api", "microservices", "serverless", "websocket",
];

function extractTechnologiesFromText(text: string): string[] {
  const lowerText = text.toLowerCase();
  const found: string[] = [];
  
  for (const tech of TECH_KEYWORDS) {
    if (lowerText.includes(tech.toLowerCase())) {
      // Normalize the technology name
      let normalized = tech;
      if (tech === "nextjs") normalized = "Next.js";
      if (tech === "nodejs") normalized = "Node.js";
      if (tech === "vue.js") normalized = "Vue.js";
      if (tech === "tailwindcss") normalized = "TailwindCSS";
      if (tech === "postgres") normalized = "PostgreSQL";
      if (tech === "golang") normalized = "Go";
      if (tech === "react native") normalized = "React Native";
      if (!found.includes(normalized)) {
        found.push(normalized);
      }
    }
  }
  
  return found;
}

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fetch all projects
    const { data: projects } = await supabase
      .from("projects")
      .select("tech_stack, description");
    
    // Fetch all documents
    const { data: documents } = await supabase
      .from("documents")
      .select("file_name");
    
    // Fetch document chunks for content analysis
    const { data: chunks } = await supabase
      .from("document_chunks")
      .select("chunk_text");
    
    // Extract technologies from projects
    const projectTechs = new Set<string>();
    if (projects) {
      for (const project of projects) {
        if (project.tech_stack && Array.isArray(project.tech_stack)) {
          project.tech_stack.forEach((tech: string) => {
            // Normalize and add
            const normalized = tech.trim();
            if (normalized) {
              projectTechs.add(normalized);
            }
          });
        }
        // Also scan description
        if (project.description) {
          const descTechs = extractTechnologiesFromText(project.description);
          descTechs.forEach(tech => projectTechs.add(tech));
        }
      }
    }
    
    // Extract technologies from document chunks
    const docTechs = new Set<string>();
    if (chunks) {
      for (const chunk of chunks) {
        if (chunk.chunk_text) {
          const detected = extractTechnologiesFromText(chunk.chunk_text);
          detected.forEach(tech => docTechs.add(tech));
        }
      }
    }
    
    // Merge and deduplicate
    const allTechs = new Set<string>([...Array.from(projectTechs), ...Array.from(docTechs)]);
    
    // Sort alphabetically
    const sortedTechs = Array.from(allTechs).sort();
    
    return NextResponse.json({
      technologies: sortedTechs,
      sources: {
        projects: projects?.length || 0,
        documents: documents?.length || 0,
        chunks: chunks?.length || 0,
      }
    });
  } catch (error) {
    console.error("Error detecting technologies:", error);
    return NextResponse.json(
      { error: "Failed to detect technologies" },
      { status: 500 }
    );
  }
}
