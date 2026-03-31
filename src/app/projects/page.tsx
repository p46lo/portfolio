import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, ExternalLink, ArrowRight } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Fetch projects from Supabase
async function getProjects() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase config");
    return [];
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  return data || [];
}

// Demo projects as fallback
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

export default async function ProjectsPage() {
  const projects = await getProjects();
  const displayProjects = projects.length > 0 ? projects : DEMO_PROJECTS;

  return (
    <div className="container px-4 py-12 mx-auto">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 animate-fade-in-up">Projects</h1>
          <p className="text-lg text-muted-foreground animate-fade-in-up delay-100">
            A showcase of my recent work and side projects
          </p>
        </div>

        {projects.length === 0 && (
          <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              ⚠️ No projects in database. Showing demo data. Add projects in /admin panel.
            </p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayProjects.map((project, index) => (
            <Card key={project.id} className="flex flex-col animate-fade-in-up hover:shadow-lg transition-all hover:-translate-y-1 h-full" style={{ animationDelay: `${200 + index * 100}ms` }}>
              <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center overflow-hidden">
                {project.image_url ? (
                  <img 
                    src={project.image_url} 
                    alt={project.title}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                ) : (
                  <span className="text-muted-foreground text-4xl">💼</span>
                )}
              </div>
              <CardHeader>
                <CardTitle>
                  {project.title}
                </CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech_stack && project.tech_stack.map((tech: string) => (
                    <span
                      key={tech}
                      className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {project.github_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 mr-1" />
                        Code
                      </a>
                    </Button>
                  )}
                  {project.live_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Demo
                      </a>
                    </Button>
                  )}
                  <Button size="sm" asChild>
                    <Link href={`/projects/${project.slug}`}>
                      Details <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {displayProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No projects yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
