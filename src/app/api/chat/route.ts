import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase configuration is missing");
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

interface KeywordPattern {
  keywords: string[];
  category: string;
  weight: number;
}

const KEYWORD_PATTERNS: KeywordPattern[] = [
  { keywords: ["project", "built", "created", "made", "developed", "work"], category: "projects", weight: 3 },
  { keywords: ["skill", "technology", "tech", "know", "stack", "language", "framework"], category: "skills", weight: 3 },
  { keywords: ["about", "who", "background", "bio", "yourself"], category: "about", weight: 2 },
  { keywords: ["experience", "work", "job", "career", "professional"], category: "experience", weight: 2 },
  { keywords: ["education", "course", "degree", "studied", "university", "school", "college", "certification"], category: "education", weight: 3 },
  { keywords: ["blog", "post", "article", "write", "writing"], category: "blog", weight: 2 },
  { keywords: ["research", "paper", "publication", "study", "academic"], category: "research", weight: 3 },
  { keywords: ["contact", "email", "reach", "connect"], category: "contact", weight: 1 },
  { keywords: ["help", "what can you", "do"], category: "help", weight: 1 },
];

const GREETINGS = ["hello", "hi", "hey", "greetings", "howdy"];
const THANK_YOU = ["thanks", "thank", "appreciate", "grateful"];

function detectIntent(message: string): string[] {
  const lowerMessage = message.toLowerCase();
  const intents: string[] = [];
  const scores: { category: string; score: number }[] = [];

  for (const pattern of KEYWORD_PATTERNS) {
    let matchCount = 0;
    for (const keyword of pattern.keywords) {
      if (lowerMessage.includes(keyword)) {
        matchCount++;
      }
    }
    if (matchCount > 0) {
      scores.push({ category: pattern.category, score: matchCount * pattern.weight });
    }
  }

  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, 3).map((s) => s.category);
}

function isGreeting(message: string): boolean {
  const lower = message.toLowerCase();
  return GREETINGS.some((g) => lower === g || lower.startsWith(g + " ") || lower.endsWith(" " + g));
}

function isThankYou(message: string): boolean {
  const lower = message.toLowerCase();
  return THANK_YOU.some((t) => lower.includes(t));
}

function formatProjects(projects: any[]): string {
  if (!projects || projects.length === 0) {
    return "No projects found in the portfolio yet.";
  }

  const projectList = projects
    .slice(0, 5)
    .map((p) => {
      let text = `**${p.title}**`;
      if (p.description) {
        text += `: ${p.description}`;
      }
      if (p.tech_stack && p.tech_stack.length > 0) {
        text += ` (Technologies: ${p.tech_stack.join(", ")})`;
      }
      return text;
    })
    .join("\n- ");

  return `Here are some of the projects I've built:\n- ${projectList}`;
}

function formatSkills(projects: any[], chunks: any[]): string {
  const techSet = new Set<string>();

  if (projects) {
    for (const project of projects) {
      if (project.tech_stack && Array.isArray(project.tech_stack)) {
        project.tech_stack.forEach((tech: string) => techSet.add(tech.trim()));
      }
    }
  }

  const techs = Array.from(techSet).sort();
  if (techs.length === 0) {
    return "No specific technologies listed yet.";
  }

  return `I work with a variety of technologies including: ${techs.join(", ")}. These come from my projects and practical experience.`;
}

function formatEducation(education: any[]): string {
  if (!education || education.length === 0) {
    return "No education entries found yet.";
  }

  const eduList = education
    .map((e) => {
      let text = `**${e.degree}** at ${e.institution}`;
      if (e.start_date || e.end_date) {
        const dates = [e.start_date, e.end_date].filter(Boolean).join(" - ");
        text += ` (${dates})`;
      }
      if (e.description) {
        text += `: ${e.description}`;
      }
      return text;
    })
    .join("\n- ");

  return `My educational background:\n- ${eduList}`;
}

function formatResearch(research: any[]): string {
  if (!research || research.length === 0) {
    return "No research papers found yet.";
  }

  const researchList = research
    .slice(0, 5)
    .map((r) => {
      let text = `**${r.title}**`;
      if (r.published_date) {
        text += ` (${r.published_date})`;
      }
      if (r.abstract) {
        text += `: ${r.abstract}`;
      }
      return text;
    })
    .join("\n- ");

  return `My research work:\n- ${researchList}`;
}

function formatBlog(blogPosts: any[]): string {
  if (!blogPosts || blogPosts.length === 0) {
    return "No blog posts found yet.";
  }

  const blogList = blogPosts
    .slice(0, 5)
    .map((b) => `**${b.title}**`)
    .join("\n- ");

  return `Blog posts:\n- ${blogList}`;
}

function generateResponse(
  intents: string[],
  data: {
    projects: any[];
    education: any[];
    research: any[];
    blogPosts: any[];
    chunks: any[];
  }
): { message: string; sources: string[] } {
  const { projects, education, research, blogPosts, chunks } = data;

  if (intents.length === 0 || intents.includes("about")) {
    return {
      message:
        "I'm a developer portfolio chatbot! I can tell you about the developer's projects, skills, education, research, and blog posts. Just ask me something like 'What projects have you built?' or 'What technologies do you know?'",
      sources: ["system"],
    };
  }

  const responses: string[] = [];
  const sourceSet = new Set<string>();

  for (const intent of intents) {
    switch (intent) {
      case "projects":
        responses.push(formatProjects(projects));
        if (projects.length > 0) sourceSet.add("projects");
        break;
      case "skills":
        responses.push(formatSkills(projects, chunks));
        if (projects.length > 0) sourceSet.add("projects");
        break;
      case "education":
        responses.push(formatEducation(education));
        if (education.length > 0) sourceSet.add("education");
        break;
      case "research":
        responses.push(formatResearch(research));
        if (research.length > 0) sourceSet.add("research");
        break;
      case "blog":
        responses.push(formatBlog(blogPosts));
        if (blogPosts.length > 0) sourceSet.add("blog_posts");
        break;
      case "experience":
        responses.push(
          formatProjects(projects) +
            "\n\n" +
            formatEducation(education)
        );
        if (projects.length > 0) sourceSet.add("projects");
        if (education.length > 0) sourceSet.add("education");
        break;
      case "contact":
        responses.push(
          "You can contact the developer through the portfolio's contact page or find them on social media links provided in the footer."
        );
        sourceSet.add("system");
        break;
      case "help":
        responses.push(
          "I can help you learn about:\n- Projects (what they've built)\n- Skills & technologies they use\n- Education background\n- Research papers\n- Blog posts\n- General about info\n\nJust ask me naturally!"
        );
        sourceSet.add("system");
        break;
    }
  }

  if (responses.length === 0) {
    return {
      message:
        "I'm not sure I understood that. Try asking about my projects, skills, education, or other topics!",
      sources: Array.from(sourceSet),
    };
  }

  return {
    message: responses.join("\n\n"),
    sources: Array.from(sourceSet),
  };
}

const DEMO_DATA = {
  projects: [
    {
      title: "Sample Project",
      description: "A demonstration project showcasing web development skills",
      tech_stack: ["React", "Next.js", "TypeScript", "TailwindCSS"],
    },
  ],
  education: [
    {
      degree: "Computer Science Degree",
      institution: "University Name",
      start_date: "2018",
      end_date: "2022",
      description: "Focus on software engineering and web technologies",
    },
  ],
  research: [],
  blogPosts: [],
};

async function fetchAllData() {
  const supabase = getSupabase();

  try {
    const [projectsRes, educationRes, researchRes, blogRes, chunksRes] = await Promise.all([
      supabase.from("projects").select("*").order("sort_order", { ascending: true }).limit(20),
      supabase.from("education").select("*").order("sort_order", { ascending: true }).limit(10),
      supabase.from("research").select("*").order("created_at", { ascending: false }).limit(10),
      supabase.from("blog_posts").select("*").order("published_at", { ascending: false }).limit(10),
      supabase.from("document_chunks").select("chunk_text").limit(50),
    ]);

    const hasData =
      (projectsRes.data && projectsRes.data.length > 0) ||
      (educationRes.data && educationRes.data.length > 0) ||
      (researchRes.data && researchRes.data.length > 0) ||
      (blogRes.data && blogRes.data.length > 0);

    if (!hasData) {
      return {
        ...DEMO_DATA,
        chunks: [],
        isDemo: true,
      };
    }

    return {
      projects: projectsRes.data || [],
      education: educationRes.data || [],
      research: researchRes.data || [],
      blogPosts: blogRes.data || [],
      chunks: chunksRes.data || [],
      isDemo: false,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      ...DEMO_DATA,
      chunks: [],
      isDemo: true,
    };
  }
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

    if (isGreeting(trimmedMessage)) {
      return NextResponse.json({
        message:
          "Hello! I'm the portfolio assistant. I can tell you about projects, skills, education, research, and more. What would you like to know?",
        sources: ["system"],
      });
    }

    if (isThankYou(trimmedMessage)) {
      return NextResponse.json({
        message: "You're welcome! Happy to help. Is there anything else you'd like to know about the portfolio?",
        sources: ["system"],
      });
    }

    const intents = detectIntent(trimmedMessage);
    const data = await fetchAllData();

    const response = generateResponse(intents, data);

    if (data.isDemo) {
      response.message +=
        "\n\n*Note: This is demo data since no database content was found. Add real data through the admin panel!*";
    }

    return NextResponse.json({
      message: response.message,
      sources: response.sources,
      intents,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message:
      "Portfolio Chat API - Send a POST request with { message: 'your question' } to chat. Available topics: projects, skills, education, research, blog, about, experience, contact, help",
    endpoints: {
      POST: "/api/chat - Send a message to get information about the portfolio",
      GET: "/api/chat - This info",
    },
    exampleQuestions: [
      "What projects have you built?",
      "What technologies do you know?",
      "Tell me about yourself",
      "What is your experience?",
      "What courses have you taken?",
      "What research have you done?",
      "Show me your blog posts",
    ],
  });
}
