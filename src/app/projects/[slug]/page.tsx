import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Github, ExternalLink, Calendar } from "lucide-react";

export default function ProjectDetailPage({ params }: { params: { slug: string } }) {
  // In production, fetch the project from the database based on params.slug
  const project = {
    title: "E-commerce Platform",
    description: "A full-stack e-commerce solution with cart, payments, and admin dashboard. This project showcases modern web development practices with Next.js, React, and PostgreSQL.",
    tech_stack: ["Next.js", "React", "Node.js", "PostgreSQL", "Stripe", "TailwindCSS"],
    github_url: "https://github.com",
    live_url: "https://demo.com",
    created_at: "2024-01-01",
    features: [
      "User authentication with JWT",
      "Shopping cart functionality",
      "Stripe payment integration",
      "Admin dashboard for product management",
      "Order tracking system",
      "Responsive design",
    ],
  };

  return (
    <div className="container px-4 py-12 mx-auto">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
          <div className="flex gap-2 mb-4">
            {project.tech_stack.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
              >
                {tech}
              </span>
            ))}
          </div>
          <p className="text-lg text-muted-foreground">{project.description}</p>
        </div>

        {/* Demo Image */}
        <div className="aspect-video bg-muted rounded-lg mb-8" />

        {/* Links */}
        <div className="flex gap-4 mb-8">
          {project.github_url && (
            <Button asChild>
              <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4 mr-2" />
                View Code
              </a>
            </Button>
          )}
          {project.live_url && (
            <Button variant="outline" asChild>
              <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Live Demo
              </a>
            </Button>
          )}
        </div>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {project.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
