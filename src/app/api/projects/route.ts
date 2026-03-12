import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Initialize Supabase lazily
function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Demo data
const DEMO_PROJECTS = [
  {
    id: "demo-1",
    title: "E-commerce Platform",
    slug: "ecommerce-platform",
    description: "A full-stack e-commerce solution with cart, payments, and admin dashboard.",
    tech_stack: ["Next.js", "React", "Node.js", "PostgreSQL", "Stripe"],
    github_url: "https://github.com",
    live_url: "https://demo.com",
    featured: true,
  },
  {
    id: "demo-2",
    title: "Task Manager App",
    slug: "task-manager",
    description: "Collaborative task management application with real-time updates.",
    tech_stack: ["Vue.js", "Firebase", "TailwindCSS"],
    github_url: "https://github.com",
    live_url: "https://demo.com",
    featured: true,
  },
  {
    id: "demo-3",
    title: "Weather Dashboard",
    slug: "weather-dashboard",
    description: "Beautiful weather dashboard with forecasts and interactive maps.",
    tech_stack: ["React", "OpenWeather API", "Chart.js"],
    github_url: "https://github.com",
    live_url: "https://demo.com",
    featured: false,
  },
];

// Validation schemas
const projectSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  tech_stack: z.array(z.string()).optional(),
  image_url: z.string().url().optional().or(z.literal("")),
  live_url: z.string().url().optional().or(z.literal("")),
  github_url: z.string().url().optional().or(z.literal("")),
  case_study_url: z.string().url().optional().or(z.literal("")),
  featured: z.boolean().optional(),
  sort_order: z.number().optional(),
});

// GET - List all projects (public)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get("featured");
    const limit = searchParams.get("limit");

    const supabase = getSupabase();

    // Return demo data if no Supabase config
    if (!supabase) {
      let projects = DEMO_PROJECTS;
      
      if (featured === "true") {
        projects = projects.filter(p => p.featured);
      }
      
      if (limit) {
        projects = projects.slice(0, parseInt(limit));
      }
      
      return NextResponse.json({ projects, demo: true });
    }

    let query = supabase
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (featured === "true") {
      query = query.eq("featured", true);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data: projects, error } = await query;

    if (error) {
      // Return demo data on error
      return NextResponse.json({ projects: DEMO_PROJECTS, demo: true, error: error.message });
    }

    return NextResponse.json({ projects: projects || [] });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ projects: DEMO_PROJECTS, demo: true });
  }
}

// POST - Create a new project (protected)
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = projectSchema.parse(body);

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        ...validatedData,
        image_url: validatedData.image_url || null,
        live_url: validatedData.live_url || null,
        github_url: validatedData.github_url || null,
        case_study_url: validatedData.case_study_url || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

// PUT - Update a project (protected)
export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const body = await req.json();
    const validatedData = projectSchema.partial().parse(body);

    const { data: project, error } = await supabase
      .from("projects")
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

// DELETE - Delete a project (protected)
export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
