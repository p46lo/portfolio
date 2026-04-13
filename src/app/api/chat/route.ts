import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

// Types for portfolio data
interface Project {
  id: string;
  title: string;
  description: string | null;
  tech_stack: string[] | null;
  github_url: string | null;
  live_url: string | null;
  created_at: string;
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
}

interface Research {
  id: string;
  title: string;
  abstract: string | null;
  published_date: string | null;
  url: string | null;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
}

interface AboutData {
  title: string | null;
  bio: string | null;
}

interface PortfolioData {
  projects: Project[];
  education: Education[];
  research: Research[];
  blogPosts: BlogPost[];
  about: AboutData | null;
  hero: {
    name: string;
    title: string;
  } | null;
}

// Fetch all portfolio data from database
async function fetchPortfolioData(): Promise<PortfolioData> {
  const supabase = getSupabase();

  if (!supabase) {
    return {
      projects: [],
      education: [],
      research: [],
      blogPosts: [],
      about: null,
      hero: null,
    };
  }

  try {
    const [projectsRes, educationRes, researchRes, blogRes, aboutRes, heroRes] = await Promise.all([
      supabase.from("projects").select("*").order("sort_order", { ascending: true }).limit(20),
      supabase.from("education").select("*").order("sort_order", { ascending: true }).limit(10),
      supabase.from("research").select("*").order("created_at", { ascending: false }).limit(10),
      supabase.from("blog_posts").select("*").order("published_at", { ascending: false }).limit(10),
      supabase.from("settings").select("value").eq("id", "about").single(),
      supabase.from("settings").select("value").eq("id", "home.hero").single(),
    ]);

    return {
      projects: projectsRes.data || [],
      education: educationRes.data || [],
      research: researchRes.data || [],
      blogPosts: blogRes.data || [],
      about: aboutRes.data?.value || null,
      hero: heroRes.data?.value || null,
    };
  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    return {
      projects: [],
      education: [],
      research: [],
      blogPosts: [],
      about: null,
      hero: null,
    };
  }
}

// Format portfolio data into context for the AI
function formatPortfolioContext(data: PortfolioData): string {
  const sections: string[] = [];

  // Developer info
  if (data.hero) {
    sections.push(`## Developer Information
Name: ${data.hero.name || "Not set"}
Title: ${data.hero.title || "Not set"}`);
  }

  if (data.about?.bio) {
    sections.push(`## About
${data.about.bio}`);
  }

  // Projects
  if (data.projects.length > 0) {
    const projectList = data.projects.map(p => {
      let entry = `### ${p.title}\n`;
      if (p.description) entry += `Description: ${p.description}\n`;
      if (p.tech_stack && p.tech_stack.length > 0) entry += `Technologies: ${p.tech_stack.join(", ")}\n`;
      if (p.live_url) entry += `Live URL: ${p.live_url}\n`;
      if (p.github_url) entry += `GitHub: ${p.github_url}\n`;
      return entry;
    }).join("\n");
    sections.push(`## Projects\n${projectList}`);
  }

  // Education
  if (data.education.length > 0) {
    const eduList = data.education.map(e => {
      let entry = `### ${e.degree}\n`;
      entry += `Institution: ${e.institution}\n`;
      if (e.start_date || e.end_date) {
        entry += `Period: ${[e.start_date, e.end_date].filter(Boolean).join(" - ")}\n`;
      }
      if (e.description) entry += `Description: ${e.description}\n`;
      return entry;
    }).join("\n");
    sections.push(`## Education\n${eduList}`);
  }

  // Research
  if (data.research.length > 0) {
    const researchList = data.research.map(r => {
      let entry = `### ${r.title}\n`;
      if (r.published_date) entry += `Published: ${r.published_date}\n`;
      if (r.abstract) entry += `Abstract: ${r.abstract}\n`;
      if (r.url) entry += `URL: ${r.url}\n`;
      return entry;
    }).join("\n");
    sections.push(`## Research\n${researchList}`);
  }

  // Blog
  if (data.blogPosts.length > 0) {
    const blogList = data.blogPosts.map(b => {
      let entry = `### ${b.title}\n`;
      if (b.excerpt) entry += `Excerpt: ${b.excerpt}\n`;
      if (b.published_at) entry += `Published: ${b.published_at}\n`;
      return entry;
    }).join("\n");
    sections.push(`## Blog Posts\n${blogList}`);
  }

  if (sections.length === 0) {
    return "No portfolio data has been added yet.";
  }

  return sections.join("\n\n");
}

// Call Groq API
async function callGroq(message: string, context: string, developerName: string = "the developer"): Promise<{ response: string; sources: string[] }> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const systemPrompt = `You are an AI assistant for a developer portfolio. Your role is to inform visitors about ${developerName}'s professional background based ONLY on the data provided below.

IMPORTANT RULES:
1. ONLY use information from the provided context - never make up or assume details
2. If information is not available in the context, say "I don't have that information in the portfolio data"
3. Be helpful, professional, and concise in your responses
4. When mentioning specific projects, skills, or achievements, cite them naturally
5. If asked about something not covered in the data, politely redirect to available topics
6. Format your responses nicely with bullet points and paragraphs when helpful
7. Always respond in the same language the user used to ask

## Portfolio Data Context:
${context}`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant", // Fast, free tier model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const aiResponse = data.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";

  // Determine sources based on what's mentioned in the response
  const sources: string[] = [];
  const lowerResponse = aiResponse.toLowerCase();
  
  if (lowerResponse.includes("project")) sources.push("projects");
  if (lowerResponse.includes("education") || lowerResponse.includes("degree") || lowerResponse.includes("university")) sources.push("education");
  if (lowerResponse.includes("research")) sources.push("research");
  if (lowerResponse.includes("blog")) sources.push("blog");
  if (lowerResponse.includes("about") || lowerResponse.includes("bio")) sources.push("about");

  return { response: aiResponse, sources };
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    // Check if Groq is configured
    const hasGroqKey = !!process.env.GROQ_API_KEY;

    if (!hasGroqKey) {
      return NextResponse.json({
        message: "AI chatbot is not configured. Please set the GROQ_API_KEY environment variable to enable AI responses.",
        sources: [],
        error: "GROQ_API_KEY not configured",
      }, { status: 503 });
    }

    // Fetch portfolio data
    const portfolioData = await fetchPortfolioData();
    const context = formatPortfolioContext(portfolioData);
    const developerName = portfolioData.hero?.name || "this developer";

    // Check if there's any data
    const hasData = portfolioData.projects.length > 0 || 
                    portfolioData.education.length > 0 || 
                    portfolioData.research.length > 0 ||
                    portfolioData.blogPosts.length > 0 ||
                    portfolioData.about?.bio;

    if (!hasData) {
      return NextResponse.json({
        message: "Welcome to the portfolio! I'm your AI assistant, but I don't have any data to show you yet. Once the developer adds projects, education, skills, and other information to the portfolio, I'll be able to tell you all about them!",
        sources: [],
      });
    }

    // Call Groq
    const result = await callGroq(trimmedMessage, context, developerName);

    return NextResponse.json({
      message: result.response,
      sources: result.sources,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to process message",
    }, { status: 500 });
  }
}

export async function GET() {
  const hasGroqKey = !!process.env.GROQ_API_KEY;

  return NextResponse.json({
    status: hasGroqKey ? "ready" : "not_configured",
    message: "Portfolio Chat API - Send a POST request with { message: 'your question' } to chat with the AI assistant.",
    info: hasGroqKey 
      ? "AI assistant is configured and ready. Ask about projects, education, skills, experience, research, blog posts, or general information about the developer."
      : "GROQ_API_KEY not found in environment. AI responses are disabled.",
    exampleQuestions: [
      "Tell me about your projects",
      "What technologies do you work with?",
      "Tell me about your education",
      "What is your experience?",
      "Show me your research work",
      "What blog posts have you written?",
      "Tell me about yourself",
    ],
  });
}
