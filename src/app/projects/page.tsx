import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github, ExternalLink } from "lucide-react";

// Demo projects - in production these would come from the database
const projects = [
  {
    id: "1",
    title: "E-commerce Platform",
    slug: "ecommerce-platform",
    description: "A full-stack e-commerce solution with cart, payments, and admin dashboard.",
    tech_stack: ["Next.js", "React", "Node.js", "PostgreSQL", "Stripe"],
    github_url: "https://github.com",
    live_url: "https://demo.com",
    featured: true,
  },
  {
    id: "2", 
    title: "Task Manager App",
    slug: "task-manager",
    description: "Collaborative task management application with real-time updates.",
    tech_stack: ["Vue.js", "Firebase", "TailwindCSS"],
    github_url: "https://github.com",
    live_url: "https://demo.com",
    featured: true,
  },
  {
    id: "3",
    title: "Weather Dashboard",
    slug: "weather-dashboard",
    description: "Beautiful weather dashboard with forecasts and interactive maps.",
    tech_stack: ["React", "OpenWeather API", "Chart.js"],
    github_url: "https://github.com",
    live_url: "https://demo.com",
    featured: false,
  },
];

export default function ProjectsPage() {
  return (
    <div className="container px-4 py-12 mx-auto">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Projects</h1>
          <p className="text-lg text-muted-foreground">
            A showcase of my recent work and side projects
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col">
              <div className="aspect-video bg-muted rounded-t-lg" />
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {project.title}
                  {project.featured && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                      Featured
                    </span>
                  )}
                </CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech_stack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  {project.github_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 mr-1" />
                        Code
                      </a>
                    </Button>
                  )}
                  {project.live_url && (
                    <Button size="sm" asChild>
                      <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Demo
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No projects yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
